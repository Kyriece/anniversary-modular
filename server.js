require('dotenv').config();
const basicAuth = require('express-basic-auth');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
      if (file.fieldname === 'music') {
          cb(null, 'public/music/');
      } else {
          cb(null, 'public/images/');
      }
  },
  filename: function(req, file, cb) {
      cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files
app.use(express.static('public'));
app.use(express.json());
// Protect admin routes
app.use('/admin', basicAuth({
    users: { 'admin': process.env.ADMIN_PASSWORD || 'default_password' },
    challenge: true
}));

// Store carousel data in a JSON file
const CAROUSEL_FILE = 'public/data/carousel-data.json';
const MUSIC_FILE = 'public/data/music-data.json';
const INTRO_TEXT_FILE = 'public/data/intro-text.json';
// Ensure required directories exist
const directories = [
    'public/images',
    'public/music',
    'public/data'
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});



// Initialize carousel data with your existing content
function initializeCarouselData() {
    const initialData = [
        { image: "1.1.jpg", caption: "One of our first dates. The Lume." },
        { image: "1.2.jpg", caption: "A room filled with one of your favorite flowers. I could almost smell them" },
        { image: "1.3.jpg", caption: "Remember when the asian lady took this picture, and we kept waiting for a good background image?" },
        { image: "1.4.jpg", caption: "This is the one we submit for siblings or dating" },
        // Add all your images and captions here
        { image: "2.1.jpg", caption: "What about time we went to sky high" },
        { image: "2.2.jpg", caption: "This was the first time I was smoking in the car and got that nicotine rush. Also drank too much coffee." },
        // ... continue with all your images and captions
        // For videos:
        { 
            image: "2.9.mp4", 
            caption: "Enjoying the view.", 
            isVideo: true 
        },
        // ... continue with all content
    ];
    
    fs.writeFileSync(CAROUSEL_FILE, JSON.stringify(initialData, null, 2));
    return initialData;
}

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Get carousel data
app.get('/api/carousel', (req, res) => {
    try {
        let data;
        if (!fs.existsSync(CAROUSEL_FILE)) {
            data = initializeCarouselData();
        } else {
            data = JSON.parse(fs.readFileSync(CAROUSEL_FILE, 'utf8'));
        }
        res.json(data);
    } catch (error) {
        console.error('Error reading carousel data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Save carousel data
app.post('/api/carousel', (req, res) => {
    try {
        fs.writeFileSync(CAROUSEL_FILE, JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error saving carousel data:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle image uploads
app.post('/api/upload/image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded');
        }
        res.json({ success: true, filename: req.file.filename });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
});

function initializeMusicData() {
  const defaultMusic = {
      songs: [
          { src: "music/Evergreen.mp3", title: "Evergreen" },
          { src: "music/Over_The_Rainbow.mp3", title: "Over the Rainbow" },
          { src: "music/Elise.mp3", title: "Elise" },
          { src: "music/As_the_world_caves_in.mp3", title: "As the world caves in" },
          { src: "music/Creep.mp3", title: "Creep" }
      ],
      initialPool: [
          { src: "music/Golden_Hour.mp3", title: "Golden Hour" },
          { src: "music/Fly_Me_To_The_Moon.mp3", title: "Fly me to the Moon" },
          { src: "music/I_Love_You_3000.mp3", title: "I Love you 3000 <3" }
      ]
  };
  fs.writeFileSync(MUSIC_FILE, JSON.stringify(defaultMusic, null, 2));
  return defaultMusic;
}

// Intro text endpoints
app.get('/api/intro-text', (req, res) => {
  try {
      let data;
      if (!fs.existsSync(INTRO_TEXT_FILE)) {
          data = initializeIntroText();
      } else {
          data = JSON.parse(fs.readFileSync(INTRO_TEXT_FILE, 'utf8'));
      }
      res.json(data);
  } catch (error) {
      console.error('Error reading intro text:', error);
      res.status(500).json({ error: error.message });
  }
});

function initializeIntroText() {
  const defaultText = {
      sentences: [
          "Hi my baby, <3",
          "To think it's already been 2 years . .",
          "Time sure flies when your in love",
          "I made this so you'll never forget the times we've had . .",
          "Dont forget to play the music",
          "Scroll down when your ready.",
          "You're still here?",
          "I got a secret for you :)",
          "It's that you're boring",
          "I love you so much <3",
          "This much |------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|",
          "I hope you liked the song I sang for you",
          "Im sure it was a flawless performance.",
          "Did you notice the background is periwrinkle?",
          "I'm running out of things to say",
          "Forever yours, Kyriece",
          "Sike bitch you really thought I'd leave?",
          "I ain't ever leaving",
          "But you should really be doing something else than watching text on a screen",
          "Like kissing me >_<",
          "Ok but really tho",
          "Happy two year anniversary my love"
      ],
      textSize: 48,
      initialDelay: 5000,
      delayBetweenSentences: 1000
  };
  fs.writeFileSync(INTRO_TEXT_FILE, JSON.stringify(defaultText, null, 2));
  return defaultText;
}

app.post('/api/intro-text', (req, res) => {
  try {
      fs.writeFileSync(INTRO_TEXT_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
  } catch (error) {
      console.error('Error saving intro text:', error);
      res.status(500).json({ error: error.message });
  }
});

// Music endpoints
app.get('/api/music', (req, res) => {
  try {
      let data;
      if (!fs.existsSync(MUSIC_FILE)) {
          data = initializeMusicData();
      } else {
          data = JSON.parse(fs.readFileSync(MUSIC_FILE, 'utf8'));
      }
      res.json(data);
  } catch (error) {
      console.error('Error reading music data:', error);
      res.status(500).json({ error: error.message });
  }
});

app.post('/api/music', (req, res) => {
  try {
      fs.writeFileSync(MUSIC_FILE, JSON.stringify(req.body, null, 2));
      res.json({ success: true });
  } catch (error) {
      console.error('Error saving music data:', error);
      res.status(500).json({ error: error.message });
  }
});

// Music file upload endpoint
app.post('/api/upload/music', upload.single('music'), (req, res) => {
  try {
      if (!req.file) {
          throw new Error('No file uploaded');
      }
      res.json({ success: true, filename: req.file.filename });
  } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});