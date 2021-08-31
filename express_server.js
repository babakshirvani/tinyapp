const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

function generateRandomString() {
  const result = Math.random().toString(36).substring(2, 8);
  console.log(result)
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselab.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls", (req, res) => {

  const templateVars = {
    urls: urlDatabase,
    // shortURL: req.params.shortURL
  };
  console.log("shortURL::1::", templateVars)
  res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("shortURL::2::", templateVars)
  const templateVars = {
    shortURL: shortURL,
    longURL: urlDatabase
  };
  res.render('urls_show', templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log("shortURL::3::", shortURL);
  delete urlDatabase[shortURL]
  res.redirect('/urls')
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});