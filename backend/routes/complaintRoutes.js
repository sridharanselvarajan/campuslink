const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');
const role = require('../middleware/role');
const upload = require('../middleware/uploadMiddleware');

router.post('/', authMiddleware, role(['student']), upload.single('image'), complaintController.createComplaint);
router.get('/my', authMiddleware, role(['student']), complaintController.getMyComplaints);
router.get('/all', authMiddleware, role(['admin']), complaintController.getAllComplaints);
router.put('/:id/status', authMiddleware, role(['admin']), complaintController.updateComplaintStatus);
router.delete('/:id', authMiddleware, complaintController.deleteComplaint);

module.exports = router;
