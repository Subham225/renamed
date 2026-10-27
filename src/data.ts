export const PERSONALIZED_BEST_SELLERS_STATIC: Product[] = [];


export const PLANTS_STATIC_CATALOG: Product[] = [
  {
    id: 'plant_boston_fern',
    name: 'Boston Fern in Ceramic Pot',
    price: 499,
    originalPrice: 699,
    category: 'plants',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=400&q=80',
    description: 'Lush green Boston fern in an elegant white ceramic pot.',
    rating: 4.8,
    reviewsCount: 72
  },
  {
    id: 'plant_money_goodluck',
    name: 'Money Plant in Glass Vase',
    price: 399,
    originalPrice: 499,
    category: 'plants',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80',
    description: 'Vibrant money plant known for bringing good luck and prosperity.',
    rating: 4.9,
    reviewsCount: 110
  }
];

export const SEASONAL_PRODUCTS: Product[] = [
  {
    id: 'seasonal_xmas_1',
    name: 'Special Christmas Plum Cake',
    price: 799,
    originalPrice: 999,
    category: 'xmas',
    image: 'https://images.unsplash.com/photo-1543589077-47d81606c1df?auto=format&fit=crop&w=400&q=80',
    description: 'Rich fruit and nut plum cake baked for the festive holiday season.',
    rating: 4.9,
    reviewsCount: 85
  }
];
export const ACCESSORY_ADDONS: Product[] = [
  {
    id: 'addon_candle_1',
    name: 'Sparkle Number Birthday Candle',
    price: 99,
    originalPrice: 149,
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?auto=format&fit=crop&w=300&q=80',
    description: 'Gold glittering number candle for birthday cakes.',
    rating: 4.8,
    reviewsCount: 52
  },
  {
    id: 'addon_card_1',
    name: 'Handcrafted Greeting Card with Envelope',
    price: 49,
    originalPrice: 99,
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80',
    description: 'Beautiful handmade card for your special message.',
    rating: 4.9,
    reviewsCount: 88
  },
  {
    id: 'addon_balloon_1',
    name: 'Metallic Party Balloons (Pack of 10)',
    price: 149,
    originalPrice: 199,
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=300&q=80',
    description: 'Assorted premium metallic balloons.',
    rating: 4.7,
    reviewsCount: 64
  }
];

import { Product, Category } from './types';

// @ts-ignore
import heroImage from './assets/images/hero_gifts_banner_1780500446361.png';
// @ts-ignore
import cakeImage from './assets/images/cakes_category_img_1780500466165.png';
// @ts-ignore
import flowerImage from './assets/images/flowers_category_img_1780500483282.png';
// @ts-ignore
import personalizedImage from './assets/images/personalized_gifts_img_1780500500855.png';

export const GENERATED_IMAGES = {
  hero: heroImage,
  cake: cakeImage,
  flower: flowerImage,
  personalized: personalizedImage,
};

export const CATEGORIES: Category[] = [
  {
    id: 'xmas',
    name: "Christmas special",
    image: 'https://images.unsplash.com/photo-1543589077-47d81606c1df?auto=format&fit=crop&w=300&q=80',
    displayOrder: 1,
    showInGrid: false,
  },
  {
    id: 'valentine_day',
    name: "Valentine's Day",
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
    displayOrder: 2,
    showInGrid: false,
  },
  {
    id: 'mothers_day',
    name: "Mother's Day",
    image: 'https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=300&q=80',
    displayOrder: 3,
    showInGrid: false,
  },
  {
    id: 'fathers_day',
    name: "Father's Day",
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=300&q=80',
    displayOrder: 3,
    showInGrid: false,
  },
  {
    id: 'teachers_day',
    name: "Teacher's Day",
    image: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&w=300&q=80',
    displayOrder: 4,
    showInGrid: false,
  },
  {
    id: 'cakes',
    name: 'Cakes',
    image: GENERATED_IMAGES.cake,
    displayOrder: 2,
  },
  {
    id: 'flowers',
    name: 'Flowers',
    image: GENERATED_IMAGES.flower,
    displayOrder: 3,
  },
  {
    id: 'birthday',
    name: 'Birthday',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=300&q=80',
    displayOrder: 4,
  },
  {
    id: 'plants',
    name: 'Plants',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=300&q=80',
    displayOrder: 5,
  },
  {
    id: 'gifts',
    name: 'Gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=300&q=80',
    displayOrder: 5,
  },
  {
    id: 'personalized_gifts',
    name: 'Personalized Gifts',
    image: GENERATED_IMAGES.personalized,
    displayOrder: 6,
  },
  {
    id: 'chocolates',
    name: 'Chocolates',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=400&q=80',
    displayOrder: 7,
  },
  {
    id: 'combos',
    name: 'Combos',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    displayOrder: 8,
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=300&q=80',
    displayOrder: 9,
  },
  {
    id: 'new_year',
    name: 'New Year',
    image: 'https://images.unsplash.com/photo-1546272989-40c92939c6c2?auto=format&fit=crop&w=300&q=80',
    displayOrder: 10,
  },
  {
    id: 'rakhi',
    name: 'Rakhi',
    image: 'https://images.unsplash.com/photo-1600025707768-1c4b7250616b?auto=format&fit=crop&w=300&q=80',
    displayOrder: 11,
  },
  {
    id: 'dewali',
    name: 'Dewali',
    image: 'https://images.unsplash.com/photo-1572911964205-01e4a7879b76?auto=format&fit=crop&w=300&q=80',
    displayOrder: 12,
  },
  {
    id: 'hand_crafts',
    name: 'Customise Hand craft',
    image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=300&q=80',
    displayOrder: 13,
  },
  {
    id: 'photo_to_art',
    name: 'Photo to Art',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=300&q=80',
    displayOrder: 14,
  }
];

export const PRODUCTS: Product[] = [
  // --- CAKES ---
  {
    id: 'cake_signature_strawberry',
    name: 'Signature Strawberry Chocolate Ganache Cake',
    price: 649,
    originalPrice: 799,
    category: 'cakes',
    image: GENERATED_IMAGES.cake,
    images: [
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'Our house-special double chocolate fudge sponge coated with a rich, glossy dark chocolate velvet ganache and layered with hand-sorted glazed fresh strawberries.',
    rating: 4.9,
    reviewsCount: 148,
    features: ['100% Freshly Baked', 'Premium Belgian Chocolate', 'Handpicked Strawberries', 'Serves 4 to 6 people'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true,
      hasNameCustomization: true
    }
  },
  {
    id: 'cake_custom_photo',
    name: 'Premium Personalised Photo Cake',
    price: 799,
    originalPrice: 999,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1557925923-33b251d59293?auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'A delicious customized cake featuring your favorite memory! Upload a photo and we will print it using 100% safe edible ink on a sweet frosting sheet.',
    rating: 4.9,
    reviewsCount: 215,
    features: ['Edible Sugar Print', 'Upload Your Own Photo', '100% Safe Colors', 'Premium Sponge'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true,
      hasPhotoUpload: true,
      hasNameCustomization: true
    }
  },
  {
    id: 'cake_golden_name',
    name: 'Golden Elegant Calligraphy Name Cake',
    price: 649,
    originalPrice: 749,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1616260841585-05561a29352e?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'A gorgeous frosted cake customized with an edible golden fondant tag containing any custom name or short message you wish.',
    rating: 4.7,
    reviewsCount: 198,
    features: ['Golden Edible Tag', 'Custom Calligraphy', 'Rich Buttercream frosting'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true,
      hasNameCustomization: true
    }
  },
  {
    id: 'cake_black_forest',
    name: 'Heavenly Dark Chocolate Black Forest Cake',
    price: 549,
    originalPrice: 599,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'Juicy dark cherries, freshly whipped French vanilla cream, and moist chocolate sponge layers shaved with rich German bittersweet chocolate flakes.',
    rating: 4.8,
    reviewsCount: 92,
    features: ['Classic German Recipe', 'Real Sour Cherries', 'Super Soft Sponge'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true
    }
  },
  {
    id: 'cake_red_velvet',
    name: 'Red Velvet Heart Cream Cheese Cake',
    price: 699,
    originalPrice: 849,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1616260841585-05561a29352e?auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'An elegant crimson red heart shaped chocolate-buttermilk cake frosted with silky smooth premium whipped cream cheese frosting.',
    rating: 4.9,
    reviewsCount: 204,
    features: ['Authentic Cocoa Sponge', 'Whipped Cream Cheese', 'Perfect for Couples'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true
    }
  },
  {
    id: 'cake_butterscotch',
    name: 'Premium English Butterscotch Caramel Cake',
    price: 599,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1616260841585-05561a29352e?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'Caramelised praline butterscotch crunch bites and gooey cream drizzle folded into fluffy golden butter sponge layers.',
    rating: 4.7,
    reviewsCount: 79,
    features: ['In-house Praline Crunch', 'Sweet Butterscotch Cream', 'Fresh Daily Bake'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true
    }
  },

  // --- FLOWERS ---
  {
    id: 'flower_pink_rose_elegance',
    name: 'Pink Rose Elegance Hand-tied Bouquet',
    price: 499,
    originalPrice: 599,
    category: 'flowers',
    image: GENERATED_IMAGES.flower,
    description: 'Exquisite spray of pastel-pink Dutch roses and soft baby\'s breath blooms bound gracefully together in organic brown craft wrapper paper and pink satin ribbon.',
    rating: 4.8,
    reviewsCount: 112,
    features: ['Fresh cut Dutch Roses', 'Free Personalised Gift Card', 'Comes with Flower Food'],
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'flower_crimson_romance',
    name: 'Crimson Romance Deep Red Roses Bunch',
    price: 549,
    originalPrice: 649,
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=500&q=80',
    description: 'A deep passionate collection of 12 luxury long-stemmed red roses arranged with leafy greens to express your heartfelt emotions perfectly.',
    rating: 4.9,
    reviewsCount: 231,
    features: ['Stems trimmed daily', 'Perfect symbol of Love', 'Wrapped in textured black paper'],
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'flower_lilies_pure_peace',
    name: 'Pure Peace Asiatic White Lilies Bouquet',
    price: 699,
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=500&q=80',
    description: 'Fragrant premium Asiatic white lilies paired nicely with fresh seasonal greenery, wrapped beautifully in lavender craft paper.',
    rating: 4.6,
    reviewsCount: 64,
    features: ['Highly aromatic', 'Long-lasting blooms', 'Imported Asiatic stems'],
    options: {
      hasMessageOption: true
    }
  },

  // --- PLANTS ---
  {
    id: 'plant_zebra_haworthia',
    name: 'Zebra Succulent in Pastel Mint Ceramic Pot',
    price: 299,
    originalPrice: 349,
    category: 'plants',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=500&q=80',
    description: 'A structural low-maintenance Zebra Succulent (Haworthia) nestled snugly inside a high-quality glazed mint-green ceramic table planter.',
    rating: 4.7,
    reviewsCount: 56,
    features: ['Extremely Hard to Kill', 'Sourced locally from organic nurseries', 'Air Purifying Natural Plant'],
    options: {
      hasPotOptions: true
    }
  },
  {
    id: 'plant_peace_lily',
    name: 'Spathiphyllum Air Purifying Peace Lily Plant',
    price: 399,
    category: 'plants',
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=500&q=80',
    description: 'Lush dark-green leaves featuring elegant sail-like white flower spathes. NASA-approved air purifier perfect for indoor bedside styling.',
    rating: 4.5,
    reviewsCount: 81,
    features: ['Filters household toxins', 'Low to medium light friendly', 'Comes with plant guide'],
    options: {
      hasPotOptions: true
    }
  },

  // --- GIFTS ---
  {
    id: 'gift_classic_box',
    name: 'Golden Keepsake Hand Tied Gift Box',
    price: 199,
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80',
    description: 'A sturdy craft gift paper box tied beautifully with high-quality golden string and custom floral decoration tags.',
    rating: 4.4,
    reviewsCount: 42,
    features: ['Recycled eco card stock', 'Spacious interior', 'Beautiful rustic typography branding'],
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'gift_mug_serenity_set',
    name: 'Aroma Lavender Scented Candle and Ceramic Mug Set',
    price: 449,
    originalPrice: 499,
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=500&q=80',
    description: 'A cozy night relaxation gift box containing a hand-poured soy wax lavender candle and a textured matte ceramic pastel coffee mug.',
    rating: 4.8,
    reviewsCount: 88,
    features: ['100% Organic Soy Wax', '30 Hours Burn Time', 'Microwave safe cup'],
    options: {
      hasMessageOption: true
    }
  },

  // --- PERSONALIZED GIFTS ---
  {
    id: 'pers_acrylic_lamp',
    name: 'Custom Couple Acrylic LED Night Lamp',
    price: 799,
    originalPrice: 999,
    category: 'personalized_gifts',
    image: GENERATED_IMAGES.personalized,
    description: 'An interactive custom-etched hearts acrylic sheet that glows in warm, cozy incandescent light. Upload your special photo to engrave inside!',
    rating: 4.9,
    reviewsCount: 312,
    features: ['Heavy USB Pine Wood Base', 'Precision laser cut', 'Perfect bedside lamp size', 'Includes premium gift packing'],
    options: {
      hasPhotoUpload: true,
      hasMessageOption: true
    }
  },
  {
    id: 'pers_wooden_frame',
    name: 'Custom Engraved Pine Wood Photo Grid Frame',
    price: 499,
    category: 'personalized_gifts',
    image: 'https://images.unsplash.com/photo-1534349762230-e0cadf78f5da?auto=format&fit=crop&w=500&q=80',
    description: 'Solid pine wood plaque laser engraved with your custom anniversary or birthday wishes and a high-resolution Polaroid polar grid picture.',
    rating: 4.7,
    reviewsCount: 175,
    features: ['100% Real Pine Wood', 'High-accuracy laser engraving', 'Includes metallic tabletop stand'],
    options: {
      hasPhotoUpload: true,
      hasMessageOption: true
    }
  },

  {
    id: 'pers_ultimate_hamper',
    name: 'Ultimate All-in-One Customized Gift Hamper',
    price: 1499,
    originalPrice: 1999,
    category: 'personalized_gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80',
    description: 'The ultimate bespoke experience. Contains a custom photo mug, an engraved pine wood frame with your selected name, an LED lamp, and a customized message card.',
    rating: 5.0,
    reviewsCount: 340,
    features: ['Complete bespoke package', 'Photo Ceramic Mug', 'Engraved Wooden Name Tag', 'Custom Message Label'],
    options: {
      hasPhotoUpload: true,
      hasMessageOption: true,
      hasNameCustomization: true,
      hasGiftCustomization: true
    }
  },
  // --- CHOCOLATES ---
  {
    id: 'custom_cake_1782716107529',
    name: 'Premium 10 Yellow Rose Flower Bouquet with Ferrero Rocher Chocolate | Luxury Gift Combo',
    price: 999,
    originalPrice: 1199,
    category: 'chocolates',
    categories: ['chocolates', 'combos', 'flowers', 'chocolate_flower', 'flower_combos'],
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80',
    description: 'The Ultimate Celebration of Joy & Golden Luxury: Premium 10 Yellow Roses Bouquet & Ferrero Rocher Chocolates.',
    rating: 5.0,
    reviewsCount: 240,
    features: ['10 Fresh Yellow Roses Bouquet', 'Ferrero Rocher Chocolates Box'],
    adminNote: 'Same Day Delivery',
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'choc_teddy_rocher_combo',
    name: 'Royal Ferrero Rocher & Cuddles Teddy Hamper',
    price: 899,
    originalPrice: 999,
    category: 'chocolates',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80',
    description: 'A festive white wicker basket containing 16 golden Ferrero Rocher premium chocolates, a super soft plush white teddy bear (6 inches), and a sweet message scroll.',
    rating: 4.9,
    reviewsCount: 189,
    features: ['16 Imported Ferrero balls', 'Hypoallergenic soft teddy bear', 'Festive basket presentation'],
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'choc_dark_silk_box',
    name: 'Artisanal Belgian Dark Cocoa Silk Box',
    price: 399,
    category: 'chocolates',
    image: 'https://images.unsplash.com/photo-1548907040-4d42b52125ca?auto=format&fit=crop&w=500&q=80',
    description: 'Rich bittersweet craft chocolates with 70% Single Origin Cocoa from Madagascar, topped with almond slivers and dry cranberries.',
    rating: 4.6,
    reviewsCount: 54,
    features: ['70% Madagascar cocoa', 'Gluten-free & Vegan', 'Curated luxury slider box'],
    options: {
      hasMessageOption: true
    }
  },

  // --- COMBOS ---
  {
    id: 'combo_fathers_day_special',
    name: 'Premium Father\'s Day Special Corporate Hamper',
    price: 1499,
    originalPrice: 1799,
    category: 'fathers_day',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80',
    description: 'Show your love for Dad with this corporate classy hamper containing a premium brushed cotton navy shirt, gold metallic rollerball pen, gourmet dark chocolates, and a personalized letterhead.',
    rating: 4.9,
    reviewsCount: 320,
    features: ['Pure Combed Cotton Shirt', 'Refillable Parker Ball Pen', 'Gourmet Chocolate Bar', 'Father\'s Day custom badge'],
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'combo_roses_cake_love',
    name: 'Red Velvet Heart Cake & Red Roses Love Combo',
    price: 1199,
    originalPrice: 1399,
    category: 'combos',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80',
    description: 'Combine romantic red velvet and absolute fresh-cut crimson roses! Features a luscious 0.5 Kg Red Velvet Heart Cake and a hand bouquet of 10 classic red roses.',
    rating: 4.9,
    reviewsCount: 421,
    features: ['Freshly baked 0.5 Kg Red Velvet cake', '10 premium Red Roses', 'Best-selling romance option'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true,
      hasMessageOption: true
    }
  },

  // --- ANNIVERSARY ---
  {
    id: 'combo_anniv_gold_romance',
    name: 'Golden Romance Anniversary Night Combo',
    price: 1799,
    originalPrice: 1999,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=500&q=80',
    description: 'Celebrate happy togetherness with our customized elegant anniversary package: LED Heart Picture Frame, a beautiful basket of premium red carnations, and luxury Swiss chocolates.',
    rating: 4.9,
    reviewsCount: 154,
    features: ['100% Customized LED plaque', '15 beautiful Red Carnations', 'Imported truffle chocolates'],
    options: {
      hasPhotoUpload: true,
      hasMessageOption: true
    }
  },
  {
    id: 'cake_fathers_day_truffle',
    name: 'Super Dad Belgian Chocolate Truffle Cake',
    price: 599,
    originalPrice: 749,
    category: 'fathers_day',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
    description: 'Surprise Dad with a rich Belgian dark chocolate glaze truffle cake, hand-decorated with a stylish "Best Dad" icing motif.',
    rating: 4.9,
    reviewsCount: 195,
    features: ['Special Father\'s Day Topping', 'Premium Belgian Truffles', 'Moist & Rich Cocoa Sponge'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true
    }
  },
  {
    id: 'cake_fathers_day_premium',
    name: 'Father\'s Day Special Classic Butterscotch Cake',
    price: 549,
    originalPrice: 649,
    category: 'fathers_day',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
    description: 'Golden caramelized butterscotch chips folded into layers of fresh whipped cream and butter sponge, perfect for Father\'s Day celebrations.',
    rating: 4.8,
    reviewsCount: 124,
    features: ['100% Eggless option available', 'Caramel butter cream frosting', 'Freshly baked of premium standard'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true
    }
  },
  // --- ADDITIONAL PREMIUM PRODUCTS FOR CATS ---
  {
    id: 'cake_rainbow_wonder',
    name: 'Vibrant 6-Layer Rainbow Vanilla Frosting Cake',
    price: 849,
    originalPrice: 1099,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'A spectacular 6-layered sponge cake featuring all colors of the rainbow, stacked and frosted with gourmet vanilla bean whipped cream and confetti sprinkles.',
    rating: 4.9,
    reviewsCount: 142,
    features: ['6 Colorful Sponge Layers', '100% Premium Vanilla Cream', 'Amazing slice perspective', 'Perfect for birthday bashes'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true,
      hasNameCustomization: true
    }
  },
  {
    id: 'cake_pineapple_paradise',
    name: 'Gourmet Organic Fresh Pineapple Gateau',
    price: 499,
    originalPrice: 599,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1557925923-33b251d59293?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1616260841585-05561a29352e?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'Traditional light sponge drenched in sweet pineapple juice, covered with rich dairy cream, caramelized pineapple pieces, and maraschino cherries.',
    rating: 4.8,
    reviewsCount: 89,
    features: ['Made with Real Pineapples', 'Ultra Light & Fluffy Sponge', 'Cherries & Cream toppings'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true
    }
  },
  {
    id: 'cake_belgian_truffle',
    name: 'Royal Belgian Double Chocolate Truffle Cake',
    price: 699,
    originalPrice: 899,
    category: 'cakes',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80',
    images: [
      'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=500&q=80'
    ],
    description: 'A dark, brooding chocolate cake infused with real melted milk chocolate chunk filling and decorated with Dutch cocoa-dusted handmade truffles.',
    rating: 4.9,
    reviewsCount: 310,
    features: ['Rich Belgian cocoa infusion', 'Topped with handmade truffles', 'Silky chocolate ganache layer'],
    options: {
      hasWeightOptions: true,
      hasEgglessOption: true,
      hasNameCustomization: true
    }
  },
  {
    id: 'flower_golden_sunflowers',
    name: 'Bright Golden Sunflowers and Yellow Lilies Vase',
    price: 599,
    originalPrice: 749,
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=500&q=80',
    description: 'A radiant glass vase arrangement of sun-kissed golden sunflowers bundled beautifully with premium yellow lilies and seasonal field greenery.',
    rating: 4.8,
    reviewsCount: 167,
    features: ['3 Big Fresh Sunflowers', 'Fragrant Yellow Lilies', 'Complimentary Clear Glass Vase'],
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'flower_exotic_orchids',
    name: 'Deep Purple Exotic Orchids Deluxe Velvet Box',
    price: 899,
    originalPrice: 1199,
    category: 'flowers',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=500&q=80',
    description: 'An elite collection of rare purple Dendrobium orchids curated in a premium soft black velvet box. Radiates pure luxury and high-class appreciation.',
    rating: 5.0,
    reviewsCount: 94,
    features: ['Rare Dendrobium Orchids', 'Luxury Black Velvet Box', 'Stays fresh for over 7 days'],
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'gift_luxury_tea_hamper',
    name: 'Premium Wooden Gourmet Selection Tea Box Hamper',
    price: 649,
    originalPrice: 799,
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80',
    description: 'A finely polished mahogany-style wooden box housing 6 distinct organic whole leaf tea varieties + a handcrafted wooden honey drizzler.',
    rating: 4.7,
    reviewsCount: 104,
    features: ['Genuine Rosewood box', '6 Exotic blend tea tubes', 'Pure organic Himalayan Honey glass jar included'],
    options: {
      hasMessageOption: true
    }
  },
  {
    id: 'gift_gold_perfume',
    name: 'Midnight Amber Custom Luxury Scented Perfume Duo',
    price: 999,
    originalPrice: 1299,
    category: 'gifts',
    image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&w=500&q=80',
    description: 'An exquisite dual-fragrance gift container set containing our top-selling Midnight Amber Eau De Parfum and a matching moisturizing perfume lotion.',
    rating: 4.9,
    reviewsCount: 122,
    features: ['Fragrance imported from France', 'Long-lasting 12H durability', 'Wrapped in pristine golden foil box'],
    options: {
      hasMessageOption: true
    }
  },
  ...PERSONALIZED_BEST_SELLERS_STATIC,
  ...PLANTS_STATIC_CATALOG.filter(p => p.id === 'plant_boston_fern' || p.id === 'plant_money_goodluck'),
  ...ACCESSORY_ADDONS,
  ...SEASONAL_PRODUCTS
];

export const CITIES = [
  { city: 'Kharagpur', pincode: '721301' },
  { city: 'Mumbai', pincode: '400001' },
  { city: 'Delhi', pincode: '110001' },
  { city: 'Bangalore', pincode: '560001' },
  { city: 'Chennai', pincode: '600001' },
  { city: 'Pune', pincode: '411001' },
  { city: 'Hyderabad', pincode: '500001' },
  { city: 'Noida', pincode: '201301' }
];
