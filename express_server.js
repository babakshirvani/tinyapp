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
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "123asdd": {
    id: "123asdd",
    email: "babak@gmail.com",
    password: "123456"
  },
  "323s3s": {
    id: "323s3s",
    email: "babak2@gmail.com",
    password: "1234567"
  }
}

//list of URLs
app.get("/urls", (req, res) => {
  if (users[req.cookies.user_id]) {
    const userID = users[req.cookies.user_id].id
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies.user_id],
      userID
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

// url post
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const user = req.cookies.user_id
  if (user) {
    urlDatabase[shortURL] = {
      longURL: longURL, userID: user
    }
    res.redirect(`/u/${shortURL}`);
  } else {
    res.redirect('/login');
  }
});
//create new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id]
  };
  if (users[req.cookies.user_id]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

//Edit url page 
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL,
    longURL,
    user: users[req.cookies.user_id]
  };
  if (users[req.cookies.user_id]) {
    res.render('urls_show', templateVars);
  } else {
    res.redirect('/login');
  }
});
app.post('/urls/:shortURL', (req, res) => {
  res.redirect(`/urls/${req.params.shortURL}`);
});
//Edit URL
app.post("/urls/:shortURL/edit", (req, res) => {
  const updateURL = req.body.updateURL
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = updateURL;
  res.redirect(`/urls`)
});

//home page 
app.get("/", (req, res) => {
  if (users[req.cookies.user_id]) {
    const userID = users[req.cookies.user_id].id
    const templateVars = {
      urls: urlDatabase,
      user: users[req.cookies.user_id],
      userID
    };
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.send("not found")
  }
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (users[req.cookies.user_id]) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL]
    res.redirect('/urls')
  } else {
    res.redirect('/login');
  }
});

//registration page
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user
  };
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
    res.status(400)
    res.redirect('/register');
  }
  if (!password) {
    res.status(400).send("password field cannot be empty")
    res.redirect('/register');
  }
  if (emailCheck) {
    res.status(400)
      .redirect('/register');
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