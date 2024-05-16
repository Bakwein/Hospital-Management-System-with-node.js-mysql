const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../data/db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');




router.get("/", function(req,res){
    //token cookie kontrolü
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                res.render('login_register/first',{
                    title: 'İlk Sayfa',
                });
            }
            else{
                //split the token
                const user = decoded;
                if(user.role == 'admin'){
                    res.render('/admin/home', {
                        title: 'Admin Anasayfa',
                    });
                }
                else if(user.role == 'doctor'){
                    res.render('/doctor/home',{
                        title: 'Doktor Anasayfa',
                    });
                }
                else if (user.role == 'hasta'){
                    res.render('/user/home', {
                        title: 'Kullanıcı Anasayfa',
                    });
                }
            }
        });
    }


    res.render('login_register/first',{
        title: 'İlk Sayfa',
    });
});

module.exports = router;