// server.js - Express.js Backend Server
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/latin-learning';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('💡 Make sure MongoDB is running: mongod');
  });

// Mongoose Schemas
const UserProgressSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  cardsStudied: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  lastStudied: { type: Date, default: Date.now },
  studyStreak: { type: Number, default: 0 },
  masteredWords: [String],
  createdAt: { type: Date, default: Date.now }
});

const TranslationHistorySchema = new mongoose.Schema({
  userId: String,
  englishText: String,
  latinText: String,
  timestamp: { type: Date, default: Date.now }
});

const VocabSchema = new mongoose.Schema({
  latin: { type: String, required: true },
  english: { type: String, required: true },
  gender: String,
  partOfSpeech: String,
  declension: String,
  difficulty: { type: String, default: 'beginner' }
});

const UserProgress = mongoose.model('UserProgress', UserProgressSchema);
const TranslationHistory = mongoose.model('TranslationHistory', TranslationHistorySchema);
const Vocab = mongoose.model('Vocab', VocabSchema);

// Initialize database with vocabulary
const initializeVocab = async () => {
  const count = await Vocab.countDocuments();
  if (count === 0) {
    const vocabData = [
      { latin: "agricola, agricolae", english: "farmer", gender: "m", partOfSpeech: "noun", declension: "first" },
      { latin: "anima, animae", english: "breath; life force; soul", gender: "f", partOfSpeech: "noun", declension: "first" },
      { latin: "dea, deae", english: "goddess", gender: "f", partOfSpeech: "noun", declension: "first" },
      { latin: "fāma, fāmae", english: "report, rumor; reputation, fame", gender: "f", partOfSpeech: "noun", declension: "first" },
      { latin: "fēmina, fēminae", english: "woman; wife", gender: "f", partOfSpeech: "noun", declension: "first" },
      { latin: "sum, esse", english: "be; exist", partOfSpeech: "verb" },
      { latin: "amō, amāre", english: "love", partOfSpeech: "verb" },
      { latin: "possum, posse", english: "be able, can", partOfSpeech: "verb" },
    ];
    await Vocab.insertMany(vocabData);
    console.log('Vocabulary initialized');
  }
};

initializeVocab();

// API Routes

// Get all vocabulary
app.get('/api/vocab', async (req, res) => {
  try {
    const vocab = await Vocab.find();
    res.json(vocab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary' });
  }
});

// Get random vocabulary for practice
app.get('/api/vocab/random', async (req, res) => {
  try {
    const count = await Vocab.countDocuments();
    const random = Math.floor(Math.random() * count);
    const vocab = await Vocab.findOne().skip(random);
    res.json(vocab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch random vocabulary' });
  }
});

// Translation endpoint using Google Translate API
app.post('/api/translate', async (req, res) => {
  try {
    const { text, target = 'la', source = 'en' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Google Translate API call
    const GOOGLE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ 
        error: 'API key not configured',
        translation: 'Please configure GOOGLE_TRANSLATE_API_KEY in .env file'
      });
    }

    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        q: text,
        source: source,
        target: target,
        format: 'text'
      }
    );

    const translation = response.data.data.translations[0].translatedText;

    // Save to translation history
    const history = new TranslationHistory({
      userId: req.body.userId || 'anonymous',
      englishText: text,
      latinText: translation
    });
    await history.save();

    res.json({ 
      translation,
      original: text,
      source,
      target
    });

  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ 
      error: 'Translation failed',
      message: error.message 
    });
  }
});

// Get user progress
app.get('/api/progress/:userId', async (req, res) => {
  try {
    const progress = await UserProgress.findOne({ userId: req.params.userId });
    if (!progress) {
      return res.json({
        userId: req.params.userId,
        cardsStudied: 0,
        score: 0,
        studyStreak: 0,
        masteredWords: []
      });
    }
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Update user progress
app.post('/api/progress', async (req, res) => {
  try {
    const { userId, cardsStudied, score, masteredWords } = req.body;
    
    let progress = await UserProgress.findOne({ userId });
    
    if (progress) {
      // Update existing progress
      progress.cardsStudied = cardsStudied || progress.cardsStudied;
      progress.score = score || progress.score;
      progress.lastStudied = Date.now();
      
      if (masteredWords) {
        progress.masteredWords = [...new Set([...progress.masteredWords, ...masteredWords])];
      }
      
      // Calculate streak
      const daysSinceLastStudy = Math.floor(
        (Date.now() - progress.lastStudied) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceLastStudy <= 1) {
        progress.studyStreak += 1;
      } else {
        progress.studyStreak = 1;
      }
      
      await progress.save();
    } else {
      // Create new progress
      progress = new UserProgress({
        userId,
        cardsStudied: cardsStudied || 0,
        score: score || 0,
        studyStreak: 1,
        masteredWords: masteredWords || []
      });
      await progress.save();
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get translation history
app.get('/api/translations/:userId', async (req, res) => {
  try {
    const history = await TranslationHistory
      .find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(50);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch translation history' });
  }
});

// Get vocabulary by declension
app.get('/api/vocab/declension/:declension', async (req, res) => {
  try {
    const vocab = await Vocab.find({ declension: req.params.declension });
    res.json(vocab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary by declension' });
  }
});

// Get vocabulary by part of speech
app.get('/api/vocab/pos/:pos', async (req, res) => {
  try {
    const vocab = await Vocab.find({ partOfSpeech: req.params.pos });
    res.json(vocab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vocabulary by part of speech' });
  }
});

// Add new vocabulary (admin function)
app.post('/api/vocab', async (req, res) => {
  try {
    const vocab = new Vocab(req.body);
    await vocab.save();
    res.status(201).json(vocab);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add vocabulary' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});