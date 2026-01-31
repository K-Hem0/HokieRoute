// Local database of Virginia Tech campus buildings in Blacksburg
// These are not always indexed by Mapbox, so we maintain our own list

export interface CampusBuilding {
  id: string;
  name: string;
  aliases: string[]; // Alternative names people might search
  coordinates: [number, number]; // [lng, lat]
  category: string;
  address: string;
}

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: "torgersen",
    name: "Torgersen Hall",
    aliases: ["Torg", "Torgersen", "Engineering"],
    coordinates: [-80.4192, 37.2296],
    category: "Academic Building",
    address: "620 Drillfield Dr, Blacksburg, VA 24061",
  },
  {
    id: "mcbryde",
    name: "McBryde Hall",
    aliases: ["McBryde", "Math Emporium"],
    coordinates: [-80.4238, 37.2285],
    category: "Academic Building",
    address: "225 Stanger St, Blacksburg, VA 24061",
  },
  {
    id: "goodwin",
    name: "Goodwin Hall",
    aliases: ["Goodwin", "Aerospace"],
    coordinates: [-80.4197, 37.2305],
    category: "Academic Building",
    address: "635 Prices Fork Rd, Blacksburg, VA 24061",
  },
  {
    id: "norris",
    name: "Norris Hall",
    aliases: ["Norris"],
    coordinates: [-80.4203, 37.2291],
    category: "Academic Building",
    address: "495 Old Turner St, Blacksburg, VA 24061",
  },
  {
    id: "whittemore",
    name: "Whittemore Hall",
    aliases: ["Whittemore", "ECE"],
    coordinates: [-80.4187, 37.2311],
    category: "Academic Building",
    address: "1185 Perry St, Blacksburg, VA 24061",
  },
  {
    id: "durham",
    name: "Durham Hall",
    aliases: ["Durham", "Computer Science", "CS Building"],
    coordinates: [-80.4175, 37.2313],
    category: "Academic Building",
    address: "1145 Perry St, Blacksburg, VA 24061",
  },
  {
    id: "newman",
    name: "Newman Library",
    aliases: ["Library", "Newman", "Main Library"],
    coordinates: [-80.4188, 37.2285],
    category: "Library",
    address: "560 Drillfield Dr, Blacksburg, VA 24061",
  },
  {
    id: "squires",
    name: "Squires Student Center",
    aliases: ["Squires", "Student Center", "SSC"],
    coordinates: [-80.4179, 37.2292],
    category: "Student Center",
    address: "290 College Ave, Blacksburg, VA 24061",
  },
  {
    id: "burruss",
    name: "Burruss Hall",
    aliases: ["Burruss", "Admin Building"],
    coordinates: [-80.4228, 37.2292],
    category: "Academic Building",
    address: "800 Drillfield Dr, Blacksburg, VA 24061",
  },
  {
    id: "drillfield",
    name: "Drillfield",
    aliases: ["Drill Field", "The Drillfield"],
    coordinates: [-80.4219, 37.2281],
    category: "Landmark",
    address: "Drillfield Dr, Blacksburg, VA 24061",
  },
  {
    id: "war-memorial",
    name: "War Memorial Chapel",
    aliases: ["War Memorial", "Chapel", "Memorial Chapel"],
    coordinates: [-80.4236, 37.2277],
    category: "Landmark",
    address: "600 Drillfield Dr, Blacksburg, VA 24061",
  },
  {
    id: "lane-stadium",
    name: "Lane Stadium",
    aliases: ["Lane", "Stadium", "Football Stadium"],
    coordinates: [-80.4182, 37.2199],
    category: "Athletics",
    address: "285 Beamer Way, Blacksburg, VA 24061",
  },
  {
    id: "cassell",
    name: "Cassell Coliseum",
    aliases: ["Cassell", "Coliseum", "Basketball Arena"],
    coordinates: [-80.4172, 37.2208],
    category: "Athletics",
    address: "675 Washington St SW, Blacksburg, VA 24061",
  },
  {
    id: "moss-arts",
    name: "Moss Arts Center",
    aliases: ["Moss", "Arts Center", "MAC"],
    coordinates: [-80.4149, 37.2308],
    category: "Arts",
    address: "190 Alumni Mall, Blacksburg, VA 24061",
  },
  {
    id: "owens",
    name: "Owens Dining Hall",
    aliases: ["Owens", "Dining Hall", "Owens Food Court"],
    coordinates: [-80.4161, 37.2252],
    category: "Dining",
    address: "100 Kent St, Blacksburg, VA 24061",
  },
  {
    id: "d2",
    name: "Dietrick Hall (D2)",
    aliases: ["D2", "Dietrick", "Dietrick Dining"],
    coordinates: [-80.4237, 37.2248],
    category: "Dining",
    address: "135 Kent St, Blacksburg, VA 24061",
  },
  {
    id: "west-end",
    name: "West End Market",
    aliases: ["West End", "WEM"],
    coordinates: [-80.4257, 37.2269],
    category: "Dining",
    address: "155 Turner St, Blacksburg, VA 24061",
  },
  {
    id: "hokie-grill",
    name: "Hokie Grill",
    aliases: ["Hokie Grill", "Food Court"],
    coordinates: [-80.4178, 37.2290],
    category: "Dining",
    address: "Squires Student Center, Blacksburg, VA 24061",
  },
  {
    id: "mccomas",
    name: "McComas Hall",
    aliases: ["McComas", "Rec Center", "Gym"],
    coordinates: [-80.4136, 37.2227],
    category: "Recreation",
    address: "595 Washington St SW, Blacksburg, VA 24061",
  },
  {
    id: "rec-sports",
    name: "War Memorial Gym",
    aliases: ["War Memorial Gym", "WMG"],
    coordinates: [-80.4222, 37.2268],
    category: "Recreation",
    address: "380 Washington St SW, Blacksburg, VA 24061",
  },
  {
    id: "ambler-johnston",
    name: "Ambler Johnston Hall",
    aliases: ["AJ", "Ambler Johnston"],
    coordinates: [-80.4217, 37.2254],
    category: "Residence Hall",
    address: "220 Kent St, Blacksburg, VA 24061",
  },
  {
    id: "pritchard",
    name: "Pritchard Hall",
    aliases: ["Pritchard"],
    coordinates: [-80.4253, 37.2260],
    category: "Residence Hall",
    address: "140 Ag Quad Ln, Blacksburg, VA 24061",
  },
  {
    id: "slusher",
    name: "Slusher Hall",
    aliases: ["Slusher Tower", "Slusher"],
    coordinates: [-80.4207, 37.2260],
    category: "Residence Hall",
    address: "267 Kent St, Blacksburg, VA 24061",
  },
  {
    id: "pamplin",
    name: "Pamplin Hall",
    aliases: ["Pamplin", "Business School"],
    coordinates: [-80.4254, 37.2295],
    category: "Academic Building",
    address: "880 West Campus Dr, Blacksburg, VA 24061",
  },
  {
    id: "randolph",
    name: "Randolph Hall",
    aliases: ["Randolph"],
    coordinates: [-80.4210, 37.2296],
    category: "Academic Building",
    address: "460 Old Turner St, Blacksburg, VA 24061",
  },
  {
    id: "hancock",
    name: "Hancock Hall",
    aliases: ["Hancock"],
    coordinates: [-80.4198, 37.2282],
    category: "Academic Building",
    address: "503 Drillfield Dr, Blacksburg, VA 24061",
  },
  {
    id: "holden",
    name: "Holden Hall",
    aliases: ["Holden"],
    coordinates: [-80.4211, 37.2275],
    category: "Academic Building",
    address: "445 Old Turner St, Blacksburg, VA 24061",
  },
  {
    id: "patton",
    name: "Patton Hall",
    aliases: ["Patton", "CEE"],
    coordinates: [-80.4226, 37.2298],
    category: "Academic Building",
    address: "750 Drillfield Dr, Blacksburg, VA 24061",
  },
  {
    id: "graduate-life",
    name: "Graduate Life Center",
    aliases: ["GLC", "Graduate Life"],
    coordinates: [-80.4172, 37.2271],
    category: "Student Center",
    address: "155 Otey St NW, Blacksburg, VA 24061",
  },
  {
    id: "surge-building",
    name: "Surge Building",
    aliases: ["Surge", "SURGE"],
    coordinates: [-80.4259, 37.2318],
    category: "Academic Building",
    address: "1770 Forecast Dr, Blacksburg, VA 24061",
  },
];

/**
 * Search campus buildings by query string
 * Matches against name and aliases (case-insensitive)
 */
export function searchCampusBuildings(query: string): CampusBuilding[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return CAMPUS_BUILDINGS.filter((building) => {
    // Check name
    if (building.name.toLowerCase().includes(normalizedQuery)) return true;
    
    // Check aliases
    return building.aliases.some((alias) =>
      alias.toLowerCase().includes(normalizedQuery)
    );
  }).slice(0, 5); // Limit to 5 results
}
