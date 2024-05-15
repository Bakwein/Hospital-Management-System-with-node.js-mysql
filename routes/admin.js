const express = require('express');
const router = express.Router();
const db = require("../data/db");


// Örnek route
router.get('/', (req, res) => {
    res.send('Admin route');
});


router.get("/login", function(req,res){
    res.render('admin/login', {
        title: 'Admin Girişi',
        kutu_baslik: 'Admin Girişi',
        message: '',
        alert_type: '',
    });
});

router.post("/login", async function(req,res){
    //console.log("admin login post çalıştı ");
    const {username, password} = req.body;
    //console.log(req.body);

   //DEVAM EDECEK
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
