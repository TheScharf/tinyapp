function emailChecker(email, users) {
  for (let address in users) {
    if (email === users[address].email) {
      return users[address];
    }
  }
  return undefined;
};

function urlsForUser(userID, urlDatabase) {
  let usersURLs = {};
  for (let url in urlDatabase) {
    if (userID === urlDatabase[url].userID) {
      usersURLs[url] = urlDatabase[url]
    }
  }
  return usersURLs;
};

function generateRandomString() {
  return Math.floor((1 + Math.random()) * 0x10000000).toString(36);
 };


module.exports = {
  emailChecker,
  urlsForUser,
  generateRandomString
}