const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../data/db');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();


router.get("/", function(req,res){
    //token cookie kontrolü
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                return res.render('login_register/first',{
                    title: 'İlk Sayfa',
                });
            }
            else{
                //split the token
                const user = decoded;
                if(user.role == 'admin'){
                    return res.render('/admin/home', {
                        title: 'Admin Anasayfa',
                    });
                }
                else if(user.role == 'doctor'){
                    return res.render('/doctor/home',{
                        title: 'Doktor Anasayfa',
                    });
                }
                else if (user.role == 'hasta'){
                    return res.render('/user/home', {
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