const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const { emailChecker } = require("./helpers");

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "a2G5tR"
  }
};


const users = {
  "a2G5tR": {
    id: "a2G5tR",
    email: "ex@123.com",
    password: "456"
  },
  "userRandomID2": {
    id: "userRandomID2",
    email: "user2@example.com",
    password: "321"
  }
}

////////  Functions  /////////

function generateRandomString() {
 return Math.floor((1 + Math.random()) * 0x10000000).toString(36);
};

// function emailChecker(email, users) {
//   for (let address in users) {
//     if (email === users[address].email) {
//       return users[address];
//     }
//   }
//   return null;
// };

// function passwordChecker(password, users) {
//   for (let pw in users) {
//     if (password === users[pw].password) {
//       return users[pw];
//     }
//   }
//   return false;
// };

function urlsForUser(userID, urlDatabase) {
  let usersURLs = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      usersURLs[url] = urlDatabase[url]
    }
  }
  return usersURLs;
}

//////////  GET  //////////

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlsForUser(req.session.user, urlDatabase),
    user: users[req.session.user]
  };
  if (!templateVars.user) {
    return res.redirect("/login")
  };
  res.render("urls_index", templateVars);
});

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

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.sendStatus(404);
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

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

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  let userID = req.session.user;
  urlDatabase[shortURL] = { longURL: longURL, userID: userID }
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = generateRandomString();
  const email = req.body.email;
  if (email === "" || password === "") {
    res.status(404).send("Please enter login information");
  }
  if (emailChecker(email, users)) {
    res.status(404).send("That email is aready in use on this site!")
  }
  req.session.user = id;
  users[id] = { 
    id, 
    email, 
    password: hashedPassword
  }; 
  res.redirect("/urls");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

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

app.post("/logout", (req, res) => {
  const user = users[req.session.id];
  req.session = null;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});