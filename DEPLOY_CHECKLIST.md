# Feltöltés előtti checklist

## 1. Lokális ellenőrzés
- [ ] A publikus oldal kemény frissítéssel (`Ctrl+F5`) újratöltve.
- [ ] A chatbot látszik és megnyílik mobilon és asztali nézetben.
- [ ] A chatbot `Kapcsolat oldal megnyitása` gombja a kapcsolat oldalra visz.
- [ ] Az `Email cím másolása` gomb működik.
- [ ] A mobil menü nyitás és zárás működik HU és DE oldalon.

## 2. Admin ellenőrzés
- [ ] Az admint nem `127.0.0.1:5500` alatt teszteled, hanem `netlify dev` vagy éles domain alatt.
- [ ] Az admin külön oldalai betöltenek:
  - `/admin/index.html`
  - `/admin/foglalasok.html`
  - `/admin/kapcsolatok.html`
  - `/admin/galeria.html`
  - `/admin/portfolio.html`
- [ ] A foglalások státuszváltása működik.
- [ ] A kapcsolati üzenetek mentése működik.
- [ ] A galériafiók létrehozás és jelszó reset működik.
- [ ] A galéria képfeltöltés működik.
- [ ] A portfólió feltöltés és törlés működik.

## 3. Supabase
- [ ] Lefuttattad: `supabase/admin_tables.sql`
- [ ] Létezik a `client-galleries` bucket.
- [ ] Létezik a `portfolio-media` bucket.
- [ ] A `profiles` táblában az admin user szerepe `admin`.

## 4. Supabase Auth
- [ ] A redirect URL-ek között szerepel:
  - `https://bphoto.at/hu/galeria-jelszo.html`
  - `https://bphoto.at/de/galeria-jelszo.html`
- [ ] Ha van preview domain, annak URL-jei is fel vannak véve.

## 5. Netlify env változók
- [ ] `RESEND_API_KEY`
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE`
- [ ] `BOOKING_FROM_EMAIL`
- [ ] `BOOKING_TO_EMAIL`
- [ ] `CONTACT_FROM_EMAIL`
- [ ] `CONTACT_TO_EMAIL`
- [ ] `GALLERY_FROM_EMAIL`

## 6. Jogi oldalak
- [ ] Ellenőrizted és véglegesítetted a hivatalos nevet / címet, ha kell:
  - `hu/aszf.html`
  - `hu/impresszum.html`
  - `de/agb.html`
  - `de/impressum.html`
- [ ] A footer linkek minden fő oldalon működnek.

## 7. SEO és indexelés
- [ ] A sitemap elérhető: `https://bphoto.at/sitemap.xml`
- [ ] A robots elérhető: `https://bphoto.at/robots.txt`
- [ ] A Google Search Console-ban a domain ellenőrizve van.
- [ ] A sitemap be van küldve Search Console-ba.
- [ ] Indexelést kértél a fő URL-ekre:
  - `/hu/index.html`
  - `/de/index.html`
  - `/hu/portfolio.html`
  - `/de/portfolio.html`
  - `/hu/arak.html`
  - `/de/preise.html`
  - `/hu/foglalas.html`
  - `/de/termin.html`
  - `/hu/kapcsolat.html`
  - `/de/kontakt.html`

## 8. Fontos megjegyzés
- A technikai SEO és a tartalmi alap most rendben erősebb lett, de találati pozíciót senki nem tud garantálni. Az indexelés és a helyezés külön dolog.
