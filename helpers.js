const getUserByEmail = (email, userDb) => {
  for (let user in userDb) {
    if (userDb[user].email === email) {
      return userDb[user];
    }
  }
};

module.exports = {
  getUserByEmail
};