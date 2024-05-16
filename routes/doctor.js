const express = require('express');
const router = express.Router();
const db = require("../data/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

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



router.get("/login_render", function(req,res){
    if(req.cookies.token)
    {
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                res.redirect('/doctor/login');
            }
            else{
                //split the token
                const user = decoded;
                if(user.role == 'admin'){
                    res.redirect('/admin/home_render');
                }
                else if(user.role == 'doctor'){
                   res.redirect('/doctor/home_render');
                }
                else if (user.role == 'hasta'){
                    res.redirect('/user/home_render');
                }
            }
        });
    }
    res.redirect('/doctor/login');
});

router.post("/login", async function(req,res){
    try{
        const {tcno, password} = req.body;
        //console.log(req.body);

        if(tcno.length !== 11)
        {
            return res.render('doctor/login', {
                message: 'TC Kimlik Numarası 11 haneli olmalıdır',
                kutu_baslik: 'Doktor Girişi',
                title: 'Doktor Girişi',
                alert_type: 'alert-danger',
            });
        }

        const [results3,] = await db.query("SELECT * FROM doktor WHERE tcno = ?", [tcno]);

        if(results3.length === 0)
        {
            return res.render('doctor/login', {
                message: 'Bu TC Kimlik Numarası ile kayıtlı bir doktor bulunmamaktadır',
                kutu_baslik: 'Doktor Girişi',
                title: 'Doktor Girişi',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            const hashedInput = results3[0].password;
            if( await bcrypt.compare(password, hashedInput))
            {
                const user_id = results3[0].iddoktor;
                const token = jwt.sign({tcno: tcno, user_id: user_id, role: 'doctor'}, process.env.JWT_SECRET, {expiresIn: '1h'});
                //cookie
                res.cookie('token', token, {httpOnly: true});
                //https
                //res.cookie('token', token, {httpOnly: true, secure: true});
                //console.log(token);
                return res.redirect('/doctor/home_render');
            }
            else
            {
                return res.render('doctor/login', {
                    message: 'Şifre hatalı',
                    kutu_baslik: 'Doktor Girişi',
                    title: 'Doktor Girişi',
                    alert_type: 'alert-danger',
                });
            }
        }

    }
    catch(err)
    {
        console.log(err);
    }
    


});

router.get("/register", function(req,res){
    res.render('doctor/register', {
        title: 'Doktor Kayıt',
        kutu_baslik: 'Doktor Kayıt',
        message: '',
        alert_type: '',
    });
});

router.get("/register_render", function(req,res){
    if(req.cookies.token)
    {
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                res.redirect('/doctor/register');
            }
            else{
                //split the token
                const user = decoded;
                if(user.role == 'admin'){
                    res.redirect('/admin/home_render');
                }
                else if(user.role == 'doctor'){
                    res.redirect('/doctor/home_render');
                }
                else if (user.role == 'hasta'){
                    res.redirect('/user/home_render');
                }
            }
        });
    res.redirect('/doctor/register');
    }
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

function verifyToken(req,res)
{
    const token = req.cookies.token;
    if(!token)
    {
        return res.render('doctor/login',
        {
            message: 'Token bulunamadı',
            kutu_baslik: 'Doktor Girişi',
            title: 'Doktor Girişi',
            alert_type: 'alert-danger',
        }
        );
    }
    try
    {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        //console.log(decoded);
        return decoded;
    }
    catch(err)
    {
        return res.render('doctor/login',
        {
            message: 'Token geçersiz',
            kutu_baslik: 'Doktor Girişi',
            title: 'Doktor Girişi',
            alert_type: 'alert-danger',
        }
        );
    }
}

router.get("/home", function(req,res){
    res.render('doctor/home', {
        title: 'Doktor Anasayfa',
    });
});

router.get("/home_render", function(req,res){
    const user = verifyToken(req,res);
    //console.log(user);
    res.redirect('/doctor/home');
});

router.get("/logout", function(req,res){
    res.clearCookie('token');
    res.redirect('/doctor/login_render');
});

module.exports = router;
