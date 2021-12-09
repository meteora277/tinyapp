const { assert } = require('chai');
const { getUserByEmail } = require('../helpers.js');

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

describe('getUserByEmail', () => {
  it('should return undefined if email was not found in database', () => {

    const user = getUserByEmail('uwu@uwu.com', testUsers);
    
    assert.isUndefined(user);

  });
});

describe('getUserByEmail', () => {
  it('should return a user object when it matches email value', () => {

    const user = getUserByEmail('user@example.com', testUsers);
    const expectedUser = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };

    assert.deepEqual(user,expectedUser);

  });
});