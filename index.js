const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const multer = require('multer');
const dotenv = require('dotenv');
const db = require('./data/db');

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
const { rawListeners } = require('process');

app.use("/libs", express.static(path.join(__dirname, 'node_modules')));
app.use('/static', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/admin', adminRoutes);
app.use('/doctor', doctorRoutes);
app.use('/user',userRoutes);
app.use(login_register);


//multer
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('photo'), async (req, res) => {
    try{
        if (!req.file) {
            return res.status(400).send('Fotoğraf yüklenmedi');
          }
          
      
          const filePath = `/uploads/${req.file.filename}`;
          const icerik = req.body.icerik;
          const tarih = req.body.tarih;
          const hasta_id = req.body.hasta;
          if (!hasta_id || !tarih || !icerik || !filePath) {
            return res.status(400).send('Tüm form alanları ve resim gereklidir.');
          }
          console.log(filePath, icerik, tarih, hasta_id);

          //hasta id'den tc'yi al
          const [hastalar,] = await db.execute('SELECT * FROM hasta WHERE hastaid = ?', [hasta_id]);
          if(hastalar.length == 0){
              return res.status(400).send('Hasta bulunamadı');
          }
          //tcno'yu al
          const h_tcno = hastalar[0].tcno;

          //aynı isimde rapor var mı kontrol et
          const [raporlar,] = await db.execute('SELECT * FROM rapor WHERE resim = ?', [filePath]);
          if(raporlar.length > 0){
                //hata mesajı olacak ama console.log'a yazdırılmayacak 400 olunca yazdırıyor
                return res.status(400).send('Bu isimde bir rapor zaten yüklü. Lütfen farklı bir isim deneyiniz.');
          }

          
          //veritabanına kaydet
          //h_tcno, tarih, icerik, filePath'i rapor'a kaydet
          await db.execute('INSERT INTO rapor (h_tcno, tarih, icerik, resim) VALUES (?, ?, ?, ?)', [h_tcno, tarih, icerik, filePath]);
      
      
          res.json({ filePath: `/uploads/${req.file.filename}` });
    }
    catch(err)
    {
        res.status(500).send('Rapor kaydedilirken bir hata oluştu');
    }
   
  });

//rapor indirme ama filename /uploads/rapor1.jpg gibi olacak
app.get('/download/:filename', (req, res) => {
  //console.log("İndirme isteği alındı"); // Değiştirildi
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  //console.log("Dosya yolu: ", filePath); // Değiştirildi
  res.download(filePath, (err) => {
      if (err) {
          console.error("Dosya indirilemedi: ", err); // Değiştirildi
          res.status(500).send('Dosya indirilemedi');
      }
  });
});

//CREATION TABLES
require('./createtables');


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
