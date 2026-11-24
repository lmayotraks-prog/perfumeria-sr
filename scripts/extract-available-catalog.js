// scripts/extract-available-catalog.js
// Extrae cada frasco del catálogo disponible (2.jpg–21.jpg) con fondo transparente
// y enriquece cada referencia cruzándola contra parfumo-catalog.json (25,663 fragancias).
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = 'D:\\essences sr\\catalogo disponible\\CATALOGO ESSENCES SR';
const OUT_IMG_DIR = path.join(__dirname, '..', 'public', 'images', 'catalog');
const PARFUMO_PATH = path.join(__dirname, '..', 'src', 'data', 'parfumo-catalog.json');
const OUT_JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'available-catalog.json');

// Catálogo real extraído visualmente página por página:
// [archivo, fila(0-3), col(0-2), genero, marca, nombre, consultaParfumo?, familiaFallback?, colorFallback?]
const CATALOG_ITEMS = [
  // ——— CABALLERO (Fondo negro: 2.jpg a 13.jpg) ———
  ['2.jpg', 0, 0, 'masculino', 'Calvin Klein', 'CK One', 'ck one', 'Cítrico', '#d9d3c3'],
  ['2.jpg', 0, 1, 'masculino', 'Calvin Klein', 'CK Be', 'ck be', 'Almizclado', '#222224'],
  ['2.jpg', 0, 2, 'masculino', 'Calvin Klein', 'CK One Red Edition', 'ck one red', 'Afrutado', '#9c1c24'],
  ['2.jpg', 1, 0, 'masculino', 'Carolina Herrera', '212 Men Aqua', '212 men aqua', 'Acuático', '#2a7ab0'],
  ['2.jpg', 1, 1, 'masculino', 'Carolina Herrera', '212 Men NYC', '212 men', 'Fresco', '#8a9aa8'],
  ['2.jpg', 1, 2, 'masculino', 'Carolina Herrera', '212 Sexy Men', '212 sexy men', 'Oriental', '#8a2630'],
  ['2.jpg', 2, 0, 'masculino', 'Carolina Herrera', '212 VIP Men', '212 vip men', 'Oriental', '#a8b0b8'],
  ['2.jpg', 2, 1, 'masculino', 'Carolina Herrera', '212 VIP Black', '212 vip black', 'Aromático', '#1a1a1f'],
  ['2.jpg', 2, 2, 'masculino', 'Carolina Herrera', '212 Heroes', '212 heroes', 'Fresco', '#4d657a'],
  ['2.jpg', 3, 0, 'masculino', 'Carolina Herrera', 'CH Men', 'ch men', 'Oriental', '#6b3e26'],
  ['2.jpg', 3, 1, 'masculino', 'Carolina Herrera', 'Bad Boy', 'bad boy', 'Especiado', '#1c1816'],
  ['2.jpg', 3, 2, 'masculino', 'Carolina Herrera', 'CH Men Privé', 'ch men prive', 'Cuero', '#4a3022'],

  ['3.jpg', 0, 0, 'masculino', 'Coach', 'Coach for Men', 'coach for men', 'Amaderado', '#2d3b4a'],
  ['3.jpg', 0, 1, 'masculino', 'Coach', 'Coach Blue', 'coach blue', 'Fresco', '#1f5c99'],
  ['3.jpg', 0, 2, 'masculino', 'Chanel', 'Bleu de Chanel', 'bleu de chanel', 'Amaderado', '#122238'],
  ['3.jpg', 1, 0, 'masculino', 'Dior', 'Fahrenheit', 'fahrenheit', 'Cuero', '#a83414'],
  ['3.jpg', 1, 1, 'masculino', 'Dior', 'Sauvage', 'sauvage', 'Fresco', '#1a3552'],
  ['3.jpg', 1, 2, 'masculino', 'Creed', 'Silver Mountain Water', 'silver mountain water', 'Fresco', '#c9d4dc'],
  ['3.jpg', 2, 0, 'masculino', 'Creed', 'Aventus', 'aventus', 'Chypre', '#2c2c2c'],
  ['3.jpg', 2, 1, 'masculino', 'Creed', 'Millésime Impérial', 'millesime imperial', 'Cítrico', '#d4ad48'],
  ['3.jpg', 2, 2, 'masculino', 'Creed', 'Original Santal', 'original santal', 'Oriental', '#b84228'],
  ['3.jpg', 3, 0, 'masculino', 'Clinique', 'Happy for Men', 'happy for men', 'Cítrico', '#e66c18'],
  ['3.jpg', 3, 1, 'masculino', 'Diesel', 'Plus Plus Masculine', 'plus plus masculine', 'Oriental', '#d4d4d4'],
  ['3.jpg', 3, 2, 'masculino', 'Diesel', 'Fuel for Life Homme', 'fuel for life homme', 'Fougère', '#7a5a30'],

  ['4.jpg', 0, 0, 'masculino', 'Diesel', 'Only The Brave', 'only the brave', 'Amaderado', '#4a6b8a'],
  ['4.jpg', 0, 1, 'masculino', 'Dolce & Gabbana', 'Light Blue Pour Homme', 'light blue pour homme', 'Cítrico', '#75aadb'],
  ['4.jpg', 0, 2, 'masculino', 'Dolce & Gabbana', 'The One for Men', 'the one for men', 'Especiado', '#a85a18'],
  ['4.jpg', 1, 0, 'masculino', 'Dolce & Gabbana', 'Pour Homme Intenso', 'intenso', 'Amaderado', '#3b2416'],
  ['4.jpg', 1, 1, 'masculino', 'Dolce & Gabbana', 'K by Dolce & Gabbana', 'k by dolce', 'Amaderado', '#34689c'],
  ['4.jpg', 1, 2, 'masculino', 'Giorgio Armani', 'Acqua di Giò Profondo', 'acqua di gio profondo', 'Acuático', '#1a3c63'],
  ['4.jpg', 2, 0, 'masculino', 'Giorgio Armani', 'Acqua di Giò Profumo', 'acqua di gio profumo', 'Acuático', '#181a1c'],
  ['4.jpg', 2, 1, 'masculino', 'Giorgio Armani', 'Acqua di Giò Pour Homme', 'acqua di gio pour homme', 'Acuático', '#b8c8cc'],
  ['4.jpg', 2, 2, 'masculino', 'Ferrari', 'Scuderia Ferrari Red', 'ferrari red', 'Cítrico', '#c41e24'],
  ['4.jpg', 3, 0, 'masculino', 'Givenchy', 'Givenchy Pour Homme', 'givenchy pour homme', 'Amaderado', '#8f1820'],
  ['4.jpg', 3, 1, 'masculino', 'Givenchy', 'Givenchy Blue Label', 'blue label', 'Cítrico', '#1e4ea8'],
  ['4.jpg', 3, 2, 'masculino', 'Hugo Boss', 'Boss Bottled', 'boss bottled', 'Amaderado', '#c8c488'],

  ['5.jpg', 0, 0, 'masculino', 'Hugo Boss', 'Boss Bottled Intense', 'boss bottled intense', 'Especiado', '#b87620'],
  ['5.jpg', 0, 1, 'masculino', 'Hugo Boss', 'Boss Bottled Night', 'boss bottled night', 'Amaderado', '#18244a'],
  ['5.jpg', 0, 2, 'masculino', 'Hugo Boss', 'Boss Bottled Unlimited', 'boss bottled unlimited', 'Fresco', '#dce2e6'],
  ['5.jpg', 1, 0, 'masculino', 'Hugo Boss', 'Boss Bottled Oud', 'boss bottled oud', 'Oriental', '#2c1e14'],
  ['5.jpg', 1, 1, 'masculino', 'Hugo Boss', 'Boss Bottled Infinite', 'boss bottled infinite', 'Amaderado', '#223654'],
  ['5.jpg', 1, 2, 'masculino', 'Hugo Boss', 'Hugo Man', 'hugo man', 'Verde', '#5c8aa8'],
  ['5.jpg', 2, 0, 'masculino', 'Hugo Boss', 'Hugo Just Different', 'hugo just different', 'Fresco', '#1c1c20'],
  ['5.jpg', 2, 1, 'masculino', 'Hugo Boss', 'Hugo Red', 'hugo red', 'Especiado', '#b01c22'],
  ['5.jpg', 2, 2, 'masculino', 'Hugo Boss', 'Boss in Motion', 'boss in motion', 'Oriental', '#a8aeb4'],
  ['5.jpg', 3, 0, 'masculino', 'Hugo Boss', 'Boss The Scent', 'boss the scent', 'Especiado', '#b87628'],
  ['5.jpg', 3, 1, 'masculino', 'Issey Miyake', "L'Eau d'Issey Pour Homme", "l'eau d'issey pour homme", 'Acuático', '#d8d4b8'],
  ['5.jpg', 3, 2, 'masculino', 'Jean Pascal', 'Jean Pascal Pour Homme', 'jean pascal', 'Amaderado', '#4a321e'],

  ['6.jpg', 0, 0, 'masculino', 'Jean Paul Gaultier', 'Le Male', 'le male', 'Oriental', '#2a7a8a'],
  ['6.jpg', 0, 1, 'masculino', 'Lacoste', 'L.12.12 Blanc', 'l.12.12 blanc', 'Fresco', '#e6e6e4'],
  ['6.jpg', 0, 2, 'masculino', 'Lacoste', 'L.12.12 Rouge', 'l.12.12 rouge', 'Especiado', '#a81e24'],
  ['6.jpg', 1, 0, 'masculino', 'Lacoste', 'L.12.12 Vert', 'l.12.12 vert', 'Verde', '#2a854a'],
  ['6.jpg', 1, 1, 'masculino', 'Lacoste', 'L.12.12 Bleu', 'l.12.12 bleu', 'Fresco', '#285ca8'],
  ['6.jpg', 1, 2, 'masculino', 'Lacoste', 'L.12.12 Jaune', 'l.12.12 jaune', 'Cítrico', '#dec022'],
  ['6.jpg', 2, 0, 'masculino', 'Lacoste', 'L.12.12 Noir', 'l.12.12 noir', 'Amaderado', '#1c1c20'],
  ['6.jpg', 2, 1, 'masculino', 'Lacoste', 'L.12.12 Magnetic', 'l.12.12 magnetic', 'Fresco', '#1c326e'],
  ['6.jpg', 2, 2, 'masculino', 'Lacoste', 'L.12.12 Energized', 'l.12.12 energized', 'Fresco', '#d8d8d6'],
  ['6.jpg', 3, 0, 'masculino', 'Lacoste', 'Lacoste Red', 'lacoste red', 'Fresco', '#c43222'],
  ['6.jpg', 3, 1, 'masculino', 'Mercedes-Benz', 'Mercedes-Benz Man', 'mercedes-benz man', 'Fresco', '#182436'],
  ['6.jpg', 3, 2, 'masculino', 'Montblanc', 'Legend Spirit', 'legend spirit', 'Fresco', '#dce0e6'],

  ['7.jpg', 0, 0, 'masculino', 'Montblanc', 'Legend', 'legend', 'Fougère', '#1a1c20'],
  ['7.jpg', 0, 1, 'masculino', 'Montblanc', 'Legend Blue', 'legend blue', 'Fresco', '#1b4aa8'],
  ['7.jpg', 0, 2, 'masculino', 'Montblanc', 'Emblem', 'emblem', 'Especiado', '#18181c'],
  ['7.jpg', 1, 0, 'masculino', 'Montblanc', 'Emblem Intense', 'emblem intense', 'Especiado', '#8c8e94'],
  ['7.jpg', 1, 1, 'masculino', 'Moschino', 'Toy Boy', 'toy boy', 'Especiado', '#1a1a1d'],
  ['7.jpg', 1, 2, 'masculino', 'Nautica', 'Nautica Voyage', 'nautica voyage', 'Acuático', '#5298cc'],
  ['7.jpg', 2, 0, 'masculino', 'Paco Rabanne', 'Pure XS', 'pure xs', 'Oriental', '#1a2c4e'],
  ['7.jpg', 2, 1, 'masculino', 'Paco Rabanne', 'XS Pour Homme', 'xs pour homme', 'Amaderado', '#d6c48a'],
  ['7.jpg', 2, 2, 'masculino', 'Paco Rabanne', 'Black XS', 'black xs', 'Oriental', '#1a1c1a'],
  ['7.jpg', 3, 0, 'masculino', 'Paco Rabanne', "Black XS L'Excès", "black xs l'exces", 'Amaderado', '#24262b'],
  ['7.jpg', 3, 1, 'masculino', 'Paco Rabanne', '1 Million', '1 million', 'Especiado', '#c99c34'],
  ['7.jpg', 3, 2, 'masculino', 'Paco Rabanne', '1 Million Lucky', '1 million lucky', 'Gourmand', '#c0bcb0'],

  ['8.jpg', 0, 0, 'masculino', 'Paco Rabanne', '1 Million Royal', '1 million royal', 'Oriental', '#c4962c'],
  ['8.jpg', 0, 1, 'masculino', 'Paco Rabanne', '1 Million Privé', '1 million prive', 'Oriental', '#7a4b24'],
  ['8.jpg', 0, 2, 'masculino', 'Paco Rabanne', 'Black XS (2018)', 'black xs 2018', 'Oriental', '#1c1a1c'],
  ['8.jpg', 1, 0, 'masculino', 'Paco Rabanne', 'Invictus', 'invictus', 'Acuático', '#9ab0c0'],
  ['8.jpg', 1, 1, 'masculino', 'Paco Rabanne', 'Invictus Victory', 'invictus victory', 'Oriental', '#1a1a1f'],
  ['8.jpg', 1, 2, 'masculino', 'Paco Rabanne', 'Invictus Legend', 'invictus legend', 'Amaderado', '#1a4c7a'],
  ['8.jpg', 2, 0, 'masculino', 'Paco Rabanne', 'Invictus Aqua', 'invictus aqua', 'Acuático', '#6db0d8'],
  ['8.jpg', 2, 1, 'masculino', 'Paco Rabanne', 'Invictus Intense', 'invictus intense', 'Oriental', '#404650'],
  ['8.jpg', 2, 2, 'masculino', 'Paris Hilton', 'Paris Hilton for Men', 'paris hilton for men', 'Fresco', '#28528a'],
  ['8.jpg', 3, 0, 'masculino', 'Ralph Lauren', 'Polo Red', 'polo red', 'Especiado', '#c4181e'],
  ['8.jpg', 3, 1, 'masculino', 'Ralph Lauren', 'Polo Blue', 'polo blue', 'Acuático', '#1a3aa8'],
  ['8.jpg', 3, 2, 'masculino', 'Ralph Lauren', 'Polo Black', 'polo black', 'Amaderado', '#18181a'],

  ['9.jpg', 0, 0, 'masculino', 'Ralph Lauren', 'Polo Red Extreme', 'polo red extreme', 'Gourmand', '#221414'],
  ['9.jpg', 0, 1, 'masculino', 'Ralph Lauren', 'Polo Ultra Blue', 'polo ultra blue', 'Cítrico', '#4c78a8'],
  ['9.jpg', 0, 2, 'masculino', 'Ralph Lauren', 'Polo Blue Sport', 'polo blue sport', 'Fresco', '#e0e2e4'],
  ['9.jpg', 1, 0, 'masculino', 'Ralph Lauren', 'Polo Red White & Blue', 'red white & blue', 'Fresco', '#1a38a0'],
  ['9.jpg', 1, 1, 'masculino', 'Victorinox', 'Swiss Army Classic', 'swiss army', 'Fresco', '#b8bcc0'],
  ['9.jpg', 1, 2, 'masculino', 'Victorinox', 'Swiss Army Altitude', 'altitude', 'Amaderado', '#282c2a'],
  ['9.jpg', 2, 0, 'masculino', 'Tommy Hilfiger', 'Tommy', 'tommy', 'Cítrico', '#c4d0d4'],
  ['9.jpg', 2, 1, 'masculino', 'Tommy Hilfiger', 'Tommy Now', 'tommy now', 'Especiado', '#1e2c5c'],
  ['9.jpg', 2, 2, 'masculino', 'Versace', 'Eros', 'eros', 'Fresco', '#127080'],
  ['9.jpg', 3, 0, 'masculino', 'Versace', 'Eros Flame', 'eros flame', 'Especiado', '#b81a24'],
  ['9.jpg', 3, 1, 'masculino', 'Versace', 'Eros Energy', 'eros energy', 'Cítrico', '#d4b024'],
  ['9.jpg', 3, 2, 'masculino', 'Versace', 'Dylan Blue', 'dylan blue', 'Fresco', '#1a2e68'],

  ['10.jpg', 0, 0, 'masculino', 'Paco Rabanne', 'Phantom', 'phantom', 'Fresco', '#b0b4b8'],
  ['10.jpg', 0, 1, 'masculino', 'Paco Rabanne', 'Phantom Parfum', 'phantom parfum', 'Oriental', '#1a1a1e'],
  ['10.jpg', 0, 2, 'masculino', 'Paco Rabanne', 'Phantom Intense', 'phantom intense', 'Oriental', '#1d3268'],
  ['10.jpg', 1, 0, 'masculino', 'Al Haramain', 'Amber Oud Rouge', 'amber oud rouge', 'Oriental', '#a82228'],
  ['10.jpg', 1, 1, 'masculino', 'Al Haramain', 'Amber Oud Gold Edition', 'amber oud gold', 'Gourmand', '#c99c40'],
  ['10.jpg', 1, 2, 'masculino', 'Al Haramain', 'Amber Oud Aqua Dubai', 'aqua dubai', 'Acuático', '#1a9ac8'],
  ['10.jpg', 2, 0, 'masculino', 'Orientica', 'Oud Saffron', 'oud saffron', 'Oriental', '#22201e'],
  ['10.jpg', 2, 1, 'masculino', 'Orientica', 'Royal Bleu', 'royal bleu', 'Amaderado', '#1c3b8a'],
  ['10.jpg', 2, 2, 'masculino', 'Orientica', 'Amber Rouge', 'amber rouge', 'Oriental', '#c42228'],
  ['10.jpg', 3, 0, 'masculino', 'Orientica', 'Royal Amber', 'royal amber', 'Oriental', '#c99c4a'],
  ['10.jpg', 3, 1, 'masculino', 'Orientica', 'Amber Noir', 'amber noir', 'Amaderado', '#1a1a1c'],
  ['10.jpg', 3, 2, 'masculino', 'Lattafa', 'Khamrah', 'khamrah', 'Gourmand', '#9e5418'],

  ['11.jpg', 0, 0, 'masculino', 'Lattafa', 'Khamrah Qahwa', 'khamrah qahwa', 'Gourmand', '#6b3818'],
  ['11.jpg', 0, 1, 'masculino', 'Valentino', 'Uomo Born in Roma', 'uomo born in roma', 'Amaderado', '#222024'],
  ['11.jpg', 0, 2, 'masculino', 'Valentino', 'Born in Roma Yellow Dream', 'yellow dream', 'Especiado', '#d4b448'],
  ['11.jpg', 1, 0, 'masculino', 'Lattafa', "Bade'e Al Oud Sublime", 'sublime', 'Afrutado', '#9c1c28'],
  ['11.jpg', 1, 1, 'masculino', 'Lattafa', "Bade'e Al Oud Amethyst", 'amethyst', 'Oriental', '#4a2452'],
  ['11.jpg', 1, 2, 'masculino', 'Lattafa', "Bade'e Al Oud Oud for Glory", 'oud for glory', 'Oriental', '#1c1a1c'],
  ['11.jpg', 2, 0, 'masculino', 'Lattafa', "Bade'e Al Oud Honor & Glory", 'honor & glory', 'Gourmand', '#ded8c8'],
  ['11.jpg', 2, 1, 'masculino', 'Lattafa', 'Asad', 'asad', 'Especiado', '#1a1a1c'],
  ['11.jpg', 2, 2, 'masculino', 'Lattafa', 'Asad Bourbon', 'asad bourbon', 'Oriental', '#5e3422'],
  ['11.jpg', 3, 0, 'masculino', 'Lattafa', 'Shaheen Gold', 'shaheen gold', 'Oriental', '#c9a448'],
  ['11.jpg', 3, 1, 'masculino', 'Lattafa', 'Shaheen Silver', 'shaheen silver', 'Amaderado', '#242628'],
  ['11.jpg', 3, 2, 'masculino', 'Lattafa', 'Emeer', 'emeer', 'Amaderado', '#c99e3e'],

  ['12.jpg', 0, 0, 'masculino', 'Armaf', 'Odyssey Mandarin Sky', 'odyssey mandarin sky', 'Gourmand', '#2ca4d4'],
  ['12.jpg', 0, 1, 'masculino', 'Armaf', 'Odyssey Limoni', 'odyssey limoni', 'Cítrico', '#d4c428'],
  ['12.jpg', 0, 2, 'masculino', 'Armaf', 'Odyssey Dubai Chocolat', 'dubai chocolat', 'Gourmand', '#5e3c22'],
  ['12.jpg', 1, 0, 'masculino', 'Ilmin', 'Il Ego', 'il ego', 'Amaderado', '#222226'],
  ['12.jpg', 1, 1, 'masculino', 'Ilmin', 'Il Mexico', 'il mexico', 'Especiado', '#2a4a32'],
  ['12.jpg', 1, 2, 'masculino', 'Ilmin', 'Kakuno', 'kakuno', 'Oriental', '#242224'],
  ['12.jpg', 2, 0, 'masculino', 'Afnan', '9 PM', '9 pm', 'Gourmand', '#1a1a1e'],
  ['12.jpg', 2, 1, 'masculino', 'Afnan', '9 AM Dive', '9 am dive', 'Acuático', '#1a5ca8'],
  ['12.jpg', 2, 2, 'masculino', 'Afnan', '9 PM Rebel', '9 pm rebel', 'Afrutado', '#9c2832'],
  ['13.jpg', 0, 0, 'masculino', 'Lattafa', 'His Confession', 'his confession', 'Oriental', '#28221e'],

  // ——— DAMA (Fondo de color / lila: 14.jpg a 21.jpg) ———
  ['14.jpg', 0, 0, 'femenino', 'Al Haramain', "L'Aventure Rose", "l'aventure rose", 'Floral', '#d87670'],
  ['14.jpg', 0, 1, 'femenino', 'Al Haramain', "L'Aventure Gold", "l'aventure gold", 'Floral', '#d4b058'],
  ['14.jpg', 0, 2, 'femenino', 'Afnan', '9 AM', '9 am', 'Cítrico', '#d8cba8'],
  ['14.jpg', 1, 0, 'femenino', 'Afnan', '9 AM Pour Femme', '9 am pour femme', 'Floral', '#d47462'],
  ['14.jpg', 1, 1, 'femenino', 'Ariana Grande', 'Cloud', 'cloud', 'Gourmand', '#98c4e0'],
  ['14.jpg', 1, 2, 'femenino', 'Ariana Grande', 'Cloud 2.0 Intense', 'cloud intense', 'Gourmand', '#304a78'],
  ['14.jpg', 2, 0, 'femenino', 'Ariana Grande', 'Thank U, Next', 'thank u next', 'Gourmand', '#e2b6c2'],
  ['14.jpg', 2, 1, 'femenino', 'Benetton', 'United Dreams Live Free', 'live free', 'Fresco', '#8cb87a'],
  ['14.jpg', 2, 2, 'femenino', 'Benetton', 'United Dreams Love Yourself', 'love yourself', 'Floral', '#e08aa4'],
  ['14.jpg', 3, 0, 'femenino', 'Balenciaga', 'Rumba', 'rumba', 'Oriental', '#c96c2a'],
  ['14.jpg', 3, 1, 'femenino', 'Bvlgari', 'Goldea', 'goldea', 'Oriental', '#d4a63a'],
  ['14.jpg', 3, 2, 'femenino', 'Bvlgari', 'Omnia Pink Sapphire', 'omnia pink sapphire', 'Floral', '#d4588a'],

  ['15.jpg', 0, 0, 'femenino', 'Bvlgari', 'Omnia Amethyste', 'omnia amethyste', 'Floral', '#9872b4'],
  ['15.jpg', 0, 1, 'femenino', 'Bvlgari', 'Omnia Coral', 'omnia coral', 'Floral', '#cc4244'],
  ['15.jpg', 0, 2, 'femenino', 'Bvlgari', 'Omnia Paraiba', 'omnia paraiba', 'Fresco', '#34a8a0'],
  ['15.jpg', 1, 0, 'femenino', 'Carolina Herrera', 'Chic', 'chic', 'Floral', '#9e1c28'],
  ['15.jpg', 1, 1, 'femenino', 'Carolina Herrera', 'Carolina Herrera EDP', 'carolina herrera', 'Floral', '#dfd494'],
  ['15.jpg', 1, 2, 'femenino', 'Carolina Herrera', '212 Woman', '212', 'Floral', '#c8ccd0'],
  ['15.jpg', 2, 0, 'femenino', 'Carolina Herrera', '212 VIP Rosé', '212 vip rose', 'Floral', '#d8a69e'],
  ['15.jpg', 2, 1, 'femenino', 'Carolina Herrera', 'CH Woman', 'ch', 'Oriental', '#a81c24'],
  ['15.jpg', 2, 2, 'femenino', 'Carolina Herrera', 'Good Girl Légère', 'good girl legere', 'Oriental', '#223866'],
  ['15.jpg', 3, 0, 'femenino', 'Carolina Herrera', 'Good Girl', 'good girl', 'Oriental', '#1a2038'],
  ['15.jpg', 3, 1, 'femenino', 'Carolina Herrera', 'Good Girl Fantastic Pink', 'good girl fantastic pink', 'Oriental', '#d490a4'],
  ['15.jpg', 3, 2, 'femenino', 'Carolina Herrera', '212 VIP Rosé Red', '212 vip rose red', 'Floral', '#c82430'],

  ['16.jpg', 0, 0, 'femenino', 'Chanel', 'Coco Mademoiselle', 'coco mademoiselle', 'Chypre', '#e2b698'],
  ['16.jpg', 0, 1, 'femenino', 'Chanel', 'Chance', 'chance', 'Chypre', '#dfb482'],
  ['16.jpg', 0, 2, 'femenino', 'Dior', 'Miss Dior', 'miss dior', 'Floral', '#e29eb0'],
  ['16.jpg', 1, 0, 'femenino', 'Creed', 'Aventus for Her', 'aventus for her', 'Chypre', '#d8d4c8'],
  ['16.jpg', 1, 1, 'femenino', 'Valentino', 'Donna Born in Roma', 'donna born in roma', 'Oriental', '#c83e6e'],
  ['16.jpg', 1, 2, 'femenino', 'Dolce & Gabbana', 'Light Blue Eau Intense', 'light blue eau intense', 'Cítrico', '#6cb2d8'],
  ['16.jpg', 2, 0, 'femenino', 'Dolce & Gabbana', 'The One', 'the one', 'Oriental', '#d4a648'],
  ['16.jpg', 2, 1, 'femenino', 'Dolce & Gabbana', 'Pour Femme', 'pour femme', 'Floral', '#d8b4be'],
  ['16.jpg', 2, 2, 'femenino', 'Givenchy', 'Irresistible', 'irresistible', 'Floral', '#deb2b8'],
  ['16.jpg', 3, 0, 'femenino', 'Hugo Boss', 'Hugo Woman Extreme', 'hugo woman extreme', 'Floral', '#d47ca0'],
  ['16.jpg', 3, 1, 'femenino', 'Hugo Boss', 'Boss Femme', 'boss femme', 'Floral', '#d8a0a2'],
  ['16.jpg', 3, 2, 'femenino', 'Hugo Boss', 'Boss The Scent for Her', 'boss the scent for her', 'Floral', '#d8aa7c'],

  ['17.jpg', 0, 1, 'femenino', 'Issey Miyake', "L'Eau d'Issey Florale", "l'eau d'issey florale", 'Floral', '#dca2ac'],
  ['17.jpg', 0, 2, 'femenino', 'Jean Paul Gaultier', 'Classique', 'classique', 'Oriental', '#d89a78'],
  ['17.jpg', 1, 0, 'femenino', 'Jean Paul Gaultier', 'Scandal', 'scandal', 'Gourmand', '#d88c8c'],
  ['17.jpg', 1, 1, 'femenino', 'Jean Paul Gaultier', 'So Scandal!', 'so scandal', 'Floral', '#b42c44'],
  ['17.jpg', 1, 2, 'femenino', 'Jennifer Lopez', 'Still', 'still', 'Floral', '#d4b8a4'],
  ['17.jpg', 2, 0, 'femenino', 'Katy Perry', 'Purr', 'purr', 'Floral', '#7c2e7c'],
  ['17.jpg', 2, 1, 'femenino', 'Katy Perry', 'Meow!', 'meow', 'Gourmand', '#dcb0cc'],
  ['17.jpg', 2, 2, 'femenino', 'Creed', 'Love in White', 'love in white', 'Floral', '#e4e2dc'],
  ['17.jpg', 3, 0, 'femenino', 'Dolce & Gabbana', 'The Only One', 'the only one', 'Gourmand', '#b86840'],
  ['17.jpg', 3, 1, 'femenino', 'Kenzo', 'Flower by Kenzo', 'flower by kenzo', 'Empolvado', '#d84244'],
  ['17.jpg', 3, 2, 'femenino', 'Kenzo', 'Kenzo Amour', 'kenzo amour', 'Oriental', '#b81e54'],

  ['18.jpg', 0, 0, 'femenino', 'Lacoste', 'Eau de Lacoste', 'eau de lacoste', 'Floral', '#ded8b4'],
  ['18.jpg', 0, 1, 'femenino', 'Lacoste', 'Touch of Pink', 'touch of pink', 'Floral', '#dc5488'],
  ['18.jpg', 0, 2, 'femenino', 'Lacoste', 'Lacoste Pour Femme', 'lacoste pour femme', 'Floral', '#dcd4c6'],
  ['18.jpg', 1, 0, 'femenino', 'Lacoste', 'L.12.12 French Panache', 'french panache', 'Chypre', '#a81c28'],
  ['18.jpg', 1, 1, 'femenino', 'Lacoste', 'L.12.12 Sparkling', 'sparkling', 'Gourmand', '#e0a8b4'],
  ['18.jpg', 1, 2, 'femenino', 'Lacoste', 'L.12.12 Magnetic Pour Elle', 'magnetic', 'Floral', '#8e247c'],
  ['18.jpg', 2, 0, 'femenino', 'Coach', 'Coach Floral', 'coach floral', 'Floral', '#e2b8b4'],
  ['18.jpg', 2, 1, 'femenino', 'Coach', 'Coach Floral Blush', 'coach floral blush', 'Floral', '#dc8e98'],
  ['18.jpg', 2, 2, 'femenino', 'Lancôme', 'Trésor', 'tresor', 'Oriental', '#c98842'],
  ['18.jpg', 3, 0, 'femenino', 'Lancôme', 'Miracle', 'miracle', 'Floral', '#d48ea4'],
  ['18.jpg', 3, 1, 'femenino', 'Lancôme', 'La Vie Est Belle', 'la vie est belle', 'Gourmand', '#dfa698'],
  ['18.jpg', 3, 2, 'femenino', 'Lancôme', 'La Vie Est Belle Rose Extraordinaire', 'la vie est belle rose', 'Floral', '#d8768c'],

  ['19.jpg', 0, 0, 'femenino', 'Montblanc', 'Lady Emblem', 'lady emblem', 'Chypre', '#d8b4a8'],
  ['19.jpg', 0, 1, 'femenino', 'Montblanc', 'Signature', 'signature', 'Oriental', '#e4dfd6'],
  ['19.jpg', 0, 2, 'femenino', 'Montblanc', "Présence d'une Femme", 'presence', 'Oriental', '#d4c8b4'],
  ['19.jpg', 1, 0, 'femenino', 'Moschino', 'Fresh Couture', 'fresh couture', 'Floral', '#2c96d8'],
  ['19.jpg', 1, 1, 'femenino', 'Moschino', 'Pink Fresh Couture', 'pink fresh couture', 'Floral', '#dc6a9c'],
  ['19.jpg', 1, 2, 'femenino', 'Moschino', 'Gold Fresh Couture', 'gold fresh couture', 'Floral', '#cfa438'],
  ['19.jpg', 2, 0, 'femenino', 'Moschino', 'Toy 2', 'toy 2', 'Floral', '#e0cf76'],
  ['19.jpg', 2, 1, 'femenino', 'Moschino', 'Funny!', 'funny', 'Cítrico', '#88c4dc'],
  ['19.jpg', 2, 2, 'femenino', 'Moschino', 'Toy 2 Bubble Gum', 'toy 2 bubble gum', 'Gourmand', '#dc7ca8'],
  ['19.jpg', 3, 0, 'femenino', 'Moschino', 'Toy 2 Pearl', 'toy 2 pearl', 'Fresco', '#7ca0c8'],
  ['19.jpg', 3, 1, 'femenino', 'Paco Rabanne', 'Pure XS for Her', 'pure xs for her', 'Oriental', '#c46c78'],
  ['19.jpg', 3, 2, 'femenino', 'Paco Rabanne', 'Lady Million', 'lady million', 'Floral', '#d4a63a'],

  ['20.jpg', 0, 0, 'femenino', 'Paco Rabanne', 'Lady Million Lucky', 'lady million lucky', 'Floral', '#cfc8bc'],
  ['20.jpg', 0, 1, 'femenino', 'Paco Rabanne', 'Olympéa', 'olympea', 'Oriental', '#d49664'],
  ['20.jpg', 0, 2, 'femenino', 'Paco Rabanne', 'Olympéa Legend', 'olympea legend', 'Oriental', '#c96c60'],
  ['20.jpg', 1, 0, 'femenino', 'Paco Rabanne', 'Fame', 'fame', 'Floral', '#cfa444'],
  ['20.jpg', 1, 1, 'femenino', 'Salvatore Ferragamo', 'Signorina Misteriosa', 'signorina misteriosa', 'Oriental', '#221c22'],
  ['20.jpg', 1, 2, 'femenino', 'Paris Hilton', 'Dazzle', 'dazzle', 'Floral', '#dc90aa'],
  ['20.jpg', 2, 0, 'femenino', 'Paris Hilton', 'Can Can', 'can can', 'Gourmand', '#d8c2aa'],
  ['20.jpg', 2, 1, 'femenino', 'Paris Hilton', 'Paris Hilton for Women', 'paris hilton', 'Floral', '#d44878'],
  ['20.jpg', 2, 2, 'femenino', 'Perry Ellis', '360° for Women', '360', 'Floral', '#dcd48a'],
  ['20.jpg', 3, 0, 'femenino', 'Perry Ellis', '360° Red for Women', '360 red', 'Floral', '#b81c28'],
  ['20.jpg', 3, 1, 'femenino', 'Tommy Hilfiger', 'Tommy Girl', 'tommy girl', 'Floral', '#d4d8b8'],

  ['21.jpg', 0, 0, 'femenino', 'Lattafa', 'Give Me Gourmand Cookie Crave', 'cookie crave', 'Gourmand', '#784830'],
  ['21.jpg', 0, 1, 'femenino', 'Lattafa', 'Give Me Gourmand Whipped Pleasure', 'whipped pleasure', 'Gourmand', '#d8a654'],
  ['21.jpg', 0, 2, 'femenino', 'Lattafa', 'Give Me Gourmand Vanilla Freak', 'vanilla freak', 'Gourmand', '#68b4a8'],
  ['21.jpg', 1, 0, 'femenino', 'Lattafa', 'Give Me Gourmand Mallow Madness', 'mallow madness', 'Gourmand', '#b488cc'],
  ['21.jpg', 1, 1, 'femenino', 'Lattafa', 'Give Me Gourmand Berry On Top', 'berry on top', 'Gourmand', '#d44468'],
  ['21.jpg', 1, 2, 'femenino', 'Lattafa', 'Give Me Gourmand Choco Overdose', 'choco overdose', 'Gourmand', '#6e3a20'],
];

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Auto-localiza la frontera interior de cada tarjeta (evitando bordes dorados/lilas)
function detectInnerBox(rawData, imgW, imgH, approxX, approxY, isDarkTemplate) {
  const isBorder = (x, y) => {
    const i = (y * imgW + x) * 4;
    const r = rawData[i], g = rawData[i + 1], b = rawData[i + 2];
    if (isDarkTemplate) {
      // Borde dorado del template caballero
      return r > 175 && g > 135 && b < 120 && (r - b) > 55;
    }
    // Borde lila del template dama
    return r > 185 && g > 135 && b > 185 && Math.abs(r - b) < 40 && (r - g) > 10;
  };

  // Centro aproximado de la tarjeta
  const cx = approxX + 144;
  const cy = approxY + 135;

  // Buscar borde superior subiendo desde cy
  let top = approxY + 12;
  for (let y = cy - 60; y >= Math.max(0, approxY - 40); y--) {
    let hits = 0;
    for (let dx = -45; dx <= 45; dx += 5) if (isBorder(cx + dx, y)) hits++;
    if (hits >= 10) {
      // Bajar hasta salir del grosor del borde
      let innerY = y;
      while (innerY < cy && isBorder(cx, innerY)) innerY++;
      top = innerY + 6;
      break;
    }
  }

  // Buscar borde inferior (encima de la píldora de texto)
  let bottom = top + 236;
  for (let y = cy + 60; y <= Math.min(imgH - 1, approxY + 310); y++) {
    let hits = 0;
    for (let dx = -55; dx <= 55; dx += 5) if (isBorder(cx + dx, y)) hits++;
    if (hits >= 14) {
      bottom = y - 6;
      break;
    }
  }

  // Buscar borde izquierdo
  let left = approxX + 12;
  for (let x = cx - 80; x >= Math.max(0, approxX - 35); x--) {
    let hits = 0;
    for (let dy = -45; dy <= 45; dy += 5) if (isBorder(x, cy + dy)) hits++;
    if (hits >= 10) {
      let innerX = x;
      while (innerX < cx && isBorder(innerX, cy)) innerX++;
      left = innerX + 3;
      break;
    }
  }

  // Buscar borde derecho
  let right = left + 262;
  for (let x = cx + 80; x <= Math.min(imgW - 1, approxX + 325); x++) {
    let hits = 0;
    for (let dy = -45; dy <= 45; dy += 5) if (isBorder(x, cy + dy)) hits++;
    if (hits >= 10) {
      let innerX = x;
      while (innerX > cx && isBorder(innerX, cy)) innerX--;
      right = innerX - 3;
      break;
    }
  }

  const w = Math.max(180, Math.min(276, right - left));
  const h = Math.max(180, Math.min(256, bottom - top));
  return { left, top, width: w, height: h };
}

async function extractCellPng(rawData, imgW, imgH, box, isDarkTemplate, outPath) {
  const { left, top, width: w, height: h } = box;
  const buf = Buffer.alloc(w * h * 4);

  for (let y = 0; y < h; y++) {
    const srcStart = ((top + y) * imgW + left) * 4;
    rawData.copy(buf, y * w * 4, srcStart, srcStart + w * 4);
  }

  // Enmascarar las 4 esquinas redondeadas internas (radio ~58px) para quitar cualquier punta del marco
  const rCorner = 58;
  const isOutsideCorner = (x, y) => {
    const cx = x < rCorner ? rCorner : x > w - 1 - rCorner ? w - 1 - rCorner : x;
    const cy = y < rCorner ? rCorner : y > h - 1 - rCorner ? h - 1 - rCorner : y;
    const dx = x - cx;
    const dy = y - cy;
    return dx * dx + dy * dy > rCorner * rCorner;
  };

  const isBgPixel = (idx, nearEdge) => {
    const r = buf[idx], g = buf[idx + 1], b = buf[idx + 2];
    const maxC = Math.max(r, g, b);
    const minC = Math.min(r, g, b);
    // Blanco / gris claro de estudio
    if (r > 232 && g > 232 && b > 232 && (maxC - minC) < 22) return true;
    if (nearEdge) {
      // Cualquier residuo del marco dorado o lila en los bordes exteriores
      if (isDarkTemplate && r > 165 && g > 125 && b < 130 && (r - b) > 45) return true;
      if (!isDarkTemplate && r > 180 && g > 130 && b > 180 && Math.abs(r - b) < 42 && (r - g) > 8) return true;
    }
    return false;
  };

  const visited = new Uint8Array(w * h);
  const queue = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const idx = p * 4;
      if (isOutsideCorner(x, y)) {
        buf[idx + 3] = 0;
        visited[p] = 1;
        queue.push(p);
      } else if (x <= 3 || x >= w - 4 || y <= 3 || y >= h - 4) {
        if (isBgPixel(idx, true)) {
          buf[idx + 3] = 0;
          visited[p] = 1;
          queue.push(p);
        }
      }
    }
  }

  let head = 0;
  while (head < queue.length) {
    const p = queue[head++];
    const x = p % w;
    const y = (p - x) / w;
    const nearEdge = x < 16 || x > w - 17 || y < 16 || y > h - 17;
    const neighbors = [
      x > 0 ? p - 1 : -1,
      x < w - 1 ? p + 1 : -1,
      y > 0 ? p - w : -1,
      y < h - 1 ? p + w : -1,
    ];
    for (const np of neighbors) {
      if (np < 0 || visited[np]) continue;
      const nidx = np * 4;
      if (isBgPixel(nidx, nearEdge)) {
        visited[np] = 1;
        buf[nidx + 3] = 0;
        queue.push(np);
      }
    }
  }

  // Suavizado ligero de borde (1px anti-aliasing sobre halos blancos)
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const p = y * w + x;
      const idx = p * 4;
      if (buf[idx + 3] === 0) continue;
      const r = buf[idx], g = buf[idx + 1], b = buf[idx + 2];
      if (r > 218 && g > 218 && b > 218) {
        let trans = 0;
        if (buf[(p - 1) * 4 + 3] === 0) trans++;
        if (buf[(p + 1) * 4 + 3] === 0) trans++;
        if (buf[(p - w) * 4 + 3] === 0) trans++;
        if (buf[(p + w) * 4 + 3] === 0) trans++;
        if (trans >= 2) buf[idx + 3] = 90;
      }
    }
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  try {
    await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
      .trim({ threshold: 12 })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
  } catch {
    await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
  }
}

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findParfumoMatch(parfumoList, brand, name, hint) {
  const bNorm = norm(brand);
  const nNorm = norm(hint || name);
  const fullNorm = norm(name);

  let best = null;
  let bestScore = -1;

  for (const p of parfumoList) {
    const pb = norm(p.brand);
    const pn = norm(p.name);

    const brandMatch = pb === bNorm || pb.includes(bNorm) || bNorm.includes(pb);
    if (!brandMatch) continue;

    let score = 0;
    if (pn === fullNorm || pn === nNorm) score += 100;
    else if (pn.includes(nNorm)) score += 60 - Math.min(25, Math.abs(pn.length - nNorm.length));
    else if (nNorm.includes(pn) && pn.length >= 4) score += 40;
    else continue;

    if (p.notes && p.notes.length >= 6) score += 12;
    if (p.reviews > 0) score += Math.min(15, Math.log10(p.reviews + 1) * 5);

    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

const DEFAULT_NOTES_BY_FAMILY = {
  Gourmand: [
    { name: 'Vainilla', intensity: 92, category: 'fondo' },
    { name: 'Caramelo', intensity: 84, category: 'corazon' },
    { name: 'Bergamota', intensity: 76, category: 'salida' },
    { name: 'Ámbar', intensity: 82, category: 'fondo' },
  ],
  Floral: [
    { name: 'Bergamota', intensity: 82, category: 'salida' },
    { name: 'Rosa', intensity: 90, category: 'corazon' },
    { name: 'Jazmín', intensity: 85, category: 'corazon' },
    { name: 'Almizcle blanco', intensity: 78, category: 'fondo' },
  ],
  Oriental: [
    { name: 'Azafrán', intensity: 84, category: 'salida' },
    { name: 'Ámbar', intensity: 92, category: 'corazon' },
    { name: 'Oud', intensity: 88, category: 'fondo' },
    { name: 'Vainilla', intensity: 82, category: 'fondo' },
  ],
  Amaderado: [
    { name: 'Bergamota', intensity: 80, category: 'salida' },
    { name: 'Cedro', intensity: 88, category: 'corazon' },
    { name: 'Vetiver', intensity: 86, category: 'fondo' },
    { name: 'Sándalo', intensity: 84, category: 'fondo' },
  ],
  Fresco: [
    { name: 'Limón', intensity: 88, category: 'salida' },
    { name: 'Lavanda', intensity: 82, category: 'corazon' },
    { name: 'Ambroxan', intensity: 86, category: 'fondo' },
  ],
  Cítrico: [
    { name: 'Bergamota', intensity: 92, category: 'salida' },
    { name: 'Mandarina', intensity: 85, category: 'salida' },
    { name: 'Neroli', intensity: 80, category: 'corazon' },
    { name: 'Almizcle', intensity: 74, category: 'fondo' },
  ],
  Acuático: [
    { name: 'Notas marinas', intensity: 92, category: 'salida' },
    { name: 'Bergamota', intensity: 84, category: 'salida' },
    { name: 'Romero', intensity: 78, category: 'corazon' },
    { name: 'Incienso', intensity: 80, category: 'fondo' },
  ],
  Especiado: [
    { name: 'Pimienta negra', intensity: 88, category: 'salida' },
    { name: 'Cardamomo', intensity: 84, category: 'corazon' },
    { name: 'Ámbar', intensity: 86, category: 'fondo' },
  ],
  Cuero: [
    { name: 'Nuez moscada', intensity: 82, category: 'salida' },
    { name: 'Violeta', intensity: 80, category: 'corazon' },
    { name: 'Cuero', intensity: 92, category: 'fondo' },
  ],
};

function lightenHex(hex) {
  const clean = hex.replace('#', '');
  const r = Math.min(255, parseInt(clean.slice(0, 2), 16) + 45);
  const g = Math.min(255, parseInt(clean.slice(2, 4), 16) + 45);
  const b = Math.min(255, parseInt(clean.slice(4, 6), 16) + 45);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function hexToGlow(hex) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},0.48)`;
}

(async () => {
  console.log('Cargando catálogo Parfumo para enriquecimiento olfativo...');
  const parfumoRaw = JSON.parse(fs.readFileSync(PARFUMO_PATH, 'utf8'));
  const parfumoList = parfumoRaw.perfumes || [];

  const approxCols = [157, 558, 968];
  const approxRows = [181, 624, 1065, 1506];

  // Agrupar items por archivo para decodificar cada JPG solo una vez
  const byFile = {};
  for (const item of CATALOG_ITEMS) {
    const file = item[0];
    if (!byFile[file]) byFile[file] = [];
    byFile[file].push(item);
  }

  const results = [];
  let matchedCount = 0;
  const usedIds = new Set();

  for (const [fileName, items] of Object.entries(byFile)) {
    const srcPath = path.join(SRC_DIR, fileName);
    const { data: rawData, info } = await sharp(srcPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

    for (const [, row, col, gender, brand, name, hint, famFallback, hexFallback] of items) {
      const isDarkTemplate = gender === 'masculino';
      const folder = isDarkTemplate ? 'caballero' : 'dama';
      let slug = slugify(`${brand}-${name}`);
      if (usedIds.has(slug)) slug = `${slug}-${folder}`;
      usedIds.add(slug);

      const outImgPath = path.join(OUT_IMG_DIR, folder, `${slug}.png`);
      const box = detectInnerBox(rawData, info.width, info.height, approxCols[col], approxRows[row], isDarkTemplate);
      await extractCellPng(rawData, info.width, info.height, box, isDarkTemplate, outImgPath);

      const match = findParfumoMatch(parfumoList, brand, name, hint);
      if (match) matchedCount++;

      const family = match?.family || famFallback || (isDarkTemplate ? 'Amaderado' : 'Floral');
      const baseColor = hexFallback || match?.liquidColor || '#b88e34';
      const altColor = lightenHex(baseColor);

      const notes =
        match && match.notes && match.notes.length > 0
          ? match.notes
          : DEFAULT_NOTES_BY_FAMILY[famFallback] || DEFAULT_NOTES_BY_FAMILY.Oriental;

      const accords =
        match && match.accords && match.accords.length > 0
          ? match.accords
          : [
              { name: family, percentage: 100, color: baseColor },
              { name: isDarkTemplate ? 'Amaderado' : 'Floral', percentage: 78, color: '#b88e34' },
            ];

      results.push({
        id: slug,
        name,
        brand,
        year: match?.year || null,
        description:
          match?.description ||
          `${name} de ${brand}. Fragancia importada disponible en SR Essences para ${
            gender === 'femenino' ? 'dama' : 'caballero'
          }.`,
        shortDesc:
          match?.shortDesc ||
          notes
            .slice(0, 3)
            .map((n) => n.name)
            .join(' · '),
        family,
        subfamilies: [],
        gender,
        concentration: match?.concentration || 'EDP',
        liquidColor: baseColor,
        liquidColorAlt: altColor,
        glowColor: hexToGlow(baseColor),
        accentColor: baseColor,
        marbleVariant: isDarkTemplate ? 'obsidian' : 'bronze',
        notes,
        accords,
        price: 0,
        priceML: 100,
        sizes: [50, 100],
        rating: match?.rating || 4.5,
        reviews: match?.reviews || 0,
        tags: match?.tags?.length ? match.tags : [family.toLowerCase(), gender],
        featured: ['Aventus', 'Sauvage', 'Bleu de Chanel', '1 Million', 'Khamrah', 'Good Girl', 'La Vie Est Belle', 'Cloud', 'Coco Mademoiselle', 'Miss Dior', 'Scandal', 'Olympéa'].includes(name),
        newArrival: (match?.year || 0) >= 2023 || name.includes('Give Me Gourmand') || name.includes('Aqua Dubai'),
        bestseller: ['Aventus', 'Sauvage', 'Bleu de Chanel', 'Acqua di Giò Profumo', 'Eros', '1 Million', 'Invictus', 'Good Girl', 'La Vie Est Belle', 'Cloud', 'Coco Mademoiselle', '212 VIP Rosé'].includes(name),
        perfumers: match?.perfumers || [],
        parfumoUrl: match?.parfumoUrl || '',
        imageUrl: `/images/catalog/${folder}/${slug}.png`,
        available: true,
        season: isDarkTemplate ? ['otoño', 'invierno'] : ['primavera', 'verano'],
        occasion: ['día', 'noche', 'especial'],
        sillage: 4,
        longevity: 4,
      });
    }
  }

  const cabCount = results.filter((r) => r.gender === 'masculino').length;
  const damCount = results.filter((r) => r.gender === 'femenino').length;

  fs.writeFileSync(
    OUT_JSON_PATH,
    JSON.stringify({
      meta: {
        total: results.length,
        caballero: cabCount,
        dama: damCount,
        enrichedFromParfumo: matchedCount,
        generated: new Date().toISOString(),
      },
      perfumes: results,
    }),
    'utf8'
  );

  console.log(`✅ Extraídos ${results.length} frascos (${cabCount} Caballero, ${damCount} Dama)`);
  console.log(`✨ Enriquecidos con pirámide real de Parfumo: ${matchedCount}/${results.length}`);
})();
