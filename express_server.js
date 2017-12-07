const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
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

// HOME PAGE
app.get("/", (req, res) => {
  res.end("Hello!");
});

// JSON LIST
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// NEW URLS PAGE
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// URL LISTING
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// URL LISTING ADD
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// SHORT URL SHOW
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

// LONG URL REDIRECT
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  let templateVars = { longURL: longURL }
  res.redirect(longURL);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World!</b></body></html>\n");
});

// PORT LISTENING AT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});