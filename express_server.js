const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const methodOverride = require('method-override');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["BruceWayneisBatman"]
}));
app.use(methodOverride('_method'));


// FUNCTIONS
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

function ifExists(itemToCheck, database, property) {
  for (let id in database) {
    if (itemToCheck === database[id][property]){
      console.log('Item exists');
      return true
      // item exists already
    }
  }
  console.log('Item does not exist');
  return false;
}

function checkPassword(email, password, users){
  for(let user in users){
    //if email exists
    if(email === users[user].email){
      //compare encrypted password
      if(bcrypt.compareSync(password, users[user].password)){
        return true;
      }
    }
  }
  return false;
}

function getUserByID(email, usersDatabase){
  for(let user in usersDatabase){
    if(email === usersDatabase[user].email){
      return usersDatabase[user].id;
    }
  }
  return undefined;
}

function getURLSByUser(userID){
  let urlList = {};
  for(let url in urlDatabase){
    if(urlDatabase[url].ownerID === userID){
      urlList[url] = urlDatabase[url];
    }
  }
  return urlList;
}

// DATABASES
// # USERS

const usersDatabase = {
  "b4tm4N": {
    id: "b4tm4N",
    email: "bruce@waynetech.com",
    password: bcrypt.hashSync("dead-parents", 11)
  },
 "J0K3Rr": {
    id: "J0K3Rr",
    email: "jackwhite@acelabs.com",
    password: bcrypt.hashSync("egg-yolks", 11)
  }
}
// # LINKS
const urlDatabase = {
  "b2xVn2": {
    id: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    ownerID: "b4tm4N"
  },
  "9sm5xK": {
    id: "9sm5xK",
    longURL: "http://www.dccomics.com",
    ownerID: "J0K3Rr"
  }
};

app.use(function(req, res, next){
  res.locals.user = usersDatabase[req.session["user_id"]];
  req.loggedIn = !!res.locals.user;
  next();
});

app.use("/urls", function(req, res, next){
  if(req.loggedIn){
    next();
  }else{
    res.redirect('/login');
  }
});

app.use((req, res, next) => {
  if(!req.session.visitorId){
    req.session.visitorId = generateRandomString();
  }
  next();
})

// REGISTER PAGE
app.get('/register', (req, res) => {
  if(req.loggedIn){
    res.status(301).redirect('/urls');
    return;
  } else{
    res.render('register');
  }
})

// REGISTER ADD
app.post('/register', function(req, res){
  // Check if form is actually entered
  if(!req.body.email || !req.body.password){
    res.status(400);
    res.send("You must enter both an email and password");
    return;
  }
  // Check database if entered email already exists
  // If it does, send nasty error
  if(ifExists(req.body.email, usersDatabase, "email")){
    res.status(400);
    res.send("User already exists, please use a different email");
    return;
  }
  // If it doesn't add them to usersDatabase
  const id = generateRandomString();
  usersDatabase[id] = {
    "id" : id,
    "email" : req.body.email,
    "password" : bcrypt.hashSync(req.body.password, 11)
  };
  req.session["user_id"] = usersDatabase[id].id;
  console.log(usersDatabase);
  res.redirect('/urls');
});


// LOGIN PAGE
app.get("/login", (req, res) => {
  if(req.loggedIn){
    res.status(301).redirect('/urls');
    return;
  }
  res.render('login');
});


// LOGIN SUBMIT
app.post('/login', function(req, res){
  if(ifExists(req.body.email, usersDatabase, "email")){
    if(checkPassword(req.body.email, req.body.password, usersDatabase)){
      const userId = getUserByID(req.body.email, usersDatabase);
      req.session["user_id"] = userId;
      res.redirect('/urls');
    }else{
      res.status(403);
      res.send("Invalid information. Please try again");
      console.log('Invalid password');
    }
  }else{
    res.status(403);
    res.send("Invalid information. Please try again");
    console.log('Invalid username');
  }
})

// LOGOUT
app.post('/logout', function(req, res){
  req.session = null;
  res.redirect('/urls');
})

// HOME PAGE
app.get("/", (req, res) => {
  res.redirect('/urls');
});

// NEW URLS PAGE
app.get('/urls/new', (req, res) => {
  res.render("urls_new");
});

// URL LISTING
app.get('/urls', function(req, res){
  res.render('urls_index', {
    urls: getURLSByUser(req.session["user_id"])
  });
  console.log(urlDatabase);
});

// URL LISTING ADD
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    id: shortURL,
    longURL: req.body.longURL,
    ownerID: usersDatabase[req.session["user_id"]].id
  };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

// SHORT URL SHOW
app.get('/urls/:id', function(req, res){
  const templateVars = {
    url : urlDatabase[req.params.id],
    shortURL : req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  console.log(urlDatabase);
  res.status(200).render('urls_show', templateVars);
  return;
});

app.use('/urls/:id', function(req, res, next){
  if(ifExists(req.params.id, urlDatabase, "id")){
    next();
  }else{
    res.status(400).send("Invalid request");
  }
})

// SHORT URL UPDATE
app.post('/urls/:id', function(req, res){
  // If URL belongs to owner, allow edit
  if(res.locals.user.id === urlDatabase[req.params.id].ownerID){
    urlDatabase[req.params.id].longURL = req.body.longURL;
    res.status(200);
    res.redirect('/urls');
  }else{
    res.status(401);
    res.send("Sorry! Only the owner can edit this link");
  }
})

// SHORT URL DELETE
app.delete('/urls/:id/delete', function(req, res){
  // If URL belongs to owner, allow delete
  if(res.locals.user.id === urlDatabase[req.params.id].ownerID){
    delete urlDatabase[req.params.id];
    res.status(200);
    res.redirect("/urls");
  }else{
    res.status(401);
    res.send("Sorry! Only the owner can delete this link");
  }
});

// LONG URL REDIRECT
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if(shortURL in urlDatabase){
    const longURL = urlDatabase[shortURL].longURL;
    if(longURL){
      res.redirect(longURL);
      return;
    }
  }
  res.status(404).send("Page Not Found");
});

// PORT LISTENING AT
app.listen(PORT, () => {
  console.log(`Shrinky-Links listening on port ${PORT}!`);
});