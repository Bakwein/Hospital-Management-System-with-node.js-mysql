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


router.get('/randevu-list', async function(req,res){
    try{
        const token = req.cookies.token;
        if(!token)
        {
            return res.redirect('/doctor/login');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const id = decoded.user_id;

        //idden tcno bul
        const [doctors, ] = await db.execute("SELECT * FROM doktor WHERE iddoktor = ?", [id]);
        if(doctors.length === 0)
        {
            return res.redirect('/doctor/login');
        }
        const d_tcno = doctors[0].tcno;


        const [results,] = await db.execute("SELECT * FROM randevu WHERE d_tcno = ?", [d_tcno]);
        const [hastalar, ] = await db.execute("SELECT * FROM hasta");
        res.render('doctor/randevu-list', {
            randevular: results,
            hastalar: hastalar,
            message: '',
            alert_type: '',
        });
    }
    catch(err){
        console.log(err);
    }
});

router.post('/randevu/:randevuid', async function(req,res){
    const randevuid = req.params.randevuid;
    let {doktor, hasta, tarih, saat} = req.body;
    let doc_id = doktor;

    try{
        const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
        const [hastalar, ] = await db.execute("SELECT * FROM hasta");

        //doctor tc'yi al
        let doktor_tcno = '';
        const [doktorlar_tc, ] = await db.execute("SELECT tcno FROM doktor WHERE iddoktor = ?", [doktor]);
        if(doktorlar_tc.length === 0)
        {
            return res.render('doctor/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doktor,
                selectedHastaId: hasta,
                selectedSaat: saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Doktor bulunamadı',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            doktor_tcno = doktorlar_tc[0].tcno;
        }

        //hasta tcyi al
        let hasta_tcno = '';
        const [hasta_tc, ] = await db.execute("SELECT tcno FROM hasta WHERE hastaid = ?", [hasta]);
        if(hasta_tc.length === 0)
        {
            return res.render('doctor/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doc_id,
                selectedHastaId: hasta,
                selectedSaat: saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Hasta bulunamadı',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            hasta_tcno = hasta_tc[0].tcno;
        }

        doktor = doktor_tcno;
        hasta = hasta_tcno;

        //doktorun güncellenecek tarihte başka bir randevusu var mı kontrol et
        const [randevular, ] = await db.execute("SELECT * FROM randevu WHERE d_tcno = ? AND tarih = ? AND saat = ?", [doktor, tarih, saat]);
        if(randevular.length > 0)
        {
            return res.render('doctor/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doc_id,
                selectedHastaId: hasta,
                selectedSaat: saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Doktorun bu saatte başka bir randevusu var',
                alert_type: 'alert-danger',
            });
        }
        //hastanın güncellenecek tarihte başka bir randevusu var mı kontrol et
        const [randevular2, ] = await db.execute("SELECT * FROM randevu WHERE h_tcno = ? AND tarih = ? AND saat = ?", [hasta, tarih, saat]);
        if(randevular2.length > 0)
        {
            return res.render('doctor/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doc_id,
                selectedHastaId: hasta,
                selectedSaat: saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Hastanın bu saatte başka bir randevusu var',
                alert_type: 'alert-danger',
            });
        }

        //güncelle
        await db.execute("UPDATE randevu SET d_tcno = ?, h_tcno = ?, tarih = ?, saat = ? WHERE randevuid = ?", [doktor, hasta, tarih, saat, randevuid]);

        res.render('doctor/randevu-edit', {
            doktorlar: doktorlar,
            hastalar: hastalar,
            selectedDoktorId: doc_id,
            selectedHastaId: hasta,
            selectedSaat: saat,
            //min tarih + 1 gün
            min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            //max tarih = min_tarih + 15 gün
            max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            message: 'Randevu başarıyla güncellendi',
            alert_type: 'alert-success',
        });


    }
    catch(err)
    {
        console.log(err);
    }
});


router.get('/randevu/:randevuid', async function(req,res){
    const randevuid = req.params.randevuid;
    try{

        const [randevular, ] = await db.execute("SELECT * FROM randevu WHERE randevuid = ?", [randevuid]);
        if(randevular.length === 0)
        {
            const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
            const [hastalar, ] = await db.execute("SELECT * FROM hasta");

            const [doktor_id, ] = await db.execute("SELECT iddoktor FROM doktor WHERE tcno = ?", [randevular[0].d_tcno]);
            const [hasta_id, ] = await db.execute("SELECT idhasta FROM hasta WHERE tcno = ?", [randevular[0].h_tcno]);
            return res.render('doctor/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doktor_id[0].iddoktor,
                selectedHastaId: hasta_id[0].idhasta,
                selectedSaat: randevular[0].saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Randevu bulunamadı',
                alert_type: 'alert-danger',
            });        
        }
        else
        {
            const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
            const [hastalar, ] = await db.execute("SELECT * FROM hasta");

            const [doktor_id, ] = await db.execute("SELECT iddoktor FROM doktor WHERE tcno = ?", [randevular[0].d_tcno]);
            const [hasta_id, ] = await db.execute("SELECT hastaid FROM hasta WHERE tcno = ?", [randevular[0].h_tcno]);
            if(doktor_id.length === 0)
            {
                return res.render('doctor/randevu-edit', {
                    doktorlar: doktorlar,
                    hastalar: hastalar,
                    selectedDoktorId: '',
                    selectedHastaId: '',
                    selectedSaat: '',
                    //min tarih + 1 gün
                    min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    //max tarih = min_tarih + 15 gün
                    max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    message: 'Doktor bulunamadı',
                    alert_type: 'alert-danger',
                });
            }
            else if(hasta_id.length === 0)
            {
                return res.render('doctor/randevu-edit', {
                    doktorlar: doktorlar,
                    hastalar: hastalar,
                    selectedDoktorId: '',
                    selectedHastaId: '',
                    selectedSaat: '',
                    //min tarih + 1 gün
                    min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    //max tarih = min_tarih + 15 gün
                    max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    message: 'Hasta bulunamadı',
                    alert_type: 'alert-danger',
                });
            }
            
            return res.render('doctor/randevu-edit', {

                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doktor_id[0].iddoktor,
                selectedHastaId: hasta_id[0].hastaid,
                selectedSaat: randevular[0].saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: '',
                alert_type: '',
            });
            
        }

    }
    catch(err)
    {
        console.log(err);
    }

});

router.get('/randevu/delete/:randevuid', async function(req,res){
    const randevuid = req.params.randevuid;
    try{
        //Randevu var mi
        const [randevular, ] = await db.execute("SELECT * FROM randevu WHERE randevuid = ?", [randevuid]);
        if(randevular.length === 0)
        {
            return res.redirect('/doctor/randevu-list');
        }
        //sil
        await db.execute("DELETE FROM randevu WHERE randevuid = ?", [randevuid]);
        res.redirect('/doctor/randevu-list');
    }
    catch(err)
    {
        console.log(err);
    }
});

router.get('/hasta-list', async function(req,res){
    try{
        const token = req.cookies.token;
        if(!token)
        {
            return res.redirect('/doctor/login');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tcno = decoded.tcno;

        //randevu tablosundan h_tcno'su tcno ile eşleşen randevuların h_tcno'sunu unique olarak getir
        const [results,] = await db.execute("SELECT DISTINCT h_tcno FROM randevu WHERE d_tcno = ?", [tcno]);

        //users dizisi olutşur
        let users = [];
        for(let i = 0; i < results.length; i++)
        {
            //her bir h_tcno için hasta tablosundan hastayı çek
            const [user, ] = await db.execute("SELECT * FROM hasta WHERE tcno = ?", [results[i].h_tcno]);
            users.push(user[0]);
        }
        res.render('doctor/hasta-list', {
            users: users,
            message: '',
            alert_type: '',
        });
        
    }   
    catch(err)
    {
        console.log(err);
    }
});

router.get('/rapor-list', async function(req,res){
    try{
        const token = req.cookies.token;
        if(!token)
        {
            return res.redirect('/doctor/login');
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tcno = decoded.tcno;

        //randevu tablosundan h_tcno'su tcno ile eşleşen randevuların h_tcno'sunu unique olarak getir
        const [results,] = await db.execute("SELECT DISTINCT h_tcno FROM randevu WHERE d_tcno = ?", [tcno]);

        let raporlar = [];
        //burada raporlar birden fazla olabilir ona göre ekleme yapılacak . resultsda tcno lar var
        for(let i = 0; i < results.length; i++)
        {
            const [rapor, ] = await db.execute("SELECT * FROM rapor WHERE h_tcno = ?", [results[i].h_tcno]);
            raporlar.push(rapor);
        }
        console.log(raporlar);
        res.render('doctor/rapor-list', {
            rapors: raporlar[1],
            message: '',
            alert_type: '',
        });


    }
    catch(err)
    {
        console.log(err);
    }
});

router.get('/rapor/:raporid', async function(req,res){
    const raporid = req.params.raporid;

    try{
        const [raporlar, ] = await db.execute("SELECT * FROM rapor WHERE raporid = ?", [raporid]);
        if(raporlar.length === 0)
        {
           const [hastalar, ] = await db.execute("SELECT * FROM hasta");
              return res.render('doctor/rapor-edit', {
                hastalar: hastalar,
                tcno: '',
                tarih: '',
                icerik: '',
                message: 'Rapor bulunamadı',
                alert_type: 'alert-danger',
              });
        }
        else
        {
            const [hastalar, ] = await db.execute("SELECT * FROM hasta");
            return res.render('doctor/rapor-edit', {
                hastalar: hastalar,
                tcno: raporlar[0].h_tcno,
                tarih: raporlar[0].tarih,
                icerik: raporlar[0].icerik,
                message: '',
                alert_type: '',
              });
        }

    }
    catch(err)
    {
        console.log(err);
    }
});

router.get('/rapor-create', async function(req,res){
    try{
        const [hastalar, ] = await db.execute("SELECT * FROM hasta");
        res.render('doctor/rapor-create', {
            hastalar: hastalar,
            tcno: '',
            tarih: '',
            icerik: '',
            message: '',
            alert_type: '',
        });
    }
    catch(err)
    {
        console.log(err);
    }
});


module.exports = router;
