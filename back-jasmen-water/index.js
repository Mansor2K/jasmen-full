require("dotenv").config();
require("./mongo_connection/mongo");
const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const bodyparser = require("body-parser");
const mqtt = require("mqtt");
const socketIo = require("socket.io");
const { sendEmail } = require("./utils/nodeMailr");
const auth = require("./routes/auth");
const user = require("./routes/user");
const setting = require("./routes/setting");
const building = require("./routes/building");
const consumption = require("./routes/consumption");
const User = require("./model/user");
const Consumption = require("./model/consumption");
const RealTimeReading = require("./model/realTimeReading");
const { applyMiddlewares } = require("./middelwere/middelWares");

const app = express();
app.use(bodyparser.json());
applyMiddlewares(app);

let server;
let credentials = null;

if (process.env.NODE_ENV === 'production') {

  try {
    const privateKey = fs.readFileSync("/etc/letsencrypt/live/jasminewaterflow.com/privkey.pem", "utf8");
    const certificate = fs.readFileSync("/etc/letsencrypt/live/jasminewaterflow.com/cert.pem", "utf8");
    const ca = fs.readFileSync("/etc/letsencrypt/live/jasminewaterflow.com/chain.pem", "utf8");

    credentials = {
      key: privateKey,
      cert: certificate,
      ca: ca,
    };

    // Create HTTPS server using credentials
    server = https.createServer(credentials, app);
    console.log("HTTPS server created for production");
  } catch (error) {
    console.error("Failed to load SSL certificates, falling back to HTTP:", error);
    server = http.createServer(app);
  }
} else {
  // Create HTTP server for development
  server = http.createServer(app);
  console.log("HTTP server created for development");
}

// Configure CORS origins based on environment
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? ["https://jasminewaterflow.com", "https://front-jasmen-water.vercel.app"]
  : ["http://localhost:5173", "http://localhost:3000"];

const io = socketIo(server, {
  cors: {
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});


const waterAppTopic = "WaterApp/Data/+";
const mqttServer = process.env.NODE_ENV === 'production' 
  ? "mqtts://jasminewaterflow.com:8883"
  : "mqtts://jasminewaterflow.com:8883";

const mqttOptions = process.env.NODE_ENV === 'production' 
  ? {
      username: "waterapp",
      password: "waterapp@",
      rejectUnauthorized: false,
    }
  : {
      username: "waterapp",
      password: "waterapp@",
      port: 8883,
      rejectUnauthorized: false,
    };


const client = mqtt.connect(mqttServer, mqttOptions);

client.on("connect", () => {
  console.log("Connected to MQTT broker over mqtts");
  client.subscribe(waterAppTopic, (err) => {
    if (err) {
      console.error("Failed to subscribe to topic:", waterAppTopic);
    } else {
      console.log("Subscribed to topic with wildcard:", waterAppTopic);
    }
  });
});


let userConsumptionData = {};

client.on("message", async (topic, message) => {
  const userId = topic.split("/")[2]; 

  if (!userId) {
    console.error("Invalid topic, userId not found:", topic);
    return;
  }

  let data;
  try {
    data = JSON.parse(message.toString());
  } catch (error) {
    console.error("Failed to parse message as JSON:", error);
    return;
  }

  console.log(`Received data for userId ${userId}:`, data);

  userConsumptionData[userId] = {
    userId: userId,
    state: data.state,
    consumption: data.consumption,
    consumptionLimit: data.limit,
    flowRate: data.flowRate,
    reset: data.reset,
  };

  io.to(userId).emit("userConsumptionUpdate", userConsumptionData[userId]);

  try {
    // Update user with current consumption data
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          consumption: data.consumption,
          status: data.state,
          limit: data.limit,
        },
      },
      { new: true }
    );

    if (updatedUser) {
      console.log(`User ${userId} updated successfully`);

      // Save real-time reading for daily processing
      const realTimeReading = new RealTimeReading({
        userId: userId,
        consumption: data.consumption,
        flowRate: data.flowRate,
        consumptionLimit: data.limit,
        reset: data.reset,
        state: data.state,
        readingTime: new Date(),
      });

      await realTimeReading.save();
      console.log(`Real-time reading saved for user ${userId}`);

      // Send email notification for high consumption
      const tolerance = 0.01;
      if (
        Math.abs(data.consumption - 80) < tolerance ||
        Math.abs(data.consumption - 100) < tolerance
      ) {
        const subject = `Water Consumption Alert for ${updatedUser.userName}`;
        const text = `Dear ${updatedUser.userName},\n\nYour current consumption has reached ${data.consumption} liters. Please take note.\n\nBest regards,\nWater Management System`;
        try {
          await sendEmail(updatedUser.email, subject, text);
          console.log(`Email sent to ${updatedUser.email} for high consumption`);
        } catch (error) {
          console.error("Failed to send email:", error);
        }
      }
    } else {
      console.error(`User ${userId} not found`);
    }
  } catch (error) {
    console.error("Failed to update user and save real-time reading:", error);
  }
});

// Daily consumption processing function
const processDailyConsumption = async () => {
  try {
    console.log("Starting daily consumption processing...");
    
    // Get yesterday's date (since we process at midnight for the previous day)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all users
    const users = await User.find({}, '_id');
    
    for (const user of users) {
      try {
        // Get all real-time readings for this user from yesterday
        const readings = await RealTimeReading.find({
          userId: user._id,
          readingTime: {
            $gte: yesterday,
            $lt: today
          }
        }).sort({ readingTime: 1 });
        
        if (readings.length === 0) {
          console.log(`No readings found for user ${user._id} on ${yesterday.toDateString()}`);
          continue;
        }
        
        // Calculate daily statistics
        const consumptions = readings.map(r => r.consumption);
        const flowRates = readings.map(r => r.flowRate);
        
        const dailyConsumption = Math.max(...consumptions) - Math.min(...consumptions);
        const maxConsumption = Math.max(...consumptions);
        const minConsumption = Math.min(...consumptions);
        const avgConsumption = consumptions.reduce((a, b) => a + b, 0) / consumptions.length;
        
        const maxFlowRate = Math.max(...flowRates);
        const minFlowRate = Math.min(...flowRates);
        const avgFlowRate = flowRates.reduce((a, b) => a + b, 0) / flowRates.length;
        
        const resetCount = readings.filter(r => r.reset).length;
        const statusChanges = readings.filter((r, i) => i > 0 && r.state !== readings[i-1].state).length;
        
        // Check if daily consumption record already exists
        const existingConsumption = await Consumption.findOne({
          userId: user._id,
          date: yesterday
        });
        
        if (existingConsumption) {
          // Update existing record
          await Consumption.findByIdAndUpdate(existingConsumption._id, {
            dailyConsumption,
            maxConsumption,
            minConsumption,
            avgConsumption,
            maxFlowRate,
            minFlowRate,
            avgFlowRate,
            consumptionLimit: readings[0].consumptionLimit,
            totalReadings: readings.length,
            resetCount,
            statusChanges
          });
          console.log(`Updated daily consumption for user ${user._id} on ${yesterday.toDateString()}`);
        } else {
          
          const dailyConsumptionRecord = new Consumption({
            userId: user._id,
            date: yesterday,
            dailyConsumption,
            maxConsumption,
            minConsumption,
            avgConsumption,
            maxFlowRate,
            minFlowRate,
            avgFlowRate,
            consumptionLimit: readings[0].consumptionLimit,
            totalReadings: readings.length,
            resetCount,
            statusChanges
          });
          
          await dailyConsumptionRecord.save();
          console.log(`Created daily consumption record for user ${user._id} on ${yesterday.toDateString()}`);
        }
        
        // Delete processed real-time readings after saving to Consumption
        const deleteResult = await RealTimeReading.deleteMany({
          userId: user._id,
          readingTime: {
            $gte: yesterday,
            $lt: today
          }
        });
        console.log(`Deleted ${deleteResult.deletedCount} real-time readings for user ${user._id} after processing ${yesterday.toDateString()}`);
        
      } catch (userError) {
        console.error(`Error processing user ${user._id}:`, userError);
      }
    }
    
    console.log("Daily consumption processing completed successfully");
  } catch (error) {
    console.error("Error in daily consumption processing:", error);
  }
};

// Schedule daily consumption processing at midnight
const scheduleDailyProcessing = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  
  const msUntilMidnight = midnight.getTime() - now.getTime();
  
  console.log(`Next daily consumption processing scheduled for: ${midnight.toISOString()}`);
  
  // Set timeout for next midnight
  setTimeout(() => {
    processDailyConsumption();
    
    // Schedule for every 24 hours after that
    setInterval(processDailyConsumption, 24 * 60 * 60 * 1000);
  }, msUntilMidnight);
};

// Start the daily processing scheduler
scheduleDailyProcessing();

io.on("connection", (socket) => {
  console.log("New admin connected");

  socket.on("viewUserProfile", (userId) => {
    socket.join(userId);

    if (userConsumptionData[userId]) {
      socket.emit("userConsumptionUpdate", userConsumptionData[userId]);
    } else {
      socket.emit("userConsumptionUpdate", { error: "User not found" });
    }
  });

  const publishToMqttByUserId = (data) => {
    const { userId } = data;
    if (!userId) {
      console.error("userId is required in the data:", data);
      return;
    }

    const specificUserTopic = `WaterApp/Data/${userId}`;
    const dataString = JSON.stringify(data);

    client.publish(specificUserTopic, dataString, (err) => {
      if (err) {
        console.error(`Failed to publish message to topic ${specificUserTopic}:`, err);
      } else {
        console.log(`Message sent to topic ${specificUserTopic}:`, dataString);
      }
    });
  };

  socket.on("SendInitialLimit", (data) => {
    publishToMqttByUserId(data);
  });

  socket.on("SendStatusClose", (data) => {
    publishToMqttByUserId(data);
  });

  socket.on("SendInitialReset", (data) => {
    publishToMqttByUserId(data);
  });

  socket.emit("hello", "Socket connected successfully");

  socket.on("disconnect", () => {
    console.log("Admin disconnected");
  });
});


app.use("/auth/v1", auth);
app.use("/user/v1", user);
app.use("/setting/v1", setting);
app.use("/building/v1", building);
app.use("/consumption/v1", consumption);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));


const PORT = process.env.PORT || (process.env.NODE_ENV === 'production' ? 5000 : 3000);
const protocol = process.env.NODE_ENV === 'production' ? 'HTTPS' : 'HTTP';

server.listen(PORT, () => {
  console.log(`${protocol} server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});