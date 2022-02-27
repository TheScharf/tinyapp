const { assert } = require('chai');

const { emailChecker } = require('../helpers.js');

const testUsers = {
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
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = emailChecker("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.isObject(user, 'will return false if no user email found')
  });
  it('should return undefined if there is no registered user with this email', function() {
    const user = emailChecker("notemail@example.com", testUsers);
    assert.isNull(user, "User is null");
  });
});