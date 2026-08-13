export interface SwissMunicipality {
  plz: string;
  name: string;
  canton: string;
  lat?: number;
  lng?: number;
}

export const SWISS_MUNICIPALITIES: SwissMunicipality[] = [
  // Zürich (ZH)
  { plz: '8000', name: 'Zürich', canton: 'ZH', lat: 47.3769, lng: 8.5417 },
  { plz: '8001', name: 'Zürich (City / Altstadt)', canton: 'ZH', lat: 47.3712, lng: 8.5422 },
  { plz: '8002', name: 'Zürich (Enge)', canton: 'ZH', lat: 47.3615, lng: 8.5320 },
  { plz: '8003', name: 'Zürich (Wiedikon)', canton: 'ZH', lat: 47.3701, lng: 8.5175 },
  { plz: '8004', name: 'Zürich (Aussersihl)', canton: 'ZH', lat: 47.3780, lng: 8.5260 },
  { plz: '8005', name: 'Zürich (Industriequartier / West)', canton: 'ZH', lat: 47.3880, lng: 8.5200 },
  { plz: '8006', name: 'Zürich (Oberstrass)', canton: 'ZH', lat: 47.3850, lng: 8.5480 },
  { plz: '8008', name: 'Zürich (Seefeld)', canton: 'ZH', lat: 47.3580, lng: 8.5520 },
  { plz: '8032', name: 'Zürich (Hottingen)', canton: 'ZH', lat: 47.3690, lng: 8.5600 },
  { plz: '8037', name: 'Zürich (Unterstrass)', canton: 'ZH', lat: 47.3920, lng: 8.5350 },
  { plz: '8038', name: 'Zürich (Wollishofen)', canton: 'ZH', lat: 47.3450, lng: 8.5310 },
  { plz: '8044', name: 'Gockhausen / Zürich', canton: 'ZH', lat: 47.3800, lng: 8.5900 },
  { plz: '8045', name: 'Zürich (Giesshübel)', canton: 'ZH', lat: 47.3570, lng: 8.5180 },
  { plz: '8046', name: 'Zürich (Affoltern)', canton: 'ZH', lat: 47.4200, lng: 8.5080 },
  { plz: '8047', name: 'Zürich (Albisrieden)', canton: 'ZH', lat: 47.3720, lng: 8.4890 },
  { plz: '8048', name: 'Zürich (Altstetten)', canton: 'ZH', lat: 47.3890, lng: 8.4850 },
  { plz: '8049', name: 'Zürich (Höngg)', canton: 'ZH', lat: 47.4010, lng: 8.4980 },
  { plz: '8050', name: 'Zürich (Oerlikon)', canton: 'ZH', lat: 47.4110, lng: 8.5440 },
  { plz: '8051', name: 'Zürich (Schwamendingen)', canton: 'ZH', lat: 47.4040, lng: 8.5720 },
  { plz: '8052', name: 'Zürich (Seebach)', canton: 'ZH', lat: 47.4250, lng: 8.5470 },
  { plz: '8053', name: 'Zürich (Witikon)', canton: 'ZH', lat: 47.3590, lng: 8.5850 },
  { plz: '8055', name: 'Zürich (Friesenberg)', canton: 'ZH', lat: 47.3620, lng: 8.5020 },
  { plz: '8057', name: 'Zürich (Milchbuck)', canton: 'ZH', lat: 47.3980, lng: 8.5450 },
  { plz: '8400', name: 'Winterthur', canton: 'ZH', lat: 47.4988, lng: 8.7237 },
  { plz: '8404', name: 'Winterthur (Stadel)', canton: 'ZH' },
  { plz: '8405', name: 'Winterthur (Seen)', canton: 'ZH' },
  { plz: '8406', name: 'Winterthur (Töss)', canton: 'ZH' },
  { plz: '8600', name: 'Dübendorf', canton: 'ZH', lat: 47.3981, lng: 8.6186 },
  { plz: '8610', name: 'Uster', canton: 'ZH', lat: 47.3486, lng: 8.7188 },
  { plz: '8620', name: 'Wetzikon', canton: 'ZH', lat: 47.3236, lng: 8.7981 },
  { plz: '8630', name: 'Rüti', canton: 'ZH' },
  { plz: '8700', name: 'Küsnacht', canton: 'ZH' },
  { plz: '8702', name: 'Zollikon', canton: 'ZH' },
  { plz: '8706', name: 'Meilen', canton: 'ZH' },
  { plz: '8708', name: 'Männedorf', canton: 'ZH' },
  { plz: '8640', name: 'Rapperswil-Jona', canton: 'SG', lat: 47.2267, lng: 8.8184 },
  { plz: '8810', name: 'Horgen', canton: 'ZH' },
  { plz: '8820', name: 'Wädenswil', canton: 'ZH' },
  { plz: '8800', name: 'Thalwil', canton: 'ZH' },
  { plz: '8802', name: 'Kilchberg', canton: 'ZH' },
  { plz: '8803', name: 'Rüschlikon', canton: 'ZH' },
  { plz: '8805', name: 'Richterswil', canton: 'ZH' },
  { plz: '8304', name: 'Wallisellen', canton: 'ZH' },
  { plz: '8302', name: 'Kloten', canton: 'ZH' },
  { plz: '8305', name: 'Dietlikon', canton: 'ZH' },
  { plz: '8307', name: 'Effretikon', canton: 'ZH' },
  { plz: '8180', name: 'Bülach', canton: 'ZH' },
  { plz: '8152', name: 'Opfikon / Glattbrugg', canton: 'ZH' },
  { plz: '8153', name: 'Rümlang', canton: 'ZH' },
  { plz: '8953', name: 'Dietikon', canton: 'ZH' },
  { plz: '8952', name: 'Schlieren', canton: 'ZH' },
  { plz: '8910', name: 'Affoltern am Albis', canton: 'ZH' },
  { plz: '8105', name: 'Regensdorf', canton: 'ZH' },
  { plz: '8604', name: 'Volketswil', canton: 'ZH' },
  { plz: '8303', name: 'Bassersdorf', canton: 'ZH' },
  { plz: '8108', name: 'Dällikon', canton: 'ZH' },
  { plz: '8107', name: 'Buchs ZH', canton: 'ZH' },
  { plz: '8308', name: 'Illnau-Effretikon', canton: 'ZH' },
  { plz: '8608', name: 'Bubikon', canton: 'ZH' },
  { plz: '8309', name: 'Nürensdorf', canton: 'ZH' },

  // Bern (BE)
  { plz: '3000', name: 'Bern', canton: 'BE', lat: 46.9480, lng: 7.4474 },
  { plz: '3005', name: 'Bern (Kirchenfeld)', canton: 'BE' },
  { plz: '3006', name: 'Bern (Schosshalde)', canton: 'BE' },
  { plz: '3007', name: 'Bern (Weissenbühl)', canton: 'BE' },
  { plz: '3008', name: 'Bern (Bümpliz)', canton: 'BE' },
  { plz: '3011', name: 'Bern (Altstadt)', canton: 'BE' },
  { plz: '3012', name: 'Bern (Länggasse)', canton: 'BE' },
  { plz: '3013', name: 'Bern (Lorraine)', canton: 'BE' },
  { plz: '3014', name: 'Bern (Breitenrain)', canton: 'BE' },
  { plz: '3018', name: 'Bern (Bethlehem)', canton: 'BE' },
  { plz: '3072', name: 'Ostermundigen', canton: 'BE' },
  { plz: '3097', name: 'Liebefeld', canton: 'BE' },
  { plz: '3098', name: 'Köniz', canton: 'BE' },
  { plz: '3052', name: 'Zollikofen', canton: 'BE' },
  { plz: '3063', name: 'Ittigen', canton: 'BE' },
  { plz: '3073', name: 'Gümligen', canton: 'BE' },
  { plz: '3074', name: 'Muri bei Bern', canton: 'BE' },
  { plz: '3600', name: 'Thun', canton: 'BE', lat: 46.7578, lng: 7.6280 },
  { plz: '3604', name: 'Thun (Strättligen)', canton: 'BE' },
  { plz: '3800', name: 'Interlaken', canton: 'BE', lat: 46.6863, lng: 7.8632 },
  { plz: '3818', name: 'Grindelwald', canton: 'BE' },
  { plz: '2500', name: 'Biel / Bienne', canton: 'BE', lat: 47.1368, lng: 7.2468 },
  { plz: '2502', name: 'Biel / Bienne (Zentrum)', canton: 'BE' },
  { plz: '2503', name: 'Biel / Bienne (Mett)', canton: 'BE' },
  { plz: '2504', name: 'Biel / Bienne (Bözingen)', canton: 'BE' },
  { plz: '3400', name: 'Burgdorf', canton: 'BE' },
  { plz: '4900', name: 'Langenthal', canton: 'BE' },
  { plz: '3250', name: 'Lyss', canton: 'BE' },
  { plz: '3700', name: 'Spiez', canton: 'BE' },
  { plz: '3780', name: 'Gstaad', canton: 'BE' },
  { plz: '3053', name: 'Münchenbuchsee', canton: 'BE' },
  { plz: '3065', name: 'Bolligen', canton: 'BE' },
  { plz: '3076', name: 'Worb', canton: 'BE' },
  { plz: '3110', name: 'Münsingen', canton: 'BE' },
  { plz: '3172', name: 'Niederwangen', canton: 'BE' },
  { plz: '3270', name: 'Aarberg', canton: 'BE' },
  { plz: '3806', name: 'Bönigen', canton: 'BE' },

  // Luzern (LU)
  { plz: '6000', name: 'Luzern', canton: 'LU', lat: 47.0502, lng: 8.3093 },
  { plz: '6003', name: 'Luzern (Neustadt)', canton: 'LU' },
  { plz: '6004', name: 'Luzern (Altstadt)', canton: 'LU' },
  { plz: '6005', name: 'Luzern (St. Niklausen)', canton: 'LU' },
  { plz: '6006', name: 'Luzern (Halden)', canton: 'LU' },
  { plz: '6010', name: 'Kriens', canton: 'LU' },
  { plz: '6020', name: 'Emmen / Emmenbrücke', canton: 'LU' },
  { plz: '6030', name: 'Ebikon', canton: 'LU' },
  { plz: '6048', name: 'Horw', canton: 'LU' },
  { plz: '6045', name: 'Meggen', canton: 'LU' },
  { plz: '6033', name: 'Buchrain', canton: 'LU' },
  { plz: '6023', name: 'Rothenburg', canton: 'LU' },
  { plz: '6210', name: 'Sursee', canton: 'LU' },
  { plz: '6130', name: 'Willisau', canton: 'LU' },
  { plz: '6015', name: 'Luzern (Reussbühl)', canton: 'LU' },
  { plz: '6014', name: 'Luzern (Littau)', canton: 'LU' },
  { plz: '6043', name: 'Adligenswil', canton: 'LU' },
  { plz: '6280', name: 'Hochdorf', canton: 'LU' },
  { plz: '6204', name: 'Sempach', canton: 'LU' },
  { plz: '6037', name: 'Root', canton: 'LU' },

  // Uri (UR), Schwyz (SZ), Obwalden (OW), Nidwalden (NW)
  { plz: '6460', name: 'Altdorf', canton: 'UR', lat: 46.8804, lng: 8.6444 },
  { plz: '6490', name: 'Andermatt', canton: 'UR' },
  { plz: '6430', name: 'Schwyz', canton: 'SZ', lat: 47.0207, lng: 8.6530 },
  { plz: '6440', name: 'Brunnen', canton: 'SZ' },
  { plz: '8853', name: 'Lachen', canton: 'SZ' },
  { plz: '8832', name: 'Wollerau', canton: 'SZ' },
  { plz: '8808', name: 'Pfäffikon SZ', canton: 'SZ' },
  { plz: '6403', name: 'Küssnacht am Rigi', canton: 'SZ' },
  { plz: '6060', name: 'Sarnen', canton: 'OW', lat: 46.8961, lng: 8.2464 },
  { plz: '6390', name: 'Engelberg', canton: 'OW' },
  { plz: '6370', name: 'Stans', canton: 'NW', lat: 46.9580, lng: 8.3660 },
  { plz: '6374', name: 'Buochs', canton: 'NW' },
  { plz: '6362', name: 'Stansstad', canton: 'NW' },

  // Glarus (GL), Zug (ZG)
  { plz: '8750', name: 'Glarus', canton: 'GL', lat: 47.0404, lng: 9.0680 },
  { plz: '8752', name: 'Näfels', canton: 'GL' },
  { plz: '6300', name: 'Zug', canton: 'ZG', lat: 47.1662, lng: 8.5155 },
  { plz: '6301', name: 'Zug (Post)', canton: 'ZG' },
  { plz: '6340', name: 'Baar', canton: 'ZG' },
  { plz: '6330', name: 'Cham', canton: 'ZG' },
  { plz: '6331', name: 'Hünenberg', canton: 'ZG' },
  { plz: '6312', name: 'Steinhausen', canton: 'ZG' },
  { plz: '6314', name: 'Unterägeri', canton: 'ZG' },
  { plz: '6315', name: 'Oberägeri', canton: 'ZG' },
  { plz: '6343', name: 'Rotkreuz', canton: 'ZG' },

  // Freiburg / Fribourg (FR), Solothurn (SO)
  { plz: '1700', name: 'Fribourg / Freiburg', canton: 'FR', lat: 46.8065, lng: 7.1620 },
  { plz: '1701', name: 'Fribourg (Zentrum)', canton: 'FR' },
  { plz: '1630', name: 'Bulle', canton: 'FR' },
  { plz: '3280', name: 'Murten / Morat', canton: 'FR' },
  { plz: '4500', name: 'Solothurn', canton: 'SO', lat: 47.2079, lng: 7.5371 },
  { plz: '4600', name: 'Olten', canton: 'SO', lat: 47.3498, lng: 7.9033 },
  { plz: '2540', name: 'Grenchen', canton: 'SO' },

  // Basel-Stadt (BS) & Basel-Landschaft (BL)
  { plz: '4000', name: 'Basel', canton: 'BS', lat: 47.5596, lng: 7.5886 },
  { plz: '4051', name: 'Basel (Grossbasel)', canton: 'BS' },
  { plz: '4052', name: 'Basel (St. Alban)', canton: 'BS' },
  { plz: '4053', name: 'Basel (Gundeldingen)', canton: 'BS' },
  { plz: '4054', name: 'Basel (Bachletten)', canton: 'BS' },
  { plz: '4055', name: 'Basel (Iselin)', canton: 'BS' },
  { plz: '4056', name: 'Basel (St. Johann)', canton: 'BS' },
  { plz: '4057', name: 'Basel (Kleinhüningen / Klybeck)', canton: 'BS' },
  { plz: '4058', name: 'Basel (Wettstein / Hirzbrunnen)', canton: 'BS' },
  { plz: '4125', name: 'Riehen', canton: 'BS' },
  { plz: '4102', name: 'Binningen', canton: 'BL' },
  { plz: '4123', name: 'Allschwil', canton: 'BL' },
  { plz: '4104', name: 'Oberwil', canton: 'BL' },
  { plz: '4132', name: 'Muttenz', canton: 'BL' },
  { plz: '4133', name: 'Pratteln', canton: 'BL' },
  { plz: '4410', name: 'Liestal', canton: 'BL', lat: 47.4842, lng: 7.7335 },
  { plz: '4153', name: 'Reinach', canton: 'BL' },
  { plz: '4142', name: 'Münchenstein', canton: 'BL' },

  // Schaffhausen (SH), Appenzell (AR/AI), St. Gallen (SG)
  { plz: '8200', name: 'Schaffhausen', canton: 'SH', lat: 47.6959, lng: 8.6380 },
  { plz: '8212', name: 'Neuhausen am Rheinfall', canton: 'SH' },
  { plz: '9000', name: 'St. Gallen', canton: 'SG', lat: 47.4245, lng: 9.3767 },
  { plz: '9008', name: 'St. Gallen (Neudorf)', canton: 'SG' },
  { plz: '9010', name: 'St. Gallen (St. Georgen)', canton: 'SG' },
  { plz: '9014', name: 'St. Gallen (Bruggen)', canton: 'SG' },
  { plz: '9015', name: 'St. Gallen (Winkeln)', canton: 'SG' },
  { plz: '9200', name: 'Gossau', canton: 'SG' },
  { plz: '9500', name: 'Wil', canton: 'SG' },
  { plz: '9470', name: 'Buchs', canton: 'SG' },
  { plz: '9100', name: 'Herisau', canton: 'AR', lat: 47.3862, lng: 9.2792 },
  { plz: '9050', name: 'Appenzell', canton: 'AI', lat: 47.3312, lng: 9.4095 },

  // Graubünden (GR)
  { plz: '7000', name: 'Chur', canton: 'GR', lat: 46.8508, lng: 9.5320 },
  { plz: '7270', name: 'Davos Platz', canton: 'GR', lat: 46.7932, lng: 9.8214 },
  { plz: '7260', name: 'Davos Dorf', canton: 'GR' },
  { plz: '7500', name: 'St. Moritz', canton: 'GR', lat: 46.4908, lng: 9.8355 },
  { plz: '7050', name: 'Arosa', canton: 'GR' },
  { plz: '7017', name: 'Flims Dorf', canton: 'GR' },
  { plz: '7018', name: 'Flims Waldhaus', canton: 'GR' },
  { plz: '7031', name: 'Laax', canton: 'GR' },
  { plz: '7310', name: 'Bad Ragaz', canton: 'SG' },

  // Aargau (AG), Thurgau (TG)
  { plz: '5000', name: 'Aarau', canton: 'AG', lat: 47.3925, lng: 8.0442 },
  { plz: '5400', name: 'Baden', canton: 'AG', lat: 47.4735, lng: 8.3080 },
  { plz: '5430', name: 'Wettingen', canton: 'AG' },
  { plz: '5610', name: 'Wohlen', canton: 'AG' },
  { plz: '5034', name: 'Suhr', canton: 'AG' },
  { plz: '4800', name: 'Zofingen', canton: 'AG' },
  { plz: '4310', name: 'Rheinfelden', canton: 'AG' },
  { plz: '8500', name: 'Frauenfeld', canton: 'TG', lat: 47.5583, lng: 8.8986 },
  { plz: '8280', name: 'Kreuzlingen', canton: 'TG', lat: 47.6458, lng: 9.1786 },
  { plz: '8570', name: 'Weinfelden', canton: 'TG' },
  { plz: '8590', name: 'Romanshorn', canton: 'TG' },
  { plz: '9320', name: 'Arbon', canton: 'TG' },

  // Tessin / Ticino (TI)
  { plz: '6900', name: 'Lugano', canton: 'TI', lat: 46.0037, lng: 8.9511 },
  { plz: '6901', name: 'Lugano (Zentrum)', canton: 'TI' },
  { plz: '6500', name: 'Bellinzona', canton: 'TI', lat: 46.1950, lng: 9.0232 },
  { plz: '6600', name: 'Locarno', canton: 'TI', lat: 46.1709, lng: 8.7995 },
  { plz: '6612', name: 'Ascona', canton: 'TI' },
  { plz: '6830', name: 'Chiasso', canton: 'TI' },
  { plz: '6850', name: 'Mendrisio', canton: 'TI' },

  // Waadt / Vaud (VD)
  { plz: '1000', name: 'Lausanne', canton: 'VD', lat: 46.5197, lng: 6.6323 },
  { plz: '1003', name: 'Lausanne (Zentrum)', canton: 'VD' },
  { plz: '1004', name: 'Lausanne (Chailly)', canton: 'VD' },
  { plz: '1006', name: 'Lausanne (Ouchy)', canton: 'VD' },
  { plz: '1007', name: 'Lausanne (Vidy)', canton: 'VD' },
  { plz: '1009', name: 'Pully', canton: 'VD' },
  { plz: '1012', name: 'Lausanne (Sallaz)', canton: 'VD' },
  { plz: '1800', name: 'Vevey', canton: 'VD', lat: 46.4628, lng: 6.8419 },
  { plz: '1820', name: 'Montreux', canton: 'VD', lat: 46.4312, lng: 6.9107 },
  { plz: '1400', name: 'Yverdon-les-Bains', canton: 'VD', lat: 46.7785, lng: 6.6411 },
  { plz: '1260', name: 'Nyon', canton: 'VD' },
  { plz: '1110', name: 'Morges', canton: 'VD' },
  { plz: '1020', name: 'Renens', canton: 'VD' },

  // Wallis / Valais (VS)
  { plz: '1950', name: 'Sion / Sitten', canton: 'VS', lat: 46.2331, lng: 7.3606 },
  { plz: '3960', name: 'Sierre / Siders', canton: 'VS' },
  { plz: '3900', name: 'Brig-Glis', canton: 'VS' },
  { plz: '3930', name: 'Visp', canton: 'VS' },
  { plz: '3920', name: 'Zermatt', canton: 'VS', lat: 46.0207, lng: 7.7491 },
  { plz: '1870', name: 'Monthey', canton: 'VS' },
  { plz: '1936', name: 'Verbier', canton: 'VS' },
  { plz: '3963', name: 'Crans-Montana', canton: 'VS' },
  { plz: '3906', name: 'Saas-Fee', canton: 'VS' },

  // Neuenburg / Neuchâtel (NE) & Jura (JU)
  { plz: '2000', name: 'Neuchâtel / Neuenburg', canton: 'NE', lat: 46.9896, lng: 6.9293 },
  { plz: '2300', name: 'La Chaux-de-Fonds', canton: 'NE' },
  { plz: '2800', name: 'Delémont / Delsberg', canton: 'JU', lat: 47.3650, lng: 7.3450 },
  { plz: '2900', name: 'Porrentruy', canton: 'JU' },

  // Genf / Genève (GE)
  { plz: '1200', name: 'Genève / Genf', canton: 'GE', lat: 46.2044, lng: 6.1432 },
  { plz: '1201', name: 'Genève (Paquis / Gare)', canton: 'GE' },
  { plz: '1202', name: 'Genève (Vermont)', canton: 'GE' },
  { plz: '1204', name: 'Genève (Cité)', canton: 'GE' },
  { plz: '1205', name: 'Genève (Plainpalais)', canton: 'GE' },
  { plz: '1206', name: 'Genève (Champel)', canton: 'GE' },
  { plz: '1207', name: 'Genève (Eaux-Vives)', canton: 'GE' },
  { plz: '1212', name: 'Grand-Lancy', canton: 'GE' },
  { plz: '1213', name: 'Onex', canton: 'GE' },
  { plz: '1217', name: 'Meyrin', canton: 'GE' },
  { plz: '1227', name: 'Carouge', canton: 'GE' },
  { plz: '1228', name: 'Plan-les-Ouates', canton: 'GE' }
];

// Helper to find closest Swiss municipality from lat & lng
export function findClosestSwissMunicipality(lat: number, lng: number): SwissMunicipality {
  let closest = SWISS_MUNICIPALITIES[0];
  let minDistance = Infinity;

  for (const muni of SWISS_MUNICIPALITIES) {
    if (muni.lat && muni.lng) {
      const dLat = (muni.lat - lat) * 111; // approx km
      const dLng = (muni.lng - lng) * 111 * Math.cos(lat * (Math.PI / 180));
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = muni;
      }
    }
  }

  return closest;
}
