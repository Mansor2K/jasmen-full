const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const upload = ({ folder }) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const destination = `uploads/${folder}/${file.fieldname}`;
      fs.mkdirSync(destination, { recursive: true });
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      const uniqueId = crypto.randomBytes(16).toString('hex');
      cb(null, uniqueId + '-' + file.originalname);
    },
  });

  const multerupload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
      // Check if file is an image
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  });
  return multerupload;
};

module.exports = { upload };
