const Skill = require('../models/Skill');
const Session = require('../models/Session');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

exports.matchTutors = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'A search query is required for AI matching.' });
    }

    /* 
     * STEP 1: Quantitative Ranking (MongoDB Aggregation)
     * We want to find skills and rank them by:
     * - Is the availability array non-empty? (Weight)
     * - Historical experience (Completed sessions count)
     * - Average Rating (from User model, populated in Skill)
     */
    
    // First, let's get a map of experience points (Completed sessions per tutor)
    const experienceData = await Session.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: '$tutor', completedSessions: { $sum: 1 } } }
    ]);
    
    const expMap = {};
    experienceData.forEach(e => { expMap[e._id.toString()] = e.completedSessions; });

    // Fetch all skills, populated with user data
    const skills = await Skill.find()
      .populate('offeredBy', 'username email averageRating _id')
      .lean();

    // Calculate a quantitative "base score" for every skill
    const scoredSkills = skills.map(skill => {
      // 1. Availability Weight (0 or 20 points)
      const hasAvailability = skill.availability && skill.availability.length > 0;
      const availabilityScore = hasAvailability ? 20 : 0;

      // 2. Experience Weight (up to 30 points)
      // Assuming 10 completed sessions = max experience score
      const tutorIdStr = skill.offeredBy?._id?.toString() || '';
      const completedSessions = expMap[tutorIdStr] || 0;
      const experienceScore = Math.min((completedSessions / 10) * 30, 30);

      // 3. Rating Weight (up to 50 points)
      // rating is 0-5. 5 * 10 = 50.
      const rating = skill.offeredBy?.averageRating || 0;
      const ratingScore = rating * 10;

      const totalBaseScore = availabilityScore + experienceScore + ratingScore;

      return {
        ...skill,
        metrics: {
          hasAvailability,
          completedSessions,
          rating,
          totalBaseScore
        }
      };
    });

    // Sort by base score descending and take the top 10 candidates
    scoredSkills.sort((a, b) => b.metrics.totalBaseScore - a.metrics.totalBaseScore);
    const top10Candidates = scoredSkills.slice(0, 10);

    // If no candidates exist at all, return empty
    if (top10Candidates.length === 0) {
      return res.json({ matches: [] });
    }

    /*
     * STEP 2: Qualitative Ranking (Gemini AI)
     * We pass the learner's query and the top 10 candidates to Gemini.
     */
    const prompt = `
      You are an elite Skill Matchmaker AI for a university platform called CampusLink.
      A student wants to learn a specific skill. 
      Their request: "${query}"

      Here are the top ${top10Candidates.length} potential tutors/skills currently available on the platform, pre-sorted by their historical reliability and rating:
      
      ${top10Candidates.map((c, i) => `
        ID: ${c._id}
        Tutor Name: ${c.offeredBy?.username}
        Skill Title: ${c.title}
        Category: ${c.category}
        Description: ${c.description}
        Rating: ${c.metrics.rating}/5
        Experience: Taught ${c.metrics.completedSessions} past sessions
        Has Schedule: ${c.metrics.hasAvailability ? 'Yes' : 'No'}
      `).join('\n')}

      Task:
      Evaluate the student's request against the descriptions and categories of these tutors. 
      Select exactly the TOP 3 absolute best matches based primarily on how well the tutor's "Description" and "Title" satisfy the student's request. 
      Return the output as a precise JSON array of objects. Do not include any markdown formatting, backticks, or other text outside of the JSON array.

      The JSON array must have exactly this format:
      [
        {
          "skillId": "the string ID of the matched skill",
          "matchPercentage": "Integer representing how good the match is (70-99)",
          "reason": "A 1-2 sentence compelling reason explaining to the student WHY this specific tutor is a great fit for their request."
        }
      ]
    `;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    let aiResponseText = result.response.text().trim();
    
    // Clean markdown if Gemini accidentally includes it despite instructions
    if (aiResponseText.startsWith('```json')) {
      aiResponseText = aiResponseText.slice(7, -3).trim();
    } else if (aiResponseText.startsWith('```')) {
      aiResponseText = aiResponseText.slice(3, -3).trim();
    }

    let aiDecisions = [];
    try {
      aiDecisions = JSON.parse(aiResponseText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON:', aiResponseText, parseErr);
      // Fallback: If AI fails to return JSON, just return the top 3 quantitative
      aiDecisions = top10Candidates.slice(0, 3).map(c => ({
        skillId: c._id.toString(),
        matchPercentage: 85,
        reason: "Matched based on outstanding platform ratings and experience."
      }));
    }

    // Merge AI decisions with the original skill data
    const finalMatches = aiDecisions.map(decision => {
      const fullSkillData = top10Candidates.find(c => c._id.toString() === decision.skillId);
      if (!fullSkillData) return null; // Sanity check

      return {
        skill: fullSkillData,
        matchPercentage: decision.matchPercentage,
        reason: decision.reason
      };
    }).filter(m => m !== null); // Remove nulls if AI hallucinated an ID

    res.json({ matches: finalMatches });

  } catch (error) {
    console.error('Matchmaking error:', error);
    res.status(500).json({ message: 'Failed to process AI matchmaking', error: error.message });
  }
};
