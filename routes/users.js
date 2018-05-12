var express = require('express');
var router = express.Router();

//Mongo Client
var MongoClient = require('mongodb');

//Database Name
const dbName = 'testDB';

//khai báo object Id
var ObjectId = require('mongodb').ObjectID;

//URL
const url = 'mongodb://localhost:27017';

//
var jwt = require('jsonwebtoken');

router.use((req, res, next) => {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, 'json-token', (err, decoded) => {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        console.log(decoded, 'TOKEN');
        req.user = decoded;    
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
});

/* GET users listing. */
router.get('/', (req, res, next) => {
  var users = [{title: "List of Users"},
    { firstName: "James", lastName: "Lê", Age: "18" },
    { firstName: "James", lastName: "Lê", Age: "18" },
    { firstName: "James", lastName: "Lê", Age: "18" }    
    ]
  res.send(users);
});

//getLists
router.post('/getUsers', (req, res) => {

  var listPaging = [];

  var page = parseInt(req.query.page);
  var limit = parseInt(req.query.limit);
  var sort = parseInt(req.query.sort);

  MongoClient.connect(url, (err, client) => {
      if (err) {
          return res.send({ error: 'DatabaseErro', message: 'Connecting failed ! ' });
      }
      const db = client.db(dbName);

      var userCollection = db.collection('Person');

      if (typeof req.query.page == 'undefined' || typeof req.query.limit == 'undefined') {
          page = 0;
          limit = 0;
      }
      userCollection.find({}, { birthdate: 1, _id: 0 })
          .sort({ birthdate: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray().then((result) => {
              return res.send({ users: result, lenght: result.length });
              client.close();
          }).catch((err) => {
              return res.send({ error: 'DatabaseError', message: 'Connecting failed ! ' });
              client.close();
          });
  });
});

module.exports = router;
