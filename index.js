const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(console.log("Berhasil konek database"))
  .catch(error => console.log(error))

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      unique: true
    }
  },
  { versionKey: false }
);
const User = mongoose.model('User', userSchema);

const exerciseSchema = mongoose.Schema(
  {
    username: String,
    description: String,
    duration: Number,
    date: Date,
    userId: String
  },
  { versionKey: false }
);
const Exercise = mongoose.model('Exercise', exerciseSchema)


app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// GET request to /api/users
app.get('/api/users', async (req, res) => {
  const users = await User.find();

  // sgdsdf

  res.send(users);
})

// POST to /api/users username
app.post('/api/users', async (req, res) => {
  const username = req.body.username;
  const foundUser = await User.findOne({
    username
  })

  if (foundUser) {
    res.json(foundUser);
  }
  else {
    const user = await User.create({
      username,
    });

    res.json(user);
  }
})

// GET request to /api/users/:_id/logs
app.get('/api/users/:_id/logs', async (req, res) => {
  let { from, to, limit } = req.query;
  const userId = req.params._id;
  const foundUser = await User.findById(userId);
  if (!foundUser) {
    res.json({
      message: "No User Found!"
    })
  }

  let filter = { userId };
  let dateFilter = {};
  if(from){
    dateFilter["$gte"] = new Date(from);
  }
  if(to){
    dateFilter["$lte"] = new Date(to);
  }
  if(from || to){
    filter.date = dateFilter
  }

  if(!limit){
    limit = 100;
  }

  // console.log(filter)
  
  let getExercises = await Exercise.find(filter).limit(limit);

  getExercises = getExercises.map((obj) => {
    return {
      description: obj['description'],
      duration: obj['duration'],
      date: obj['date'].toDateString()
    }
  });

  // res.json(getExercises);

  res.json({
    _id: userId,
    username: foundUser.username,
    count: getExercises.length,
    log: getExercises
  })
})

// POST to /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  let { description, duration, date } = req.body;
  const userId = req.body[":_id"];
  const foundUser = await User.findById(userId);

  if (!foundUser) {
    res.json({
      message: "No User Found!"
    })
  }
  else {
    if (!date) {
      date = new Date();
    }
    else {
      date = new Date(date);
    }

    await Exercise.create({
      username: foundUser.username,
      description,
      duration,
      date: date,
      userId: userId
    })

    res.send({
      username: foundUser.username,
      description,
      duration,
      date: date.toDateString(),
      _id: userId
    });
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
