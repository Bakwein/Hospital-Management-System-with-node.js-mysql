const express = require('express');
const router = express.Router();
const db = require("../data/db");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

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

        const [admins, ] = await db.execute("SELECT * FROM admin WHERE kullaniciadi = ?", [username], function(err, result){
            if(err){
                console.log(err);
            }    
        });

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
                const token = jwt.sign({username: admins[0].kullaniciadi, id: admins[0].id}, process.env.JWT_SECRET, {expiresIn: '1h'});
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
    console.log(user);
    res.redirect('/admin/home');
});

router.get("/logout", function(req,res){
    res.clearCookie('token');
    res.redirect('/admin/login_render');
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
