const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', skillController.getSkills);
router.get('/my', authMiddleware, skillController.getMySkills);
router.get('/:id', skillController.getSkillById);
router.post('/', authMiddleware, skillController.createSkill);
router.put('/:id', authMiddleware, skillController.updateSkill);
router.delete('/:id', authMiddleware, skillController.deleteSkill);

module.exports = router;
