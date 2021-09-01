const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));

const generateRandomString = function() {
  const result = Math.random().toString(36).substring(2, 8);
  console.log("new Random string:", result)
  return result;
};

const findEmail = function(email) {
  for (const id in users) {
    if (email === users[id].email) {
      let user = users[id]
      return user
    }
  }
  return false
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL,
    longURL,
    user: users[req.cookies.user_id]
  };
  res.render('urls_show', templateVars);
});

app.get("/", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  res.render('urls_index', templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let requestBody = req.body;
  urlDatabase[shortURL] = requestBody.longURL;
  res.redirect(`/u/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`)
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL]
  res.redirect('/urls')
});

//register page
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  let emailCheck = false
  if (user) {
    emailCheck = findEmail(user.email)
    console.log(user.email)
  }
  const templateVars = {
    urls: urlDatabase,
    user,
    emailCheck: emailCheck
  };
  console.log("users:", users)
  res.render('register', templateVars);
});

//submit registration
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const emailCheck = findEmail(email)
  if (email && password && !emailCheck) {
    users[userID] = { id: userID, email: email, password: password };
    res.cookie('user_id', userID);
    res.redirect('/');
  }
  if (!email) {
    res.status(400).send("email field cannot be empty")
    res.redirect('/register');
  }
  if (!password) {
    res.status(400).send("password field cannot be empty")
    res.redirect('/register');
  }
  if (emailCheck) {
    res.status(400)
    res.redirect('/register', emailCheck.email);
  }
});

app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render('login', templateVars);
});


// login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const emailCheck = findEmail(email)
  if (email === emailCheck.email && password === emailCheck.password) {
    const userID = emailCheck.id
    res.cookie('user_id', userID)
    res.redirect('/urls')
  }
  if (emailCheck.email !== email) {
    res.status(403).send("email not found")
  }
  if (emailCheck.password !== password) {
    res.status(403).send("password is wrong")
  }
});

//logout

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});