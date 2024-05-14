const mysql = require('mysql2');
const config = require('../config');

let connection = mysql.createConnection(config.db);

connection.connect(function(err){
    if(err)
    {
        return console.log(err);
    }

    console.log("mysql bağlandi");
});

module.exports = connection.promise();