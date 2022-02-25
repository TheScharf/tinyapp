const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan("dev"));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const users = {
  "userRandomID1": {
    id: "userRandomID1",
    email: "user1@example.com",
    password: "maple-pizza"
  },
  "userRandomID2": {
    id: "userRandomID2",
    email: "user2@example.com",
    password: "poop-soap"
  }
}
//let user = {};

// function lookUpID() {
// for (user in users) {
//   return user.id;
// }
// };

////////  Functions  /////////

function generateRandomString() {
 return Math.floor((1 + Math.random()) * 0x10000000).toString(36);
};

function emailChecker(email, users) {
  for (let address in users) {
    if (email === users[address].email) {
      return users[address];
    }
  }
  return false;
};

function passwordChecker(password, users) {
  for (let pw in users) {
    if (password === users[pw].password) {
      return users[pw];
    }
  }
  return false;
};

//////////  GET  //////////

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user: users[req.cookies.user]
  };
  console.log("USER", req.cookies)
  console.log(users);
  if (!templateVars.user) {
    return res.redirect("/login")
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
  user: users[req.cookies.user]
  };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user]
  };
  let user = users[req.cookies.user];
  if (user) {
    res.redirect("urls");
    return;
  } else {
  res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user]
  };
  let user = users[req.cookies.user];
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
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies.user]
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
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
  //console.log(urlDatabase);
});

app.post("/register", (req, res) => {
  const password = req.body.password;
  const id = generateRandomString();
  const email = req.body.email;
  if (email === "" || password === "") {
    res.status(404).send("Please enter login information");
  }
  if (emailChecker(email, users)) {
    res.status(404).send("That email is aready in use on this site!")
  }
  //console.log(id);
  res.cookie('user', id);
  users[id] = { id, email, password };
  //console.log("users",users);
  res.redirect("/urls");
  
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  urlDatabase[req.params.id].longURL = req.body.longURL;
  //console.log(req.params);
  res.redirect("/urls");
});

app.post("/login", (req, res) =>{
  const templateVars = {
  user: users[req.cookies.user]
  }
  const goodEmail = emailChecker(req.body.email, users);
  const goodPw = passwordChecker(req.body.password, users);
  console.log(goodEmail);
  console.log(goodPw);
  if (!goodEmail) {
    res.status(403).send('Oops! Email not found');
    return;
  }
  if (!goodPw) {
    res.status(403).send("Oops!");
    return;
  }
  
  for( key in users ) {
    const userInfo = users[key];
    if ( userInfo.email === req.body.email && userInfo.password === req.body.password ) {
      res.cookie("user", userInfo.id);
      res.redirect("/urls");
      return;
    }
  }
  res.status(403).send("Oops!");

});

app.post("/logout", (req, res) => {
  const user = users[req.cookies.id];
  res.clearCookie("user");
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});