const express = require('express');
const router = express.Router();
const db = require("../data/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

//class import
const { Hasta, Admin, Doktor, Randevu, Rapor} = require('../classes/classes');


function sayiDisindaKarakterVarMi(str) {
    return /\D/.test(str);
}

function harfDisindaKarakterVarMi(str) {
    return /[^a-zA-ZçÇğĞıİöÖşŞüÜ]/.test(str);
}

function isValidDate(str)
{
    const date = new Date(str);
    return !isNaN(date.getTime());
}

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


router.get("/login_render", function(req,res){
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
               return  res.redirect('/admin/login');
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

    res.redirect('/admin/login');
});

router.post("/login", async function(req,res){
    try{
        //console.log("admin login post çalıştı ");
        const {username, password} = req.body;
        //console.log(req.body);

        const [admins, ] = await db.execute("SELECT * FROM admin WHERE kullaniciadi = ?", [username]);

        if(admins.length === 0){
            return res.render('admin/login', {
                title: 'Admin Girişi',
                kutu_baslik: 'Admin Girişi',
                message: 'Kullanıcı adı veya şifre hatalı',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            if(password == admins[0].sifre){
                const token = jwt.sign({username: admins[0].kullaniciadi, user_id: admins[0].id, role: "admin"}, process.env.JWT_SECRET, {expiresIn: '1h'});
                if(process.env.isHttps == 'true'){
                    res.cookie('token', token, {httpOnly: true, secure: true});
                }
                else{
                    res.cookie('token', token, {httpOnly: true});
                }


                //console.log(token);

                return res.redirect('/admin/home_render');

                
            }
            else
            {
                return res.render('admin/login', {
                    title: 'Admin Girişi',
                    kutu_baslik: 'Admin Girişi',
                    message: 'Kullanıcı adı veya şifre hatalı',
                    alert_type: 'alert-danger',
                });
            }
        }

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
        return res.render('admin/login',
        {
            message: 'Token bulunamadı',
            kutu_baslik: 'Kullanıcı Girişi',
            title: 'Kullanıcı Girişi',
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
        return res.render('admin/login',
        {
            message: 'Token geçersiz',
            kutu_baslik: 'Kullanıcı Girişi',
            title: 'Kullanıcı Girişi',
            alert_type: 'alert-danger',
        }
        );
    }
}

router.get("/home", function(req,res){
    res.render('admin/home', {
        title: 'Admin Anasayfa',
    });
});

router.get("/home_render", function(req,res){
    const user = verifyToken(req,res);
    //console.log(user);
    res.redirect('/admin/home');
});

router.get("/logout", function(req,res){
    res.clearCookie('token');
    res.redirect('/admin/login_render');
});


router.get('/doctor-list', async function(req,res){
    let page = parseInt(req.query.page, 10) || 1;
    let postPerPage = 12;
    let i = page > 4 ? page - 2 : 1
    let offset = (postPerPage * page) - postPerPage;
    let sql2 = 'SELECT * FROM doktor'
    try{
        const [countResult] = await db.execute('SELECT COUNT(*) AS count FROM doktor');
        let count = countResult[0].count;

        const result = await db.execute("SELECT * FROM doktor LIMIT " + offset + ", " + postPerPage) 
        res.render('admin/doctor-list', {
            doctors: result[0],
            nowPage: parseInt(page),
            totalPage: Math.ceil(count/postPerPage),
            i: i,
            message: '',
            alert_type: '',
        });

    }
    catch(err)
    {
        console.log(err);
    }
});

router.get('/hasta-list', async function(req,res){
    let page = parseInt(req.query.page, 10) || 1;
    let postPerPage = 12;
    let i = page > 4 ? page - 2 : 1
    let offset = (postPerPage * page) - postPerPage;
    let sql2 = 'SELECT * FROM hasta'
    try{
        const [countResult] = await db.execute('SELECT COUNT(*) AS count FROM hasta');
        let count = countResult[0].count;

        const result = await db.execute("SELECT * FROM hasta LIMIT " + offset + ", " + postPerPage) 
        res.render('admin/hasta-list', {
            users: result[0],
            nowPage: parseInt(page),
            totalPage: Math.ceil(count/postPerPage),
            i: i
        });

    }
    catch(err)
    {
        console.log(err);
    }
});

router.get('/hasta-create', function(req,res){
    res.render('admin/hasta-create',
    {
        message: '',
        alert_type: '',
    });
});




router.post('/hasta-create', async function(req,res){
    //console.log(req.body);
    
    try{
        const {tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, sifre} = req.body;


        if(tcno.length != 11){
            return res.render('admin/hasta-create', {
                message: 'TC numarası 11 haneli olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(tcno)){
            return res.render('admin/hasta-create', {
                message: 'TC numarası sadece sayılardan oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(isim)){
            return res.render('admin/hasta-create', {
                message: 'İsim sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length < 2){
            return res.render('admin/hasta-create', {
                message: 'İsim en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length > 50){
            return res.render('admin/hasta-create', {
                message: 'İsim en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(soyisim)){
            return res.render('admin/hasta-create', {
                message: 'Soyisim sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length < 2){
            return res.render('admin/hasta-create', {
                message: 'Soyisim en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length > 50){
            return res.render('admin/hasta-create', {
                message: 'Soyisim en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(!isValidDate(dogumTarihi)){
            return res.render('admin/hasta-create', {
                message: 'Doğum tarihi hatalı.',
                alert_type: 'alert-danger',
            });
        }
        else if(new Date(dogumTarihi) > new Date()){
            return res.render('admin/hasta-create', {
                message: 'Doğum tarihi bugünden büyük olamaz.',
                alert_type: 'alert-danger',
            });
        }
        else if(cinsiyet !== '1' && cinsiyet !== '2' && cinsiyet !== '0'){
            return res.render('admin/hasta-create', {
                message: 'Cinsiyet hatalı.',
                alert_type: 'alert-danger',
            });
        }
        else if(telefon.length != 10){
            return res.render('admin/hasta-create', {
                message: 'Telefon numarası 10 haneli olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(telefon)){
            return res.render('admin/hasta-create', {
                message: 'Telefon numarası sadece sayılardan oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(sehir)){
            return res.render('admin/hasta-create', {
                message: 'Şehir sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sehir.length < 2){
            return res.render('admin/hasta-create', {
                message: 'Şehir en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sehir.length > 50){
            return res.render('admin/hasta-create', {
                message: 'Şehir en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(ilce)){
            return res.render('admin/hasta-create', {
                message: 'İlçe sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(ilce.length < 2){
            return res.render('admin/hasta-create', {
                message: 'İlçe en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(ilce.length > 50){
            return res.render('admin/hasta-create', {
                message: 'İlçe en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(mahalle.length < 2){
            return res.render('admin/hasta-create', {
                message: 'Mahalle en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(mahalle.length > 50){
            return res.render('admin/hasta-create', {
                message: 'Mahalle en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }


        const [users, ] = await db.execute("SELECT * FROM hasta WHERE tcno = ?", [tcno]);

        if(users.length === 0){
            const hashedPassword = await bcrypt.hash(sifre, 8);

            await db.execute("INSERT INTO hasta(tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, sifre) VALUES(?,?,?,?,?,?,?,?,?,?)",[tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, hashedPassword]);



            //hasta nesnesi oluştur
            let hasta_nesne = new Hasta(null, tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, sifre);

            res.render('admin/hasta-create', {
                message: 'Hasta başarıyla eklendi.',
                alert_type: 'alert-success',
            });
        }
        else
        {
            res.render('admin/hasta-create', {
                message: 'Bu TC numarası ile kayıtlı bir kullanıcı zaten var.',
                alert_type: 'alert-danger',
            });
        }

    }
    catch(err){
        console.log(err);
    }
    
});

router.get('/doctor-create', function(req,res){
    res.render('admin/doctor-create',
    {
        message: '',
        alert_type: '',
    });
});

router.post('/doctor-create', async function(req,res){
    //console.log(req.body);
    
    try{
        const {tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, sifre} = req.body;

        if(tcno.length != 11){
            return res.render('admin/doctor-create', {
                message: 'TC numarası 11 haneli olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(tcno))
        {
            return res.render('admin/doctor-create', {
                message: 'TC numarası sadece sayılardan oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(isim)){
            return res.render('admin/doctor-create', {
                message: 'İsim sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length < 2){
            return res.render('admin/doctor-create', {
                message: 'İsim en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length > 50){
            return res.render('admin/doctor-create', {
                message: 'İsim en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(soyisim)){
            return res.render('admin/doctor-create', {
                message: 'Soyisim sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length < 2){
            return res.render('admin/doctor-create', {
                message: 'Soyisim en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length > 50){
            return res.render('admin/doctor-create', {
                message: 'Soyisim en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(uzmanlik_alani.length < 2){
            return res.render('admin/doctor-create', {
                message: 'Uzmanlık alanı en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(uzmanlik_alani.length > 50){
            return res.render('admin/doctor-create', {
                message: 'Uzmanlık alanı en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(calistigi_hastane.length < 2){
            return res.render('admin/doctor-create', {
                message: 'Çalıştığı hastane en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(calistigi_hastane.length > 100){
            return res.render('admin/doctor-create', {
                message: 'Çalıştığı hastane en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }

        const [doctors, ] = await db.execute("SELECT * FROM doktor WHERE tcno = ?", [tcno]);


        if(doctors.length === 0){
            const hashedPassword = await bcrypt.hash(sifre, 8);
            //console.log(hashedPassword);

            await db.execute("INSERT INTO doktor(tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, password) VALUES(?,?,?,?,?,?)",[tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, hashedPassword]);
            //doktor nesnesi
            let doktor_nesne = new Doktor(null, tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, sifre);
            

            res.render('admin/doctor-create', {
                message: 'Doktor başarıyla eklendi.',
                alert_type: 'alert-success',
            });
        }
        else
        {
            res.render('admin/doctor-create', {
                message: 'Bu TC numarası ile kayıtlı bir doktor zaten var.',
                alert_type: 'alert-danger',
            });
        }
        
    }
    catch(err){
        console.log(err);
    }
});


router.get('/profile', async function(req,res){
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                return res.redirect('/admin/login');
            }
        });
    }
    try{
        const token = req.cookies.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const username = decoded.username;
    const [admins, ] = await db.execute("SELECT * FROM admin WHERE kullaniciadi = ?", [username]);

    if(admins.length === 0){
        //cookieyi temizle
        res.clearCookie('token');
        return res.redirect('/admin/login');
    }
    else{
        res.render('admin/profile', {
            id: admins[0].adminid,
            kullaniciadi: admins[0].kullaniciadi,
        });
    }

    }
    catch(err)
    {
        console.log(err);
    }
    


});

//post
router.post('/profile_update', async function(req,res){
    try{
        const {id, kullaniciadi, sifre} = req.body;
        //console.log(id, kullaniciadi, sifre);

        if(kullaniciadi.length < 2){
            return res.render('admin/profile_update', {
                id: id,
                kullaniciadi: kullaniciadi,
                message: 'Kullanıcı adı en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(kullaniciadi.length > 50){
            return res.render('admin/profile_update', {
                id: id,
                kullaniciadi: kullaniciadi,
                message: 'Kullanıcı adı en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else{
            const [admins, ] = await db.execute("SELECT * FROM admin WHERE kullaniciadi = ?", [kullaniciadi]);
            if(admins.length === 0){
                await db.execute("UPDATE admin SET kullaniciadi = ?, sifre = ? WHERE adminid = ?", [kullaniciadi, sifre, id]);

                //token
                res.clearCookie('token');
                const token = jwt.sign({username: kullaniciadi, user_id: id, role: "admin"}, process.env.JWT_SECRET, {expiresIn: '1h'});
                //cookie
                if(process.env.isHttps == 'true'){
                    res.cookie('token', token, {httpOnly: true, secure: true});
                }
                else{
                    res.cookie('token', token, {httpOnly: true});
                }

                res.render('admin/profile_update', {
                    id: id,
                    kullaniciadi: kullaniciadi,
                    message: 'Profil başarıyla güncellendi.',
                    alert_type: 'alert-success',
                });
            }
            else{
                // aynı kullanıcı adı var, güncelle
                if(admins[0].adminid == id){
                    await db.execute("UPDATE admin SET kullaniciadi = ?, sifre = ? WHERE adminid = ?", [kullaniciadi, sifre, id]);

                    //token
                    res.clearCookie('token');
                    const token = jwt.sign({username: kullaniciadi, user_id: id, role: "admin"}, process.env.JWT_SECRET, {expiresIn: '1h'});
                    //cookie
                    if(process.env.isHttps == 'true'){
                        res.cookie('token', token, {httpOnly: true, secure: true});
                    }
                    else{
                        res.cookie('token', token, {httpOnly: true});
                    }

                    res.render('admin/profile_update', {
                        id: id,
                        kullaniciadi: kullaniciadi,
                        message: 'Profil başarıyla güncellendi.',
                        alert_type: 'alert-success',
                    });
                }
                else{
                    return res.render('admin/profile_update', {
                        id: id,
                        kullaniciadi: kullaniciadi,
                        message: 'Bu kullanıcı adı zaten kullanımda.',
                        alert_type: 'alert-danger',
                    });
                }
            }
        }

    }
    catch(err)
    {
        console.log(err);
    }
});


router.get('/profile_update', async function(req,res){
    try{
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const username = decoded.username;
        const [admins, ] = await db.execute("SELECT * FROM admin WHERE kullaniciadi = ?", [username]);
        res.render('admin/profile_update', {
            id: admins[0].adminid,
            kullaniciadi: admins[0].kullaniciadi,
            message: '',
            alert_type: '',
        });

    }
    catch(err)
    {
        console.log(err);
    }
    
});


router.get('/profile_update_render', function(req,res){
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                return res.redirect('/admin/login');
            }
        });
    }
    res.redirect('/admin/profile_update');
    
    

});

router.post("/hasta/:hastaid", async function(req,res){
    const hastaid = req.params.hastaid;
    const {tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle} = req.body;

    try{
        if(tcno.length != 11){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'TC numarası 11 haneli olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(tcno)){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'TC numarası sadece sayılardan oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(isim)){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İsim sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length < 2){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İsim en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length > 50){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İsim en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(soyisim)){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Soyisim sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length < 2){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Soyisim en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length > 50){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Soyisim en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(!isValidDate(dogumTarihi)){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Doğum tarihi hatalı.',
                alert_type: 'alert-danger',
            });
        }
        else if(new Date(dogumTarihi) > new Date()){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Doğum tarihi bugünden büyük olamaz.',
                alert_type: 'alert-danger',
            });
        }
        else if(cinsiyet !== '1' && cinsiyet !== '2' && cinsiyet !== '0'){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Cinsiyet hatalı.',
                alert_type: 'alert-danger',
            });
        }
        else if(telefon.length != 10){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Telefon numarası 10 haneli olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(telefon)){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Telefon numarası sadece sayılardan oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(sehir)){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Şehir sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sehir.length < 2){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Şehir en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sehir.length > 50){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Şehir en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(ilce)){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İlçe sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(ilce.length < 2){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İlçe en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(ilce.length > 50){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İlçe en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(mahalle.length < 2){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Mahalle en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(mahalle.length > 50){
            return res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Mahalle en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            await db.execute("UPDATE hasta SET tcno = ?, isim = ?, soyisim = ?, dogumTarihi = ?, cinsiyet = ?, telefon = ?, sehir = ?, ilce = ?, mahalle = ? WHERE hastaid = ?",[tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, hastaid]);

            //bildirim
            await db.execute("INSERT INTO bildirim(tcno, role, date, icerik) VALUES(?,?,?,?)",[tcno, 'hasta', new Date().toISOString().slice(0, 19).replace('T', ' '), 'Hasta bilgileriniz güncellendi.']);

            res.render('admin/hasta-edit', {
                id: hastaid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Hasta başarıyla güncellendi.',
                alert_type: 'alert-success',
            });
        }


    }
    catch(err)
    {
        console.log(err);
    }
});


router.get("/hasta/:hastaid", async function(req,res){
    const hastaid = req.params.hastaid;

    try{
        const [users, ] = await db.execute("SELECT * FROM hasta WHERE hastaid = ?", [hastaid]);
        if(users.length === 0){
            return res.render('admin/hasta-edit', {
                message: 'Hasta bulunamadı.',
                alert_type: 'alert-danger',
            });
        }
        else{
            //console.log(users[0].tcno, "**");

            res.render('admin/hasta-edit', {
                id: users[0].hastaid,
                tcno: users[0].tcno,
                isim: users[0].isim,
                soyisim: users[0].soyisim,
                dogumTarihi: users[0].dogumTarihi,
                cinsiyet: users[0].cinsiyet,
                telefon: users[0].telefon,
                sehir: users[0].sehir,
                ilce: users[0].ilce,
                mahalle: users[0].mahalle,
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

router.post("/doktor/:doktorid", async function(req,res){
    const doktorid = req.params.doktorid;
    const {tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane} = req.body;
    try{
        if(tcno.length != 11){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'TC numarası 11 haneli olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(tcno))
        {
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'TC numarası sadece sayılardan oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(isim)){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'İsim sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length < 2){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'İsim en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length > 50){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'İsim en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(soyisim)){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Soyisim sadece harflerden oluşmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length < 2){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Soyisim en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length > 50){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Soyisim en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(uzmanlik_alani.length < 2){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Uzmanlık alanı en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(uzmanlik_alani.length > 50){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Uzmanlık alanı en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else if(calistigi_hastane.length < 2){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Çalıştığı hastane en az 2 karakter olmalıdır.',
                alert_type: 'alert-danger',
            });
        }
        else if(calistigi_hastane.length > 100){
            return res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Çalıştığı hastane en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            await db.execute("UPDATE doktor SET tcno = ?, isim = ?, soyisim = ?, uzmanlik_alani = ?, calistigi_hastane = ? WHERE iddoktor = ?",[tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, doktorid]);

            //bildirim
            await db.execute("INSERT INTO bildirim(tcno, role, date, icerik) VALUES(?,?,?,?)",[tcno, 'doktor', new Date().toISOString().slice(0, 19).replace('T', ' '), 'Doktor bilgileriniz güncellendi.']);

            res.render('admin/doctor-edit', {
                id: doktorid,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                uzmanlik_alani: uzmanlik_alani,
                calistigi_hastane: calistigi_hastane,
                message: 'Doktor başarıyla güncellendi.',
                alert_type: 'alert-success',
            });
        }
    }
    catch(err)
    {
        console.log(err);
    }
});


router.get("/doktor/:doktorid", async function(req,res){
    const doktorid = req.params.doktorid;

    try{
        const [doctors, ] = await db.execute("SELECT * FROM doktor WHERE iddoktor = ?", [doktorid]);
        if(doctors.length === 0){
            return res.render('admin/doctor-edit', {
                message: 'Doktor bulunamadı.',
                alert_type: 'alert-danger',
            });
        }
        else{
            res.render('admin/doctor-edit', {
                id: doctors[0].doktorid,
                tcno: doctors[0].tcno,
                isim: doctors[0].isim,
                soyisim: doctors[0].soyisim,
                uzmanlik_alani: doctors[0].uzmanlik_alani,
                calistigi_hastane: doctors[0].calistigi_hastane,
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

router.get("/hasta/delete/:hastaid", async function(req,res){
    const hastaid = req.params.hastaid;

    try{
        //await db.execute("DELETE FROM hasta WHERE hastaid = ?", [hastaid]);

        await db.execute("DELETE FROM hasta WHERE hastaid = ?", [hastaid]);

        res.redirect('/admin/hasta-list');
    }
    catch(err)
    {
        console.log(err);
    }
});

router.get("/doktor/delete/:doktorid", async function(req,res){
    let page = parseInt(req.query.page, 10) || 1;
    let postPerPage = 12;
    let i = page > 4 ? page - 2 : 1
    let offset = (postPerPage * page) - postPerPage;
    const doktorid = req.params.doktorid;
    try{

        //const [doctors, ] = await db.execute("SELECT * FROM doktor");
        //doctor tcsi bul
        const [countResults] = await db.execute('SELECT COUNT(*) AS count FROM doktor');
        let count = countResults[0].count;
        const [doktorlar_tc, ] = await db.execute("SELECT * FROM doktor WHERE iddoktor = ?", [doktorid]);
        const result = await db.execute("SELECT * FROM doktor LIMIT " + offset + ", " + postPerPage) ;
        if(doktorlar_tc.length === 0){
            return res.render('admin/doctor-list', {
                doctors: result[0],
                nowPage: parseInt(page),
                totalPage: Math.ceil(count/postPerPage),
                i: i,
                message: 'Doktor bulunamadı.',
                alert_type: 'alert-danger',                

            });
        }

        const [randevular, ] = await db.execute("SELECT * FROM randevu WHERE d_tcno = ?", [doktorlar_tc[0].tcno]);
        if(randevular.length > 0){
            return res.render('admin/doctor-list', {
                doctors: result[0],
                nowPage: parseInt(page),
                totalPage: Math.ceil(count/postPerPage),
                i: i,
                message: 'Bu doktora ait randevular olduğu için silinemez.',
                alert_type: 'alert-danger',
                
            });
        }

        await db.execute("DELETE FROM doktor WHERE iddoktor = ?", [doktorid]);


        res.redirect('/admin/doctor-list');
    }
    catch(err)
    {
        console.log(err);
    }
});


router.get('/randevu-list', async function(req,res){
    let page = parseInt(req.query.page, 10) || 1;
    let postPerPage = 12;
    let i = page > 4 ? page - 2 : 1
    let offset = (postPerPage * page) - postPerPage;
    let sql2 = 'SELECT * FROM randevu'
    try{
        const [countResult] = await db.execute('SELECT COUNT(*) AS count FROM randevu');
        let count = countResult[0].count;

        const result = await db.execute("SELECT * FROM randevu LIMIT " + offset + ", " + postPerPage) ;
        const result2 = await db.execute("SELECT * FROM doktor") ;
        const result3 = await db.execute("SELECT * FROM hasta") ;
        res.render('admin/randevu-list', {
            randevular: result[0],
            doktorlar: result2[0],
            hastalar: result3[0],
            nowPage: parseInt(page),
            totalPage: Math.ceil(count/postPerPage),
            i: i,
            message: '',
            alert_type: '',
        });

    }
    catch(err)
    {
        console.log(err);
    }
});

router.get('/randevu-create', async function(req,res){
    try{
        const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
        const [hastalar, ] = await db.execute("SELECT * FROM hasta");
        res.render('admin/randevu-create', {
            doktorlar: doktorlar,
            hastalar: hastalar,
            //min tarih + 1 gün
            min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            //max tarih = min_tarih + 15 gün
            max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            message: '',
            alert_type: '',
        });
    }
    catch(err)
    {
        console.log(err);
    }
});


router.post('/randevu-create', async function(req,res){
    let {doktor, hasta, tarih, saat} = req.body;
    //console.log(doktor, hasta, tarih, saat);



    try{
        const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
        const [hastalar, ] = await db.execute("SELECT * FROM hasta");

        //doktor tc'yi al
        let doktor_tcno = '';
        const [doktorlar_tc, ] = await db.execute("SELECT * FROM doktor WHERE iddoktor = ?", [doktor]);
        if(doktorlar_tc.length === 0){
            return res.render('admin/randevu-create', {
                doktorlar: doktorlar,
            hastalar: hastalar,
            //min tarih + 1 gün
            min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            //max tarih = min_tarih + 15 gün
            max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Doktor bulunamadı.',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            doktor_tcno = doktorlar_tc[0].tcno;
        }

        //hasta tc'yi al
        let hasta_tcno = '';
        const [hastalar_tc, ] = await db.execute("SELECT * FROM hasta WHERE hastaid = ?", [hasta]);
        if(hastalar_tc.length === 0){
            return res.render('admin/randevu-create', {
                message: 'Hasta bulunamadı.',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            hasta_tcno = hastalar_tc[0].tcno;
        }

        doktor = doktor_tcno;
        hasta = hasta_tcno;

        //doktorun randevusu var mı?
        const [randevular, ] = await db.execute("SELECT * FROM randevu WHERE d_tcno = ? AND tarih = ? AND saat = ?", [doktor, tarih, saat]);
        if(randevular.length > 0){
            return res.render('admin/randevu-create', {
                doktorlar: doktorlar,
            hastalar: hastalar,
            //min tarih + 1 gün
            min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            //max tarih = min_tarih + 15 gün
            max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Bu doktorun bu tarihte ve saatte randevusu zaten var.',
                alert_type: 'alert-danger',
            });
        }
        //hastanın randevusu var mı?
        const [randevular2, ] = await db.execute("SELECT * FROM randevu WHERE h_tcno = ? AND tarih = ? AND saat = ?", [hasta, tarih, saat]);
        if(randevular2.length > 0){
            return res.render('admin/randevu-create', {
                doktorlar: doktorlar,
            hastalar: hastalar,
            //min tarih + 1 gün
            min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            //max tarih = min_tarih + 15 gün
            max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Bu hastanın bu tarihte ve saatte randevusu zaten var.',
                alert_type: 'alert-danger',
            });
        }

        //oluştur
        await db.execute("INSERT INTO randevu(d_tcno, h_tcno, tarih, saat) VALUES(?,?,?,?)",[doktor, hasta, tarih, saat]);
        //randevu nesnesi oluşturma
        let randevu_nesne = new Randevu(null, tarih, saat,doktor , hasta);
        
        //bildirim oluşturma
        await db.execute("INSERT INTO bildirim(tcno, role, date, icerik) VALUES(?,?,?,?)",[doktor, "doktor", new Date().toISOString().slice(0, 19).replace('T', ' '), "Randevunuz oluşturuldu."]);
        await db.execute("INSERT INTO bildirim(tcno, role, date, icerik) VALUES(?,?,?,?)",[hasta, "hasta", new Date().toISOString().slice(0, 19).replace('T', ' '), "Randevunuz oluşturuldu."]);
    

        
        

        res.render('admin/randevu-create', {
            doktorlar: doktorlar,
            hastalar: hastalar,
            //min tarih + 1 gün
            min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            //max tarih = min_tarih + 15 gün
            max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            message: 'Randevu başarıyla eklendi.',
            alert_type: 'alert-success',
        });

    }
    catch(err)
    {
        console.log(err);
    }
});

router.post('/randevu/:randevuid', async function(req,res){
    const randevuid = req.params.randevuid;
    let {doktor, hasta, tarih, saat} = req.body;
    try{
        const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
        const [hastalar, ] = await db.execute("SELECT * FROM hasta");

        //doktor tc'yi al
        let doktor_tcno = '';
        const [doktorlar_tc, ] = await db.execute("SELECT * FROM doktor WHERE iddoktor = ?", [doktor]);
        if(doktorlar_tc.length === 0){
            return res.render('admin/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doktor,
                selectedHastaId: hasta,
                selectedSaat: saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Doktor bulunamadı.',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            doktor_tcno = doktorlar_tc[0].tcno;
        }

        //hasta tc'yi al
        let hasta_tcno = '';
        const [hastalar_tc, ] = await db.execute("SELECT * FROM hasta WHERE hastaid = ?", [hasta]);
        if(hastalar_tc.length === 0){
            return res.render('admin/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doktor,
                selectedHastaId: hasta,
                selectedSaat: saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Hasta bulunamadı.',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            hasta_tcno = hastalar_tc[0].tcno;
        }

        doktor = doktor_tcno;
        hasta = hasta_tcno;

        //doktorun bu güncellenecek tarihte başka randevusu var mı
        const [randevular, ] = await db.execute("SELECT * FROM randevu WHERE d_tcno = ? AND tarih = ? AND saat = ?", [doktor, tarih, saat]);
        if(randevular.length > 0){
            return res.render('admin/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doktor,
                selectedHastaId: hasta,
                selectedSaat: saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Bu doktorun bu tarihte ve saatte randevusu zaten var.',
                alert_type: 'alert-danger',
            });
        }
        //hastanın bu güncellenecek tarihte başka randevusu var mı
        const [randevular2, ] = await db.execute("SELECT * FROM randevu WHERE h_tcno = ? AND tarih = ? AND saat = ?", [hasta, tarih, saat]);
        if(randevular2.length > 0){
            return res.render('admin/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doktor,
                selectedHastaId: hasta,
                selectedSaat: saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Bu hastanın bu tarihte ve saatte randevusu zaten var.',
                alert_type: 'alert-danger',
            });
        }

        //güncelle
        await db.execute("UPDATE randevu SET d_tcno = ?, h_tcno = ?, tarih = ?, saat = ? WHERE randevuid = ?",[doktor, hasta, tarih, saat, randevuid]);

        //bildirim
        await db.execute("INSERT INTO bildirim(tcno, role, date, icerik) VALUES(?,?,?,?)",[doktor, 'doktor', new Date().toISOString().slice(0, 19).replace('T', ' '), 'Randevunuz güncellendi.']);
        //bildirim
        await db.execute("INSERT INTO bildirim(tcno, role, date, icerik) VALUES(?,?,?,?)",[hasta, 'hasta', new Date().toISOString().slice(0, 19).replace('T', ' '), 'Randevunuz güncellendi.']);

        res.render('admin/randevu-edit', {
            doktorlar: doktorlar,
            hastalar: hastalar,
            selectedDoktorId: doktor,
            selectedHastaId: hasta,
            selectedSaat: saat,
            //min tarih + 1 gün
            min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            //max tarih = min_tarih + 15 gün
            max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            message: 'Randevu başarıyla güncellendi.',
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
        if(randevular.length === 0){
            const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
            const [hastalar, ] = await db.execute("SELECT * FROM hasta");

            const [doktor_id, ] = await db.execute("SELECT iddoktor FROM doktor WHERE tcno = ?", [randevular[0].d_tcno]);
            const [hasta_id, ] = await db.execute("SELECT hastaid FROM hasta WHERE tcno = ?", [randevular[0].h_tcno]);
            return res.render('admin/randevu-edit', {
                doktorlar: doktorlar,
                hastalar: hastalar,
                selectedDoktorId: doktor_id[0].iddoktor,
                selectedHastaId: hasta_id[0].hastaid,
                selectedSaat: randevular[0].saat,
                //min tarih + 1 gün
                min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                //max tarih = min_tarih + 15 gün
                max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                message: 'Randevu bulunamadı.',
                alert_type: 'alert-danger',
            });
        }
        else{
            const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
            const [hastalar, ] = await db.execute("SELECT * FROM hasta");

            const [doktor_id, ] = await db.execute("SELECT iddoktor FROM doktor WHERE tcno = ?", [randevular[0].d_tcno]);
            const [hasta_id, ] = await db.execute("SELECT hastaid FROM hasta WHERE tcno = ?", [randevular[0].h_tcno]);
            if(doktor_id.length === 0){
                return res.render('admin/randevu-edit', {
                    doktorlar: doktorlar,
                    hastalar: hastalar,
                    selectedDoktorId: doktor_id[0].iddoktor,
                    selectedHastaId: hasta_id[0].hastaid,
                    selectedSaat: randevular[0].saat,
                    //min tarih + 1 gün
                    min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    //max tarih = min_tarih + 15 gün
                    max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    message: 'Doktor bulunamadı.',
                    alert_type: 'alert-danger',
                });
            }
            if(hasta_id.length === 0){
                return res.render('admin/randevu-edit', {
                    doktorlar: doktorlar,
                    hastalar: hastalar,
                    selectedDoktorId: doktor_id[0].iddoktor,
                    selectedHastaId: hasta_id[0].hastaid,
                    selectedSaat: randevular[0].saat,
                    //min tarih + 1 gün
                    min_tarih : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    //max tarih = min_tarih + 15 gün
                    max_tarih : new Date(new Date().getTime() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    message: 'Hasta bulunamadı.',
                    alert_type: 'alert-danger',
                });
            }


            res.render('admin/randevu-edit', {
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
        //randevu var mı
        const [randevular, ] = await db.execute("SELECT * FROM randevu WHERE randevuid = ?", [randevuid]);
        if(randevular.length === 0){
            return res.redirect('/admin/randevu-list');
        }
        //sil
        await db.execute("DELETE FROM randevu WHERE randevuid = ?", [randevuid]);
        //bildirim
        await db.execute("INSERT INTO bildirim(tcno, role, date, icerik) VALUES(?,?,?,?)",[randevular[0].d_tcno, 'doktor', new Date().toISOString().slice(0, 19).replace('T', ' '), 'Randevunuz iptal edildi.']);
        //bildirim
        await db.execute("INSERT INTO bildirim(tcno, role, date, icerik) VALUES(?,?,?,?)",[randevular[0].h_tcno, 'hasta', new Date().toISOString().slice(0, 19).replace('T', ' '), 'Randevunuz iptal edildi.']);

        res.redirect('/admin/randevu-list');


    }
    catch(err)
    {
        console.log(err);
    }
});

router.get('/rapor-create', async function(req,res){
    try{
        const [hastalar, ] = await db.execute("SELECT * FROM hasta");

        res.render('admin/rapor-create', {
            hastalar: hastalar,
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
    let page = parseInt(req.query.page, 10) || 1;
    let postPerPage = 12;
    let i = page > 4 ? page - 2 : 1
    let offset = (postPerPage * page) - postPerPage;
    try{
        const [countResult] = await db.execute('SELECT COUNT(*) AS count FROM rapor');
        let count = countResult[0].count;

        const raporlar = await db.execute("SELECT * FROM rapor LIMIT " + offset + ", " + postPerPage) 
        res.render('admin/rapor-list', {
            rapors: raporlar[0],
            nowPage: parseInt(page),
            totalPage: Math.ceil(count/postPerPage),
            i: i,
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
        if(raporlar.length === 0){
            const [hastalar, ] = await db.execute("SELECT * FROM hasta");

            return res.render('admin/rapor-edit', {
                hastalar: hastalar,
                tcno: '',
                tarih: '',
                icerik: '',
                message: 'Rapor bulunamadı.',
                alert_type: 'alert-danger',
            });
        }
        else{
            const [hastalar, ] = await db.execute("SELECT * FROM hasta");
            res.render('admin/rapor-edit', {
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


module.exports = router;
