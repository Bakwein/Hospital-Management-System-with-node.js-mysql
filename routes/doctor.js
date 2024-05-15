const express = require('express');
const router = express.Router();
const db = require("../data/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Örnek route
router.get('/', (req, res) => {
    res.send('Doctor route');
});

router.get("/login", function(req,res){
    res.render('doctor/login', {
        title: 'Doktor Girişi',
        kutu_baslik: 'Doktor Girişi',
        message: '',
        alert_type: '',

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
        message: '',
        alert_type: '',
    });
});

function sayiDisindaKarakterVarMi(str) {
    return /\D/.test(str);
}

function harfDisindaKarakterVarMi(str) {
    return /[^a-zA-ZçÇğĞıİöÖşŞüÜ]/.test(str);
}

router.post("/register", async function(req,res){
    try{
        //console.log("doctor register post çalıştı ");
        const {tcno, isim, soyisim,alan, hastane , password, repassword} = req.body;
        console.log(req.body);

        //KONTROLLER
        if(tcno.length !== 11)
        {
            return res.render('doctor/register', {
                message: 'TC Kimlik Numarası 11 haneli olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(tcno)){
            return res.render('doctor/register', {
                message: 'TC Kimlik Numarası sadece sayılardan oluşmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(isim)){
            return res.render('doctor/register', {
                message: 'İsim sadece harflerden oluşmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length < 2)
        {
            return res.render('doctor/register', {
                message: 'İsim en az 2 karakter olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length > 50)
        {
            return res.render('doctor/register', {
                message: 'İsim en fazla 50 karakter olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(soyisim))
        {
            return res.render('doctor/register', {
                message: 'Soyisim sadece harflerden oluşmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length < 2)
        {
            return res.render('doctor/register', {
                message: 'Soyisim en az 2 karakter olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length > 50)
        {
            return res.render('doctor/register', {
                message: 'Soyisim en fazla 50 karakter olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(alan))
        {
            return res.render('doctor/register', {
                message: 'Uzmanlık alanı sadece harflerden oluşmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(alan.length < 2)
        {
            return res.render('doctor/register', {
                message: 'Uzmanlık alanı en az 2 karakter olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(alan.length > 50)
        {
            return res.render('doctor/register', {
                message: 'Uzmanlık alanı en fazla 50 karakter olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(hastane))
        {
            return res.render('doctor/register', {
                message: 'Çalıştığı hastane sadece harflerden oluşmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(hastane.length < 2)
        {
            return res.render('doctor/register', {
                message: 'Çalıştığı hastane en az 2 karakter olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(hastane.length > 50)
        {
            return res.render('doctor/register', {
                message: 'Çalıştığı hastane en fazla 50 karakter olmalıdır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        //BURAYA PASSWORD KONTROLÜ EKLENECEK

        const [results,] = await db.query("SELECT * FROM doktor WHERE tcno = ?", [tcno]);
        //console.log(results);
        if(results.length > 0)
        {
            return res.render('doctor/register', {
                message: 'Bu TC Kimlik Numarası ile kayıtlı bir doktor bulunmaktadır',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        else if(password !== repassword)
        {
            return res.render('doctor/register', {
                message: 'Şifreler uyuşmuyor',
                kutu_baslik: 'Doktor Kayıt',
                title: 'Doktor Kayıt',
                alert_type: 'alert-danger',
            });
        }
        let hashedPassword = await bcrypt.hash(password, 8);
        //console.log(hashedPassword);
        await db.query("INSERT INTO doktor (tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, password) VALUES (?,?,?,?,?,?)", [tcno, isim, soyisim, alan, hastane, hashedPassword]);

        return res.render('doctor/register', {
            message: 'Doktor başarıyla kaydedildi',
            kutu_baslik: 'Doktor Kayıt',
            title: 'Doktor Kayıt',
            alert_type: 'alert-success',
        });
    }
    catch(err){
        console.log(err);
    }
    
});

module.exports = router;
