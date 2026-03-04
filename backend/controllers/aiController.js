const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);

// System prompts per mode
const SYSTEM_PROMPTS = {
  doubt: `You are a helpful academic tutor for college students. 
Answer the student's doubt clearly and concisely. 
Use simple language, break down complex concepts step-by-step, and provide examples where helpful.
Always be encouraging and supportive.`,

  summarize: `You are an expert academic summarizer.
The student will paste their notes or text. Summarize it in a clear, structured format using:
- Key Points (bullet list)
- Core Concepts
- 1-2 sentence conclusion
Keep the summary concise but comprehensive.`,

  explain: `You are a brilliant teacher who can explain any concept simply.
Explain the given topic as if you are teaching a beginner college student.
Use analogies, real-world examples, and simple language.
Structure your response with: Definition → How it works → Real example → Key takeaway.`,

  quiz: `You are a quiz generator for college students.
Generate 5 multiple-choice questions (MCQs) based on the topic or text provided by the student.
Format each question as:
Q1. [Question]
a) [Option]
b) [Option]
c) [Option]
d) [Option]
Answer: [Correct option letter]

Make the questions test fundamental understanding, not just memorization.`,
};

exports.chat = async (req, res) => {
  try {
    const { mode, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const validModes = ['doubt', 'summarize', 'explain', 'quiz'];
    const selectedMode = validModes.includes(mode) ? mode : 'doubt';

    const systemPrompt = SYSTEM_PROMPTS[selectedMode];
    const fullPrompt = `${systemPrompt}\n\nStudent input:\n${message.trim()}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();

    res.json({ reply: text, mode: selectedMode });
  } catch (err) {
    console.error('AI Controller Error:', err.message);
    res.status(500).json({ message: 'AI service failed. Please try again.', error: err.message });
  }
};
