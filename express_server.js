const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { emailChecker } = require("./helpers");
const { urlsForUser } = require("./helpers");
const { generateRandomString } = require("./helpers");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.set("view engine", "ejs");

const urlDatabase = {};

const users = {};

//////////  GET  //////////

app.get("/", (req, res) => {
  res.redirect("/login");
});
// urls page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user, urlDatabase),
    user: users[req.session.user]
  };
  if (!templateVars.user) {
    return res.redirect("/login");
  }
  res.render("urls_index", templateVars);
});
// create a new short url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user]
  };
  let user = users[req.session.user];
  if (!user) {
    res.redirect("urls");
    return;
  } else {
    res.render("urls_new", templateVars);
  }
});
// register new user
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user]
  };
  let user = users[req.session.user];
  if (user) {
    res.redirect("urls");
    return;
  } else {
    res.render("register", templateVars);
  }
});
// login existing user
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user]
  };
  let user = users[req.session.user];
  if (user) {
    res.redirect("urls");
    return;
  } else {
    res.render("login", templateVars);
  }
});
// provides access to longURL when shortURL is utilized
app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});
// users short URLs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user]
  };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

/////////  POST  ////////
// list of users personal URLs
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let userID = req.session.user;
  urlDatabase[shortURL] = { longURL: longURL, userID: userID };
  res.redirect("/urls");
});
// to register a new user
app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  const email = req.body.email;
  if (email === "" || password === "") {
    res.status(404).send("Please enter login information");
  }
  if (emailChecker(email, users)) {
    res.status(404).send("That email is aready in use on this site!");
  }
  req.session.user = id;
  users[id] = {
    id,
    email,
    password: hashedPassword
  };
  res.redirect("/urls");
});
// for a user to delete their own short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});
// to edit the short URL and attach a different longURL
app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});
// to submit login information for existing users
app.post("/login", (req, res) =>{
  const email = req.body.email;
  const password = req.body.password;
  const userObj = emailChecker(email, users);
  if (!userObj) {
    return res.status(403).send('Oops! Email not found');
  }
  const userPW = userObj.password;
  if (!bcrypt.compareSync(password, userPW)) {
    return res.status(403).send('Oops! Password doesn\'t match');
  }
  req.session.user = userObj.id;
  res.redirect("/urls");
});
// to log out and clear encrypted cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});