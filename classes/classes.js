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

    
}

module.exports = { Hasta, Admin, Doktor, Randevu, Rapor };
