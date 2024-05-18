const express = require('express');
const router = express.Router();
const db = require("../data/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

// Örnek route
router.get('/', (req, res) => {
    res.send('User route');
});

router.get("/login", function(req,res){
    res.render('user/login', {
        title: 'Kullanıcı Girişi',
        kutu_baslik: 'Kullanıcı Girişi',
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
                return res.redirect('/user/login');
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

    res.redirect('/user/login');


    
});


router.post("/login", async function(req,res){
    try
    {
        const {tcno, password} = req.body;
        //console.log(tcno);
        //console.log(password);
        console.log(req.body);

        if(tcno.length !== 11)
        {
            return res.render('user/login', {
                message: 'TC Kimlik Numarası 11 haneli olmalıdır',
                kutu_baslik: 'Kullanıcı Girişi',
                title: 'Kullanıcı Girişi',
                alert_type: 'alert-danger',
            });
        }

        const [results3,] = await db.execute("SELECT * FROM hasta WHERE tcno = ?", [tcno]);

        if(results3.length === 0)
        {
            return res.render('user/login', {
                message: 'Bu TC Kimlik Numarası ile kayıtlı bir kullanıcı bulunamadı',
                kutu_baslik: 'Kullanıcı Girişi',
                title: 'Kullanıcı Girişi',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            const hashedInput = results3[0].sifre;

            if( await bcrypt.compare(password, hashedInput))
            {
                const user_id = results3[0].hastaid;
                const token = jwt.sign({tcno: tcno, user_id: user_id, role: "hasta"}, process.env.JWT_SECRET, { expiresIn: '1h' });
                //cookie
                if(process.env.isHttps == 'true'){
                    res.cookie('token', token, {httpOnly: true, secure: true});
                }
                else{
                    res.cookie('token', token, {httpOnly: true});
                }

                return res.redirect('/user/home_render');
            }
            else
            {
                return res.render('user/login', {
                    message: 'Şifre yanlış',
                    kutu_baslik: 'Kullanıcı Girişi',
                    title: 'Kullanıcı Girişi',
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
    res.render('user/register', {
        title: 'Kullanıcı Kayıt',
        kutu_baslik: 'Kullanıcı Kayıt',
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
                return res.redirect('/user/register');
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

    res.redirect('/user/register');


   
});

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

router.post("/register", async function(req,res){
    try
    {

    const {tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, password, repassword} = req.body;
    

    //KONTROLLER
    if(tcno.length !== 11)
    {
        return res.render('user/register', {
            message: 'TC Kimlik Numarası 11 haneli olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(sayiDisindaKarakterVarMi(tcno)){
        return res.render('user/register', {
            message: 'TC Kimlik Numarası sadece sayılardan oluşmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(harfDisindaKarakterVarMi(isim)){
        return res.render('user/register', {
            message: 'İsim sadece harflerden oluşmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(isim.length < 2)
    {
        return res.render('user/register', {
            message: 'İsim en az 2 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(isim.length > 50)
    {
        return res.render('user/register', {
            message: 'İsim en fazla 50 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(harfDisindaKarakterVarMi(soyisim))
    {
        return res.render('user/register', {
            message: 'Soyisim sadece harflerden oluşmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(soyisim.length < 2)
    {
        return res.render('user/register', {
            message: 'Soyisim en az 2 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(soyisim.length > 50)
    {
        return res.render('user/register', {
            message: 'Soyisim en fazla 50 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(!isValidDate(dogumTarihi))
    {
        return res.render('user/register', {
            message: 'Doğum tarihi geçerli bir tarih değil',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    //dogum tarihi bugünden büyük olamaz
    else if(new Date(dogumTarihi) > new Date())
    {
        return res.render('user/register', {
            message: 'Doğum tarihi bugünden büyük olamaz',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(cinsiyet !== '1' && cinsiyet !== '2' && cinsiyet !== "0")
    {
        return res.render('user/register', {
            message: 'Cinsiyet erkek, kadın veya belirtilmemiş olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(telefon.length !== 10)
    {
        return res.render('user/register', {
            message: 'Telefon numarası 10 haneli olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(sayiDisindaKarakterVarMi(telefon))
    {
        return res.render('user/register', {
            message: 'Telefon numarası sadece sayılardan oluşmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(harfDisindaKarakterVarMi(sehir))
    {
        return res.render('user/register', {
            message: 'Şehir sadece harflerden oluşmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(sehir.length < 2)
    {
        return res.render('user/register', {
            message: 'Şehir en az 2 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(sehir.length > 50)
    {
        return res.render('user/register', {
            message: 'Şehir en fazla 50 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(harfDisindaKarakterVarMi(ilce))
    {
        return res.render('user/register', {
            message: 'İlçe sadece harflerden oluşmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(ilce.length < 2)
    {
        return res.render('user/register', {
            message: 'İlçe en az 2 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(ilce.length > 50)
    {
        return res.render('user/register', {
            message: 'İlçe en fazla 50 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(mahalle.length < 2)
    {
        return res.render('user/register', {
            message: 'Mahalle en az 2 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    else if(mahalle.length > 50)
    {
        return res.render('user/register', {
            message: 'Mahalle en fazla 50 karakter olmalıdır',
            kutu_baslik: 'Kullanıcı Kayıt',
            title: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
        });
    }
    
    //BURAYA PASSWORD KONTROLÜ EKLENECEK
    const [results,] = await db.execute("SELECT tcno FROM hasta WHERE tcno = ?", [tcno]);
    //RESULTS 0 OLAYI??????????????????
    //console.log(results);
    //console.log(results[0]);
    if(results.length > 0)
    {
        return res.render('user/register', {
            message: 'Bu TC Kimlik Numarası ile kayıtlı bir kullanıcı zaten var',
            kutu_baslik: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
            title: 'Kullanıcı Kayıt',
        });
    }
    else if(password !== repassword)
    {
        return res.render('user/register', {
            message: 'Şifreler eşleşmiyor',
            kutu_baslik: 'Kullanıcı Kayıt',
            alert_type: 'alert-danger',
            title: 'Kullanıcı Kayıt',
        });
    }
    let hashedPassword = await bcrypt.hash(password, 8);

    //console.log(hashedPassword);
    //direkt gerceklesmez bunun icin await kullanmak zorundayi
    await db.execute("INSERT INTO hasta(tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, sifre) VALUES(?,?,?,?,?,?,?,?,?,?)",[tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, hashedPassword]);

    return res.render('user/register', {
        message: 'Kayıt başarılı',
        kutu_baslik: 'Kullanıcı Kayıt',
        title: 'Kullanıcı Kayıt',
        alert_type: 'alert-success',
    });
        
        
    

    }
    catch(err)
    {
        console.log(err);
    }
    

});


function verifyToken(req,res)
{
    const token = req.cookies.token;
    if(!token)
    {
        return res.render('user/login',
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
        return res.render('user/login',
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
    res.render('user/home', {
        title: 'Kullanıcı Anasayfa',
    });
});


router.get("/home_render", function(req,res){
    const user = verifyToken(req,res);
    console.log(user);
    res.redirect('/user/home');
});

router.get("/logout", function(req,res){
    res.clearCookie('token');
    res.redirect('/user/login_render');
});

router.get('/doctor-list', async function(req,res){
    try{
        const [doctors,] = await db.execute("SELECT * FROM doktor");
        res.render('user/doctor-list', {
            doctors: doctors,
        });

    }
    catch(err)
    {
        console.log(err);
    }
});


router.get("/profile", async function(req,res){
    if(req.cookies.token){
        //verify it
        const token = req.cookies.token;
        jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
            if(err){
                return res.redirect('/user/login');
            }
        });
    }
    try{
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tcno = decoded.tcno;
        const [results,] = await db.execute("SELECT * FROM hasta WHERE tcno = ?", [tcno]); 

        if(results.length === 0)
        {
            res.clearCookie('token');
            return res.redirect('/user/login_render');

        }
        else
        {
            res.render('user/profile', {
                id: results[0].hastaid,
                tcno: results[0].tcno,
                isim: results[0].isim,
                soyisim: results[0].soyisim,
                dogumTarihi: results[0].dogumTarihi,
                cinsiyet: results[0].cinsiyet,
                telefon: results[0].telefon,
                sehir: results[0].sehir,
                ilce: results[0].ilce,
                mahalle: results[0].mahalle,
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
        const {id, tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle,sifre} = req.body;

        if(tcno.length !== 11)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'TC Kimlik Numarası 11 haneli olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(tcno)){
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'TC Kimlik Numarası sadece sayılardan oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(isim)){
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İsim sadece harflerden oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length < 2)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İsim en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(isim.length > 50)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İsim en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(soyisim)){
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Soyisim sadece harflerden oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length < 2)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Soyisim en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(soyisim.length > 50)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Soyisim en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(!isValidDate(dogumTarihi))
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Doğum tarihi geçerli bir tarih değil',
                alert_type: 'alert-danger',
            });
        }
        //dogum tarihi bugünden büyük olamaz
        else if(new Date(dogumTarihi) > new Date())
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Doğum tarihi bugünden büyük olamaz',
                alert_type: 'alert-danger',
            });
        }
        else if(cinsiyet !== '1' && cinsiyet !== '2' && cinsiyet !== "0")
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Cinsiyet erkek, kadın veya belirtilmemiş olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(telefon.length !== 10)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Telefon numarası 10 haneli olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(sayiDisindaKarakterVarMi(telefon))
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Telefon numarası sadece sayılardan oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(sehir))
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Şehir sadece harflerden oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(sehir.length < 2)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Şehir en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(sehir.length > 50)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Şehir en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(harfDisindaKarakterVarMi(ilce))
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İlçe sadece harflerden oluşmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(ilce.length < 2)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İlçe en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(ilce.length > 50)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'İlçe en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(mahalle.length < 2)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Mahalle en az 2 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else if(mahalle.length > 50)
        {
            return res.render('user/profile_update', {
                id: id,
                tcno: tcno,
                isim: isim,
                soyisim: soyisim,
                dogumTarihi: dogumTarihi,
                cinsiyet: cinsiyet,
                telefon: telefon,
                sehir: sehir,
                ilce: ilce,
                mahalle: mahalle,
                message: 'Mahalle en fazla 50 karakter olmalıdır',
                alert_type: 'alert-danger',
            });
        }
        else
        {
            const [results,] = await db.execute("SELECT * FROM hasta WHERE hastaid = ?", [tcno]);
            let newHashed = await bcrypt.hash(sifre, 8);
            if(results.length === 0)
            {
                await db.execute("UPDATE hasta SET tcno = ?, isim = ?, soyisim = ?, dogumTarihi = ?, cinsiyet = ?, telefon = ?, sehir = ?, ilce = ?, mahalle = ?, sifre = ? WHERE hastaid = ?", [tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, newHashed, id]);

                //token
                res.clearCookie('token');
                const token = jwt.sign({tcno: tcno, user_id: id, role: "hasta"}, process.env.JWT_SECRET, { expiresIn: '1h' });
                if(process.env.isHttps == 'true'){
                    res.cookie('token', token, {httpOnly: true, secure: true});
                }
                else{
                    res.cookie('token', token, {httpOnly: true});
                }

                return res.render('user/profile_update', {
                    id: id,
                    tcno: tcno,
                    isim: isim,
                    soyisim: soyisim,
                    dogumTarihi: dogumTarihi,
                    cinsiyet: cinsiyet,
                    telefon: telefon,
                    sehir: sehir,
                    ilce: ilce,
                    mahalle: mahalle,
                    message: 'Profil güncellendi',
                    alert_type: 'alert-success',
                });
            }
            else
            {
                if(results[0].hastaid == id)
                {
                    await db.execute("UPDATE hasta SET tcno = ?, isim = ?, soyisim = ?, dogumTarihi = ?, cinsiyet = ?, telefon = ?, sehir = ?, ilce = ?, mahalle = ?, sifre = ? WHERE hastaid = ?", [tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, newHashed, id]);
                    //token
                    res.clearCookie('token');
                    const token = jwt.sign({tcno: tcno, user_id: id, role: "hasta"}, process.env.JWT_SECRET, { expiresIn: '1h' });
                    if(process.env.isHttps == 'true'){
                        res.cookie('token', token, {httpOnly: true, secure: true});
                    }
                    else{
                        res.cookie('token', token, {httpOnly: true});
                    }

                    return res.render('user/profile_update', {
                        id: id,
                        tcno: tcno,
                        isim: isim,
                        soyisim: soyisim,
                        dogumTarihi: dogumTarihi,
                        cinsiyet: cinsiyet,
                        telefon: telefon,
                        sehir: sehir,
                        ilce: ilce,
                        mahalle: mahalle,
                        message: 'Profil güncellendi',
                        alert_type: 'alert-success',
                    });
                
                }
                else
                {
                    return res.render('user/profile_update', {
                        id: id,
                        tcno: tcno,
                        isim: isim,
                        soyisim: soyisim,
                        dogumTarihi: dogumTarihi,
                        cinsiyet: cinsiyet,
                        telefon: telefon,
                        sehir: sehir,
                        ilce: ilce,
                        mahalle: mahalle,
                        message: 'Bu TC Kimlik Numarası ile kayıtlı bir kullanıcı zaten var',
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
        const tcno = decoded.tcno;
        const [results,] = await db.execute("SELECT * FROM hasta WHERE tcno = ?", [tcno]);
        res.render('user/profile_update', {
            id: results[0].hastaid,
            tcno: results[0].tcno,
            isim: results[0].isim,
            soyisim: results[0].soyisim,
            //dogumTarihi: results[0].dogumTarihi,
            //cinsiyet: cinsiyettemp,
            telefon: results[0].telefon,
            sehir: results[0].sehir,
            ilce: results[0].ilce,
            mahalle: results[0].mahalle,
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
                return res.redirect('/user/login');
            }
        });
    }
    res.redirect('/user/profile_update');
    
});

router.get('/randevu/delete/:randevuid', async function(req,res){
    try{
        const randevuid = req.params.randevuid;
        await db.execute("DELETE FROM randevu WHERE randevuid = ?", [randevuid]);
        res.redirect('/user/randevu-list');
    }
    catch(err)
    {
        console.log(err);
    }
});

router.get('/randevu-list', async function(req,res){
    try{
        if(req.cookies.token){
            //verify it
            const token = req.cookies.token;
            jwt.verify(token, process.env.JWT_SECRET, function(err, decoded){
                if(err){
                    return res.redirect('/user/login');
                }
            });
        }
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const tcno = decoded.tcno;
        console.log(tcno);
        const [randevular,] = await db.execute("SELECT * FROM randevu WHERE h_tcno = ?", [tcno]);
        const [doktorlar, ] = await db.execute("SELECT * FROM doktor");
        console.log(randevular, doktorlar);
        res.render('user/randevu-list', {
            randevular: randevular,
            doktorlar: doktorlar,
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
