const express = require('express');
const multer = require('multer');
const path = require('path'); // Thêm dòng này để import module path
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Đảm bảo thư mục này tồn tại hoặc được tạo tự động
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Không có file nào được tải lên.');
  }

  // Lấy URL của file
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, avatarUrl: fileUrl });
});

module.exports = router;
