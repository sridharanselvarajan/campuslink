const express = require('express');
const router = express.Router();
const techPostController = require('../controllers/techPostController');
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/role');

// Admin routes
router.post('/', auth, role(['admin']), techPostController.createTechPost);
router.put('/:id', auth, role(['admin']), techPostController.updateTechPost);
router.delete('/:id', auth, role(['admin']), techPostController.deleteTechPost);

// Public/student routes
router.get('/', auth, techPostController.getTechPosts);
router.get('/:id', auth, techPostController.getTechPostById);

// Bookmarking
router.post('/:id/save', auth, role(['student']), techPostController.savePost);
router.delete('/:id/save', auth, role(['student']), techPostController.unsavePost);
router.get('/saved/all', auth, role(['student']), techPostController.getSavedPosts);

module.exports = router;

