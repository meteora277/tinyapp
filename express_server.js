const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const { createHash } = require('crypto');

const app = express();
const PORT = 8080;
const salt = "IamSalt";

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://lighthouselabs.com',
    userID: 'uwuowo'
  },
  '9sm5xK': {
    longURL: 'https://www.google.com',
    userID: 'uwuowo'
  },
  'b6UTxQ': {
    longURL: "https://www.tsn.ca",
    userID: "uwuowo"
  },
  'i3BoGr': {
    longURL: "https://www.google.ca",
    userID: "owoowo"
  }
};
const users = {
  "uwuowo": {
    id: "uwuowo",
    email:'justin.s.diaz@gmail.com',
    password: '!"Öõ£$\x00ÕÄ¼\t\n»½H&\x996.Cü\x91\x194[\x07\x00Ï\x17\x84\x1C\x1C'
  }
};
console.log(urlDatabase);
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
const isEmailInDB = (checkEmail) => {
  for (let user in users) {
    if (users[user].email === checkEmail) {
      return true;
    }
  }
  return false;
};
const UserFromEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};
const urlsForUser = function(userId) {
  const filteredUrls = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userId) {
      filteredUrls[url] = urlDatabase[url];
    }
  }
  return filteredUrls;
};

//body parser will parse the buffer recieved when a user POSTs into an object available with req.body
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

//home page redirect to urls page
app.get('/', (req, res) => {
  res.redirect('/urls');
});

//renders page for creating a new key: value in the db
//user will be redirected if they are not logged in
app.get('/urls/new', (req, res) => {

  const user = users[req.cookies["user_id"]];
  if (user) {
    const templateVars = {user: user};
    res.render('urls_new', templateVars);
    return;
  }
  res.redirect('/login');
});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies["user_id"]];
  
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: user};
  res.render('urls_show', templateVars);
});

//renders all the urls into a template
app.get('/urls', (req, res) => {

  const user = users[req.cookies["user_id"]] || undefined;
  let filteredUserUrls = undefined;

  if (user) {
    filteredUserUrls = urlsForUser(user.id);
  }
  
  const templateVars = {urls: filteredUserUrls , user: user};
  res.render('urls_index', templateVars);
});

app.get('/urls.json', (req ,res) => {
  res.json(urlDatabase);
});

// if shortUrl key is in the database it will redirect, else return to /urls page
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.redirect('/urls');
  }
  res.redirect(longURL);
   
});
app.get('/register', (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {user: user};
  res.render('urls_register', templateVars);

});

//request to login will check if there is a cookie, and redirect you if so
app.get('/login', (req, res) => {
  const user = users[req.cookies["user_id"]] || undefined;
  const templateVars = {user: user};
  res.render('urls_login', templateVars);

});

//if post request is valid, it will add to database and then redirect to the link passed into database
//it will also check if link s tart with http:// because redirect doesn't seem to work without it.
//user cannot post to this url if they are not logged in
app.post('/urls', (req, res) => {
  const user = users[req.cookies["user_id"]];
  if (user) {

    const key = generateRandomString();
    urlDatabase[key] = {};

    if (req.body.longURL.slice(0,7) !== 'http://') {
      urlDatabase[key].longURL = 'http://' + req.body.longURL;
      urlDatabase[key].userID = req.cookies["user_id"];
    } else {
      urlDatabase[key].longURL = req.body.longURL;
      urlDatabase[key].userID = req.cookies["user_id"];
    }
    console.log(urlDatabase);
    console.log(urlsForUser(req.cookies['user_id']));
    res.redirect(`/u/${key}`);
    return;
  }
  res.status(400).send('you must be logged in to send post requests');
});

//will extract url from :shortURL and then delete it from db
app.post('/urls/:shortURL/delete', (req, res) =>{
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');

});

//will update key in the db based on post wildcard
app.post('/urls/:shortURL/update', (req, res) => {
  const userId = req.cookies["user_id"];
  const shortUrl = req.params.shortURL;
  const updatedURL = req.body.longURL;

  urlDatabase[shortUrl] = {longURL: updatedURL, userID: userId};

  res.redirect('/urls');

});

//takes email and password out of form data compares it to db
//if there is no email in db or the password is incorrect it will retrun a 400 error
app.post('/login', (req, res) => {
  
  let candidateEmail = req.body.email.toLowerCase();
  let candidatePassword = req.body.password;
  let user = UserFromEmail(candidateEmail);
  let hash = createHash('sha256').update(salt + candidatePassword).digest('binary');
  
  if (user) {
    let password = user.password;
    let email = user.email;
    if (email === candidateEmail && password === hash) {

      res.cookie('user_id', user.id , {expires: new Date(Date.now() + 900000)});
      res.redirect('/urls');
      return;
    }
    res.status(400).send('Incorrect Password');
    return;
  }
  res.status(400).send('There is no account registered to this email');
  return;
});


//clears cookies when user presses logout button
app.post('/logout', (req, res) =>{
  res.clearCookie('user_id');
  res.redirect('/urls');
});


//grabs form info from /register and add a new user to the users db
//sends user off with a cookie containing login info
app.post('/register', (req, res) => {

  //lowercased for consistant matching with db
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  if (email === "" || password === "") {
    res.status(400).send('Fields cannot be left empty');
    return;
  }
  if (isEmailInDB(email) === true) {
    res.status(400).send('An account has already been register under this email.');
    return;
  }
  
  const hash = createHash('sha256').update(salt + password).digest('binary');
  const id = generateRandomString();

  let newUser =  {
    "id": id,
    email: email,
    password: hash
  };
  
  users[id] = newUser;
  res.cookie('user_id', id, {expires: new Date(Date.now() + 900000)});
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
