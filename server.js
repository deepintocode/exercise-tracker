const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./user');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.sendFile('index');
});

app.post('/api/exercise/new-user', (req, res) => {
  const username = req.body.username;
  User.findOne({ username: username })
  .then((data) => {
    if(data) {
      res.send(`The username '${username}' is not available`);
    } else {
      User.create({ username: username })
      .then(data => res.json({username: data.username, userId: data._id}));
    }
  })
  .catch(err => console.log(err));
});

app.post('/api/exercise/add', (req, res) => {
  const { userId, description, duration } = req.body;
  if(!userId || !description || !duration) {
    res.send('The user ID, description and duration fields are required.');
  }
  let date = req.body.date;
  if (date === '') {
    date = new Date();
  }
  if(mongoose.Types.ObjectId.isValid(userId)) {
    User.findByIdAndUpdate(userId, { $push: {
      log: {
        description: description,
        duration: duration,
        date: date
      }
    }})
    .then((data) => {
      if(data) {   
        res.json({
          username: data.username,
          description: description,
          duration: duration,
          date: date
        });
      } else {
        res.send(`UserId ${userId} not found.`);
      }
    })
  .catch(err => console.log(err));
  } else {
    res.send('This is not a valid ID');
  }
});

app.get('/api/exercise/log', (req, res) => {
  let { userId, from, to, limit } = req.query;
  if(!userId) {
    res.send('The user ID query is required.');
  }
  if(!mongoose.Types.ObjectId.isValid(userId)) {
    res.send('The user ID is not valid.')
  }
  User.findById(userId)
  .then(data => {
    if(data) {
      let filteredData = data.log;
      if(from && to) {
        from = new Date(from);
        to = new Date(to);
        filteredData = data.log.filter(x => (x.date > from && x.date < to))
      }
      else if(from) {
        from = new Date(from);
        filteredData = data.log.filter(x => (x.date > from))
      }
      else if(to) {
        to = new Date(to);
        filteredData = data.log.filter(x => (x.date < to))
      } 
      if(limit) {
        limit = Number(limit);
        filteredData = filteredData.slice(0, limit);
      }
      res.json(filteredData);
    } else {
      res.send('The user ID does not exist');
    }
  })
  .catch(err => console.log(err));
  
});

app.listen(process.env.PORT || 3000, () => console.log('The server is listening at port 3000'));