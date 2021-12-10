const getUserByEmail = (email, userDb) => {
  for (let user in userDb) {
    if (userDb[user].email === email) {
      return userDb[user];
    }
  }
};
const generateRandomString = () => {
  let numberArray = [];
  //function set up so if the available keys change, function will still work
  let availableChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';

  //helper function to run 6 times to get a 6 random character string
  let randomNumFromString = (string) => {
    let randomIndex = Math.floor(Math.random() * (string.length - 1));
    return string[randomIndex];
  };

  let i = 0;
  while (i < 6) {
    numberArray.push(randomNumFromString(availableChars));
    i++;
  }
  return numberArray.join('');
};


const isEmailInDB = (checkEmail, database) => {
  for (let user in database) {
    if (database[user].email === checkEmail) {
      return true;
    }
  }
  return false;
};

const getURLsOfUser = function(userId, database) {
  const filteredUrls = {};

  for (let url in database) {
    if (database[url].userID === userId) {
      filteredUrls[url] = database[url];
    }
  }
  return filteredUrls;
};
 


module.exports = {
  getUserByEmail,
  generateRandomString,
  isEmailInDB,
  getURLsOfUser
};