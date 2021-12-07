const bodyParser = require('body-parser');
const express = require('express');


const app = express();
const PORT = 8080;

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

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

//body parser will parse the buffer recieved when a user POSTs into an object available with req.body
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

//home page redirect to urls page
app.get('/', (req, res) => {
  res.redirect('/urls');
});

//renders page for creating a new key: value in the db
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});


app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});


//renders all the urls into a template
app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});
app.get('/urls.json', (req ,res) => {
  res.json(urlDatabase);
});

// if shortUrl key is in the database it will redirect, else return to /urls page
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.redirect('/urls');
  }
  res.redirect(longURL);
 
});
//if post request is valid, it will add to database and then redirect to the link passed into database
app.post('/urls', (req, res) => {
  console.log(req.body);
  let key = generateRandomString();
  urlDatabase[key] = req.body.longURL;

  res.redirect(`/u/${key}`);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});