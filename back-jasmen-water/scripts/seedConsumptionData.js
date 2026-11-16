require("dotenv").config();
require("../mongo_connection/mongo");
const Consumption = require("../model/consumption");
const User = require("../model/user");
const mongoose = require("mongoose");

/**
 * Script to generate fake consumption data for all users
 * Generates data for the past year with realistic variations
 */

// Helper function to generate random number between min and max
const random = (min, max) => Math.random() * (max - min) + min;

// Helper function to generate random integer
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to add days to a date
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper function to format date as YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Generate realistic consumption data for a single day
const generateDailyConsumption = (baseConsumption, date, dayOfWeek, dayOfMonth, month, userIndex, hasLeak = false, leakStartDay = null) => {
  // Base variations
  let variation = 1;
  
  // Weekend effect (slightly higher consumption on weekends)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    variation += random(0.1, 0.3);
  }
  
  // Monthly variation (summer months have higher consumption)
  if (month >= 5 && month <= 8) { // June, July, August, September
    variation += random(0.2, 0.4);
  } else if (month >= 11 || month <= 1) { // December, January, February
    variation += random(0.1, 0.2);
  }
  
  // Random daily variation
  variation += random(-0.2, 0.2);
  
  // Ensure minimum consumption
  let dailyConsumption = Math.max(10, baseConsumption * variation);
  
  // Generate related metrics
  let avgFlowRate = random(15, 45);
  let maxFlowRate = avgFlowRate * random(1.5, 2.5);
  let minFlowRate = avgFlowRate * random(0.3, 0.7);
  
  let avgConsumption = dailyConsumption * random(0.8, 1.2);
  let maxConsumption = dailyConsumption * random(1.2, 1.8);
  let minConsumption = dailyConsumption * random(0.3, 0.7);
  
  // Generate pump-related metrics
  let totalReadings = randomInt(50, 200);
  let resetCount = randomInt(0, 3);
  let statusChanges = randomInt(5, 25); // Pump cycles
  
  // LEAK PATTERNS - Generate leak scenarios for some users
  if (hasLeak && leakStartDay && date >= leakStartDay) {
    const daysSinceStart = Math.floor((date - leakStartDay) / (1000 * 60 * 60 * 24));
    const leakType = userIndex % 4; // Different leak types for different users
    
    switch (leakType) {
      case 0: // Type 1: Continuous low flow leak (dripping faucet)
        // Low consumption but continuous flow
        dailyConsumption = baseConsumption * random(0.2, 0.4); // 20-40% of normal
        avgFlowRate = random(8, 15); // Low but continuous flow
        minFlowRate = random(5, 10); // Never goes to zero
        maxFlowRate = avgFlowRate * random(1.2, 1.5);
        statusChanges = randomInt(0, 2); // Very few pump cycles
        totalReadings = randomInt(150, 300); // Many readings (continuous monitoring)
        break;
        
      case 1: // Type 2: High flow leak (pipe burst - intermittent)
        if (daysSinceStart >= 0 && daysSinceStart <= 5) {
          // First few days: high flow, high consumption
          dailyConsumption = baseConsumption * random(2.5, 4.0);
          avgFlowRate = random(60, 90);
          statusChanges = randomInt(30, 50); // Many cycles trying to maintain pressure
          resetCount = randomInt(3, 8); // High reset count
        } else if (daysSinceStart > 5 && daysSinceStart <= 10) {
          // Middle days: still high but decreasing
          dailyConsumption = baseConsumption * random(1.8, 2.5);
          avgFlowRate = random(45, 70);
          statusChanges = randomInt(20, 35);
        } else {
          // Later days: leak partially fixed but still present
          dailyConsumption = baseConsumption * random(1.3, 1.8);
          avgFlowRate = random(35, 55);
          statusChanges = randomInt(15, 25);
        }
        break;
        
      case 2: // Type 3: Slow leak (toilet running)
        // Moderate consumption but flow without proper cycles
        dailyConsumption = baseConsumption * random(0.6, 0.9);
        avgFlowRate = random(20, 35);
        statusChanges = randomInt(1, 5); // Very few cycles
        totalReadings = randomInt(200, 400); // Continuous readings
        minFlowRate = random(15, 25); // Never stops completely
        break;
        
      case 3: // Type 4: Gradual leak (worsening over time)
        const leakSeverity = Math.min(1.0, daysSinceStart / 30); // Gradual increase
        dailyConsumption = baseConsumption * (1.0 + leakSeverity * random(0.5, 1.0));
        avgFlowRate = random(25, 50) * (1 + leakSeverity * 0.5);
        statusChanges = randomInt(8, 20);
        if (daysSinceStart > 20) {
          resetCount = randomInt(2, 6); // More resets as leak worsens
        }
        break;
    }
    
    // Recalculate related metrics after leak adjustments
    maxFlowRate = avgFlowRate * random(1.5, 2.5);
    minFlowRate = avgFlowRate * random(0.3, 0.7);
    avgConsumption = dailyConsumption * random(0.8, 1.2);
    maxConsumption = dailyConsumption * random(1.2, 1.8);
    minConsumption = dailyConsumption * random(0.3, 0.7);
  }
  
  return {
    dailyConsumption: parseFloat(dailyConsumption.toFixed(2)),
    maxConsumption: parseFloat(maxConsumption.toFixed(2)),
    minConsumption: parseFloat(minConsumption.toFixed(2)),
    avgConsumption: parseFloat(avgConsumption.toFixed(2)),
    maxFlowRate: parseFloat(maxFlowRate.toFixed(2)),
    minFlowRate: parseFloat(minFlowRate.toFixed(2)),
    avgFlowRate: parseFloat(avgFlowRate.toFixed(2)),
    totalReadings: totalReadings,
    resetCount: resetCount,
    statusChanges: statusChanges,
  };
};

// Main function to seed data
const seedConsumptionData = async () => {
  try {
    console.log("🌱 Starting consumption data seeding...\n");

    // Get all users
    const users = await User.find({ isAdmin: false }).select("_id userName email roomNumber limit");
    
    if (users.length === 0) {
      console.log("❌ No users found in the database. Please create users first.");
      process.exit(1);
    }

    console.log(`📊 Found ${users.length} users to seed data for\n`);

    // Calculate date range (past year)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    startDate.setHours(0, 0, 0, 0);

    console.log(`📅 Date range: ${formatDate(startDate)} to ${formatDate(endDate)}\n`);

    let totalRecordsCreated = 0;
    let totalRecordsSkipped = 0;

    // Process each user
    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const user = users[userIndex];
      console.log(`👤 Processing user: ${user.userName} (${user.email})`);
      
      // Base consumption per user (varied by user)
      const baseConsumption = user.limit ? user.limit * random(0.3, 0.7) : random(50, 150);
      const consumptionLimit = user.limit || random(200, 500);

      // Determine if this user should have leak patterns (30% of users)
      const hasLeak = userIndex % 3 === 0; // Every 3rd user has leaks
      const leakStartDay = hasLeak 
        ? new Date(startDate.getTime() + randomInt(30, 200) * 24 * 60 * 60 * 1000) // Leak starts randomly within first 200 days
        : null;

      if (hasLeak) {
        console.log(`   ⚠️  This user will have leak patterns starting around ${formatDate(leakStartDay)}`);
      }

      let userRecordsCreated = 0;
      let userRecordsSkipped = 0;

      // Generate data for each day in the past year
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const dayOfMonth = currentDate.getDate();
        const month = currentDate.getMonth();

        // Check if record already exists for this date
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);
        
        const existingRecord = await Consumption.findOne({
          userId: user._id,
          date: {
            $gte: dayStart,
            $lte: dayEnd
          }
        });

        if (!existingRecord) {
          // Generate consumption data
          const consumptionData = generateDailyConsumption(
            baseConsumption,
            currentDate,
            dayOfWeek,
            dayOfMonth,
            month,
            userIndex,
            hasLeak,
            leakStartDay
          );

          // Create consumption record
          await Consumption.create({
            userId: user._id,
            date: new Date(currentDate),
            ...consumptionData,
            consumptionLimit: consumptionLimit,
            isActive: true,
          });

          userRecordsCreated++;
          totalRecordsCreated++;
        } else {
          userRecordsSkipped++;
          totalRecordsSkipped++;
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log(`   ✅ Created: ${userRecordsCreated} records`);
      console.log(`   ⏭️  Skipped: ${userRecordsSkipped} existing records\n`);
    }

    console.log("=".repeat(50));
    console.log("📈 Seeding Summary:");
    console.log(`   ✅ Total records created: ${totalRecordsCreated}`);
    console.log(`   ⏭️  Total records skipped: ${totalRecordsSkipped}`);
    console.log(`   👥 Users processed: ${users.length}`);
    console.log("=".repeat(50));
    console.log("\n✨ Seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding consumption data:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedConsumptionData();

