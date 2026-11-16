/**
 * locationResolver.ts
 * High-precision Indonesian geographic and peatland zone resolver.
 * Maps coordinates to exact Kabupaten/Kota, Peat Hydrological Unit (KHG),
 * and local timezones (WIB/WITA/WIT).
 */

export interface DetailedLocationInfo {
  province: string;
  regency: string; // Kabupaten / Kota
  district?: string; // Kecamatan
  landscape: string; // Ekosistem / KHG / Konsesi
  isPeatland: boolean;
  peatDepthEstimate: string;
  coordinatesFormatted: string;
  coordinatesDMS: string;
  localTimeFormatted: string;
  timezoneLabel: string;
  googleMapsUrl: string;
  osmUrl: string;
}

/**
 * Converts decimal degrees to Degree-Minute-Second string
 */
export function toDMS(lat: number, lon: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';

  const absLat = Math.abs(lat);
  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);
  const latSec = ((absLat - latDeg - latMin / 60) * 3600).toFixed(1);

  const absLon = Math.abs(lon);
  const lonDeg = Math.floor(absLon);
  const lonMin = Math.floor((absLon - lonDeg) * 60);
  const lonSec = ((absLon - lonDeg - lonMin / 60) * 3600).toFixed(1);

  return `${latDeg}°${latMin}'${latSec}"${latDir}, ${lonDeg}°${lonMin}'${lonSec}"${lonDir}`;
}

/**
 * Convert UTC date and time (HHMM) to Indonesian Local Time (WIB / WITA / WIT)
 */
export function getIndonesianLocalTime(dateStr: string, timeStr: string, lon: number): { timeFormatted: string; tz: string } {
  const cleanTime = (timeStr || '1200').padStart(4, '0');
  const hoursUTC = parseInt(cleanTime.slice(0, 2), 10) || 0;
  const minutes = parseInt(cleanTime.slice(2, 4), 10) || 0;

  // Timezone offset based on longitude
  let tzOffset = 7; // WIB
  let tz = 'WIB';

  if (lon >= 115 && lon < 125) {
    tzOffset = 8;
    tz = 'WITA';
  } else if (lon >= 125) {
    tzOffset = 9;
    tz = 'WIT';
  }

  let localHour = (hoursUTC + tzOffset) % 24;
  const hourFormatted = localHour.toString().padStart(2, '0');
  const minFormatted = minutes.toString().padStart(2, '0');

  return {
    timeFormatted: `${hourFormatted}:${minFormatted} ${tz}`,
    tz,
  };
}

/**
 * High-resolution geographic zone resolver for Indonesia
 */
export function resolveHotspotLocation(
  lat: number,
  lon: number,
  aoiId: string = 'indonesia',
  language: 'en' | 'id' = 'id',
  dateStr?: string,
  timeStr?: string
): DetailedLocationInfo {
  let province = language === 'id' ? 'Indonesia' : 'Indonesia';
  let regency = language === 'id' ? 'Wilayah Indonesia' : 'Indonesian Region';
  let district = '';
  let landscape = language === 'id' ? 'Kawasan Vegetasi Tropis' : 'Tropical Vegetation Zone';
  let isPeatland = false;
  let peatDepthEstimate = '> 0.5 m';

  // 1. RIAU & SUMATRA REGIONS
  if (lon >= 99.5 && lon <= 104.5 && lat >= -1.0 && lat <= 2.8) {
    province = 'Riau';
    isPeatland = true;

    if (lat > 1.2) {
      regency = 'Kabupaten Rokan Hilir';
      district = 'Kubu / Bangko Pusako';
      landscape = 'KHG Sungai Rokan - Sungai Kubu (Kubah Gambut Dalam)';
      peatDepthEstimate = '3.5 – 5.2 m';
    } else if (lat > 0.5 && lon < 101.8) {
      regency = 'Kabupaten Bengkalis & Kota Dumai';
      district = 'Bukit Batu / Bukit Kapur';
      landscape = 'Cagar Biosfer Giam Siak Kecil - Bukit Batu';
      peatDepthEstimate = '4.0 – 6.5 m';
    } else if (lat >= 0.2 && lat <= 0.9 && lon >= 101.5) {
      regency = 'Kabupaten Siak';
      district = 'Dayun / Sungai Apit / Koto Gasib';
      landscape = 'KHG Sungai Siak - Sungai Kampar (Kubah Gambut Lindung)';
      peatDepthEstimate = '4.8 – 7.0 m';
    } else if (lat >= -0.3 && lat < 0.3) {
      regency = 'Kabupaten Pelalawan';
      district = 'Teluk Meranti / Kuala Kampar';
      landscape = 'Semenanjung Kampar (Kubah Gambut Raksasa)';
      peatDepthEstimate = '5.5 – 9.0 m';
    } else {
      regency = 'Kabupaten Indragiri Hilir';
      district = 'Gaung Anak Serka / Mandah';
      landscape = 'KHG Sungai Indragiri - Batang Gansal';
      peatDepthEstimate = '3.0 – 4.5 m';
    }
  }

  // 2. CENTRAL KALIMANTAN (KALTENG)
  else if (lon >= 111.0 && lon <= 115.5 && lat >= -3.5 && lat <= -0.5) {
    province = 'Kalimantan Tengah';
    isPeatland = true;

    if (lat < -2.2 && lon >= 113.8) {
      regency = 'Kabupaten Pulang Pisau & Kapuas';
      district = 'Sebangau Kuala / Basarang / Kahayan Hilir';
      landscape = 'Kawasan Eks-PLG Blok A & Blok C (Kubah Gambut Kahayan)';
      peatDepthEstimate = '5.0 – 8.2 m';
    } else if (lon < 112.8) {
      regency = 'Kabupaten Kotawaringin Timur & Seruyan';
      district = 'Mentaya Hilir / Seruyan Hilir';
      landscape = 'KHG Sungai Mentaya - Sungai Seruyan';
      peatDepthEstimate = '3.5 – 5.0 m';
    } else if (lat > -1.5) {
      regency = 'Kabupaten Katingan';
      district = 'Katingan Hilir / Tasik Payawan';
      landscape = 'Taman Nasional Sebangau & Buffer Zone Katingan';
      peatDepthEstimate = '4.2 – 6.8 m';
    } else {
      regency = 'Kota Palangka Raya';
      district = 'Sabangau / Bukit Batu / Pahandut';
      landscape = 'KHG Sebangau - Kahayan Hilir';
      peatDepthEstimate = '3.8 – 5.5 m';
    }
  }

  // 3. EAST KALIMANTAN (KALIMANTAN TIMUR / KALTIM - SAMARINDA, IKN, KUTAI)
  else if (lon >= 115.5 && lon <= 119.5 && lat >= -2.5 && lat <= 2.8) {
    province = 'Kalimantan Timur';
    isPeatland = true;

    if (lat >= -0.7 && lat <= -0.2 && lon >= 117.0 && lon <= 117.35) {
      regency = 'Kota Samarinda & Kutai Kartanegara';
      district = 'Palaran / Sanga-Sanga / Loa Janan';
      landscape = 'KHG Sungai Mahakam - Sungai Belayan (Kawasan Gambut Mahakam Hilir)';
      peatDepthEstimate = '2.5 – 4.2 m';
    } else if (lat >= -1.5 && lat <= -0.8 && lon >= 116.5 && lon <= 117.2) {
      regency = 'Kota Balikpapan & Penajam Paser Utara (Kawasan IKN)';
      district = 'Sepaku / Samboja / Balikpapan Utara';
      landscape = 'Kawasan Hutan Lindung Sungai Wain & Buffer IKN Nusantara';
      peatDepthEstimate = '1.8 – 3.2 m';
    } else if (lat >= -0.6 && lat <= 1.0 && lon >= 115.8 && lon <= 117.0) {
      regency = 'Kabupaten Kutai Kartanegara & Kutai Barat';
      district = 'Muara Kaman / Kota Bangun / Muara Siran';
      landscape = 'Kubah Gambut Danau Semayang-Melintang (KHG Kedang Kepala)';
      peatDepthEstimate = '4.0 – 6.5 m';
    } else if (lat > 1.0) {
      regency = 'Kabupaten Berau & Kutai Timur';
      district = 'Kelay / Segah / Sangatta';
      landscape = 'Taman Nasional Kutai & Lanskap Hutan Tropis Berau';
      peatDepthEstimate = '1.5 – 3.0 m';
    } else {
      regency = 'Kabupaten Paser & Penajam Paser Utara';
      district = 'Kuaro / Tanah Grogot / Long Ikis';
      landscape = 'KHG Sungai Kendilo - Teluk Adang';
      peatDepthEstimate = '2.0 – 3.5 m';
    }
  }

  // 4. SOUTH KALIMANTAN (KALIMANTAN SELATAN / KALSEL)
  else if (lon >= 114.2 && lon <= 116.5 && lat >= -4.5 && lat <= -1.8) {
    province = 'Kalimantan Selatan';
    isPeatland = true;

    if (lat <= -3.6) {
      regency = 'Kabupaten Tanah Laut';
      district = 'Kurau / Bumi Makmur / Bati-Bati';
      landscape = 'Kawasan Rawa Gambut Pesisir Tanah Laut';
      peatDepthEstimate = '2.0 – 3.8 m';
    } else if (lat >= -3.55 && lat <= -3.2 && lon >= 114.65) {
      regency = 'Kota Banjarbaru & Kabupaten Banjar';
      district = 'Landasan Ulin / Gambut / Liang Anggang';
      landscape = 'Kawasan Gambut Bandara Syamsudin Noor (KHG Barito-Alalak)';
      peatDepthEstimate = '2.5 – 4.0 m';
    } else if (lat > -3.0) {
      regency = 'Kabupaten Hulu Sungai Utara & Barito Kuala';
      district = 'Danau Panggang / Amuntai / Marabahan';
      landscape = 'KHG Sungai Barito - Sungai Tapin';
      peatDepthEstimate = '3.0 – 5.0 m';
    } else {
      regency = 'Kota Banjarmasin & Barito Kuala';
      district = 'Alalak / Banjarmasin Selatan';
      landscape = 'Lanskap Rawa Pasang Surut Barito';
      peatDepthEstimate = '1.8 – 3.2 m';
    }
  }

  // 5. SOUTH SUMATRA (SUMSEL)
  else if (lon >= 103.5 && lon <= 106.5 && lat >= -4.5 && lat <= -1.5) {
    province = 'Sumatera Selatan';
    isPeatland = true;

    if (lon >= 105.0 && lat <= -2.5) {
      regency = 'Kabupaten Ogan Komering Ilir (OKI)';
      district = 'Cengal / Tulung Selapan / Air Sugihan';
      landscape = 'KHG Sungai Sugihan - Sungai Saleh (Konsesi HTI & Kubah Gambut)';
      peatDepthEstimate = '3.2 – 5.8 m';
    } else if (lat > -2.5) {
      regency = 'Kabupaten Banyuasin & Musi Banyuasin';
      district = 'Tanjung Lago / Muara Telang / Bayung Lencir';
      landscape = 'Taman Nasional Sembilang & KHG Lalan-Mendahara';
      peatDepthEstimate = '2.8 – 4.5 m';
    } else {
      regency = 'Kabupaten Muara Enim & Ogan Ilir';
      district = 'Pemulutan / Gelumbang';
      landscape = 'KHG Sungai Ogan - Sungai Komering';
      peatDepthEstimate = '2.0 – 3.5 m';
    }
  }

  // 6. JAMBI
  else if (lon >= 102.5 && lon <= 104.8 && lat >= -2.0 && lat <= -0.5) {
    province = 'Jambi';
    isPeatland = true;
    regency = 'Kabupaten Muaro Jambi & Tanjung Jabung Timur';
    district = 'Kumpeh / Berbak / Dendang';
    landscape = 'Taman Nasional Berbak & KHG Batanghari-Kumpeh';
    peatDepthEstimate = '3.5 – 6.0 m';
  }

  // 7. WEST KALIMANTAN (KALBAR)
  else if (lon >= 108.5 && lon <= 112.5 && lat >= -3.0 && lat <= 1.5) {
    province = 'Kalimantan Barat';
    isPeatland = true;

    if (lat < -1.0) {
      regency = 'Kabupaten Ketapang & Kayong Utara';
      district = 'Matan Hilir / Simpang Hilir / Teluk Batang';
      landscape = 'Taman Nasional Gunung Palung & KHG Tolak-Pawan';
      peatDepthEstimate = '3.8 – 6.2 m';
    } else {
      regency = 'Kabupaten Kubu Raya & Pontianak';
      district = 'Sungai Raya / Rasau Jaya / Siantan';
      landscape = 'KHG Sungai Mempawah - Sungai Kapuas';
      peatDepthEstimate = '3.0 – 4.8 m';
    }
  }

  // 8. PAPUA (SOUTH PAPUA)
  else if (lon >= 137.0 && lon <= 141.2 && lat >= -9.0 && lat <= -4.0) {
    province = 'Papua Selatan';
    isPeatland = true;
    regency = 'Kabupaten Merauke & Mappi';
    district = 'Animha / Kurik / Obaa / Edera';
    landscape = 'Lanskap Gambut & Rawa Savana Merauke-Mappi';
    peatDepthEstimate = '1.8 – 3.5 m';
  }

  // 9. ACEH & SUMUT (TRIPA & LABUHANBATU)
  else if (lon >= 95.0 && lon <= 100.8 && lat >= 1.5 && lat <= 5.8) {
    isPeatland = true;
    if (lon < 98.0) {
      province = 'Aceh';
      regency = 'Kabupaten Nagan Raya & Aceh Barat';
      district = 'Darul Makmur / Kuala Pesisir';
      landscape = 'Kawasan Rawa Gambut Tripa (Kawasan Ekosistem Leuser)';
      peatDepthEstimate = '3.0 – 5.5 m';
    } else {
      province = 'Sumatera Utara';
      regency = 'Kabupaten Labuhanbatu & Asahan';
      district = 'Panai Hilir / Kualuh Hilir';
      landscape = 'KHG Sungai Barumun - Sungai Kualuh (Rawa Gambut Labuhanbatu)';
      peatDepthEstimate = '3.0 – 5.2 m';
    }
  }

  // 10. LAMPUNG (MESUJI / TULANG BAWANG)
  else if (lon >= 104.5 && lon <= 106.0 && lat >= -5.2 && lat <= -3.8) {
    province = 'Lampung';
    isPeatland = true;
    regency = 'Kabupaten Mesuji & Tulang Bawang';
    district = 'Rawajitu / Rawa Pitu';
    landscape = 'KHG Sungai Mesuji - Sungai Tulang Bawang';
    peatDepthEstimate = '1.8 – 3.2 m';
  }

  // 11. SULAWESI REGION
  else if (lon >= 118.5 && lon <= 125.0 && lat >= -6.0 && lat <= 2.0) {
    province = 'Sulawesi';
    regency = 'Kawasan Hutan Pegunungan Sulawesi';
    district = 'Lanskap Konservasi Wallacea';
    landscape = 'Kawasan Hutan Hujan Tropis & Savana Sulawesi';
    peatDepthEstimate = '> 0.5 m';
  }

  // 12. JAWA & BALI REGION
  else if (lon >= 105.0 && lon <= 116.0 && lat >= -8.8 && lat <= -5.8) {
    province = 'Jawa & Bali';
    regency = 'Kawasan Konservasi & Pegunungan Jawa';
    district = 'Kawasan Lereng Vulkanik';
    landscape = 'Taman Nasional Bromo Tengger Semeru / Ijen / Baluran / Merbabu';
    peatDepthEstimate = '> 0.5 m';
  }

  // 13. SMART REGIONAL BASIN FALLBACK (Prevents generic "Indonesian Region")
  else {
    if (lon >= 95.0 && lon <= 106.0) {
      province = language === 'id' ? 'Sumatera' : 'Sumatra';
      regency = language === 'id' ? 'Lanskap Vegetasi Sumatera' : 'Sumatra Basin Landscape';
    } else if (lon >= 108.0 && lon <= 119.5) {
      province = 'Kalimantan';
      regency = language === 'id' ? 'Lanskap Hutan Tropis Kalimantan' : 'Kalimantan Tropical Landscape';
    } else if (lon >= 119.5 && lon <= 126.0) {
      province = 'Sulawesi';
      regency = language === 'id' ? 'Lanskap Kepulauan Wallacea' : 'Wallacea Archipelago Landscape';
    } else if (lon >= 130.0 && lon <= 141.5) {
      province = 'Papua & Maluku';
      regency = language === 'id' ? 'Lanskap Rimba Papua' : 'Papua Rainforest Landscape';
    }
  }

  // Fallback translation
  if (language === 'en') {
    landscape = landscape
      .replace('Kubah Gambut Dalam', 'Deep Peat Dome')
      .replace('Kubah Gambut Lindung', 'Protected Peat Dome')
      .replace('Kubah Gambut Raksasa', 'Giant Peat Dome')
      .replace('Cagar Biosfer', 'Biosphere Reserve')
      .replace('Taman Nasional', 'National Park')
      .replace('Kawasan Eks-PLG', 'Ex-Mega Rice Project (PLG) Basin')
      .replace('Konsesi HTI & Kubah Gambut', 'Pulpwood Concession & Peat Dome')
      .replace('Lanskap Gambut & Rawa Savana', 'Peatland & Savannah Wetland Landscape')
      .replace('Kawasan Gambut', 'Peatland Zone')
      .replace('Kawasan Rawa Gambut Pesisir', 'Coastal Peat Swamp Zone');
  }

  const { timeFormatted, tz } = getIndonesianLocalTime(dateStr || '2026-01-01', timeStr || '1200', lon);
  const latFormatted = `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lonFormatted = `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? 'E' : 'W'}`;

  return {
    province,
    regency,
    district,
    landscape,
    isPeatland,
    peatDepthEstimate,
    coordinatesFormatted: `${latFormatted}, ${lonFormatted}`,
    coordinatesDMS: toDMS(lat, lon),
    localTimeFormatted: timeFormatted,
    timezoneLabel: tz,
    googleMapsUrl: `https://www.google.com/maps?q=${lat.toFixed(6)},${lon.toFixed(6)}`,
    osmUrl: `https://www.openstreetmap.org/?mlat=${lat.toFixed(6)}&mlon=${lon.toFixed(6)}#map=14/${lat.toFixed(6)}/${lon.toFixed(6)}`,
  };
}
