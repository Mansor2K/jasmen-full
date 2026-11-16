const Building = require("../model/building");
const User = require("../model/user");
const fs = require('fs');
const path = require('path');

// Helper function to convert file path to full URL
const getFileUrl = (filePath) => {
  if (!filePath) return null;
  // Convert backslashes to forward slashes for URLs
  return filePath.replace(/\\/g, '/');
};

const addBuilding = async (req, res) => {
  try {
    const {
      buildingName,
      buildingAddress,
      buildingCode,
      buildingDescription,
    } = req.body;

    // Basic validation for required fields
    if (!buildingName) {
      return res.status(400).json({
        error: "buildingName is required",
      });
    }

    // Check if the building code is already in use (if provided)
    if (buildingCode) {
      const existingBuilding = await Building.findOne({ buildingCode });
      if (existingBuilding) {
        return res.status(400).json({ error: "Building code is already in use" });
      }
    }

    // Handle file upload
    let buildingLogo = null;
    if (req.file) {
      buildingLogo = req.file.path; // Store the file path
    }

    // Create a new building
    const newBuilding = new Building({
      buildingName,
      buildingAddress,
      buildingCode,
      buildingDescription,
      buildingLogo,
    });

    // Save the new building to the database
    const savedBuilding = await newBuilding.save();

    res.status(201).json(savedBuilding);
  } catch (error) {
    // If there's an error and a file was uploaded, delete it
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
        console.error('Error deleting uploaded file:', fileError);
      }
    }
    res.status(400).json({ error: error.message });
  }
};

const getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find()
      .select("-__v -updatedAt")
      .lean();

    // Get user count for each building
    const buildingsWithUserCount = await Promise.all(
      buildings.map(async (building) => {
        const userCount = await User.countDocuments({ building: building._id });
        return {
          ...building,
          userCount,
          buildingLogo: getFileUrl(building.buildingLogo),
        };
      })
    );

    res.status(200).json({
      buildings: buildingsWithUserCount,
      totalBuildings: buildingsWithUserCount.length,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getOneBuilding = async (req, res) => {
  try {
    const buildingId = req.params.id;

    const building = await Building.findById(buildingId)
      .select("-__v -updatedAt")
      .lean();

    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    // Get users in this building
    const users = await User.find({ building: buildingId })
      .select("-password -isAdmin -SearchEmail -updatedAt -__v")
      .lean();

    const buildingWithUsers = {
      ...building,
      buildingLogo: getFileUrl(building.buildingLogo),
      users,
      userCount: users.length,
    };

    res.status(200).json(buildingWithUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateBuilding = async (req, res) => {
  try {
    const buildingId = req.params.id;

    // Check if building exists
    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    // Check if building code is being updated and if it conflicts
    if (req.body.buildingCode && req.body.buildingCode !== building.buildingCode) {
      const existingBuilding = await Building.findOne({ 
        buildingCode: req.body.buildingCode,
        _id: { $ne: buildingId }
      });
      if (existingBuilding) {
        return res.status(400).json({ error: "Building code is already in use" });
      }
    }

    // Handle file upload
    let buildingLogo = building.buildingLogo; // Keep existing logo by default
    if (req.file) {
      // Delete old logo file if it exists
      if (building.buildingLogo && fs.existsSync(building.buildingLogo)) {
        try {
          fs.unlinkSync(building.buildingLogo);
        } catch (fileError) {
          console.error('Error deleting old logo file:', fileError);
        }
      }
      buildingLogo = req.file.path; // Use new uploaded file
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      buildingLogo
    };

    // Update the building
    const updatedBuilding = await Building.findByIdAndUpdate(
      buildingId,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Building updated successfully",
      building: updatedBuilding,
    });
  } catch (error) {
    // If there's an error and a file was uploaded, delete it
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (fileError) {
        console.error('Error deleting uploaded file:', fileError);
      }
    }
    res.status(400).json({ error: error.message });
  }
};

const deleteBuilding = async (req, res) => {
  try {
    const buildingId = req.params.id;

    // Check if building exists
    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    // Check if there are users in this building
    const userCount = await User.countDocuments({ building: buildingId });
    if (userCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete building. There are ${userCount} users associated with this building. Please reassign or delete users first.` 
      });
    }

    // Delete the logo file if it exists
    if (building.buildingLogo && fs.existsSync(building.buildingLogo)) {
      try {
        fs.unlinkSync(building.buildingLogo);
      } catch (fileError) {
        console.error('Error deleting logo file:', fileError);
      }
    }

    // Delete the building
    await Building.findByIdAndDelete(buildingId);

    res.status(200).json({ message: "Building deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBuildingUsers = async (req, res) => {
  try {
    const buildingId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    
    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    // Get users in this building with pagination
    const users = await User.find({ building: buildingId })
      .select("-password -isAdmin -SearchEmail -updatedAt -__v")
      .populate('building', 'buildingName buildingAddress buildingCode')
      .skip(skip)
      .limit(limit)
      .lean();

    const totalUsers = await User.countDocuments({ building: buildingId });

    res.status(200).json({
      building: {
        _id: building._id,
        buildingName: building.buildingName,
        buildingAddress: building.buildingAddress,
        buildingCode: building.buildingCode,
        buildingDescription: building.buildingDescription,
        buildingLogo: getFileUrl(building.buildingLogo),
      },
      users,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const assignUserToBuilding = async (req, res) => {
  try {
    const { userId, buildingId } = req.body;

    // Validate required fields
    if (!userId || !buildingId) {
      return res.status(400).json({
        error: "userId and buildingId are required",
      });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if building exists
    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    // Check if user is already assigned to this building
    if (user.building && user.building.toString() === buildingId) {
      return res.status(400).json({ 
        error: "User is already assigned to this building" 
      });
    }

    // Assign user to building
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { building: buildingId },
      { new: true }
    ).select("-password -isAdmin -SearchEmail -updatedAt -__v");

    res.status(200).json({
      message: "User assigned to building successfully",
      user: updatedUser,
      building: {
        _id: building._id,
        buildingName: building.buildingName,
        buildingAddress: building.buildingAddress,
        buildingCode: building.buildingCode,
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const unassignUserFromBuilding = async (req, res) => {
  try {
    const { userId } = req.body;


    if (!userId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

  
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }


    if (!user.building) {
      return res.status(400).json({ 
        error: "User is not assigned to any building" 
      });
    }


    const building = await Building.findById(user.building);


    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { building: null },
      { new: true }
    ).select("-password -isAdmin -SearchEmail -updatedAt -__v");

    res.status(200).json({
      message: "User unassigned from building successfully",
      user: updatedUser,
      previousBuilding: building ? {
        _id: building._id,
        buildingName: building.buildingName,
        buildingAddress: building.buildingAddress,
        buildingCode: building.buildingCode,
      } : null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addUserToBuilding = async (req, res) => {
  try {
    const { buildingId } = req.params;
    const {
      userName,
      email,
      password,
      mobile,
      roomNumber,
      consumption,
      flowRate,
      limit,
      status,
      tax,
      charging,
    } = req.body;

    // Validate required fields
    if (!userName || !email || !password || !mobile || !roomNumber) {
      return res.status(400).json({
        error: "userName, email, password, mobile, and roomNumber are required",
      });
    }

    // Check if building exists
    const building = await Building.findById(buildingId);
    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use" });
    }

    // Hash the password
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Create a new user assigned to this building
    const newUser = new User({
      userName,
      email,
      SearchEmail: email.toLowerCase(),
      password: hash,
      isAdmin: false,
      consumption: consumption || 0,
      flowRate: flowRate || 0,
      limit: limit || 0,
      mobile,
      roomNumber,
      status: status || false,
      reset: false,
      building: buildingId, // Assign to the specified building
      tax: tax || [],
      charging: charging || [],
    });

    // Save the new user
    const savedUser = await newUser.save();

    // Create auth record
    const Auth = require("../model/auth");
    const newAuth = new Auth({
      userName,
      email: email.toLowerCase(),
      SearchEmail: email.toLowerCase(),
      password: hash,
      isAdmin: false,
    });
    await newAuth.save();

    // Remove sensitive fields before sending response
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    delete userResponse.SearchEmail;

    res.status(201).json({
      message: "User created and assigned to building successfully",
      user: userResponse,
      building: {
        _id: building._id,
        buildingName: building.buildingName,
        buildingAddress: building.buildingAddress,
        buildingCode: building.buildingCode,
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUnassignedUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get users that are not assigned to any building
    const unassignedUsers = await User.find({ 
      $or: [
        { building: { $exists: false } },
        { building: null }
      ]
    })
      .select("-password -isAdmin -SearchEmail -updatedAt -__v")
      .skip(skip)
      .limit(limit)
      .lean();

      const totalUnassignedUsers = await User.countDocuments({
        $or: [
          { building: { $exists: false } },
          { building: null }
        ]
      });
      

    res.status(200).json({
      users: unassignedUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUnassignedUsers / limit),
      totalUnassignedUsers,
      message: "Users not assigned to any building"
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  addBuilding,
  getAllBuildings,
  getOneBuilding,
  updateBuilding,
  deleteBuilding,
  getBuildingUsers,
  assignUserToBuilding,
  unassignUserFromBuilding,
  addUserToBuilding,
  getUnassignedUsers,
};
