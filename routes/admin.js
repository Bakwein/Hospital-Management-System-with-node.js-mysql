const express = require('express');
const router = express.Router();

// Örnek route
router.get('/', (req, res) => {
    res.send('Admin route');
});


router.use("/login", function(req,res){
    res.render('admin/login', {
        title: 'Admin Girişi',
        kutu_baslik: 'Admin Girişi',
    });
});

/*
router.use("/register", function(req,res){
    res.render('admin/register', {
        title: 'Admin Kayıt',
        kutu_baslik: 'Admin Kayıt',
    });
});
*/
module.exports = router;
