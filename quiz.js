// routes/quiz.js
const express = require('express');
const Quiz = require('../models/quiz');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Route to create a new quiz
router.post('/conduct', async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: 'No questions provided' });
    }

    const quizCode = uuidv4();
    const quiz = new Quiz({ questions, quizCode });
    await quiz.save();

    console.log('Quiz created with quizCode:', quizCode);
    res.json({ quizCode });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

router.get('/take/:quizCode', async (req, res) => {
  console.log("Reached take endpoint"); // Log for debugging
  const { quizCode } = req.params;
  console.log("Received quiz code:", quizCode);

  try {
      const quiz = await Quiz.findOne({ quizCode });
      console.log("Quiz found:", quiz); // This should print the quiz or null

      if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
      res.json({ questions: quiz.questions });
  } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ error: "Server error" });
  }
});



router.post('/:quizCode/submit', async (req, res) => {
  const { quizCode } = req.params;
  const { answers } = req.body;

  try {
    const quiz = await Quiz.findOne({ quizCode });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    let score = 0;

    // Log to check answers and questions for debugging
    console.log("Received answers from frontend:", answers);
    console.log("Quiz questions from database:", quiz.questions);

    // Compare submitted answers with correct answers
    quiz.questions.forEach((question, index) => {
      console.log(`Comparing submitted answer: ${answers[index]} with correct answer: ${question.answer}`);
      if (String(answers[index]) === String(question.answer)) {
        score += 1; // Increment score for each correct answer
      }
    });

    console.log("Calculated score:", score);
    req.session.score = score; 
    res.json({ score });
  } catch (error) {
    console.error('Error calculating score:', error);
    res.status(500).json({ error: 'Failed to calculate score' });
  }
});

router.get("/result", (req, res) => {
  const score = req.session.quizScore;
  if (score !== undefined) {
      res.json({ score });
  } else {
      res.status(404).json({ error: "Result not found" });
  }
});



module.exports = router;
