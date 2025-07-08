const express = require("express");
const path = require("path");
const app = express();

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

const leaderboard = [
  { username: 'Steve', questsCompleted: 5 },
  { username: 'Alex', questsCompleted: 3 },
];

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  
  console.log(`Login request from ${username}`);
  res.redirect('/wallet');
});

app.get('/wallet', (req, res) => {
  res.render('wallet');
});

app.get('/leaderboard', (req, res) => {
  res.render('leaderboard', { leaderboard });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
