const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../data/db');

router.get("/", function(req,res){
    res.render('login_register/first',{
        title: 'İlk Sayfa',
    });
});

module.exports = router;