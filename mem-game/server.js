// Import required modules
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const client = new MongoClient(process.env.MONGO_URI);


let db;
client.connect(err => {
  if (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  }
  db = client.db('mem_game');
  console.log('Connected to MongoDB');
});

// Verify Token Middleware
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(403).json({ error: 'Token required' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid Token' });
  }
};

// Register User
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const userExists = await db.collection('users').findOne({ username });
  if (userExists) return res.status(400).json({ error: 'Username already exists' });

  await db.collection('users').insertOne({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered' });
});

// Login User
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.collection('users').findOne({ username });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ message: 'Login successful', token });
});

// Fetch User Profile with Scores
app.get('/api/profile', verifyToken, async (req, res) => {
  const userId = new ObjectId(req.user.id);
  const user = await db.collection('users').findOne({ _id: userId }, { projection: { password: 0 } });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const scores = await db.collection('scores').find({ userId }).sort({ createdAt: -1 }).toArray();
  res.json({ user, scores });
});

// Save Score
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Get Highscores
app.get('/api/highscores/:difficulty', async (req, res) => {
  const { difficulty } = req.params;
  const validDifficulties = ['easy', 'medium', 'hard', 'extreme'];
  if (!validDifficulties.includes(difficulty)) {
    return res.status(400).json({ error: 'Invalid difficulty level' });
  }

  const highscores = await db.collection('scores')
    .find({ difficulty })
    .sort({ score: -1 })
    .limit(10)
    .toArray();

  res.json(highscores);
});

// Start the server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
