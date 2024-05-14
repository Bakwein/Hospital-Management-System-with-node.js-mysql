const express = require('express');
const router = express.Router();

// Örnek route
router.get('/', (req, res) => {
    res.send('Doctor route');
});

router.use("/login", function(req,res){
    res.render('doctor/login', {
        title: 'Doktor Girişi',
        kutu_baslik: 'Doktor Girişi',
    });
});

router.use("/register", function(req,res){
    res.render('doctor/register', {
        title: 'Doktor Kayıt',
        kutu_baslik: 'Doktor Kayıt',
    });
});

module.exports = router;
