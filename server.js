'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const moment = require('moment');
const async = require('async');
var morgan  = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var multer = require('multer');
var connectToDB = require('./mySqlDb/db.js');
var usermodel = require('./users_model/users_model.js');
app.use(express.static(__dirname + '/uploads/'));

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
      cb(null, Date.parse(new Date)+file.originalname)
    }
});

var upload = multer({storage: storage});

app.use(bodyParser.json());                                     
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

var port = process.env.PORT || 8080;

var router = express.Router();  

connectToDB.connect(function(err) {
        if (err)
        throw err;
        console.log('DB Connected');            
});


// route to authenticate a user 
router.post('/authenticate', function(req, res) {
          connectToDB.query('SELECT * FROM users WHERE email = ?', [req.body.email], function (err, result) {
            if (err)
            res.status(500).send({ status:500, error:err, data:'', message:'SERVER_ERROR' });

            if(result.length != 0){
                usermodel.BCRYPT.compare(req.body.password, result[0].password, function(err, resstatus) {
                    if(resstatus) {
                    var payload = {
                            user:req.body.email
                        }
                    var token = jwt.sign(payload, usermodel.secret, {
                        expiresIn: 60*60*24 // expires in 24 hours
                    });
                    res.status(200).send({ status:200, error:'', data:{'token':token, 'user':result}, message:'SUCCESS' });
                    } else {
                    res.status(404).send({ status:404, error:'AUTHENTICATION_FAILED', data:[], message:'AUTHENTICATION_FAILED' });
                    }
                });
            } else {
                res.status(404).send({ status:404, error:'USER_NOT_FOUND', data:result, message:'USER_NOT_FOUND'});
            }            
        });
});
// route to authenticate a user end here    

router.post('/createUser', upload.single('user_image'), function(req, res){
    req.body.user_image = req.file.filename; 
    usermodel.createUser(req, res)
});

router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, usermodel.secret, function(err, decoded) {      
      if (err) {
        return res.status(403).send({ status:403, error:'AUTHENTICATION_FAILED', data:[], message:'AUTHENTICATION_FAILED' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ status:403, error:'NO_TOKEN_PROVIDED', data:[], message:'NO_TOKEN_PROVIDED' });
  }
});


router.get('/getUsers', function (req, res) {
    usermodel.getUsers(req, res);
});

router.get('/getUser/:id', function(req, res){
   usermodel.getUser(req, res);
});

router.delete('/deleteUser/:id', function(req, res){
   usermodel.deleteUser(req, res);
});

router.get('/checkWaterFall/:me/:friend', function(req, res) {
    async.waterfall(
        [
            function(callback) {
                
                callback(null, req.params.me, req.params.friend);
            },
            function(arg1, arg2, callback) {
                var caption = arg1 +' and '+ arg2;
                callback(null, caption);
            },
            function(caption, callback) {
                caption += ' works!';
                callback(null, caption);
            }
        ],
        function (err, caption) {
            console.log(caption);
            
        }
    );
});

app.use('/api', router);
app.listen(port);
console.log('Server is up on ' + port);

