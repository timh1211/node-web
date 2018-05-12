var express = require('express');
var router = express.Router();

//Mongo Client
var MongoClient = require('mongodb');

//Database Name
const dbName = process.env.MONGODB_NAME || 'testDB'; //khai báo biến mỗi trường, gán trên heroku

//URL
const url = process.env.MONGODB_URL || 'mongodb://localhost:27017';
// const url = 'mongodb://haulv1997:hautu411971197@ds119090.mlab.com:19090/web-demo';
//
var jwt = require('jsonwebtoken');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/user-login', (req, res, next) => {
  var currentUser = req.user;
  MongoClient.connect(url, (err, client) => {
      if (err) {
          return res.send({ error: 'DatabaseError', message: 'Connecting failed !' });
      }
      const db = client.db(dbName);
      var userCollection = db.collection('Person');

      userCollection.findOne({ username: req.body.username, password: req.body.password }, (err, user)=>{
        if(err){
          return res.send({error: "mongoError", message: err});
        }

        var token = jwt.sign(user, "json-token", {
          expiresIn: 60*60
        });

        user.token = token;
        res.send({result: user});
      });
  });
});


module.exports = router;
