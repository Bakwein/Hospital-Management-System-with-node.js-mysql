const express = require('express');
const router = express.Router();
const db = require("../data/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

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
                res.redirect('/admin/login');
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
                //cookie
                res.cookie('token', token, {httpOnly: true});
                //https
                //res.cookie('token', token, {httpOnly: true, secure: true});

                console.log(token);

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
        console.log(decoded);
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
    try{
        const [doctors, ] = await db.execute("SELECT * FROM doktor");
        res.render('admin/doctor-list', {
            doctors: doctors,
        });

    }
    catch(err){
        console.log(err);
    }
});

router.get('/hasta-list', async function(req,res){
    try{
        const [users, ] = await db.execute("SELECT * FROM hasta");
        res.render('admin/hasta-list', {
            users: users,
        });

    }
    catch(err){
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
    console.log(req.body);
    
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
        else if(calistigi_hastane.length > 50){
            return res.render('admin/doctor-create', {
                message: 'Çalıştığı hastane en fazla 50 karakter olabilir.',
                alert_type: 'alert-danger',
            });
        }

        const [doctors, ] = await db.execute("SELECT * FROM doktor WHERE tcno = ?", [tcno]);


        if(doctors.length === 0){
            const hashedPassword = await bcrypt.hash(sifre, 8);
            console.log(hashedPassword);

            await db.execute("INSERT INTO doktor(tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, password) VALUES(?,?,?,?,?,?)",[tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, hashedPassword]);

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
                res.redirect('/admin/login');
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
                //sil
                res.cookie('token', token, {httpOnly: true});
                //https
                //res.cookie('token', token, {httpOnly: true, secure: true});

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
                    //sil
                    res.cookie('token', token, {httpOnly: true});
                    //https
                    //res.cookie('token', token, {httpOnly: true, secure: true});

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


router.get('/profile_update_render', async function(req,res){
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                res.redirect('/admin/login');
            }
        });
    }
    res.redirect('/admin/profile_update');

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
