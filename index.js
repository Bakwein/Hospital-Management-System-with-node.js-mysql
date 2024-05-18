const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
dotenv.config();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

const path = require('path');
const userRoutes = require('./routes/user');
const doctorRoutes = require('./routes/doctor');
const adminRoutes = require('./routes/admin');
const login_register = require('./routes/login_register');

app.use("/libs", express.static(path.join(__dirname, 'node_modules')));
app.use('/static', express.static(path.join(__dirname, 'assets')));

app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/user',userRoutes);
app.use(login_register);

//envdeki ishhttps true ise https ile calisir
if(process.env.isHttps == 'true'){
   //https with app
    const https = require('https');
    const fs = require('fs');
    const options = {
        key: fs.readFileSync('./certs/www.prolab2.com.key'),
        cert: fs.readFileSync('./certs/www.prolab2.com.crt')
    };
    https.createServer(options, app).listen(3001, function(){
        console.log("Node.js server is running on port 3001...");
});
}
else
{
    app.listen(3000, function(){
        console.log("Node.js server is running on port 3000...");
    });

}
