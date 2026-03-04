const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/role');

router.post('/', auth, role(['admin']), announcementController.createAnnouncement);
router.get('/', auth, announcementController.getAnnouncements);
router.put('/:id', auth, role(['admin']), announcementController.updateAnnouncement);
router.delete('/:id', auth, role(['admin']), announcementController.deleteAnnouncement);

module.exports = router;
