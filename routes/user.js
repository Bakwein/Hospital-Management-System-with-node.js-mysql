const express = require('express');
const router = express.Router();

// Örnek route
router.get('/', (req, res) => {
    res.send('User route');
});

router.use("/login", function(req,res){
    res.render('user/login', {
        title: 'Kullanıcı Girişi',
        kutu_baslik: 'Kullanıcı Girişi',

    });
});

router.use("/register", function(req,res){
    res.render('user/register', {
        title: 'Kullanıcı Kayıt',
        kutu_baslik: 'Kullanıcı Kayıt',
    });
});

module.exports = router;
