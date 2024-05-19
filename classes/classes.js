// hasta listesi
const hastalar = [];
// admin listesi
const adminler = [];
// doktor listesi
const doktorlar = [];
// randevu listesi
const randevular = [];
// rapor listesi
const raporlar = [];

class Hasta {
    constructor(hastaid, tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, sifre) {
        this.hastaid = hastaid;
        this.tcno = tcno;
        this.isim = isim;
        this.soyisim = soyisim;
        this.dogumTarihi = dogumTarihi;
        this.cinsiyet = cinsiyet;
        this.telefon = telefon;
        this.sehir = sehir;
        this.ilce = ilce;
        this.mahalle = mahalle;
        this.sifre = sifre;
    }

    // getter
    getHastaBilgileri() {
        return this.hastaid + " " + this.tcno + " " + this.isim + " " + this.soyisim + " " + this.dogumTarihi + " " + this.cinsiyet + " " + this.telefon + " " + this.sehir + " " + this.ilce + " " + this.mahalle + " " + this.sifre;
    }

    // setter
    setHastaBilgileri(hastaid, tcno, isim, soyisim, dogumTarihi, cinsiyet, telefon, sehir, ilce, mahalle, sifre) {
        this.hastaid = hastaid;
        this.tcno = tcno;
        this.isim = isim;
        this.soyisim = soyisim;
        this.dogumTarihi = dogumTarihi;
        this.cinsiyet = cinsiyet;
        this.telefon = telefon;
        this.sehir = sehir;
        this.ilce = ilce;
        this.mahalle = mahalle;
        this.sifre = sifre;
    }

    // hastalar listesine ekle
    static addHasta(hasta) {
        hastalar.push(hasta);
    }

    // hastalar listesinden sil
    static removeHasta(hasta) {
        const index = hastalar.indexOf(hasta);
        if (index > -1) {
            hastalar.splice(index, 1);
        }
    }
}

class Admin {
    constructor(adminid, kullaniciadi, sifre) {
        this.adminid = adminid;
        this.kullaniciadi = kullaniciadi;
        this.sifre = sifre;
    }

    // getter
    getAdminBilgileri() {
        return this.adminid + " " + this.kullaniciadi + " " + this.sifre;
    }

    // setter
    setAdminBilgileri(adminid, kullaniciadi, sifre) {
        this.adminid = adminid;
        this.kullaniciadi = kullaniciadi;
        this.sifre = sifre;
    }

    // adminler listesine ekle
    static addAdmin(admin) {
        adminler.push(admin);
    }

    // adminler listesinden sil
    static removeAdmin(admin) {
        const index = adminler.indexOf(admin);
        if (index > -1) {
            adminler.splice(index, 1);
        }
    }
}

class Doktor {
    constructor(iddoktor, tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, password) {
        this.iddoktor = iddoktor;
        this.tcno = tcno;
        this.isim = isim;
        this.soyisim = soyisim;
        this.uzmanlik_alani = uzmanlik_alani;
        this.calistigi_hastane = calistigi_hastane;
        this.password = password;
    }

    // getter
    getDoktorBilgileri() {
        return this.iddoktor + " " + this.tcno + " " + this.isim + " " + this.soyisim + " " + this.uzmanlik_alani + " " + this.calistigi_hastane + " " + this.password;
    }

    // setter
    setDoktorBilgileri(iddoktor, tcno, isim, soyisim, uzmanlik_alani, calistigi_hastane, password) {
        this.iddoktor = iddoktor;
        this.tcno = tcno;
        this.isim = isim;
        this.soyisim = soyisim;
        this.uzmanlik_alani = uzmanlik_alani;
        this.calistigi_hastane = calistigi_hastane;
        this.password = password;
    }

    // doktorlar listesine ekle
    static addDoktor(doktor) {
        doktorlar.push(doktor);
    }

    // doktorlar listesinden sil
    static removeDoktor(doktor) {
        const index = doktorlar.indexOf(doktor);
        if (index > -1) {
            doktorlar.splice(index, 1);
        }
    }
}

class Randevu {
    constructor(randevuid, tarih, saat, d_tcno, h_tcno) {
        this.randevuid = randevuid;
        this.tarih = tarih;
        this.saat = saat;
        this.d_tcno = d_tcno;
        this.h_tcno = h_tcno;
    }

    // getter
    getRandevuBilgileri() {
        return this.randevuid + " " + this.tarih + " " + this.saat + " " + this.d_tcno + " " + this.h_tcno;
    }

    // setter
    setRandevuBilgileri(randevuid, tarih, saat, d_tcno, h_tcno) {
        this.randevuid = randevuid;
        this.tarih = tarih;
        this.saat = saat;
        this.d_tcno = d_tcno;
        this.h_tcno = h_tcno;
    }

    // randevular listesine ekle
    static addRandevu(randevu) {
        randevular.push(randevu);
    }

    // randevular listesinden sil
    static removeRandevu(randevu) {
        const index = randevular.indexOf(randevu);
        if (index > -1) {
            randevular.splice(index, 1);
        }
    }
}

class Rapor {
    constructor(raporid, h_tcno, tarih, icerik, resim) {
        this.raporid = raporid;
        this.h_tcno = h_tcno;
        this.tarih = tarih;
        this.icerik = icerik;
        this.resim = resim;
    }

    // getter
    getRaporBilgileri() {
        return this.raporid + " " + this.h_tcno + " " + this.tarih + " " + this.icerik + " " + this.resim;
    }

    // setter
    setRaporBilgileri(raporid, h_tcno, tarih, icerik, resim) {
        this.raporid = raporid;
        this.h_tcno = h_tcno;
        this.tarih = tarih;
        this.icerik = icerik;
        this.resim = resim;
    }

    // raporlar listesine ekle
    static addRapor(rapor) {
        raporlar.push(rapor);
    }

    // raporlar listesinden sil
    static removeRapor(rapor) {
        const index = raporlar.indexOf(rapor);
        if (index > -1) {
            raporlar.splice(index, 1);
        }
    }
}

module.exports = { Hasta, Admin, Doktor, Randevu, Rapor, hastalar, adminler, doktorlar, randevular, raporlar };
