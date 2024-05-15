const express = require('express');
const router = express.Router();
const db = require("../data/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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


router.post("/login", function(req,res){
    try
    {
        const {tcno, password} = req.body;
        //console.log(tcno);
        //console.log(password);
        
        console.log(req.body);
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
    else if(harfDisindaKarakterVarMi(mahalle))
    {
        return res.render('user/register', {
            message: 'Mahalle sadece harflerden oluşmalıdır',
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

module.exports = router;
