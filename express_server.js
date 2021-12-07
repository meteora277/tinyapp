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
console.log(generateRandomString());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

//body parser will parse the buffer recieved when a user POSTs into an object available with req.body
app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.send('Hello!');
});
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render('urls_show', templateVars);
});

app.get('/urls', (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render('urls_index', templateVars);
});
app.get('/urls.json', (req ,res) => {
  res.json(urlDatabase);
});
app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('OK');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});