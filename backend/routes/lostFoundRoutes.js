const express = require('express');
const router = express.Router();
const lostFoundController = require('../controllers/lostFoundController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/', auth, upload.single('image'), lostFoundController.createLostFound);
router.get('/', auth, lostFoundController.getLostFound);
router.get('/my', auth, lostFoundController.getMyLostFound);
router.put('/:id', auth, lostFoundController.updateLostFound);
router.delete('/:id', auth, lostFoundController.deleteLostFound);

module.exports = router;
