const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

const path = require('path');
const userRoutes = require('./routes/user');
const doctorRoutes = require('./routes/doctor');
const adminRoutes = require('./routes/admin');
const login_register = require('./routes/login_register');

app.use("/libs", express.static(path.join(__dirname, 'node_modules')));
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/user',userRoutes);
app.use(login_register);


app.listen(3000, function(){
    console.log("Node.js server is running...");
});