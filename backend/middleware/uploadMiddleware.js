const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = 'upload/';
    if (req.baseUrl.includes('lostfound')) dest += 'lostitems/';
    else if (req.baseUrl.includes('complaints')) dest += 'complaints/';
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = upload;
