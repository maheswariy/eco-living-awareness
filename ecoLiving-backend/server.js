const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

// Middleware
app.set('view engine', 'ejs');
app.use(express.json()); // 🟢 THIS is what you're missing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection


require('dotenv').config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.log(err));

// Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: String,
  firstName: String,
  lastName: String
});


const blogSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  category: String,
  content: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Blog = mongoose.model('Blog', blogSchema);


const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/myEcoLife', (req, res) => {
  console.log('🔍 /myEcoLife loaded');
  res.sendFile(path.join(__dirname, 'public', 'myEcoLife.html'));
});

app.get('/blogSaved', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'blogSaved.html'));
});


app.get('/ecoWays', async (req, res) => {
    try {
        const blogs = await Blog.find();
        res.render('ecoWays', { blogs }); // ✅ Renders ecoWays.ejs with data
    } catch (err) {
        console.error(err);
        res.status(500).send("Something went wrong");
    }
});


app.get("/blog/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).send("Blog not found");
    }
    res.render("singleBlog", { blog });
  } catch (err) {
    res.status(500).send("Error loading blog");
  }
});



// Signup Route
app.post('/signup', async (req, res) => {
  const {firstName,lastName, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.send('User already exists!');
  }

  const user = new User({firstName,lastName, email, password });
  await user.save();

  res.redirect('/home.html');
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && user.password === password) {
    res.redirect('/home');
  } else {
    res.send('Invalid credentials. Please try again.');
  }
});


app.post('/submit-blog', async (req, res) => {
console.log('Received submission:', req.body);
  const { email, category, content } = req.body;
  try {
    const blog = new Blog({ email, category, content });
    await blog.save();
    res.status(200).redirect('/blogSaved.html');
  } catch (err) {
    res.status(500).send('Error saving blog');
  }
});


// Start server
app.listen(3000, () => {
  console.log('🚀 Server running at http://localhost:3000');
});
