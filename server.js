'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const hapidb = require('./mySqlDb/db.js');
const moment = require('moment');
const bcrypt = require('bcrypt');
const async = require('async');
var morgan  = require('morgan');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var secret = require('./config.js');
const saltRounds = 10;

var selectColforUserList = "id, email, name, address";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

var port = process.env.PORT || 8080;

var router = express.Router();  

// router.use(function (req, res, next) {
//   console.log('Time:', moment().format('MMMM Do YYYY, h:mm:ss a'))
//   console.info(`${req.method} ${req.originalUrl}`)
//   res.on('finish', () => {
//         console.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`)
//     })
  
//   next()
// })

hapidb.connect(function(err) {
        if (err)
        return err;
        console.log('DB Connected');            
});


// route to authenticate a user 
router.post('/authenticate', function(req, res) {

          hapidb.query('SELECT * FROM users WHERE email = ?', [req.body.email], function (err, result) {
            if (err)
            res.status(500).send({
                status:500,
                error:err,
                data:'',
                message:'SERVER_ERROR'
            });

            if(result.length != 0){
                console.log(result[0].password, secret.secret);
                bcrypt.compare(req.body.password, result[0].password, function(err, resstatus) {
                if(resstatus) {
                   var payload = {
                        user:req.body.email
                    }
                var token = jwt.sign(payload, secret.secret, {
                expiresIn: 60*60*24 // expires in 24 hours
                });

                 res.status(200).send({
                    status:200,
                    error:'',
                    data:{'token':token, 'user':result},
                    message:'SUCCESS'
                });
                } else {
                res.status(404).send({
                    status:404,
                    error:'AUTHENTICATION_FAILED',
                    data:[],
                    message:'AUTHENTICATION_FAILED'
                });
                } 
                });
                

            } else {
                res.status(404).send({
                status:404,
                error:'USER_NOT_FOUND',
                data:result,
                message:'USER_NOT_FOUND'
                });  
            }
            
        });

});
// route to authenticate a user end here    

router.post('/createUser', function(req, res){

    var hashPwd = req.body.password;

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        req.body.password = hash;
            
        hapidb.query('INSERT INTO users SET ?', req.body, function (err, result) {
            if (err)
            res.send({
                status:500,
                error:err,
                data:'',
                message:'SERVER_ERROR'
            });
            else
            res.send({
                status:200,
                error:'',
                data:result,
                message:'SUCCESS'
            });
            console.log('data inserted successfully.')
        });

    });

});

router.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token || req.headers['x-access-token'];

  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, secret.secret, function(err, decoded) {      
      if (err) {
        return res.status(403).send({
                status:403,
                error:'AUTHENTICATION_FAILED',
                data:[],
                message:'AUTHENTICATION_FAILED'
            });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
                status:403,
                error:'NO_TOKEN_PROVIDED',
                data:[],
                message:'NO_TOKEN_PROVIDED'
            });

  }
});


router.get('/getUsers', function(req, res){


    hapidb.query('SELECT '+selectColforUserList+' FROM users', function (err, result, fields) {
        if (err)
        res.send({
            status:500,
            error:err,
            data:'',
            message:'SERVER_ERROR'
        });
        else
        res.send({
            status:200,
            error:'',
            data:result,
            message:'SUCCESS'
        });
        
    });

});

router.get('/getUser/:id', function(req, res){


    hapidb.query('SELECT '+selectColforUserList+' FROM users WHERE id = ?',[req.params.id], function (err, result, fields) {
        if (err)
        res.send({
            status:500,
            error:err,
            data:'',
            message:'SERVER_ERROR'
        });
        if(result.length !=0)
        res.status(200).send({
            status:200,
            error:'',
            data:result,
            message:'SUCCESS'
        });
        else
         res.status(404).send({
            status:404,
            error:'USER_NOT_FOUND',
            data:[],
            message:'USER_NOT_FOUND'
        });   
        
    });

});

router.delete('/deleteUser/:id', function(req, res){

  var id = req.params.id;

    hapidb.query('DELETE FROM users WHERE id = ?',[id], function (err, result, fields) {
        if (err)
        res.send({
            status:500,
            error:err,
            data:'',
            message:'SERVER_ERROR'
        });
        if(result.affectedRows != 0)
        res.send({
            status:200,
            error:'',
            data:result,
            message:'SUCCESS'
        });
        else
        res.send({
            status:404,
            error:'USER_NOT_FOUND',
            data:result,
            message:'USER_NOT_FOUND'
        });    
        
    });

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

