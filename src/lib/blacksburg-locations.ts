/**
 * Local database of common Blacksburg/Virginia Tech locations
 * for fast prefix matching before falling back to Nominatim
 */

export interface LocalLocation {
  id: string;
  name: string;
  aliases: string[]; // Alternative names/abbreviations
  fullAddress: string;
  coordinates: [number, number]; // [lng, lat]
  category: string;
}

export const BLACKSBURG_LOCATIONS: LocalLocation[] = [
  // Academic Buildings
  {
    id: "local-torgersen",
    name: "Torgersen Hall",
    aliases: ["torg", "torgerson", "engineering"],
    fullAddress: "Torgersen Hall, 620 Drillfield Drive, Blacksburg, VA 24061",
    coordinates: [-80.4195, 37.2295],
    category: "building",
  },
  {
    id: "local-newman",
    name: "Newman Library",
    aliases: ["library", "new man"],
    fullAddress: "Newman Library, 560 Drillfield Drive, Blacksburg, VA 24061",
    coordinates: [-80.4140, 37.2280],
    category: "library",
  },
  {
    id: "local-mcbryde",
    name: "McBryde Hall",
    aliases: ["mcbryde", "math"],
    fullAddress: "McBryde Hall, 225 Stanger Street, Blacksburg, VA 24061",
    coordinates: [-80.4248, 37.2295],
    category: "building",
  },
  {
    id: "local-burruss",
    name: "Burruss Hall",
    aliases: ["burruss", "admin"],
    fullAddress: "Burruss Hall, 800 Drillfield Drive, Blacksburg, VA 24061",
    coordinates: [-80.4175, 37.2290],
    category: "building",
  },
  {
    id: "local-hancock",
    name: "Hancock Hall",
    aliases: ["han", "hanc"],
    fullAddress: "Hancock Hall, 490 Old Turner Street, Blacksburg, VA 24061",
    coordinates: [-80.4243, 37.2302],
    category: "building",
  },
  {
    id: "local-harper",
    name: "Harper Hall",
    aliases: ["harp", "harpe"],
    fullAddress: "Harper Hall, 240 West Campus Drive, Blacksburg, VA 24061",
    coordinates: [-80.4232, 37.2226],
    category: "dormitory",
  },
  {
    id: "local-hahn-north",
    name: "Hahn Hall North",
    aliases: ["hahn", "hah"],
    fullAddress: "Hahn Hall North, 900 West Campus Drive, Blacksburg, VA 24061",
    coordinates: [-80.4261, 37.2284],
    category: "building",
  },
  {
    id: "local-hahn-south",
    name: "Hahn Hall South",
    aliases: ["hahn south"],
    fullAddress: "Hahn Hall South, 800 West Campus Drive, Blacksburg, VA 24061",
    coordinates: [-80.4257, 37.2279],
    category: "building",
  },
  {
    id: "local-hahn-garden",
    name: "Hahn Horticultural Garden",
    aliases: ["hahn garden", "garden", "horticultural"],
    fullAddress: "Hahn Horticultural Garden, 200 Garden Lane, Blacksburg, VA 24061",
    coordinates: [-80.4245, 37.2195],
    category: "garden",
  },
  // Student Centers & Dining
  {
    id: "local-squires",
    name: "Squires Student Center",
    aliases: ["squires", "student center"],
    fullAddress: "Squires Student Center, 290 College Avenue, Blacksburg, VA 24061",
    coordinates: [-80.4130, 37.2280],
    category: "building",
  },
  {
    id: "local-owens",
    name: "Owens Dining Hall",
    aliases: ["owens", "dining"],
    fullAddress: "Owens Dining Hall, 140 Otey Street, Blacksburg, VA 24061",
    coordinates: [-80.4165, 37.2270],
    category: "dining",
  },
  {
    id: "local-deet",
    name: "D2 Dining Center",
    aliases: ["d2", "deet", "dietrick"],
    fullAddress: "Dietrick Dining Center, 340 West Campus Drive, Blacksburg, VA 24061",
    coordinates: [-80.4210, 37.2245],
    category: "dining",
  },
  // Sports
  {
    id: "local-lane-stadium",
    name: "Lane Stadium",
    aliases: ["lane", "stadium", "football"],
    fullAddress: "Lane Stadium, 285 Beamer Way, Blacksburg, VA 24061",
    coordinates: [-80.4180, 37.2200],
    category: "stadium",
  },
  {
    id: "local-cassell",
    name: "Cassell Coliseum",
    aliases: ["cassell", "coliseum", "basketball"],
    fullAddress: "Cassell Coliseum, 675 Washington Street, Blacksburg, VA 24061",
    coordinates: [-80.4185, 37.2220],
    category: "arena",
  },
  {
    id: "local-war-memorial",
    name: "War Memorial Hall",
    aliases: ["war memorial", "gym", "rec"],
    fullAddress: "War Memorial Hall, 370 Alumni Mall, Blacksburg, VA 24061",
    coordinates: [-80.4155, 37.2285],
    category: "gym",
  },
  // Residence Halls
  {
    id: "local-pritchard",
    name: "Pritchard Hall",
    aliases: ["pritch", "pritchard"],
    fullAddress: "Pritchard Hall, 410 Washington Street, Blacksburg, VA 24061",
    coordinates: [-80.4195, 37.2260],
    category: "dormitory",
  },
  {
    id: "local-slusher",
    name: "Slusher Hall",
    aliases: ["slusher", "slush"],
    fullAddress: "Slusher Hall, 300 West Campus Drive, Blacksburg, VA 24061",
    coordinates: [-80.4225, 37.2240],
    category: "dormitory",
  },
  {
    id: "local-ambler-johnston",
    name: "Ambler Johnston Hall",
    aliases: ["aj", "ambler", "johnston"],
    fullAddress: "Ambler Johnston Hall, 630 Washington Street, Blacksburg, VA 24061",
    coordinates: [-80.4175, 37.2235],
    category: "dormitory",
  },
  {
    id: "local-vawter",
    name: "Vawter Hall",
    aliases: ["vawter"],
    fullAddress: "Vawter Hall, 130 Otey Street, Blacksburg, VA 24061",
    coordinates: [-80.4160, 37.2265],
    category: "dormitory",
  },
  {
    id: "local-payne",
    name: "Payne Hall",
    aliases: ["payne"],
    fullAddress: "Payne Hall, 280 West Campus Drive, Blacksburg, VA 24061",
    coordinates: [-80.4218, 37.2248],
    category: "dormitory",
  },
  // Landmarks
  {
    id: "local-drillfield",
    name: "Drillfield",
    aliases: ["drill", "drill field"],
    fullAddress: "Drillfield, Virginia Tech Campus, Blacksburg, VA 24061",
    coordinates: [-80.4150, 37.2290],
    category: "landmark",
  },
  {
    id: "local-duck-pond",
    name: "Duck Pond",
    aliases: ["duck", "pond"],
    fullAddress: "Duck Pond Drive, Blacksburg, VA 24061",
    coordinates: [-80.4280, 37.2230],
    category: "park",
  },
  {
    id: "local-huckleberry",
    name: "Huckleberry Trail",
    aliases: ["huckleberry", "huck", "trail"],
    fullAddress: "Huckleberry Trail, Blacksburg, VA 24060",
    coordinates: [-80.4250, 37.2320],
    category: "trail",
  },
  // Downtown
  {
    id: "local-downtown",
    name: "Downtown Blacksburg",
    aliases: ["downtown", "main street", "town"],
    fullAddress: "Main Street, Downtown Blacksburg, VA 24060",
    coordinates: [-80.4095, 37.2295],
    category: "area",
  },
  // Transit
  {
    id: "local-bus-stop-squires",
    name: "Squires Bus Stop",
    aliases: ["bus stop", "bt", "blacksburg transit"],
    fullAddress: "Squires Student Center Bus Stop, College Avenue, Blacksburg, VA 24061",
    coordinates: [-80.4128, 37.2282],
    category: "transit",
  },
];

/**
 * Search local locations by prefix matching
 */
export function searchLocalLocations(query: string): LocalLocation[] {
  const q = query.toLowerCase().trim();
  if (q.length < 1) return [];
  
  const matches: { location: LocalLocation; score: number }[] = [];
  
  for (const location of BLACKSBURG_LOCATIONS) {
    let score = 0;
    const nameLower = location.name.toLowerCase();
    
    // Exact match on name start
    if (nameLower.startsWith(q)) {
      score = 100 - q.length; // Shorter query = higher score for same match
    }
    // Word match in name
    else if (nameLower.split(" ").some(word => word.startsWith(q))) {
      score = 80 - q.length;
    }
    // Alias match
    else if (location.aliases.some(alias => alias.toLowerCase().startsWith(q))) {
      score = 70 - q.length;
    }
    // Partial match anywhere in name
    else if (nameLower.includes(q)) {
      score = 50 - q.length;
    }
    // Partial match in aliases
    else if (location.aliases.some(alias => alias.toLowerCase().includes(q))) {
      score = 40 - q.length;
    }
    
    if (score > 0) {
      matches.push({ location, score });
    }
  }
  
  // Sort by score descending
  matches.sort((a, b) => b.score - a.score);
  
  return matches.slice(0, 5).map(m => m.location);
}
