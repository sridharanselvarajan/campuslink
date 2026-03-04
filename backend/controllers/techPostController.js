const TechPost = require('../models/TechPost');
const SavedPost = require('../models/SavedPost');
const User = require('../models/User');

// Admin: Create a new tech post
exports.createTechPost = async (req, res) => {
  try {
    const post = await TechPost.create({ ...req.body, postedBy: req.user._id });

    // Award +20 points to the poster
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalPoints: 20 } });

    // Check Community Helper badge (3+ posts)
    const postCount = await TechPost.countDocuments({ postedBy: req.user._id });
    if (postCount >= 3) {
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { badges: 'Community Helper' }
      });
    }

    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get all tech posts (with optional search/filter)
exports.getTechPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const posts = await TechPost.find(filter).sort({ createdAt: -1 }).populate('postedBy', 'username');
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single tech post by ID
exports.getTechPostById = async (req, res) => {
  try {
    const post = await TechPost.findById(req.params.id).populate('postedBy', 'username');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Admin: Update a tech post
exports.updateTechPost = async (req, res) => {
  try {
    const post = await TechPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin: Delete a tech post
exports.deleteTechPost = async (req, res) => {
  try {
    const post = await TechPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student: Bookmark a post
exports.savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await SavedPost.findOne({ studentId: req.user._id, postId: id });
    if (existing) return res.status(400).json({ message: 'Already saved' });
    const saved = await SavedPost.create({ studentId: req.user._id, postId: id });
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student: Unbookmark a post
exports.unsavePost = async (req, res) => {
  try {
    const { id } = req.params;
    await SavedPost.findOneAndDelete({ studentId: req.user._id, postId: id });
    res.json({ message: 'Post unsaved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student: Get all saved posts
exports.getSavedPosts = async (req, res) => {
  try {
    const saved = await SavedPost.find({ studentId: req.user._id }).populate('postId');
    res.json(saved.map(s => s.postId));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

