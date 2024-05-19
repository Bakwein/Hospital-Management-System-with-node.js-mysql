const db = require("./data/db");
const bcrypt = require('bcryptjs');

async function creating_admin_table() 
{
    try{
        await db.execute(`CREATE TABLE IF NOT EXISTS admin (
            adminid int NOT NULL AUTO_INCREMENT,
            kullaniciadi varchar(50) NOT NULL,
            sifre varchar(255) NOT NULL,
            PRIMARY KEY (adminid),
            UNIQUE KEY adminid_UNIQUE (adminid),
            UNIQUE KEY kullaniciadi_UNIQUE (kullaniciadi)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;`);
        console.log("Admin tablosu oluşturuldu");
    }
    catch(err)
    {
        console.log("Admin tablosu oluşturulurken hata oluştu" + err);
    }
    


}

async function creating_doctor_table()
{
    try{
        await db.execute(`
        CREATE TABLE IF NOT EXISTS doktor (
            iddoktor int NOT NULL AUTO_INCREMENT,
            tcno varchar(11) NOT NULL,
            isim varchar(50) NOT NULL,
            soyisim varchar(50) NOT NULL,
            uzmanlik_alani varchar(50) NOT NULL,
            calistigi_hastane varchar(100) NOT NULL,
            password varchar(255) NOT NULL,
            PRIMARY KEY (iddoktor),
            UNIQUE KEY iddoktor_UNIQUE (iddoktor),
            UNIQUE KEY tcno_UNIQUE (tcno)
        ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        
        `);

        console.log("Doktor tablosu oluşturuldu")
    }
    catch(err)
    {
        console.log("Doktor tablosu oluşturulurken hata oluştu" + err);
    }
}


async function creating_hasta_table()
{
    try{

        await db.execute(`
        CREATE TABLE IF NOT EXISTS hasta (
            hastaid int NOT NULL AUTO_INCREMENT,
            tcno varchar(11) NOT NULL,
            isim varchar(50) NOT NULL,
            soyisim varchar(50) NOT NULL,
            dogumTarihi date NOT NULL,
            cinsiyet varchar(20) NOT NULL,
            telefon varchar(10) NOT NULL,
            sehir varchar(50) NOT NULL,
            ilce varchar(50) NOT NULL,
            mahalle varchar(50) NOT NULL,
            sifre varchar(255) NOT NULL,
            PRIMARY KEY (hastaid),
            UNIQUE KEY hastaid_UNIQUE (hastaid),
            UNIQUE KEY tckimlik_UNIQUE (tcno)
        ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

        `);

        console.log("Hasta tablosu oluşturuldu")
    }
    catch(err)
    {
        console.log("Hasta tablosu oluşturulurken hata oluştu" + err);
    }
}


async function creating_randevu_table()
{
    try{
        await db.execute(`
        CREATE TABLE IF NOT EXISTS randevu (
            randevuid int NOT NULL AUTO_INCREMENT,
            tarih varchar(45) NOT NULL,
            saat varchar(45) NOT NULL,
            d_tcno varchar(11) NOT NULL,
            h_tcno varchar(11) NOT NULL,
            PRIMARY KEY (randevuid),
            UNIQUE KEY randevuid_UNIQUE (randevuid),
            KEY d_tcno_idx (d_tcno),
            KEY h_tcno_idx (h_tcno),
            CONSTRAINT d_tcno FOREIGN KEY (d_tcno) REFERENCES doktor (tcno) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT h_tcno FOREIGN KEY (h_tcno) REFERENCES hasta (tcno) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        console.log("Randevu tablosu oluşturuldu");
    }
    catch(err)
    {
        console.log("Randevu tablosu oluşturulurken hata oluştu" + err);
    }
}

async function creating_rapor_table()
{
    try{
        await db.execute(`
        CREATE TABLE IF NOT EXISTS rapor (
            raporid int NOT NULL AUTO_INCREMENT,
            h_tcno varchar(11) NOT NULL,
            tarih varchar(45) NOT NULL,
            icerik varchar(255) NOT NULL,
            resim varchar(100) NOT NULL,
            PRIMARY KEY (raporid),
            UNIQUE KEY raporid_UNIQUE (raporid),
            KEY h_tc_idx (h_tcno),
            CONSTRAINT h_tc FOREIGN KEY (h_tcno) REFERENCES hasta (tcno) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        `);

        console.log("Rapor tablosu oluşturuldu");
    }
    catch(err)
    {
        console.log("Rapor tablosu oluşturulurken hata oluştu" + err);
    }
}

async function check_and_create_admin(name, pass)
{
    try{
        const [result,] = await db.execute(`SELECT * FROM admin WHERE kullaniciadi = ? AND sifre = ?`, [name, pass]);
        if(result.length > 0)
        {
        }
        else
        {
            await db.execute(`INSERT INTO admin (kullaniciadi, sifre) VALUES (?, ?)`, [name, pass]);
        }
    }
    catch(err)
    {
        console.log("Admin tablosuna veri eklenirken hata oluştu" + err);
    }

}

function creating_rows_admin()
{
    check_and_create_admin("admin5", "123");
    check_and_create_admin("admin6", "123");
    check_and_create_admin("admin7", "123");
    check_and_create_admin("admin8", "123");
    check_and_create_admin("admin9", "123");
    check_and_create_admin("sefa", "12345");
}


async function check_and_create_doctor(tcno, isim, soyisim, uzmanlik, hastane, pass)
{
    try{
        const [result,] = await db.execute(`SELECT * FROM doktor WHERE tcno = ? AND isim = ? AND soyisim = ? AND uzmanlik_alani = ? AND calistigi_hastane = ?`, [tcno, isim, soyisim, uzmanlik, hastane]);
        if(result.length > 0)
        {
        }
        else
        {
            await db.execute(`INSERT INTO doktor (tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, password) VALUES (?, ?, ?, ?, ?, ?)`, [tcno, isim, soyisim, uzmanlik, hastane, pass]);
        }
    }
    catch(err)
    {
        console.log("Doktor tablosuna veri eklenirken hata oluştu" + err);
    }

}

async function  creationg_rows_doctor()
{
    const sifre = await  bcrypt.hash("123", 8);

    await check_and_create_doctor("12345678901", "Ercüment ", "Akıncılar", "Kulak Burun Boğaz", "Özel Hastane", sifre);
    await check_and_create_doctor("12345678902", "Fatma ", "Acar", "Göz", "Özel Hastane", sifre);
    await check_and_create_doctor("12345678903", "Bestami ", "Ağırağaç", "Kardiyoloji", "Özel Hastane", sifre);
    await check_and_create_doctor("12345678904", "Lemi ", "Akçay", "Ortopedi", "Şehir Hastanesi", sifre);
    await check_and_create_doctor("12345678905", "Rafi ", "Akaş", "Dahiliye", "Özel Hastane", sifre);
    await check_and_create_doctor("12345678906", "Mehmet", "Ardıç", "Nöroloji", "Özel Hastane", sifre);
    await check_and_create_doctor("12345678907", "Serdar", "Aksu", "Üroloji", "Özel Hastane", sifre);
    await check_and_create_doctor("12345678908", "Süleyman", "Akkaya", "Cildiye", "Özel Hastane", sifre);
    await check_and_create_doctor("12345678909", "Mehmet", "Akkaya", "Kadın Hastalıkları", "Şehir Hastanesi", sifre);
    await check_and_create_doctor("12345678910", "İzlem ", "Arınç", "Çocuk Hastalıkları", "Özel Hastane", sifre);
    await check_and_create_doctor("12345678911", "Saba ", "Atmaca", "Kadın Hastalıkları", "24 Eylül Hastanesi", sifre);
    await check_and_create_doctor("12345678912", "Sera", "Azbay", "Çocuk Hastalıkları", "24 Eylül Hastanes", sifre);
    await check_and_create_doctor("12345678913", "Mahperi ", "Baştuğ", "Kardiyoloji", "24 Eylül Hastanesi", sifre);
    await check_and_create_doctor("12345678914", "Safa ", "Baydil", "Ortopedi", "24 Eylül Hastanesi", sifre);
    await check_and_create_doctor("12345678915", "Sefa ", "Bayrak", "Dahiliye", "24 Eylül Hastanesi", sifre);
    await check_and_create_doctor("12345678916", "Sedat", "Bayraktar", "Nöroloji", "24 Eylül Hastanesi", sifre);
    await check_and_create_doctor("12345678917", "Sedat", "Bektaş", "Üroloji", "24 Eylül Hastanesi", sifre);
    await check_and_create_doctor("12345678918", "Kubilay ", "Begiç", "Cildiye", "Acıbadem", sifre);
    await check_and_create_doctor("12345678919", "Remzi", "Bilgi", "Kadın Hastalıkları", "Acıbadem", sifre);
    await check_and_create_doctor("12345678920", "Süleyman", "Bilgin", "Çocuk Hastalıkları", "Acıbadem", sifre);
    await check_and_create_doctor("12345678921", "Pekin", "Bilir", "Kardiyoloji", "Acıbadem", sifre);
    await check_and_create_doctor("12345678922", "Ogün  ", "Bölge", "Ortopedi", "Acıbadem", sifre);
    await check_and_create_doctor("12345678923", "Sena  ", "Candan", "Dahiliye", "Acıbadem", sifre);
    await check_and_create_doctor("12345678924", "Yücel   ", "Civan", "Nöroloji", "Akademi Hastanesi", sifre);
    await check_and_create_doctor("12345678925", "Süleyman", "Çakır", "Üroloji", "Akademi Hastanesi", sifre);
    await check_and_create_doctor("12345678926", "Seyit ", "Çakmak", "Cildiye", "Akademi Hastanesi", sifre);
    await check_and_create_doctor("12345678927", "Elif ", "Çalışkan", "Kadın Hastalıkları", "Akademi Hastanesi", sifre);
    await check_and_create_doctor("12345678928", "Oltun ", "Çalık", "Çocuk Hastalıkları", "Akademi Hastanesi", sifre);
    await check_and_create_doctor("12345678929", "Sena ", "Çelik", "Kardiyoloji", "Akademi Hastanesi", sifre);
    await check_and_create_doctor("12345678930", "Yansı ", "Çetin", "Ortopedi", "Akademi Hastanesi", sifre);
    await check_and_create_doctor("12345678931", "Seher ", "Çevik", "Dahiliye", "Akademi Hastanesi", sifre);

    







}

async function check_and_create_hasta(tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, pass)
{
    try{
        const [result,] = await db.execute(`SELECT * FROM hasta WHERE tcno = ? AND isim = ? AND soyisim = ? AND dogumTarihi = ? AND cinsiyet = ? AND telefon = ? AND sehir = ? AND ilce = ? AND mahalle = ?`, [tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle]);
        if(result.length > 0)
        {
        }
        else
        {
            await db.execute(`INSERT INTO hasta (tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, sifre) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, pass]);
        }
    }
    catch(err)
    {
        console.log("Hasta tablosuna veri eklenirken hata oluştu" + err);
    }

}


async function creating_rows_hasta()
{
    const sifre = await  bcrypt.hash("123", 8);
    //1se erkek 2 ise kadın 0 ise diğer

    await check_and_create_hasta("72345678901", "Ercüment", "Akıncılar", "1999-01-01", "2", "5551234567", "Ankara", "Çankaya", "Bahçelievler", sifre);
    await check_and_create_hasta("72345678902", "Fatma", "Acar", "1998-02-02", "1", "5552345678", "Istanbul", "Kadikoy", "Moda", sifre);
    await check_and_create_hasta("72345678903", "Bestami", "Ağırağaç", "1997-03-03", "0", "5553456789", "Izmir", "Konak", "Alsancak", sifre);
    await check_and_create_hasta("72345678904", "Lemi", "Akçay", "1996-04-04", "1", "5554567890", "Bursa", "Osmangazi", "Nilüfer", sifre);
    await check_and_create_hasta("72345678905", "Rafi", "Akaş", "1995-05-05", "0", "5555678901", "Antalya", "Muratpaşa", "Lara", sifre);
    await check_and_create_hasta("72345678906", "Mehmet", "Ardıç", "1994-06-06", "2", "5556789012", "Adana", "Seyhan", "Çukurova", sifre);
    await check_and_create_hasta("72345678907", "Serdar", "Aksu", "1993-07-07", "0", "5557890123", "Eskisehir", "Odunpazari", "Tepebasi", sifre);
    await check_and_create_hasta("72345678908", "Süleyman", "Akkaya", "1992-08-08", "2", "5558901234", "Gaziantep", "Sehitkamil", "Şahinbey", sifre);
    await check_and_create_hasta("72345678909", "Mehmet", "Akkaya", "1991-09-09", "1", "5559012345", "Samsun", "Atakum", "Ilkadim", sifre);
    await check_and_create_hasta("72345678910", "İzlem", "Arınç", "1990-10-10", "2", "5550123456", "Konya", "Selçuklu", "Meram", sifre);
    await check_and_create_hasta("72345678911", "Saba", "Atmaca", "1989-11-11", "0", "5551123456", "Kayseri", "Melikgazi", "Talas", sifre);
    await check_and_create_hasta("72345678912", "Sera", "Azbay", "1988-12-12", "1", "5552123456", "Trabzon", "Ortahisar", "Boztepe", sifre);
    await check_and_create_hasta("72345678913", "Mahperi", "Baştuğ", "1987-01-13", "2", "5553123456", "Erzurum", "Yakutiye", "Palandöken", sifre);
    await check_and_create_hasta("72345678914", "Safa", "Baydil", "1986-02-14", "0", "5554123456", "Malatya", "Battalgazi", "Yeşilyurt", sifre);
    await check_and_create_hasta("72345678915", "Sefa", "Bayrak", "1985-03-15", "1", "5555123456", "Mardin", "Artuklu", "Kızıltepe", sifre);
    await check_and_create_hasta("72345678916", "Sedat", "Bayraktar", "1984-04-16", "2", "5556123456", "Kocaeli", "İzmit", "Gebze", sifre);
    await check_and_create_hasta("72345678917", "Sedat", "Bektaş", "1983-05-17", "0", "5557123456", "Denizli", "Pamukkale", "Merkezefendi", sifre);
    await check_and_create_hasta("72345678918", "Kubilay", "Begiç", "1982-06-18", "1", "5558123456", "Muğla", "Bodrum", "Fethiye", sifre);
    await check_and_create_hasta("72345678919", "Remzi", "Bilgi", "1981-07-19", "2", "5559123456", "Sakarya", "Adapazari", "Erenler", sifre);
    await check_and_create_hasta("72345678920", "Süleyman", "Bilgin", "1980-08-20", "0", "5551012345", "Tekirdağ", "Süleymanpaşa", "Çorlu", sifre);
    await check_and_create_hasta("72345678921", "Pekin", "Bilir", "1979-09-21", "1", "5551112345", "Kahramanmaraş", "Onikişubat", "Dulkadiroğlu", sifre);
    await check_and_create_hasta("72345678922", "Ogün", "Bölge", "1978-10-22", "2", "5551212345", "Aydın", "Efeler", "Nazilli", sifre);
    await check_and_create_hasta("72345678923", "Sena", "Candan", "1977-11-23", "0", "5551312345", "Balıkesir", "Karesi", "Altıeylül", sifre);
    await check_and_create_hasta("72345678924", "Yücel", "Civan", "1976-12-24", "1", "5551412345", "Manisa", "Şehzadeler", "Yunusemre", sifre);
    await check_and_create_hasta("72345678925", "Süleyman", "Çakır", "1975-01-25", "2", "5551512345", "Hatay", "Antakya", "İskenderun", sifre);
    await check_and_create_hasta("72345678926", "Seyit", "Çakmak", "1974-02-26", "0", "5551612345", "Ordu", "Altınordu", "Ünye", sifre);
    await check_and_create_hasta("72345678927", "Elif", "Çalışkan", "1973-03-27", "1", "5551712345", "Van", "İpekyolu", "Edremit", sifre);
    await check_and_create_hasta("72345678928", "Oltun", "Çalık", "1972-04-28", "2", "5551812345", "Şanlıurfa", "Eyyübiye", "Haliliye", sifre);
    await check_and_create_hasta("72345678929", "Sena", "Çelik", "1971-05-29", "0", "5551912345", "Afyon", "Merkez", "Sandıklı", sifre);
    await check_and_create_hasta("72345678930", "Yansı", "Çetin", "1970-06-30", "1", "5552012345", "Çanakkale", "Merkez", "Gelibolu", sifre);
    await check_and_create_hasta("72345678931", "Arzu", "Deniz", "1969-07-31", "2", "5552112345", "Yalova", "Çiftlikköy", "Altınova", sifre);
    await check_and_create_hasta("42345678932", "Berk", "Demir", "1968-08-01", "0", "5552212345", "Bilecik", "Bozüyük", "Osmaneli", sifre);
    await check_and_create_hasta("42345678933", "Cansu", "Durak", "1967-09-02", "1", "5552312345", "Düzce", "Merkez", "Akçakoca", sifre);
    await check_and_create_hasta("42345678934", "Deniz", "Ekinci", "1966-10-03", "2", "5552412345", "Isparta", "Merkez", "Yalvaç", sifre);
    await check_and_create_hasta("42345678935", "Ece", "Eren", "1965-11-04", "0", "5552512345", "Uşak", "Merkez", "Banaz", sifre);
    await check_and_create_hasta("42345678936", "Fikret", "Ertürk", "1964-12-05", "1", "5552612345", "Bartın", "Merkez", "Amasra", sifre);
    await check_and_create_hasta("42345678937", "Gökçe", "Erzurumlu", "1963-01-06", "2", "5552712345", "Karabük", "Merkez", "Safranbolu", sifre);
    await check_and_create_hasta("42345678938", "Halil", "Güner", "1962-02-07", "0", "5552812345", "Kırklareli", "Merkez", "Lüleburgaz", sifre);
    await check_and_create_hasta("42345678939", "Işık", "Gürbüz", "1961-03-08", "1", "5552912345", "Kilis", "Merkez", "Musabeyli", sifre);
    await check_and_create_hasta("42345678940", "Jale", "Gürsoy", "1960-04-09", "2", "5553012345", "Sinop", "Merkez", "Gerze", sifre);
    await check_and_create_hasta("52345678941", "Kamil", "Güven", "1959-05-10", "0", "5553112345", "Bayburt", "Merkez", "Aydıntepe", sifre);
    await check_and_create_hasta("52345678942", "Leman", "Güzel", "1958-06-11", "1", "5553212345", "Karaman", "Merkez", "Ermenek", sifre);
    await check_and_create_hasta("52345678943", "Melek", "Hakan", "1957-07-12", "2", "5553312345", "Osmaniye", "Merkez", "Kadirli", sifre);
    await check_and_create_hasta("52345678944", "Naci", "Halis", "1956-08-13", "0", "5553412345", "Ardahan", "Merkez", "Göle", sifre);
    await check_and_create_hasta("52345678945", "Oya", "Karaca", "1955-09-14", "1", "5553512345", "Iğdır", "Merkez", "Tuzluca", sifre);
    

}


async function check_and_create_randevu(tarih, saat, d_tcno, h_tcno)
{
    try{
        const [result,] = await db.execute(`SELECT * FROM randevu WHERE tarih = ? AND saat = ? AND d_tcno = ? AND h_tcno = ?`, [tarih, saat, d_tcno, h_tcno]);
        if(result.length > 0)
        {
        }
        else
        {
            await db.execute(`INSERT INTO randevu (tarih, saat, d_tcno, h_tcno) VALUES (?, ?, ?, ?)`, [tarih, saat, d_tcno, h_tcno]);
        }
    }
    catch(err)
    {
        console.log("Randevu tablosuna veri eklenirken hata oluştu" + err);
    }


}

function creating_rows_randevu()
{
    check_and_create_randevu("2024-05-01", "09:00", "12345678908", "72345678910");
    check_and_create_randevu("2024-05-01", "09:00", "12345678908", "72345678910");
    check_and_create_randevu("2024-05-02", "10:00", "12345678908", "72345678910");
    check_and_create_randevu("2024-05-03", "11:00", "12345678908", "42345678939");
    check_and_create_randevu("2024-05-04", "14:00", "12345678908", "42345678939");
    check_and_create_randevu("2024-05-05", "15:00", "12345678908", "42345678939");
    check_and_create_randevu("2024-05-06", "16:00", "12345678908", "42345678939");
    check_and_create_randevu("2024-05-01", "09:00", "12345678922", "52345678944");
    check_and_create_randevu("2024-05-02", "10:00", "12345678922", "52345678944");
    check_and_create_randevu("2024-05-03", "11:00", "12345678922", "52345678944");
    check_and_create_randevu("2024-05-04", "14:00", "12345678922", "52345678944");
    check_and_create_randevu("2024-05-05", "15:00", "12345678922", "72345678909");
    check_and_create_randevu("2024-05-06", "16:00", "12345678922", "72345678909");
    check_and_create_randevu("2024-05-01", "09:00", "12345678922", "72345678909");
    check_and_create_randevu("2024-05-02", "10:00", "12345678908", "72345678909");
    check_and_create_randevu("2024-05-03", "11:00", "12345678905", "72345678908");
    check_and_create_randevu("2024-05-04", "14:00", "12345678905", "72345678908");
    check_and_create_randevu("2024-05-05", "15:00", "12345678905", "72345678908");
    check_and_create_randevu("2024-05-06", "16:00", "12345678905", "72345678908");
    check_and_create_randevu("2024-05-01", "09:00", "12345678905", "72345678907");
    check_and_create_randevu("2024-05-02", "10:00", "12345678905", "72345678907");
    check_and_create_randevu("2024-05-03", "11:00", "12345678906", "72345678907");
    check_and_create_randevu("2024-05-04", "14:00", "12345678906", "72345678907");
    check_and_create_randevu("2024-05-05", "15:00", "12345678906", "72345678907");
    check_and_create_randevu("2024-05-06", "16:00", "12345678906", "72345678930");
    check_and_create_randevu("2024-05-01", "09:00", "12345678906", "72345678930");
    check_and_create_randevu("2024-05-02", "10:00", "12345678906", "72345678930");
    check_and_create_randevu("2024-05-03", "11:00", "12345678903", "72345678930");
    check_and_create_randevu("2024-05-04", "14:00", "12345678903", "72345678930");
    check_and_create_randevu("2024-05-05", "15:00", "12345678903", "52345678941");
    check_and_create_randevu("2024-05-06", "16:00", "12345678903", "52345678941");
    check_and_create_randevu("2024-05-01", "09:00", "12345678903", "52345678941");
    check_and_create_randevu("2024-05-02", "10:00", "12345678903", "52345678941");
    check_and_create_randevu("2024-05-03", "11:00", "12345678931", "52345678941");
    check_and_create_randevu("2024-05-04", "14:00", "12345678931", "72345678902");
    check_and_create_randevu("2024-05-05", "15:00", "12345678931", "72345678902");
    check_and_create_randevu("2024-05-06", "16:00", "12345678931", "72345678902");
    check_and_create_randevu("2024-05-01", "09:00", "12345678931", "72345678902");
    check_and_create_randevu("2024-05-02", "10:00", "12345678930", "72345678902");
    check_and_create_randevu("2024-05-03", "11:00", "12345678930", "52345678944");
    check_and_create_randevu("2024-05-04", "14:00", "12345678930", "52345678944");
    check_and_create_randevu("2024-05-05", "15:00", "12345678930", "52345678944");
    check_and_create_randevu("2024-05-06", "16:00", "12345678930", "52345678944");
    check_and_create_randevu("2024-05-01", "09:00", "12345678926", "72345678917");
    check_and_create_randevu("2024-05-02", "10:00", "12345678926", "72345678917");
    check_and_create_randevu("2024-05-03", "11:00", "12345678926", "72345678917");
    check_and_create_randevu("2024-05-04", "14:00", "12345678926", "72345678917");

}


creating_admin_table();
creating_doctor_table();
creating_hasta_table();
creating_randevu_table();
creating_rapor_table();
creating_rows_admin();
creationg_rows_doctor();
creating_rows_hasta();
creating_rows_randevu();





