const PRODUCTS_CATALOG_VERSION = 5;

const makeFamily = (title, basePrice, description, imagePool, optionSets = []) => ({
  title,
  basePrice,
  description,
  imagePool,
  optionSets,
});

const makeAccessoryBadge = (label, colorA, colorB) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${colorA}" />
          <stop offset="100%" stop-color="${colorB}" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" rx="48" fill="url(#bg)" />
      <circle cx="640" cy="110" r="88" fill="rgba(255,255,255,0.16)" />
      <circle cx="160" cy="490" r="120" fill="rgba(255,255,255,0.10)" />
      <rect x="120" y="140" width="560" height="300" rx="40" fill="rgba(255,255,255,0.26)" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="54" font-weight="700" fill="#10213d">
        ${label}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const lightingImages = [
  'https://www.tronic.co.ke/cdn/shop/files/LE_0722-DL_75x75_crop_center.jpg?v=1756396790',
  'https://www.tronic.co.ke/cdn/shop/files/WEBSITEPICTURES_74_75x75_crop_center.png?v=1756397544',
  'https://www.tronic.co.ke/cdn/shop/files/LE-3022-DL_75x75_crop_center.jpg?v=1756397907',
  'https://www.tronic.co.ke/cdn/shop/files/WEBSITEPICTURES_39_75x75_crop_center.png?v=1756397899',
];

const switchesImages = [
  'https://www.tronic.co.ke/cdn/shop/files/TD5100-GY_75x75_crop_center.jpg?v=1756397318',
  'https://www.tronic.co.ke/cdn/shop/files/TD5112-BK_1_75x75_crop_center.jpg?v=1756397571',
  'https://www.tronic.co.ke/cdn/shop/files/TD5112-GY_bba9c1e7-c9a2-4808-ac0b-8598ad8875bf_75x75_crop_center.jpg?v=1756397589',
  'https://www.tronic.co.ke/cdn/shop/files/TP5112-WP_75x75_crop_center.jpg?v=1756398465',
  'https://www.tronic.co.ke/cdn/shop/files/5_b52069d2-062a-4f95-b20c-a816f9a3e631_75x75_crop_center.png?v=1770793228',
  'https://www.tronic.co.ke/cdn/shop/files/17_5e41eb81-3730-41ab-82d0-9a2957aea053_75x75_crop_center.png?v=1756398878',
];

const adaptorsImages = [
  'https://www.tronic.co.ke/cdn/shop/files/ordinary3gang_75x75_crop_center.jpg?v=1756398917',
  'https://www.tronic.co.ke/cdn/shop/files/usb3gang_75x75_crop_center.jpg?v=1756396512',
  'https://www.tronic.co.ke/cdn/shop/files/TR-7864-UBC_75x75_crop_center.jpg?v=1756396760',
  'https://www.tronic.co.ke/cdn/shop/files/TRK7864-BK_75x75_crop_center.jpg?v=1756399001',
  'https://www.tronic.co.ke/cdn/shop/files/EC7694-BS_1_75x75_crop_center.jpg?v=1756396358',
  'https://www.tronic.co.ke/cdn/shop/files/EC7674-BS_1_75x75_crop_center.jpg?v=1754857686',
  'https://www.tronic.co.ke/cdn/shop/files/EC7204_75x75_crop_center.jpg?v=1756396151',
  'https://www.tronic.co.ke/cdn/shop/files/EC7304_75x75_crop_center.jpg?v=1756396159',
];

const protectionImages = [
  'https://www.tronic.co.ke/cdn/shop/files/TD-5145-BK_75x75_crop_center.jpg?v=1754857522',
  'https://www.tronic.co.ke/cdn/shop/products/EM-DT25_75x75_crop_center.jpg?v=1756398879',
  'https://www.tronic.co.ke/cdn/shop/files/MC-1010-6K_75x75_crop_center.jpg?v=1756397276',
  'https://www.tronic.co.ke/cdn/shop/files/MC-1025-6K_75x75_crop_center.jpg?v=1756397465',
  'https://www.tronic.co.ke/cdn/shop/files/MC-1040-6K_75x75_crop_center.jpg?v=1756397379',
  'https://www.tronic.co.ke/cdn/shop/files/VP-HG13-BS_75x75_crop_center.jpg?v=1756396778',
];

const accessoriesImages = [
  'https://www.tronic.co.ke/cdn/shop/products/IT02BK_2476795c-6585-4d6b-8d43-f40c06ee8549_75x75_crop_center.jpg?v=1756396877',
  makeAccessoryBadge('Accessories', '#e8f3ff', '#cfe5ff'),
  makeAccessoryBadge('Cable Care', '#ecfdf5', '#d1fae5'),
  makeAccessoryBadge('Fixings', '#fff7ed', '#fde68a'),
];

const categoryPlans = [
  {
    category: 'Lighting',
    families: [
      makeFamily('LED Bulb', 145, 'Energy-saving bulbs for daily lighting.', lightingImages, [
        ['7W', '9W', '12W', '18W', '24W', '30W'],
        ['B22', 'E27'],
        ['Warm White', 'Cool White', 'Daylight', 'Dimmable', 'Sensor'],
      ]),
      makeFamily('Panel Light', 820, 'Slim ceiling panels for bright modern interiors.', lightingImages, [
        ['12W', '18W', '24W', '36W'],
        ['Round', 'Square'],
        ['Slim', 'Smart', 'Dimmable'],
      ]),
      makeFamily('Flood Light', 1450, 'Outdoor flood lights for yards, signage, and security.', lightingImages, [
        ['20W', '30W', '50W', '100W'],
        ['IP65', 'IP66'],
        ['Warm White', 'Cool White', 'Daylight'],
      ]),
      makeFamily('Ceiling Light', 990, 'Decorative ceiling lights for lounges and hallways.', lightingImages, [
        ['Round', 'Square', 'Oval'],
        ['LED', 'Crystal', 'Flush Mount'],
        ['White', 'Gold', 'Chrome'],
      ]),
      makeFamily('Downlight', 670, 'Recessed downlights for clean architectural finishes.', lightingImages, [
        ['5W', '7W', '9W', '12W'],
        ['Round', 'Square'],
        ['Warm White', 'Cool White', 'Daylight'],
      ]),
      makeFamily('Tube Light', 540, 'Linear lighting for kitchens, offices, and workshops.', lightingImages, [
        ['18W', '20W', '36W', '40W'],
        ['2ft', '4ft', '5ft'],
        ['Smart', 'Standard', 'Flicker-Free'],
      ]),
      makeFamily('Sensor Light', 1450, 'Motion-sensing lights for convenience and energy savings.', lightingImages, [
        ['7W', '9W', '12W'],
        ['PIR', 'Microwave'],
        ['B22', 'E27'],
      ]),
      makeFamily('Emergency Light', 2100, 'Backup lights for safer power interruptions.', lightingImages, [
        ['6W', '10W', '15W'],
        ['Rechargeable', 'Battery Backup'],
        ['Wall Mount', 'Portable'],
      ]),
    ],
  },
  {
    category: 'Switches & Sockets',
    families: [
      makeFamily('1 Gang Switch', 220, 'Single-point wall switches for everyday control.', switchesImages, [
        ['1 Way', '2 Way'],
        ['Grey', 'Black', 'White'],
        ['Screwless', 'Neon', 'Standard'],
      ]),
      makeFamily('2 Gang Switch', 340, 'Two-gang switches for more flexible lighting control.', switchesImages, [
        ['1 Way', '2 Way'],
        ['Grey', 'Black', 'White'],
        ['Screwless', 'Neon', 'Standard'],
      ]),
      makeFamily('Socket Outlet', 750, 'Reliable wall sockets for home and office power.', switchesImages, [
        ['13A', '16A'],
        ['1 Gang', '2 Gang'],
        ['Single Pole', 'Neon Indicator', 'USB Ready'],
      ]),
      makeFamily('Waterproof Switch', 1120, 'IP-rated switchgear for kitchens and outdoor spaces.', switchesImages, [
        ['1 Gang', '2 Gang'],
        ['IP66', 'Weatherproof'],
        ['Grey', 'Black'],
      ]),
      makeFamily('Blanking Plate', 195, 'Neat screwless blanking plates for unused openings.', switchesImages, [
        ['1 Gang', '2 Gang'],
        ['Grey', 'Black', 'White'],
        ['Screwless', 'Metal Finish'],
      ]),
      makeFamily('Dimmer Switch', 880, 'Smooth light control for lounges and feature rooms.', switchesImages, [
        ['LED', 'Incandescent'],
        ['Rotary', 'Touch'],
        ['Grey', 'Black', 'White'],
      ]),
      makeFamily('USB Socket', 1280, 'Wall sockets with built-in charging ports.', switchesImages, [
        ['13A', '16A'],
        ['USB-A', 'USB-C', 'USB-A + USB-C'],
        ['Grey', 'Black', 'White'],
      ]),
      makeFamily('Floor Socket', 1650, 'Flush floor-mounted sockets for boardrooms and living spaces.', switchesImages, [
        ['1 Gang', '2 Gang'],
        ['Brass', 'Grey'],
        ['Screw Lid', 'Pop-Up'],
      ]),
    ],
  },
  {
    category: 'Adaptors & Extensions',
    families: [
      makeFamily('3-Gang Adaptor', 1320, 'Flexible multi-socket power control.', adaptorsImages, [
        ['13A', '16A'],
        ['Switches', 'USB', 'USB-C'],
        ['2M', '3M', '5M'],
      ]),
      makeFamily('4-Way Extension', 1545, 'Power strip extensions for desks and study areas.', adaptorsImages, [
        ['13A', '16A'],
        ['Neon', 'Master Switch', 'Individual Switches'],
        ['2M', '3M', '5M'],
      ]),
      makeFamily('5-Way Power Strip', 1975, 'High-capacity strips for mixed devices.', adaptorsImages, [
        ['13A', '16A'],
        ['Master Switch', 'Safety Shutters', 'Neon'],
        ['2M', '3M', '5M'],
      ]),
      makeFamily('6-Way Extension', 2100, 'Six-way extension sockets for larger setups.', adaptorsImages, [
        ['13A', '16A'],
        ['Master Switch', 'USB-C', 'Neon'],
        ['2M', '3M', '5M'],
      ]),
      makeFamily('USB Charging Hub', 1915, 'Charging hubs with USB and Type-C support.', adaptorsImages, [
        ['2-Port', '4-Port', '6-Port'],
        ['USB-A', 'USB-C', 'USB-A + USB-C'],
        ['Desk', 'Wall Mount'],
      ]),
      makeFamily('Travel Adapter', 950, 'Compact plug adapters for travel and quick use.', adaptorsImages, [
        ['UK', 'EU', 'US', 'Universal'],
        ['Single', 'Foldable', 'Compact'],
        ['Black', 'White'],
      ]),
      makeFamily('Desk Power Hub', 2250, 'Desktop hubs for charging and organized workspaces.', adaptorsImages, [
        ['3-Way', '4-Way', '5-Way'],
        ['USB-A', 'USB-C', 'Wireless Ready'],
        ['2M', '3M'],
      ]),
      makeFamily('Surge Extension', 2840, 'Protected extensions for sensitive electronics.', adaptorsImages, [
        ['4-Way', '5-Way', '6-Way'],
        ['Surge Protected', 'Master Switch'],
        ['2M', '3M', '5M'],
      ]),
    ],
  },
  {
    category: 'Protection Devices',
    families: [
      makeFamily('MCB', 175, 'Circuit breakers for dependable overcurrent protection.', protectionImages, [
        ['6A', '10A', '16A', '20A', '25A', '32A', '40A'],
        ['1 Pole', '2 Pole', '3 Pole'],
        ['Curve B', 'Curve C', 'Curve D'],
      ]),
      makeFamily('RCCB', 980, 'Residual current protection for safer installations.', protectionImages, [
        ['25A', '40A', '63A'],
        ['30mA', '100mA', '300mA'],
        ['2 Pole', '4 Pole'],
      ]),
      makeFamily('RCBO', 1450, 'Combined breaker and earth leakage protection.', protectionImages, [
        ['6A', '10A', '16A', '20A', '32A'],
        ['30mA', '100mA'],
        ['1P+N', '2 Pole'],
      ]),
      makeFamily('Voltage Protector', 1050, 'Protection against unstable supply and surges.', protectionImages, [
        ['13A', '16A'],
        ['Fridge', 'TV', 'General Use'],
        ['Auto Reset', 'Delay Start'],
      ]),
      makeFamily('Timer Switch', 1400, 'Programmable timers for energy control.', protectionImages, [
        ['Digital', 'Analogue'],
        ['25A', '40A'],
        ['Daily', 'Weekly'],
      ]),
      makeFamily('Surge Protector', 1280, 'Protection for devices that need extra safety.', protectionImages, [
        ['6-Way', '8-Way'],
        ['USB Ready', 'Master Switch'],
        ['Wall Mount', 'Desk'],
      ]),
      makeFamily('DP Switch', 750, 'Double pole switching for heavy-duty circuits.', protectionImages, [
        ['32A', '45A', '60A'],
        ['With Neon', 'Without Neon'],
        ['Black', 'Grey'],
      ]),
      makeFamily('Distribution Box', 2450, 'Compact distribution boards for organized wiring.', protectionImages, [
        ['4 Way', '6 Way', '8 Way', '12 Way'],
        ['Surface Mount', 'Flush Mount'],
        ['Metal', 'Plastic'],
      ]),
    ],
  },
  {
    category: 'Accessories',
    families: [
      makeFamily('Insulation Tape', 150, 'Durable tape for cable finishing and repairs.', accessoriesImages, [
        ['20 Yard', '30 Yard', '50 Yard'],
        ['Black', 'Red', 'Blue', 'Green'],
        ['Standard', 'Heavy Duty', 'Pro'],
      ]),
      makeFamily('Cable Tie', 65, 'Neat cable management for bundles and panels.', accessoriesImages, [
        ['100mm', '150mm', '200mm', '300mm'],
        ['Black', 'White', 'UV Resistant'],
        ['Pack of 25', 'Pack of 50', 'Pack of 100'],
      ]),
      makeFamily('Junction Box', 180, 'Safe enclosure for joins and termination points.', accessoriesImages, [
        ['2 Way', '4 Way', '6 Way'],
        ['Round', 'Square', 'Rectangular'],
        ['Indoor', 'Weatherproof'],
      ]),
      makeFamily('Cable Clip', 95, 'Cable clips for tidy wall and ceiling installs.', accessoriesImages, [
        ['6mm', '8mm', '10mm', '12mm'],
        ['Round', 'Flat'],
        ['Pack of 25', 'Pack of 50'],
      ]),
      makeFamily('Conduit Pipe', 220, 'Protective conduit for wiring runs.', accessoriesImages, [
        ['20mm', '25mm', '32mm'],
        ['PVC', 'Flexible'],
        ['3M', '6M'],
      ]),
      makeFamily('Connector Block', 140, 'Terminal connectors for clean wiring joins.', accessoriesImages, [
        ['2 Way', '4 Way', '6 Way', '12 Way'],
        ['Screw Type', 'Spring Type'],
        ['Pack of 10', 'Pack of 20'],
      ]),
      makeFamily('Cable Gland', 175, 'Secure cable entry fittings for panels and boxes.', accessoriesImages, [
        ['M16', 'M20', 'M25', 'M32'],
        ['Brass', 'Nylon'],
        ['IP65', 'IP68'],
      ]),
      makeFamily('Wire Marker Kit', 260, 'Label kits for easier installation maintenance.', accessoriesImages, [
        ['Alphabet', 'Number', 'Symbol'],
        ['Heat Shrink', 'Clip-On'],
        ['Compact', 'Professional'],
      ]),
    ],
  },
];

function pickOption(optionSet, index) {
  if (!optionSet || optionSet.length === 0) {
    return '';
  }

  return optionSet[index % optionSet.length];
}

function buildCategoryProducts(categoryPlan, categoryIndex) {
  const products = [];
  const perFamily = 25;

  categoryPlan.families.forEach((family, familyIndex) => {
    for (let variantIndex = 0; variantIndex < perFamily; variantIndex += 1) {
      const serial = String(categoryIndex * 200 + familyIndex * perFamily + variantIndex + 1).padStart(3, '0');
      const variantParts = family.optionSets
        .map((optionSet) => pickOption(optionSet, variantIndex))
        .filter(Boolean);

      const variantLabel = variantParts.length ? ` ${variantParts.join(' ')}` : '';
      const image = family.imagePool[variantIndex % family.imagePool.length];
      const basePrice = family.basePrice + familyIndex * 12;
      const priceStep = Math.max(15, Math.round(family.basePrice * 0.08));
      const price = basePrice + (variantIndex % 5) * priceStep;
      const stockQuantity = variantIndex % 17 === 0
        ? 0
        : 4 + ((familyIndex * 7 + variantIndex * 3) % 28);

      products.push({
        name: `${family.title}${variantLabel} - Series ${serial}`,
        description: `${family.description} ${variantParts.join(' ')} variant for ${categoryPlan.category.toLowerCase()} installations.`.trim(),
        price,
        image,
        category: categoryPlan.category,
        stock_quantity: stockQuantity,
        is_active: 1,
      });
    }
  });

  return products;
}

function buildProductCatalog() {
  return categoryPlans.flatMap((categoryPlan, categoryIndex) =>
    buildCategoryProducts(categoryPlan, categoryIndex)
  );
}

module.exports = {
  PRODUCTS_CATALOG_VERSION,
  buildProductCatalog,
};
