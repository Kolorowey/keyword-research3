const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Uploads folder
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// File type validation
const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, jpg, png) are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
