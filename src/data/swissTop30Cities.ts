export interface SwissTopCityRegion {
  id: string;
  name: string;
  cityName: string;
  canton: string;
  lat: number;
  lng: number;
  subLocations: string[];
}

export const SWISS_TOP_30_CITIES: SwissTopCityRegion[] = [
  // 1. Zürich (Kanton ZH - Hauptort)
  {
    id: 'zurich',
    name: 'Zürich',
    cityName: 'Zürich',
    canton: 'ZH',
    lat: 47.3769,
    lng: 8.5417,
    subLocations: [
      'Padel Arena Zürich-West, 8005 Zürich',
      'Seeufer Studio Seefeld, 8008 Zürich',
      'Sportanlage Oerlikon, 8050 Zürich',
      'Fitness Loft Altstetten, 8048 Zürich'
    ]
  },
  // 2. Genf (Kanton GE - Hauptort)
  {
    id: 'geneva',
    name: 'Genf (Genève)',
    cityName: 'Genève',
    canton: 'GE',
    lat: 46.2044,
    lng: 6.1432,
    subLocations: [
      'Geneva Tennis Club, 1208 Genève',
      'Parc des Bastions Yoga, 1204 Genève',
      'Crossfit Plainpalais, 1205 Genève',
      'Quai du Mont-Blanc SUP, 1201 Genève'
    ]
  },
  // 3. Basel (Kanton BS - Hauptort)
  {
    id: 'basel',
    name: 'Basel',
    cityName: 'Basel',
    canton: 'BS',
    lat: 47.5596,
    lng: 7.5886,
    subLocations: [
      'TC Basel St. Jakob, 4052 Basel',
      'Rhein Yoga & Outdoor, 4058 Basel',
      'Fitness & Boulderecke Gundeli, 4053 Basel',
      'Sportzentrum St. Johann, 4056 Basel'
    ]
  },
  // 4. Lausanne (Kanton VD - Hauptort)
  {
    id: 'lausanne',
    name: 'Lausanne',
    cityName: 'Lausanne',
    canton: 'VD',
    lat: 46.5197,
    lng: 6.6323,
    subLocations: [
      'Ouchy Waterfront Yoga, 1006 Lausanne',
      'Vidy Sports Center, 1007 Lausanne',
      'Tennis Club Lausanne, 1000 Lausanne',
      'Crossfit Flon, 1003 Lausanne'
    ]
  },
  // 5. Bern (Kanton BE - Hauptort)
  {
    id: 'bern',
    name: 'Bern',
    cityName: 'Bern',
    canton: 'BE',
    lat: 46.9480,
    lng: 7.4474,
    subLocations: [
      'Crossfit Box Aare Lorraine, 3013 Bern',
      'Neufeld Athletikpark, 3012 Bern',
      'Gurten Outdoor Fitness, 3084 Wabern/Bern',
      'Kirchenfeld Tennis, 3005 Bern'
    ]
  },
  // 6. Winterthur (Zusatzstadt ZH)
  {
    id: 'winterthur',
    name: 'Winterthur',
    cityName: 'Winterthur',
    canton: 'ZH',
    lat: 47.4988,
    lng: 8.7237,
    subLocations: [
      'Sportzentrum Deutweg, 8400 Winterthur',
      'Kletterhalle 6a, 8404 Winterthur',
      'Tennisclub Eulach, 8400 Winterthur',
      'Padel Halle Töss, 8406 Winterthur'
    ]
  },
  // 7. Luzern (Kanton LU - Hauptort)
  {
    id: 'luzern',
    name: 'Luzern',
    cityName: 'Luzern',
    canton: 'LU',
    lat: 47.0502,
    lng: 8.3093,
    subLocations: [
      'Oana Wave & Surf, 6030 Ebikon/Luzern',
      'Seeufer Tribschen Yoga, 6005 Luzern',
      'Allmend Sportarena, 6000 Luzern',
      'TC Luzern Lido, 6006 Luzern'
    ]
  },
  // 8. St. Gallen (Kanton SG - Hauptort)
  {
    id: 'stgallen',
    name: 'St. Gallen',
    cityName: 'St. Gallen',
    canton: 'SG',
    lat: 47.4245,
    lng: 9.3767,
    subLocations: [
      'Athletik Zentrum, 9000 St. Gallen',
      'Drei Weieren Outdoor Yoga, 9000 St. Gallen',
      'Crossfit Gallus, 9014 St. Gallen',
      'Tennisclub Lerchenfeld, 9015 St. Gallen'
    ]
  },
  // 9. Bellinzona (Kanton TI - Hauptort)
  {
    id: 'bellinzona',
    name: 'Bellinzona',
    cityName: 'Bellinzona',
    canton: 'TI',
    lat: 46.1950,
    lng: 9.0232,
    subLocations: [
      'Centro Sportivo Bellinzona, 6500 Bellinzona',
      'Castle Outdoor Fitness, 6500 Bellinzona',
      'TC Bellinzona, 6500 Bellinzona'
    ]
  },
  // 10. Freiburg (Fribourg) (Kanton FR - Hauptort)
  {
    id: 'fribourg',
    name: 'Freiburg (Fribourg)',
    cityName: 'Fribourg',
    canton: 'FR',
    lat: 46.8065,
    lng: 7.1620,
    subLocations: [
      'Centre Sportif St-Léonard, 1700 Fribourg',
      'Yoga & Pilates Sarine, 1700 Fribourg',
      'Crossfit Fribourg, 1700 Fribourg',
      'TC Marly, 1723 Marly'
    ]
  },
  // 11. Schaffhausen (Kanton SH - Hauptort)
  {
    id: 'schaffhausen',
    name: 'Schaffhausen',
    cityName: 'Schaffhausen',
    canton: 'SH',
    lat: 47.6959,
    lng: 8.6380,
    subLocations: [
      'KSS Sportarena Schaffhausen, 8200 Schaffhausen',
      'Munot Fitness & Running, 8200 Schaffhausen',
      'TC Dreilinden, 8200 Schaffhausen'
    ]
  },
  // 12. Chur (Kanton GR - Hauptort)
  {
    id: 'chur',
    name: 'Chur',
    cityName: 'Chur',
    canton: 'GR',
    lat: 46.8508,
    lng: 9.5320,
    subLocations: [
      'Obere Au Sportzentrum, 7000 Chur',
      'Crossfit Chur, 7000 Chur',
      'Tennis Club Chur, 7000 Chur'
    ]
  },
  // 13. Neuenburg (Neuchâtel) (Kanton NE - Hauptort)
  {
    id: 'neuchatel',
    name: 'Neuenburg (Neuchâtel)',
    cityName: 'Neuchâtel',
    canton: 'NE',
    lat: 46.9896,
    lng: 6.9293,
    subLocations: [
      'Quai Léopold-Robert SUP, 2000 Neuchâtel',
      'TC Neuchâtel Mail, 2000 Neuchâtel',
      'Crossfit Littoral, 2000 Neuchâtel'
    ]
  },
  // 14. Uster (Zusatzstadt ZH)
  {
    id: 'uster',
    name: 'Uster',
    cityName: 'Uster',
    canton: 'ZH',
    lat: 47.3486,
    lng: 8.7188,
    subLocations: [
      'Sportbad & Halle Buchholz, 8610 Uster',
      'Greifensee SUP & Outdoor Yoga, 8610 Uster',
      'TC Uster, 8610 Uster',
      'Crossfit Züri-Oberland, 8610 Uster'
    ]
  },
  // 15. Sitten (Sion) (Kanton VS - Hauptort)
  {
    id: 'sion',
    name: 'Sitten (Sion)',
    cityName: 'Sion',
    canton: 'VS',
    lat: 46.2331,
    lng: 7.3606,
    subLocations: [
      'Ancien Stand Sports, 1950 Sion',
      'Domaine des Iles SUP & Beach, 1950 Sion',
      'Crossfit Valais, 1950 Sion'
    ]
  },
  // 16. Zug (Kanton ZG - Hauptort)
  {
    id: 'zug',
    name: 'Zug',
    cityName: 'Zug',
    canton: 'ZG',
    lat: 47.1662,
    lng: 8.5155,
    subLocations: [
      'Bossard Arena Outdoor, 6300 Zug',
      'Seeufer Zug SUP & Yoga, 6300 Zug',
      'TC Zug Allmend, 6300 Zug',
      'Crossfit Zug, 6300 Zug'
    ]
  },
  // 17. Frauenfeld (Kanton TG - Hauptort)
  {
    id: 'frauenfeld',
    name: 'Frauenfeld',
    cityName: 'Frauenfeld',
    canton: 'TG',
    lat: 47.5583,
    lng: 8.8986,
    subLocations: [
      'Sportzentrum Kleine Allmend, 8500 Frauenfeld',
      'TC Frauenfeld, 8500 Frauenfeld',
      'Thurgau Fitness Studio, 8500 Frauenfeld'
    ]
  },
  // 18. Aarau (Kanton AG - Hauptort)
  {
    id: 'aarau',
    name: 'Aarau',
    cityName: 'Aarau',
    canton: 'AG',
    lat: 47.3925,
    lng: 8.0444,
    subLocations: [
      'Sportanlage Schachen, 5000 Aarau',
      'TC Aarau, 5000 Aarau',
      'Aare Outdoor Training, 5000 Aarau'
    ]
  },
  // 19. Altdorf (Kanton UR - Hauptort)
  {
    id: 'altdorf',
    name: 'Altdorf',
    cityName: 'Altdorf',
    canton: 'UR',
    lat: 46.8804,
    lng: 8.6444,
    subLocations: [
      'Sportplatz Feld, 6460 Altdorf',
      'TC Altdorf, 6460 Altdorf',
      'Urner Fit Center, 6460 Altdorf'
    ]
  },
  // 20. Appenzell (Kanton AI - Hauptort)
  {
    id: 'appenzell',
    name: 'Appenzell',
    cityName: 'Appenzell',
    canton: 'AI',
    lat: 47.3312,
    lng: 9.4093,
    subLocations: [
      'Sportzentrum Schaies, 9050 Appenzell',
      'TC Appenzell, 9050 Appenzell'
    ]
  },
  // 21. Delsberg (Delémont) (Kanton JU - Hauptort)
  {
    id: 'delemont',
    name: 'Delsberg (Delémont)',
    cityName: 'Delémont',
    canton: 'JU',
    lat: 47.3649,
    lng: 7.3444,
    subLocations: [
      'Centre Sportif Delémont, 2800 Delémont',
      'TC Delémont, 2800 Delémont'
    ]
  },
  // 22. Glarus (Kanton GL - Hauptort)
  {
    id: 'glarus',
    name: 'Glarus',
    cityName: 'Glarus',
    canton: 'GL',
    lat: 47.0406,
    lng: 9.0680,
    subLocations: [
      'Sportzentrum Buchholz, 8750 Glarus',
      'TC Glarus, 8750 Glarus'
    ]
  },
  // 23. Herisau (Kanton AR - Hauptort)
  {
    id: 'herisau',
    name: 'Herisau',
    cityName: 'Herisau',
    canton: 'AR',
    lat: 47.3860,
    lng: 9.2792,
    subLocations: [
      'Sportzentrum Herisau, 9100 Herisau',
      'TC Herisau, 9100 Herisau'
    ]
  },
  // 24. Liestal (Kanton BL - Hauptort)
  {
    id: 'liestal',
    name: 'Liestal',
    cityName: 'Liestal',
    canton: 'BL',
    lat: 47.4842,
    lng: 7.7336,
    subLocations: [
      'Sportanlage Gitterli, 4410 Liestal',
      'TC Liestal, 4410 Liestal'
    ]
  },
  // 25. Sarnen (Kanton OW - Hauptort)
  {
    id: 'sarnen',
    name: 'Sarnen',
    cityName: 'Sarnen',
    canton: 'OW',
    lat: 46.8962,
    lng: 8.2458,
    subLocations: [
      'Sportcamp Sarnen, 6060 Sarnen',
      'Sarnersee SUP & Outdoor, 6060 Sarnen'
    ]
  },
  // 26. Schwyz (Kanton SZ - Hauptort)
  {
    id: 'schwyz',
    name: 'Schwyz',
    cityName: 'Schwyz',
    canton: 'SZ',
    lat: 47.0207,
    lng: 8.6531,
    subLocations: [
      'Wintersried Sportpark, 6430 Schwyz',
      'TC Schwyz, 6430 Schwyz'
    ]
  },
  // 27. Solothurn (Kanton SO - Hauptort)
  {
    id: 'solothurn',
    name: 'Solothurn',
    cityName: 'Solothurn',
    canton: 'SO',
    lat: 47.2088,
    lng: 7.5372,
    subLocations: [
      'CIS Sportzentrum, 4500 Solothurn',
      'Aare Fitness Outdoor, 4500 Solothurn',
      'TC Solothurn, 4500 Solothurn'
    ]
  },
  // 28. Stans (Kanton NW - Hauptort)
  {
    id: 'stans',
    name: 'Stans',
    cityName: 'Stans',
    canton: 'NW',
    lat: 46.9581,
    lng: 8.3662,
    subLocations: [
      'Eichli Sportpark, 6370 Stans',
      'TC Stans, 6370 Stans'
    ]
  }
];
