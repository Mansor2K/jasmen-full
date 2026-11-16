const express = require('express');
const multer = require('multer');
const { 
  addBuilding, 
  getAllBuildings, 
  getOneBuilding, 
  updateBuilding, 
  deleteBuilding, 
  getBuildingUsers,
  assignUserToBuilding,
  unassignUserFromBuilding,
  addUserToBuilding,
  getUnassignedUsers
} = require('../controller/building');
const { upload } = require('../utils/multer');
const router = express.Router();
const { verfiyAdmin, verfiyUser } = require('../utils/verfy_user_token/verfy');

// Building routes
router.post("/AddBuilding", verfiyAdmin, upload({ folder: 'buildings' }).single('buildingLogo'), addBuilding);
router.get("/GetAllBuildings", verfiyAdmin, getAllBuildings);
router.patch("/UpdateBuilding/:id", verfiyAdmin, upload({ folder: 'buildings' }).single('buildingLogo'), updateBuilding);
router.delete("/DeleteBuilding/:id", verfiyAdmin, deleteBuilding);
router.get("/GetBuildingUsers/:id", verfiyAdmin, getBuildingUsers);
router.get("/GetOneBuilding/:id", verfiyAdmin, getOneBuilding);

// User assignment routes
router.post("/AssignUserToBuilding", verfiyAdmin, assignUserToBuilding);
router.post("/UnassignUserFromBuilding", verfiyAdmin, unassignUserFromBuilding);
router.post("/AddUserToBuilding/:buildingId", verfiyAdmin, addUserToBuilding);
router.get("/GetUnassignedUsers", verfiyAdmin, getUnassignedUsers);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected field name. Use "buildingLogo" as field name.' });
    }
    return res.status(400).json({ error: error.message });
  }
  if (error.message === 'Only image files are allowed!') {
    return res.status(400).json({ error: 'Only image files are allowed!' });
  }
  next(error);
});

module.exports = router;
