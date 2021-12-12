const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const express = require('express');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString, isEmailInDB, getURLsOfUser } = require('./helpers.js');

const app = express();
const PORT = 8080;

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
    password: '$2a$10$Ll3/tzdT77ZwdJmqGjRqlu0c99Oq73OqVEEoqBunOclpg/XR3cWl.'
  }
};


//custom middleware to read user id from cookie, and append the user obj to the request
const getCurrentUser = (req, res, next) => {
  const currentUser = users[req.session['user_id']] || undefined;

  req.currentUser = currentUser;
  next();
};
//body parser will parse the buffer recieved when a user POSTs into an object available with req.body
app.use(cookieSession({
  name: 'session',
  keys: ['83ea39af-3669-45c2-af71-eba99b07bdf7'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(bodyParser.urlencoded({extended: true}));
app.use(getCurrentUser);
app.set('view engine', 'ejs');

//home page redirect to urls page
app.get('/', (req, res) => {
  const user = req.getCurrentUser || undefined;
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

//renders page for creating a new key: value in the db
//user will be redirected if they are not logged in
app.get('/urls/new', (req, res) => {

  const user = req.currentUser;

  //conditionally renders the new page only if user is logged in, else redirects them to the login page
  if (user) {
    const templateVars = {user: user};
    res.render('urls_new', templateVars);
    return;
  }
  res.redirect('/login');
  return;

});

//reads url ket from params and gets the associated long url from the database
app.get('/urls/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  const user = req.currentUser;

  if (user) {
    //if url they are specifying doesn't match an item in db it will throw an error
    if (urlDatabase[shortURL] === undefined) {
      res.status(404).send("this page doesn't exist");
      return;
    }
    //if user tries to view a url that they do not have permission to, it will throw an error
    if (urlDatabase[shortURL].userID !== user.id) {
      res.status(401).send("You do not have access to this page");
      return;
    }
    
    const templateVars = {shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user: user};
    res.render('urls_show', templateVars);
    return;
  }
  res.status(401).send("You do not have access to this page");
  return;
});

//renders all the urls into a template
app.get('/urls', (req, res) => {

  const user = users[req.session.user_id];
  let filteredUserUrls = undefined;

  if (user) {
    filteredUserUrls = getURLsOfUser(user.id, urlDatabase);
  }
  
  const templateVars = {urls: filteredUserUrls , user: user};
  res.render('urls_index', templateVars);
});

// if shortUrl key is in the database it will redirect, else return to /urls page
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (longURL === undefined) {
    res.redirect('/urls');
    return;
  }
  res.redirect(longURL);
  return;
   
});

//send back register page, if user is logged in already it will redirect to the /urls page
app.get('/register', (req, res) => {
  const user = req.currentUser || undefined;
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: user};
  res.render('urls_register', templateVars);
  return;
});

//request to login will check if there is a cookie, and redirect you if so
app.get('/login', (req, res) => {
  const user = users[req.session.user_id] || undefined;

  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVars = {user: user};
  res.render('urls_login', templateVars);
  return;
});

// for testing purposes
// app.get('/urls.json', (req ,res) => {
//   res.json(urlDatabase);
// });

//if post request is valid, it will add to database and then redirect to the link passed into database
//it will also check if link s tart with http:// because redirect doesn't seem to work without it.
//user cannot post to this url if they are not logged in, and will be redirected to /urls
app.post('/urls', (req, res) => {

  const user = req.currentUser;
  if (user) {

    const key = generateRandomString();
    urlDatabase[key] = {};
    const hasProtocol = req.body.longURL.slice(0,7) === 'http://' || req.body.longURL.slice(0,8) === 'https://';

    if (hasProtocol) {
      urlDatabase[key].longURL = req.body.longURL;
      urlDatabase[key].userID = req.session.user_id;
    } else {
      urlDatabase[key].longURL = 'http://' + req.body.longURL;
      urlDatabase[key].userID = req.session.user_id;
    }
    
    res.redirect(`/urls/${key}`);
    return;
  }
  res.status(400).send('you must be logged in to send post requests');
  return;
});

//will extract url from :shortURL and then delete it from db
app.post('/urls/:shortURL/delete', (req, res) =>{
  
  let shortURL = req.params.shortURL;
  const urlKey = urlDatabase[shortURL];
  const user = req.currentUser;

  //if ID of user matches the owner ID of the url it will delete that URL from the DB
  if (user.id === urlKey.userID) {
 
    delete urlDatabase[shortURL];
  }
  
  res.redirect('/urls');
  return;
});

//will update key in the db based on post wildcard
app.post('/urls/:shortURL', (req, res) => {

  const shortURL = req.params.shortURL;
  const updatedURL = req.body.longURL;
  const user = req.currentUser;
  const urlKey = urlDatabase[shortURL];

  //if current user's id and urls own don't match it will not update
  if (user.id === urlKey.userID) {
    urlDatabase[shortURL] = {longURL: updatedURL, userID: user.id};
  }
  res.redirect('/urls');
  return;
});

//takes email and password out of form data compares it to db
//if there is no email in db or the password is incorrect it will retrun a 400 error
app.post('/login', (req, res) => {
  
  let candidateEmail = req.body.email.toLowerCase();
  let candidatePassword = req.body.password;
  let user = getUserByEmail(candidateEmail, users);

  //if either field is empty it will throw an error
  if (candidatePassword === "" || candidateEmail === "") {
    res.status(400).send('Fields cannot be left empty');
    return;
  }
   
  if (user) {

    let password = user.password;
    const correctPassword = bcrypt.compareSync(candidatePassword, password);
    if (correctPassword) {

      req.session["user_id"] = user.id;
      res.redirect('/urls');
      return;
    }
    res.status(400).send('Incorrect Password');
    return;
  }
  res.status(400).send('There is no account registered to this email');
  return;
});

//grabs form info from /register and add a new user to the users db
//sends user off with a cookie containing login info
app.post('/register', (req, res) => {

  //lowercased for consistant matching with db
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  //if either field is empty it will throw an error
  if (email === "" || password === "") {
    res.status(400).send('Fields cannot be left empty');
    return;
  }

  //if email is already in db it will fail to register and throw an error
  if (isEmailInDB(email, users) === true) {
    res.status(400).send('An account has already been register under this email.');
    return;
  }
  
  const hash = bcrypt.hashSync(password, 10);
  const id = generateRandomString();

  let newUser =  {
    "id": id,
    email: email,
    password: hash
  };
  
  users[id] = newUser;

  req.session['user_id'] = id;
  res.redirect('/urls');
  return;
});

//clears cookies when user presses logout button
app.post('/logout', (req, res) =>{
  req.session = null;
  res.redirect('/urls');
  return;
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
