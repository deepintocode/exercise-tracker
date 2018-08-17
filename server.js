const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const shortid = require('shortid');

let users = [];

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile('index');
});

app.post('/api/exercise/new-user', (req, res) => {
  const username = req.body.username;
  /* Check if user exists
  * If not create a user assign a random ID and push its info to the users array
  */
  if (users.find(x => x.username === username)) {
    res.send('Username already taken')
  } else {
    const userInfo = {
      'username': username,
      _id: shortid.generate()
    };
    users.push(userInfo);
    res.json(userInfo);
  }
});

app.listen(process.env.PORT || 3000, () => console.log('The server is listening at port 3000'));