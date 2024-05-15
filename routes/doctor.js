const express = require('express');
const router = express.Router();
const db = require("../data/db");

// Örnek route
router.get('/', (req, res) => {
    res.send('Doctor route');
});

router.get("/login", function(req,res){
    res.render('doctor/login', {
        title: 'Doktor Girişi',
        kutu_baslik: 'Doktor Girişi',
    });
});

router.post("/login", function(req,res){
    console.log("doctor login post çalıştı ");
    const {tcno, password} = req.body;
    console.log(req.body);
});

router.get("/register", function(req,res){
    res.render('doctor/register', {
        title: 'Doktor Kayıt',
        kutu_baslik: 'Doktor Kayıt',
    });
});

router.post("/register", function(req,res){
    console.log("doctor register post çalıştı ");
    const {tcno, isim, soyisim,uzmanlik_alani, calistigi_hastane , password, repassword} = req.body;
    console.log(req.body);
});

module.exports = router;
