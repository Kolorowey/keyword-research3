const multer = require("multer");

const storage = multer.memoryStorage(); // Store in memory for Base64 conversion
const upload = multer({ storage });

module.exports = upload;
