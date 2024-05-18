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
                return res.redirect('/doctor/login');
            }
            else{
                //split the token
                const user = decoded;
                if(user.role == 'admin'){
                    return res.redirect('/admin/home_render');
                }
                else if(user.role == 'doctor'){
                    return res.redirect('/doctor/home_render');
                }
                else if (user.role == 'hasta'){
                    return res.redirect('/user/home_render');
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

        const [results3,] = await db.execute("SELECT * FROM doktor WHERE tcno = ?", [tcno]);

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
            if( await bcrypt.compare(password, hashedInput, ))
            {
                const user_id = results3[0].iddoktor;
                const token = jwt.sign({tcno: tcno, user_id: user_id, role: 'doctor'}, process.env.JWT_SECRET, {expiresIn: '1h'});
                //cookie
                if(process.env.isHttps == 'true'){
                    res.cookie('token', token, {httpOnly: true, secure: true});
                }
                else{
                    res.cookie('token', token, {httpOnly: true});
                }
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
                return res.redirect('/doctor/register');
            }
            else{
                //split the token
                const user = decoded;
                if(user.role == 'admin'){
                    return res.redirect('/admin/home_render');
                }
                else if(user.role == 'doctor'){
                    return res.redirect('/doctor/home_render');
                }
                else if (user.role == 'hasta'){
                    return res.redirect('/user/home_render');
                }
            }
        });
    }

    res.redirect('/doctor/register');

   
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

        const [results,] = await db.execute("SELECT * FROM doktor WHERE tcno = ?", [tcno]);
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
        await db.execute("INSERT INTO doktor (tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, password) VALUES (?,?,?,?,?,?)", [tcno, isim, soyisim, alan, hastane, hashedPassword]);

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


router.get('/profile', async function(req,res){
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                return res.redirect('/doctor/login');
            }
        });
    }
    try{
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tcno = decoded.tcno;
        const [results,] = await db.execute("SELECT * FROM doktor WHERE tcno = ?", [tcno]);

        if(results.length === 0)
        {
           res.clearCookie('token');
              res.redirect('/doctor/login');
        }
        else
        {
            res.render('doctor/profile', {
                id: results[0].iddoktor,
                tcno: results[0].tcno,
                isim: results[0].isim,
                soyisim: results[0].soyisim,
                uzmanlik_alani: results[0].uzmanlik_alani,
                calistigi_hastane: results[0].calistigi_hastane,
            });
        }

    }
    catch(err){
        console.log(err);
    }
});

//post 

router.post('/profile_update', async function(req,res){
    try{
        const {id, tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, sifre} = req.body; 

        if(tcno.length !== 11)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'TC Kimlik Numarası 11 haneli olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(tcno))
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'TC Kimlik Numarası sadece sayılardan oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(isim))
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'İsim sadece harflerden oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length < 2)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'İsim en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length > 50)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'İsim en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(soyisim))
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Soyisim sadece harflerden oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length < 2)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Soyisim en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length > 50)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Soyisim en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(uzmanlik_alani.length < 2)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Uzmanlık alanı en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(uzmanlik_alani.length > 50)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Uzmanlık alanı en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(calistigi_hastane.length < 2)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Çalıştığı hastane en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(calistigi_hastane.length > 100)
        {
            return res.render('doctor/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Çalıştığı hastane en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            const [results,] = await db.execute("SELECT * FROM doktor WHERE tcno = ?", [tcno]);
            let newHashed = await bcrypt.hash(sifre, 8);
            if(results.length === 0 )
            {
                await db.execute("UPDATE doktor SET tcno = ?, isim = ?, soyisim = ?, uzmanlik_alani = ?, calistigi_hastane = ?, password = ? WHERE iddoktor = ?", [tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, newHashed ,id]);

                //token
                res.clearCookie('token');
                const token = jwt.sign({tcno: tcno, user_id: id, role: 'doctor'}, process.env.JWT_SECRET, {expiresIn: '1h'});
                if(process.env.isHttps == 'true'){
                    res.cookie('token', token, {httpOnly: true, secure: true});
                }
                else{
                    res.cookie('token', token, {httpOnly: true});
                }

                return res.render('doctor/profile_update', {
                    id: id,
                    tcno: tcno,
                    isim: isim,
                    soyisim: soyisim,
                    uzmanlik_alani: uzmanlik_alani,
                    calistigi_hastane: calistigi_hastane,
                    message: 'Profil başarıyla güncellendi',
                    alert_type: 'alert-success',
                });
            }
            else
            {
                if(results[0].iddoktor == id)
                {
                    await db.execute("UPDATE doktor SET tcno = ?, isim = ?, soyisim = ?, uzmanlik_alani = ?, calistigi_hastane = ?, password = ? WHERE iddoktor = ?", [tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane,newHashed, id]);

                    //token
                    res.clearCookie('token');
                    const token = jwt.sign({tcno: tcno, user_id: id, role: 'doctor'}, process.env.JWT_SECRET, {expiresIn: '1h'});
                    if(process.env.isHttps == 'true'){
                        res.cookie('token', token, {httpOnly: true, secure: true});
                    }
                    else{
                        res.cookie('token', token, {httpOnly: true});
                    }

                    return res.render('doctor/profile_update', {
                        id: id,
                        tcno: tcno,
                        isim: isim,
                        soyisim: soyisim,
                        uzmanlik_alani: uzmanlik_alani,
                        calistigi_hastane: calistigi_hastane,
                        message: 'Profil başarıyla güncellendi',
                        alert_type: 'alert-success',
                    });
                } 
                else
                {
                    return res.render('doctor/profile_update', {
                        id: id,
                        tcno: tcno,
                        isim: isim,
                        soyisim: soyisim,
                        uzmanlik_alani: uzmanlik_alani,
                        calistigi_hastane: calistigi_hastane,
                        message: 'Bu TC Kimlik Numarası ile kayıtlı bir doktor bulunmaktadır',
                        alert_type: 'alert-danger',
                    });
                
                }
            }
        }
    }  
    catch(err){
        console.log(err);
    }
});



router.get('/profile_update', async function(req,res){
    try{
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tcno = decoded.tcno;
        const [results,] = await db.execute("SELECT * FROM doktor WHERE tcno = ?", [tcno]);
        res.render('doctor/profile_update', {
            id: results[0].iddoktor,
            tcno: results[0].tcno,
            isim: results[0].isim,
            soyisim: results[0].soyisim,
            uzmanlik_alani: results[0].uzmanlik_alani,
            calistigi_hastane: results[0].calistigi_hastane,
            message: '',
            alert_type: '',
        });

    }
    catch(err){
        console.log(err);
    }
});

router.get('/profile_update_render', async function(req,res){
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                return res.redirect('/doctor/login');
            }
        });
    }
    res.redirect('/doctor/profile_update');
    
    
});

module.exports = router;
