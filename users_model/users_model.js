var DB = require('../mySqlDb/db.js');
var BCRYPT = require('bcrypt');
var secretKeys = require('../config.js');
var secret = secretKeys.secret;
var saltRounds = 10;
var selectColforUserList = "id, email, name, address, contact, user_image";

var createUser = (req, res) => {
    BCRYPT.hash(req.body.password, saltRounds, function(err, hash) {
        req.body.password = hash;         
        DB.query('INSERT INTO users SET ?', req.body, function (err, result) {
            if (err)
            res.status(500).send({ status:500, error:err, data:'', message:'SERVER_ERROR' });
            else
            res.status(200).send({status:200, error:'', data:result, message:'SUCCESS' });
        });
    });
}

var updateUser = (req, res) => {       
        DB.query('UPDATE users SET ? WHERE id = ?', req.body, function (err, result) {
            if (err)
            res.status(500).send({ status:500, error:err, data:'', message:'SERVER_ERROR' });
            else
            res.status(200).send({ status:200, error:'', data:result, message:'SUCCESS' });
        });
}

var getUsers = (req, res) => {
    DB.query('SELECT '+selectColforUserList+' FROM users', function (err, result, fields) {
        if (err)
        res.status(500).send({ status:500, error:err, data:'', message:'SERVER_ERROR' });
        else
        res.status(200).send({ status:200, error:'', data:result, message:'SUCCESS' });        
    });
}

var getUser = (req, res) => {
    DB.query('SELECT '+selectColforUserList+' FROM users WHERE id = ?',[req.params.id], function (err, result, fields) {
        if (err)
        res.status(500).send({ status:500, error:err, data:'', message:'SERVER_ERROR' });
        if(result.length !=0)
        res.status(200).send({ status:200, error:'', data:result, message:'SUCCESS' });
        else
        res.status(404).send({ status:404, error:'USER_NOT_FOUND', data:[], message:'USER_NOT_FOUND' });       
    });
}

var deleteUser = (req, res) => {    
    var id = req.params.id;
    DB.query('DELETE FROM users WHERE id = ?',[id], function (err, result, fields) {
        if (err)
        res.status(500).send({ status:500, error:err, data:'', message:'SERVER_ERROR' });
        if(result.affectedRows != 0)
        res.status(200).send({ status:200, error:'', data:result, message:'SUCCESS' });
        else
        res.status(404).send({ status:404, error:'USER_NOT_FOUND', data:result, message:'USER_NOT_FOUND' });        
    });
}

module.exports = {createUser, getUsers, getUser, deleteUser, secret, BCRYPT, selectColforUserList};