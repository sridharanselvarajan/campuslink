const Poll = require('../models/Poll');
const PollResponse = require('../models/PollResponse');

// Create a new poll (Admin only)
exports.createPoll = async (req, res) => {
  try {
    const { question, options, expiresAt } = req.body;
    
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ 
        message: 'Question and at least 2 options are required' 
      });
    }

    const poll = await Poll.create({
      question,
      options: options.map(option => ({ text: option })),
      createdBy: req.user.id,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    await poll.populate('createdBy', 'username');
    
    res.status(201).json({ 
      message: 'Poll created successfully', 
      poll 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all polls (with user's vote status)
exports.getPolls = async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};
    
    if (active === 'true') {
      query.isActive = true;
      query.$or = [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ];
    } else if (active === 'false') {
      query.$or = [
        { isActive: false },
        { expiresAt: { $lte: new Date() } }
      ];
    }

    const polls = await Poll.find(query)
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });

    // Get user's votes for these polls
    const userVotes = await PollResponse.find({
      userId: req.user.id,
      pollId: { $in: polls.map(poll => poll._id) }
    });

    const pollsWithVotes = polls.map(poll => {
      const userVote = userVotes.find(vote => 
        vote.pollId.toString() === poll._id.toString()
      );
      
      return {
        ...poll.toObject(),
        userVote: userVote ? userVote.optionIndex : null,
        hasVoted: !!userVote
      };
    });

    res.json({ polls: pollsWithVotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single poll with results
exports.getPoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    // Check if user has voted
    const userVote = await PollResponse.findOne({
      pollId: req.params.id,
      userId: req.user.id
    });

    const pollData = {
      ...poll.toObject(),
      userVote: userVote ? userVote.optionIndex : null,
      hasVoted: !!userVote
    };

    res.json({ poll: pollData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Vote on a poll
exports.vote = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({ message: 'Poll has expired' });
    }

    if (optionIndex < 0 || optionIndex >= poll.options.length) {
      return res.status(400).json({ message: 'Invalid option' });
    }

    // Check if user already voted
    const existingVote = await PollResponse.findOne({
      pollId,
      userId: req.user.id
    });

    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }

    // Create vote record
    await PollResponse.create({
      pollId,
      userId: req.user.id,
      optionIndex
    });

    // Update vote count
    poll.options[optionIndex].voteCount += 1;
    await poll.save();

    res.json({ 
      message: 'Vote recorded successfully',
      poll: await Poll.findById(pollId).populate('createdBy', 'username')
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'You have already voted on this poll' });
    }
    res.status(500).json({ message: err.message });
  }
};

// Update poll (Admin only)
exports.updatePoll = async (req, res) => {
  try {
    const { question, options, expiresAt, isActive } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updates = {};
    if (question) updates.question = question;
    if (options) updates.options = options.map(option => ({ text: option }));
    if (expiresAt !== undefined) updates.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedPoll = await Poll.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate('createdBy', 'username');

    res.json({ 
      message: 'Poll updated successfully', 
      poll: updatedPoll 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete poll (Admin only)
exports.deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    if (poll.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete poll responses first
    await PollResponse.deleteMany({ pollId: req.params.id });
    
    // Delete poll
    await Poll.findByIdAndDelete(req.params.id);

    res.json({ message: 'Poll deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get poll results
exports.getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id)
      .populate('createdBy', 'username');

    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const totalVotes = poll.options.reduce((sum, option) => sum + option.voteCount, 0);
    
    const results = poll.options.map((option, index) => ({
      text: option.text,
      votes: option.voteCount,
      percentage: totalVotes > 0 ? Math.round((option.voteCount / totalVotes) * 100) : 0
    }));

    res.json({
      poll: {
        ...poll.toObject(),
        totalVotes,
        results
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
