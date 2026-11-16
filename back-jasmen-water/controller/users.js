const User = require("../model/user");
const Auth = require("../model/auth");
const bcrypt = require("bcryptjs");
const { use } = require("../routes/user");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const auth = require("../model/auth");
require("dotenv").config();

const getOneUser2 = async (req, res) => {
  try {
    const userId = req.params.id;


    // Step 1: Find the user in authSchema by ID
    let authUser = await auth.findById(userId);
    if (!authUser) {
      authUser = await User.findById(userId);

      if (!authUser) {
        return res.status(404).json({ error: 'User not found in authSchema' });
      }

    }


    // Step 2: Extract the email from the found user
    const email = authUser.email;

    // Step 3: Search for the user in userSchema by email and exclude sensitive fields
    const user = await User.findOne({ email }).select('-password -isAdmin -SearchEmail  -updatedAt -__v');

    if (!user) {
      return res.status(404).json({ error: 'User not found in userSchema' });
    }

    // Step 4: Calculate totalMoney by summing the money in the charging array
    const totalMoney = user.charging.reduce((sum, charge) => sum + charge.money, 0);

    // Ensure the `status` field is always a boolean
    const processedUser = {
      ...user._doc, // Spread the user document to create a new object
      status: typeof user.status === 'string' ? user.status === 'true' : user.status, // Convert string "true"/"false" to boolean
      totalMoney, // Add the totalMoney field
    };

    // Step 5: Return the user data along with totalMoney
    return res.status(200).json(processedUser);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};


const addUser = async (req, res) => {
  try {
    const {
      reset,
      userName,
      email,
      password,
      mobile,
      roomNumber,
      isAdmin,
      consumption,
      flowRate,
      limit,
      status,
      tax,
      charging,
    } = req.body;

    // Basic validation for required fields
    if (!userName || !email || !password || !mobile || !roomNumber) {
      return res
        .status(400)
        .json({
          error:
            "userName, email, password, mobile, and roomNumber are required",
        });
    }

    // Check if the email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Create a new user
    const newUser = new User({
      userName,
      email,
      SearchEmail: email.toLowerCase(), // Normalize email for search
      password: hash,
      isAdmin: isAdmin || false,
      consumption: consumption || 0,
      flowRate: flowRate || 0,
      limit: limit || 0,
      mobile,
      roomNumber,
      status: status || false,
      reset: reset || false,
      tax: tax || [],
      charging: charging || [],
    });

    // Save the new user to the database
    const savedUser = await newUser.save();

    // Create a new auth record (assuming you have a separate Auth model)
    const newAuth = new Auth({
      userName,
      email: email.toLowerCase(), // Normalize email for consistency
      SearchEmail: email.toLowerCase(),
      password: hash,
      isAdmin: isAdmin || false,
    });

    await newAuth.save();

    // Remove sensitive fields before sending the response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.SearchEmail;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const getOneUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          _id: 1,
          userName: 1,
          email: 1,
          consumption: 1,
          flowRate: 1,
          limit: 1,
          mobile: 1,
          roomNumber: 1,
          status: 1,
          tax: 1,
          createdAt: 1,
          lastCharging: { $arrayElemAt: ["$charging", 0] },
          totalChargingMoney: { $sum: "$charging.money" } // Calculate the total sum of money in charging
        },
      },
    ]);

    if (!user || user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Ensure the `status` field is always a boolean
    const processedUser = {
      ...user[0],
      status:
        typeof user[0].status === "string"
          ? user[0].status === "true"
          : user[0].status,
    };

    res.status(200).json(processedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


const deleteOneUser = async (req, res) => {
  try {
    // Fetch the user by ID
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete the user from the users table
    await User.findByIdAndDelete(req.params.id);

    // Delete the user from the auth table by email
    const authDeletionResult = await Auth.findOneAndDelete({
      email: user.email,
    });
    if (!authDeletionResult) {
      return res.status(404).json({ error: "User not found in auth table" });
    }

    res
      .status(200)
      .json({ message: "User deleted successfully from both tables" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    // Fetch the user by ID from the users table
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prepare updates for the user table
    const updates = req.body;
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    // Save updated user in the users table
    await user.save();

    // Prepare updates for the auth table
    const authUpdates = req.body;
    if (updates.email) authUpdates.email = updates.email;
    if (updates.password) {
      const salt = bcrypt.genSaltSync(10);
      authUpdates.password = bcrypt.hashSync(updates.password, salt);
    }

    // Update the user in the auth table by email
    const authUpdateResult = await Auth.findOneAndUpdate(
      { SearchEmail: user.SearchEmail },
      authUpdates,
      { new: true }
    );

    if (!authUpdateResult) {
      return res.status(404).json({ error: "User not found in auth table" });
    }

    // Remove sensitive fields before sending the response
    const { __v, isAdmin, password, SearchEmail, ...other } = user._doc;

    res.status(200).json({
      message: "User updated successfully in both tables",
      user: other,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteAllUser = async (req, res) => {
  try {
    const user = await User.deleteMeny();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 7;
    const skip = (page - 1) * limit;

    // Step 1: Fetch the users and count total users
    const users = await User.find()
      .select("-password -updatedAt -isAdmin")
      .skip(skip)
      .limit(limit)
      .lean();
    const totalUsers = await User.countDocuments();

    // Step 2: Get auth IDs for all users
    const userEmails = users.map(user => user.email);
    const authUsers = await Auth.find({ email: { $in: userEmails } })
      .select("_id email")
      .lean();

    // Create a map of email to auth ID for quick lookup
    const emailToAuthId = {};
    authUsers.forEach(authUser => {
      emailToAuthId[authUser.email] = authUser._id;
    });

    // Step 3: Iterate through users and ensure `status` is a boolean, add auth ID
    const processedUsers = users.map(user => ({
      ...user,
      status: typeof user.status === 'string' ? user.status === 'true' : user.status,
      authId: emailToAuthId[user.email] || null, // Add auth ID or null if not found
    }));

    // Step 4: Return the processed users and pagination info
    res.status(200).json({
      users: processedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getHighFiveUsers = async (req, res) => {
  try {
    // Calculate the sum of money for each user and get the top 2 users
    const usersWithSum = await User.aggregate([
      { $unwind: "$charging" },
      {
        $group: {
          _id: "$_id",
          totalMoney: { $sum: "$charging.money" },
          userData: { $first: "$$ROOT" },
        },
      },
      { $sort: { totalMoney: -1 } },
      { $limit: 5 },
      {
        $project: {
          userData: 1,
          totalMoney: 1,
        },
      },
    ]);

    // Fetch full user documents with charging data for the top 2 users
    const userIds = usersWithSum.map((item) => item.userData._id);
    const topUsers = await User.find({ _id: { $in: userIds } })
      .select("-__v -updatedAt -isAdmin -password")
      .populate({
        path: "charging",
        select: "-updatedAt",
      });

    // Add totalMoney to the full user documents
    const users = topUsers.map((user) => {
      const userWithSum = usersWithSum.find((item) =>
        item.userData._id.equals(user._id)
      );
      return { ...user.toObject(), totalMoney: userWithSum.totalMoney };
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getLastFiveUsers = async (req, res) => {
  try {
    // Fetch the last 5 users added to the database
    const users = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-__v -updatedAt -isAdmin -password")
      .populate({
        path: "charging",
        select: "-updatedAt",
      });

    // Calculate the total sum of all money in the charging arrays in the entire database
    const result = await User.aggregate([
      { $unwind: "$charging" },
      { $group: { _id: null, totalMoney: { $sum: "$charging.money" } } },
      { $project: { _id: 0, totalMoney: 1 } },
    ]);

    const totalMoney = result.length > 0 ? result[0].totalMoney : 0;

    // Get the total count of users in the database
    const userCount = await User.countDocuments();

    res.json({ users, totalMoney, userCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addChargeToUser = async (req, res) => {
  const userId = req.params.id;
  const { money, limit } = req.body;
  const meterPrice = console.log("Received money:", money);
  console.log("Received limit:", limit);

  if (typeof money !== "number" || money <= 0) {
    return res.status(400).json({ message: "Invalid money value" });
  }

  if (typeof limit !== "number" || limit < 0) {
    return res.status(400).json({ message: "Invalid limit value" });
  }

  try {
    // Find the user by ID and update the charging list, status, and limit
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: { charging: { money } },
        status: true,
        limit: limit,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user limit:", user.limit); // Check updated value

    // Send email to the user
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: user.email, // Recipient address from the user schema
      subject: "Charge Added to Your Account",
      text: `Dear ${user.email},\n\nA new charge of $${money} has been added to your account.\n\nThank you.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent successfully:", info.response);
      }
    });

    const { __v, isAdmin, password, SearchEmail, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addTaxToUser = async (req, res) => {
  const userId = req.params.id;
  const { value, reason } = req.body;

  console.log("Received value:", value);
  console.log("Received reason:", reason);

  if (typeof value !== "number" || value <= 0) {
    return res.status(400).json({ message: "Invalid tax value" });
  }

  if (typeof reason !== "string" || reason.trim() === "") {
    return res.status(400).json({ message: "Invalid reason" });
  }

  try {
    // Find the user by ID and update the tax list, status, and limit
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $push: { tax: { value, reason } },
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Updated user limit:", user.limit); // Check updated value

    // Send email to the user
    // const transporter = nodemailer.createTransport({
    //   service: 'gmail',
    //   auth: {
    //     user: 'ahmed011khattab@gmail.com',  // Your Gmail address
    //     pass: 'rvhbqcqygscfzdat',   // Your Gmail password or App Password
    //   },
    // });

    // const mailOptions = {
    //   from: 'ahmed011khattab@gmail.com', // Sender address
    //   to: user.email,                    // Recipient address from the user schema
    //   subject: 'New Tax Added to Your Account',
    //   text: `Dear ${user.email},\n\nA new tax of $${value} has been added to your account for the following reason: ${reason}.\n\nThank you.`,
    // };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.log('Error sending email:', error);
    //   } else {
    //     console.log('Email sent successfully:', info.response);
    //   }
    // });

    const { __v, isAdmin, password, SearchEmail, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTaxForUser = async (req, res) => {
  const userId = req.params.UserId;
  const taxId = req.params.TaxId;
  const { value, reason, limit } = req.body;

  console.log("Received value:", value);
  console.log("Received reason:", reason);

  // Validate inputs
  if (value && (typeof value !== "number" || value <= 0)) {
    return res.status(400).json({ message: "Invalid tax value" });
  }

  if (reason && (typeof reason !== "string" || reason.trim() === "")) {
    return res.status(400).json({ message: "Invalid reason" });
  }

  try {
    // Find the user by ID and update the specific tax object
    const updateFields = {};
    if (value) updateFields["tax.$.value"] = value;
    if (reason) updateFields["tax.$.reason"] = reason;
    if (limit !== undefined) updateFields["limit"] = limit;

    const user = await User.findOneAndUpdate(
      { _id: userId, "tax._id": taxId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User or tax not found" });
    }

    console.log("Updated tax:", user.tax.id(taxId)); // Check updated tax object

    const { __v, isAdmin, password, SearchEmail, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteTaxFromUser = async (req, res) => {
  try {
    const { UserId, TaxId } = req.params;

    // Find the user by ID and pull the specific tax item by taxId
    const user = await User.findByIdAndUpdate(
      UserId,
      { $pull: { tax: { _id: TaxId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const clearUserCharges = async (req, res) => {
  try {
    const userId = req.params.id;
    const chargeId = req.params.chargeId;


    // Find the user by ID and clear their charging array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { charging: { _id: chargeId } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    // Remove sensitive fields before sending the response
    const { __v, isAdmin, password, SearchEmail, ...other } = user._doc;

    res.status(200).json({
      message: "Successfully cleared charges for user",
      user: other,
      success: true
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const resetAllMoneyGained = async (req, res) => {
  try {
    // Clear all charging arrays for all users
    const result = await User.updateMany(
      {},
      { $set: { charging: [] } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: "No users found or no charges to clear",
        success: false
      });
    }

    res.status(200).json({
      message: `Successfully reset all money gained for ${result.modifiedCount} users`,
      modifiedCount: result.modifiedCount,
      success: true
    });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};

module.exports = {
  addUser,
  getOneUser2,
  getLastFiveUsers,
  getAllUsers,
  getOneUser,
  deleteOneUser,
  updateUser,
  deleteAllUser,
  getHighFiveUsers,
  addChargeToUser,
  addTaxToUser,
  updateTaxForUser,
  deleteTaxFromUser,
  clearUserCharges,
  resetAllMoneyGained
};
