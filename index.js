const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(console.log("Berhasil konek database"))
  .catch(error => console.log(error))

const userSchema = mongoose.Schema({
    username: {
      type: String,
      unique: true
    }
  }, { versionKey: false })

const User = mongoose.model('User', userSchema);

app.use(cors())
app.use(express.urlencoded({extended: true}))
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

  if(foundUser){
    res.json(foundUser);
  }
  else{
    const user = await User.create({
      username,
    });
  
    res.json(user);
  }
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
