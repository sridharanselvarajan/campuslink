const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/role');

router.post('/', auth, role(['student']), timetableController.createTimetable);
router.get('/', auth, role(['student']), timetableController.getTimetable);
router.put('/:id', auth, role(['student']), timetableController.updateTimetable);
router.delete('/:id', auth, role(['student']), timetableController.deleteTimetable);

module.exports = router;
