import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, BookOpen, Languages, Award } from 'lucide-react';
import axios from 'axios';

// API base URL
const API_BASE = 'http://localhost:5000/api';

// Latin vocabulary data
const vocabData = [
  { latin: "agricola, agricolae", gender: "m", english: "farmer", pos: "noun", declension: "first" },
  { latin: "anima, animae", gender: "f", english: "breath; life force; soul", pos: "noun", declension: "first" },
  { latin: "dea, deae", gender: "f", english: "goddess", pos: "noun", declension: "first" },
  { latin: "fāma, fāmae", gender: "f", english: "report, rumor; reputation, fame", pos: "noun", declension: "first" },
  { latin: "fēmina, fēminae", gender: "f", english: "woman; wife", pos: "noun", declension: "first" },
  { latin: "fīlia, fīliae", gender: "f", english: "daughter", pos: "noun", declension: "first" },
  { latin: "īnsula, īnsulae", gender: "f", english: "island", pos: "noun", declension: "first" },
  { latin: "Italia, Italiae", gender: "f", english: "Italy", pos: "noun", declension: "first" },
  { latin: "nauta, nautae", gender: "m", english: "sailor", pos: "noun", declension: "first" },
  { latin: "patria, patriae", gender: "f", english: "country, homeland", pos: "noun", declension: "first" },
  { latin: "pecūnia, pecūniae", gender: "f", english: "money", pos: "noun", declension: "first" },
  { latin: "poēta, poētae", gender: "m", english: "poet", pos: "noun", declension: "first" },
  { latin: "puella, puellae", gender: "f", english: "girl", pos: "noun", declension: "first" },
  { latin: "rēgīna, rēgīnae", gender: "f", english: "queen", pos: "noun", declension: "first" },
  { latin: "via, viae", gender: "f", english: "way, road, street", pos: "noun", declension: "first" },
  { latin: "ager, agrī", gender: "m", english: "field", pos: "noun", declension: "second" },
  { latin: "deus, deī", gender: "m", english: "god", pos: "noun", declension: "second" },
  { latin: "dominus, dominī", gender: "m", english: "master, lord", pos: "noun", declension: "second" },
  { latin: "filius, filiī", gender: "m", english: "son", pos: "noun", declension: "second" },
  { latin: "gladius, gladiī", gender: "m", english: "sword", pos: "noun", declension: "second" },
  { latin: "liber, librī", gender: "m", english: "book", pos: "noun", declension: "second" },
  { latin: "puer, puerī", gender: "m", english: "boy", pos: "noun", declension: "second" },
  { latin: "servus, servī", gender: "m", english: "slave", pos: "noun", declension: "second" },
  { latin: "vir, virī", gender: "m", english: "man; husband", pos: "noun", declension: "second" },
  { latin: "aurum, aurī", gender: "n", english: "gold", pos: "noun", declension: "second" },
  { latin: "bellum, bellī", gender: "n", english: "war", pos: "noun", declension: "second" },
  { latin: "ambulō, ambulāre", english: "walk", pos: "verb" },
  { latin: "amō, amāre", english: "love", pos: "verb" },
  { latin: "sum, esse", english: "be; exist", pos: "verb" },
  { latin: "possum, posse", english: "be able, can", pos: "verb" },
];

const phrases = [
  { latin: "poenās dare", english: "to pay the penalty" },
  { latin: "vēla dare", english: "to set sail" },
  { latin: "causam agere", english: "to conduct or plead a case" },
  { latin: "cōnsilium capere", english: "to form a plan" },
  { latin: "bellum gerere", english: "to wage war" },
];

function App() {
  const [page, setPage] = useState('home');
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [translateInput, setTranslateInput] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [userProgress, setUserProgress] = useState({
    cardsStudied: 0,
    score: 0,
    studyStreak: 0
  });
  const [error, setError] = useState('');

  const userId = 'user123'; // In production, this would come from authentication

  // Load progress from backend
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const response = await axios.get(`${API_BASE}/progress/${userId}`);
      setUserProgress(response.data);
    } catch (error) {
      console.log('Could not load progress:', error.message);
      setUserProgress({ cardsStudied: 0, score: 0, studyStreak: 0 });
    }
  };

  const saveProgress = async (newProgress) => {
    try {
      const response = await axios.post(`${API_BASE}/progress`, {
        userId,
        ...newProgress
      });
      setUserProgress(response.data);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleNextCard = () => {
    setCurrentCard((prev) => (prev + 1) % vocabData.length);
    setFlipped(false);
    const newProgress = {
      cardsStudied: (userProgress.cardsStudied || 0) + 1,
      score: userProgress.score || 0
    };
    saveProgress(newProgress);
  };

  const handlePrevCard = () => {
    setCurrentCard((prev) => (prev - 1 + vocabData.length) % vocabData.length);
    setFlipped(false);
  };

  const handleTranslate = async () => {
    if (!translateInput.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE}/translate`, {
        text: translateInput,
        target: 'la',
        userId
      });
      setTranslatedText(response.data.translation);
    } catch (error) {
      console.error('Translation error:', error);
      setError('Translation failed. Make sure backend is running and Google Translate API is configured.');
      setTranslatedText('');
    }
    setLoading(false);
  };

  const HomePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-900 mb-4">Latin Language Learning</h1>
          <p className="text-xl text-amber-700">Master Latin vocabulary and phrases</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => setPage('flashcards')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <BookOpen className="w-12 h-12 text-amber-600 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-amber-900 text-center mb-2">Flashcards</h2>
            <p className="text-amber-700 text-center">Study vocabulary with interactive flashcards</p>
          </div>

          <div 
            onClick={() => setPage('translate')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Languages className="w-12 h-12 text-amber-600 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-amber-900 text-center mb-2">Translate</h2>
            <p className="text-amber-700 text-center">Practice translation with Google Translate</p>
          </div>

          <div 
            onClick={() => setPage('progress')}
            className="bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
          >
            <Award className="w-12 h-12 text-amber-600 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-amber-900 text-center mb-2">Progress</h2>
            <p className="text-amber-700 text-center">Track your learning journey</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-2xl font-bold text-amber-900 mb-4">Common Latin Phrases</h3>
          <div className="space-y-3">
            {phrases.map((phrase, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <span className="font-semibold text-amber-900">{phrase.latin}</span>
                <span className="text-amber-700">{phrase.english}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const FlashcardsPage = () => {
    const card = vocabData[currentCard];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => setPage('home')}
            className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-indigo-900"
          >
            ← Back to Home
          </button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-900 mb-2">Flashcards</h1>
            <p className="text-indigo-700">Card {currentCard + 1} of {vocabData.length}</p>
          </div>

          <div 
            onClick={() => setFlipped(!flipped)}
            className="bg-white rounded-2xl shadow-2xl p-12 min-h-80 flex items-center justify-center cursor-pointer hover:shadow-3xl transition-all mb-8"
          >
            <div className="text-center">
              {!flipped ? (
                <div>
                  <div className="text-5xl font-bold text-indigo-900 mb-4">{card.latin}</div>
                  {card.pos && (
                    <div className="text-sm text-indigo-600 uppercase tracking-wide">
                      {card.pos} {card.gender && `• ${card.gender}`} {card.declension && `• ${card.declension} declension`}
                    </div>
                  )}
                  <div className="mt-6 text-indigo-500">Click to reveal</div>
                </div>
              ) : (
                <div>
                  <div className="text-4xl font-bold text-indigo-900 mb-4">{card.english}</div>
                  <div className="text-2xl text-indigo-700 mb-2">{card.latin}</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button 
              onClick={handlePrevCard}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <button 
              onClick={() => setFlipped(!flipped)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-900 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <RotateCw className="w-5 h-5" />
              Flip Card
            </button>

            <button 
              onClick={handleNextCard}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TranslatePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => setPage('home')}
          className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-emerald-900"
        >
          ← Back to Home
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">Translation Practice</h1>
          <p className="text-emerald-700">Translate English to Latin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <label className="block text-emerald-900 font-semibold mb-2">English Text:</label>
            <textarea
              value={translateInput}
              onChange={(e) => setTranslateInput(e.target.value)}
              className="w-full p-4 border-2 border-emerald-200 rounded-lg focus:border-emerald-500 focus:outline-none min-h-32"
              placeholder="Enter English text to translate..."
            />
          </div>

          <button 
            onClick={handleTranslate}
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-lg shadow hover:bg-emerald-700 transition-colors disabled:bg-emerald-300 font-semibold"
          >
            {loading ? 'Translating...' : 'Translate to Latin'}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded text-red-700">
              {error}
            </div>
          )}

          {translatedText && (
            <div className="mt-6 p-6 bg-emerald-50 rounded-lg">
              <label className="block text-emerald-900 font-semibold mb-2">Latin Translation:</label>
              <div className="text-2xl text-emerald-900 font-serif">{translatedText}</div>
            </div>
          )}

          <div className="mt-8 p-4 bg-amber-50 border-l-4 border-amber-500 rounded">
            <p className="text-amber-900">
              <strong>Note:</strong> This uses Google Translate API for practice. For accurate Latin translations, consult classical resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const ProgressPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-8">
      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => setPage('home')}
          className="mb-6 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-purple-900"
        >
          ← Back to Home
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">Your Progress</h1>
          <p className="text-purple-700">Track your Latin learning journey</p>
        </div>

        <div className="grid gap-6">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-900">Cards Studied</h2>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-5xl font-bold text-purple-600">
              {userProgress.cardsStudied || 0}
            </div>
            <div className="text-purple-700 mt-2">
              out of {vocabData.length} total words
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-900">Learning Streak</h2>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <div className="text-5xl font-bold text-purple-600">
              {userProgress.studyStreak || 0}
            </div>
            <div className="text-purple-700 mt-2">days of study</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">Progress Bar</h2>
            <div className="w-full bg-purple-200 rounded-full h-4">
              <div 
                className="bg-purple-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${((userProgress.cardsStudied || 0) / vocabData.length) * 100}%` }}
              />
            </div>
            <div className="text-purple-700 mt-2 text-center">
              {Math.round(((userProgress.cardsStudied || 0) / vocabData.length) * 100)}% Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {page === 'home' && <HomePage />}
      {page === 'flashcards' && <FlashcardsPage />}
      {page === 'translate' && <TranslatePage />}
      {page === 'progress' && <ProgressPage />}
    </>
  );
}

export default App;