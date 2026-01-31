// Popular Virginia Tech and Blacksburg locations for instant filtering
// These are searched instantly before Nominatim API results arrive

export interface QuickLocation {
  id: string;
  name: string;
  keywords: string[]; // Search terms that match this location
  address: string;
  coordinates: [number, number]; // [lng, lat]
}

export const POPULAR_LOCATIONS: QuickLocation[] = [
  // Academic Buildings
  { id: "torgersen", name: "Torgersen Hall", keywords: ["torg", "torgersen", "engineering"], address: "620 Drillfield Drive", coordinates: [-80.4201, 37.2297] },
  { id: "mcbryde", name: "McBryde Hall", keywords: ["mcbryde", "math", "cs", "computer science"], address: "225 Stanger St.", coordinates: [-80.4251, 37.2290] },
  { id: "goodwin", name: "Goodwin Hall", keywords: ["goodwin", "aerospace", "signature"], address: "635 Prices Fork Rd", coordinates: [-80.4204, 37.2310] },
  { id: "norris", name: "Norris Hall", keywords: ["norris"], address: "495 Old Turner St.", coordinates: [-80.4223, 37.2296] },
  { id: "whittemore", name: "Whittemore Hall", keywords: ["whittemore", "ece", "electrical"], address: "1185 Perry St.", coordinates: [-80.4196, 37.2316] },
  { id: "durham", name: "Durham Hall", keywords: ["durham", "civil", "cee"], address: "1145 Perry St.", coordinates: [-80.4188, 37.2318] },
  { id: "newman", name: "Newman Library", keywords: ["newman", "library", "carol"], address: "560 Drillfield Drive", coordinates: [-80.4189, 37.2284] },
  { id: "burruss", name: "Burruss Hall", keywords: ["burruss", "admin"], address: "800 Drillfield Drive", coordinates: [-80.4242, 37.2289] },
  { id: "pamplin", name: "Pamplin Hall", keywords: ["pamplin", "business"], address: "880 West Campus Drive", coordinates: [-80.4268, 37.2280] },
  
  // Student Life
  { id: "squires", name: "Squires Student Center", keywords: ["squires", "student center", "ssc"], address: "290 College Ave.", coordinates: [-80.4175, 37.2296] },
  { id: "glc", name: "Graduate Life Center", keywords: ["glc", "graduate", "grad life"], address: "155 Otey St. NW", coordinates: [-80.4167, 37.2273] },
  
  // Dining
  // Sources: vt.edu building pages / campus services listings
  { id: "owens", name: "Owens Dining Hall", keywords: ["owens", "dining", "food court"], address: "150 Kent St.", coordinates: [-80.4161, 37.2252] },
  { id: "d2", name: "Dietrick Hall (D2)", keywords: ["d2", "dietrick"], address: "285 Ag Quad Ln.", coordinates: [-80.4237, 37.2248] },
  { id: "westend", name: "West End Market", keywords: ["west end", "wem"], address: "Cochrane Hall, 770 Washington St SW", coordinates: [-80.4257, 37.2269] },
  
  // Residence Halls
  { id: "pritchard", name: "Pritchard Hall", keywords: ["pritchard"], address: "630 Washington St. SW", coordinates: [-80.4200, 37.2242] },
  { id: "aj", name: "Ambler Johnston Hall", keywords: ["ambler", "johnston", "aj"], address: "700 Washington St. SW", coordinates: [-80.4217, 37.2254] },
  { id: "slusher", name: "Slusher Hall", keywords: ["slusher", "tower"], address: "267 Kent St.", coordinates: [-80.4207, 37.2260] },
  { id: "harper", name: "Harper Hall", keywords: ["harper"], address: "240 West Campus Drive", coordinates: [-80.4232, 37.2226] },
  { id: "cochrane", name: "Cochrane Hall", keywords: ["cochrane"], address: "210 West Campus Drive", coordinates: [-80.4245, 37.2232] },
  { id: "newman-res", name: "New Residence Hall East", keywords: ["new res", "nrh", "new hall"], address: "Kent St.", coordinates: [-80.4169, 37.2242] },
  
  // Athletics & Recreation
  { id: "lane", name: "Lane Stadium", keywords: ["lane", "stadium", "football"], address: "285 Beamer Way", coordinates: [-80.4182, 37.2199] },
  { id: "cassell", name: "Cassell Coliseum", keywords: ["cassell", "coliseum", "basketball"], address: "675 Washington St. SW", coordinates: [-80.4172, 37.2208] },
  { id: "mccomas", name: "McComas Hall", keywords: ["mccomas", "rec", "gym"], address: "895 Washington St SW", coordinates: [-80.4136, 37.2227] },
  
  // Landmarks
  { id: "drillfield", name: "Drillfield", keywords: ["drillfield", "drill field"], address: "Drillfield Drive", coordinates: [-80.4219, 37.2281] },
  { id: "war-memorial", name: "War Memorial Chapel", keywords: ["war memorial", "chapel", "memorial"], address: "600 Drillfield Drive", coordinates: [-80.4236, 37.2277] },
  { id: "moss", name: "Moss Arts Center", keywords: ["moss", "arts", "center"], address: "190 Alumni Mall", coordinates: [-80.4149, 37.2308] },
];

/**
 * Instantly filter popular locations by query
 * Returns matches within milliseconds
 */
export function filterPopularLocations(query: string): QuickLocation[] {
  if (!query || query.length < 2) return [];
  
  const q = query.toLowerCase().trim();
  
  return POPULAR_LOCATIONS.filter((loc) => {
    // Check name
    if (loc.name.toLowerCase().includes(q)) return true;
    // Check keywords
    return loc.keywords.some((kw) => kw.includes(q));
  }).slice(0, 5);
}
