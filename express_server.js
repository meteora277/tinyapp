const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const { createHash } = require('crypto');

const app = express();
const PORT = 8080;
const salt = "IamSalt";



const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};
const users = {
  "uwuowo": {
    id: "uwuowo",
    email:'justin.s.diaz@gmail.com',
    password: '!"Öõ£$\x00ÕÄ¼\t\n»½H&\x996.Cü\x91\x194[\x07\x00Ï\x17\x84\x1C\x1C'
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
const isEmailInDB = (checkEmail) => {
  for (let user in users) {
    if (users[user].email === checkEmail) {
      return true;
    }
  }
  return false;
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
app.get('/urls/new', (req, res) => {

  const user = users[req.cookies["user_id"]];
  const templateVars = {user: user};
  res.render('urls_new', templateVars);

});

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies["user_id"]];
  
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: user};
  res.render('urls_show', templateVars);
});

//renders all the urls into a template
app.get('/urls', (req, res) => {
  const user = users[req.cookies["user_id"]] || undefined;
  const templateVars = {urls: urlDatabase, user: user};
  res.render('urls_index', templateVars);
});
app.get('/urls.json', (req ,res) => {
  res.json(urlDatabase);
});

// if shortUrl key is in the database it will redirect, else return to /urls page
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
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

//if post request is valid, it will add to database and then redirect to the link passed into database
//it will also check if link start with http:// becuase redirect doesn't seem to work without it.
app.post('/urls', (req, res) => {

  const key = generateRandomString();
  if (req.body.longURL.slice(0,7) !== 'http://') {
    urlDatabase[key] = 'http://' + req.body.longURL;
  } else {
    urlDatabase[key] = req.body.longURL;
  }
  res.redirect(`/u/${key}`);
});

//will extract url from :shortURL and then delete it from db
app.post('/urls/:shortURL/delete', (req, res) =>{
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');

});

//will update key in the db based on post wildcard
app.post('/urls/:shortURL/update', (req, res) => {
  let shortUrl = req.params.shortURL;
  let updatedURL = req.body.longURL;
  urlDatabase[shortUrl] = updatedURL;
  res.redirect('/urls');

});

//yakes username out of form data and creates a cookie login information
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username, { expires: new Date(Date.now() + 900000)});
  res.redirect('/urls');
});


//clears cookies when user presses logout button
app.post('/logout', (req, res) =>{
  res.clearCookie('user_id');
  res.redirect('/urls');
});


//grabs form info from /register and add a new user to the users db

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
  console.log(users)
  res.cookie('user_id', id, {expires: new Date(Date.now() + 900000)});
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
//î³nrn?þÁm§y»NSø¥¾'oÌ?Æê