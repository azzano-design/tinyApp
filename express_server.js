const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "bruce@waynetech.com",
    password: "deadparents123"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "jackwhite@acelabs.com",
    password: "H4H4H4!"
  }
}

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
  let templateVars = { user_id: req.cookies["user_id"] };
  res.render("register", templateVars);
});

// REGISTER ADD
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userDatabase = Object.keys(users);
  var userExists = false;

  // Check if form is actually entered
  if (password === '' || email === '') {
    res.status(400);
    res.send('You must enter both an email and password');
    return;
  }
  // Check database if entered email already exists
  for(var i = 0; i < userDatabase.length; i++) {
    existingEmail = users[userDatabase[i]].email;
    if (existingEmail == email) {
      userExists = true;
    }
  }
  // If it does, send nasty error
  // If it doesn't add them to userDatabase
  if ( userExists === true ){
    res.status(400);
    res.send('User already exists, please use a different email');
  } else {
      id = generateRandomString();
      user = { id: id, email: email, password: password};
      users[id] = user;
      res.cookie('user_id', id);
      res.redirect('/urls');
  }
});


// LOGIN
app.post("/login", (req, res) => {
  let user_id = req.body.username;
  res.cookie('user_id', user_id);
  let templateVars = { user_id: req.cookies["user_id"] };
  res.redirect('/urls');
});

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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
  let templateVars = { user_id: req.cookies["user_id"] };
  res.render("urls_new", templateVars);
});

// URL LISTING
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

// URL LISTING ADD
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  let templateVars = { user_id: req.cookies["user_id"] };
  res.redirect(`/urls/${shortURL}`);
});

// SHORT URL SHOW
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, urlDatabase: urlDatabase, user_id: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});

// SHORT URL UPDATE
app.post("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let newURL = req.body.newURL;
  urlDatabase[shortURL] = newURL;
  let templateVars = { user_id: req.cookies["user_id"] };
  res.redirect('/urls');
})

// SHORT URL DELETE
app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  let shortURLString = shortURL.toString();
  let templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
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