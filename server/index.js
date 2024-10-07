const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(path.join(__dirname, 'serviceAccountKey.json')),
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/cs_association', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Models
const Member = mongoose.model('Member', {
  uid: String,
  name: String,
  email: String,
  role: String,
  avatar: String,
  bio: String,
  skills: [String],
  socialLinks: {
    github: String,
    linkedin: String,
    twitter: String
  }
});

const Event = mongoose.model('Event', {
  title: String,
  description: String,
  date: Date,
  location: String,
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  maxAttendees: Number
});

const Post = mongoose.model('Post', {
  title: String,
  content: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  createdAt: Date,
  likes: Number,
  comments: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    content: String,
    createdAt: Date
  }]
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

// Routes

// User profile editing
app.put('/api/members/:id', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const updatedMember = await Member.findOneAndUpdate(
      { uid: req.params.id },
      {
        ...req.body,
        avatar: req.file ? `/uploads/${req.file.filename}` : req.body.avatar
      },
      { new: true }
    );
    res.json(updatedMember);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get user profile
app.get('/api/members/:id', async (req, res) => {
  try {
    const member = await Member.findOne({ uid: req.params.id });
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Forum post comments
app.post('/api/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const comment = {
      author: req.body.authorId,
      content: req.body.content,
      createdAt: new Date()
    };
    post.comments.push(comment);
    await post.save();
    const populatedPost = await Post.findById(req.params.id).populate('comments.author', 'name avatar');
    io.emit('newComment', { postId: req.params.id, comment: populatedPost.comments[populatedPost.comments.length - 1] });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Event RSVP
app.post('/api/events/:id/rsvp', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }
    if (event.attendees.includes(req.body.memberId)) {
      return res.status(400).json({ message: 'Already RSVP\'d to this event' });
    }
    event.attendees.push(req.body.memberId);
    await event.save();
    io.emit('eventUpdate', { eventId: req.params.id, attendees: event.attendees.length });
    res.status(200).json({ message: 'RSVP successful' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Cancel RSVP
app.delete('/api/events/:id/rsvp', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    event.attendees = event.attendees.filter(attendee => attendee.toString() !== req.body.memberId);
    await event.save();
    io.emit('eventUpdate', { eventId: req.params.id, attendees: event.attendees.length });
    res.status(200).json({ message: 'RSVP cancelled successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Existing routes...

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});