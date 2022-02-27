


function emailChecker(email, users) {
  for (let address in users) {
    if (email === users[address].email) {
      return users[address];
    }
  }
  return undefined;
};


module.exports = {
  emailChecker
}