const express = require('express');
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const { getUserByEmail, generateRandomString } = require('./helpers');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(cookieSession({ name: 'session', keys: ['my secret key', 'another secret key'] }));
app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "123asdd"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "323s3s"
  }
};

const users = {
  "123asdd": {
    id: "123asdd",
    email: "babak1@gmail.com",
    //password: 123456
    password: "$2b$10$U7VttdTfFUAUmTR5SIkeqe/4.TAldDnP/hDH7bKWfzl543HChyHPC"
  },
  "323s3s": {
    id: "323s3s",
    email: "babak2@gmail.com",
    // password: 1234567
    password: "$2b$10$OwBYIQ9m.XOGWOB12/pT/.x9/kSy7ihWU9MKwzBnX.wmWE.Y4hwvi"
  }
};

//home page **** GET / ****
app.get("/", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  }
  const userID = users[req.session.user_id].id;
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
    userID
  };
  res.render('urls_index', templateVars);
});

// **** GET /urls ****
app.get("/urls", (req, res) => {
  if (!users[req.session.user_id]) {
    const errorMsg = { message: 'You dont have permission to visit this page, please login or register!', code: 403 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }
  const userID = users[req.session.user_id].id;
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id],
    userID
  };
  res.render('urls_index', templateVars);
});

//**** GET /urls/new ****
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    res.redirect('/login');
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.session.user_id]
  };
  res.render("urls_new", templateVars);
});

//**** GET /urls/:id ****
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;

  if (!urlDatabase[shortURL]) {
    const errorMsg = { message: 'The short URL not found!!', code: 404 };
    res.status(404);
    res.render('error', errorMsg);
    return;
  }
  if (!users[req.session.user_id]) {
    const errorMsg = { message: 'Please login or register, You dont have permission to visit this page!!!', code: 403 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }
  if (users[req.session.user_id].id !== urlDatabase[shortURL].userID) {
    const errorMsg = { message: 'This is not your short URL, you dont have permission to edit!', code: 403 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }

  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user: users[req.session.user_id]
  };
  res.render('urls_show', templateVars);
});

// **** GET /u/:id ****
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    const errorMsg = { message: 'Page not found!', code: 404 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// *** POST /urls ***
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const user = req.session.user_id;
  if (!user) {
    const errorMsg = { message: 'Please login first!!', code: 400 };
    res.status(400);
    res.render('error', errorMsg);
    return;
  }
  urlDatabase[shortURL] = {
    longURL: longURL, userID: user
  };
  res.redirect(`/urls/${shortURL}`);
});

//*** POST /urls/:id ***
app.post("/urls/:shortURL", (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.shortURL;
  if (!user) {
    const errorMsg = { message: 'Please login first!!', code: 400 };
    res.status(400);
    res.render('error', errorMsg);
    return;
  }
  if (users[user].id !== urlDatabase[shortURL].userID) {
    const errorMsg = { message: 'This is not your short URL, you dont have permission to edit!', code: 403 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }
  const updateURL = req.body.updateURL;
  urlDatabase[shortURL].longURL = updateURL;
  res.redirect(`/urls/${req.params.shortURL}`);
});

//*** POST urls/:id/delete ***
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!users[req.session.user_id]) {
    const errorMsg = { message: 'Please login or register, You dont have permission to delete this url!!!', code: 403 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }
  const shortURL = req.params.shortURL;
  if (users[req.session.user_id].id !== urlDatabase[shortURL].userID) {
    const errorMsg = { message: 'This is not your short URL, you dont have permission to delete!', code: 403 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

//**** GET /login ****
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render('login', templateVars);
});

//**** GET /register ****
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  const user = users[req.session.user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  };
  res.render('register', templateVars);
});

//*** POST /login ***
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExist = getUserByEmail(email, users);

  if (email === "") {
    const errorMsg = { message: 'Email field or Password is empty, Try again!!', code: 400 };
    res.status(400);
    res.render('error', errorMsg);
    return;
  }
  if (userExist === undefined) {
    const errorMsg = { message: 'Email not found, Please try again or Register.', code: 403 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }
  if (!bcrypt.compareSync(password, userExist.password)) {
    const errorMsg = { message: 'Password is wrong!! Please try again.', code: 403 };
    res.status(403);
    res.render('error', errorMsg);
    return;
  }
  if (bcrypt.compareSync(password, userExist.password)) {
    const userID = userExist.id;
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

//*** POST /register ***
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const userExist = getUserByEmail(email, users);
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    const errorMsg = { message: 'Email field or Password is empty, Try again!!', code: 400 };
    res.status(400);
    res.render('error', errorMsg);
    return;
  }
  if (userExist) {
    const errorMsg = { message: 'This email address exist, Please try to login!', code: 400 };
    res.status(400);
    res.render('error', errorMsg);
    return;
  }
  users[userID] = { id: userID, email: email, password: hashedPassword };
  req.session.user_id = userID;
  res.redirect('/urls');
});

//*** POST /logout ***
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});