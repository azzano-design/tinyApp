const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


function generateRandomString() {
  let potentialChar = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let string_length = 6;
  let shortendURL = '';
  for (let i = 0; i < string_length; i++) {
    let randNum = Math.floor(Math.random() * potentialChar.length);
    shortendURL += potentialChar.substring(randNum, randNum + 1);
  }
  return(shortendURL);
}

// REGISTER PAGE
app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("register", templateVars);
});

// REGISTER ADD
app.post("/register", (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  res.redirect('/urls');
});

// LOGIN
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie('username', username);
  let templateVars = { username: req.cookies["username"] };
  res.redirect('/urls');
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

// HOME PAGE
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// JSON LIST
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// NEW URLS PAGE
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// URL LISTING
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// URL LISTING ADD
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars = { username: req.cookies["username"] };
  res.redirect(`/urls/${shortURL}`);
});

// SHORT URL SHOW
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urlDatabase: urlDatabase, username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

// SHORT URL UPDATE
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL;
  let templateVars = { username: req.cookies["username"] };
  res.redirect('/urls');
})

// SHORT URL DELETE
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  let shortURLString = shortURL.toString();
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  delete templateVars.urls[shortURLString];
  res.redirect('/urls');
});

// LONG URL REDIRECT
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { longURL: longURL, username: req.cookies["username"] }
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World!</b></body></html>\n");
});

// PORT LISTENING AT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});