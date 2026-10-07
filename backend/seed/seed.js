// Chalane ka tareeqa: npm run seed
// DHYAN: ye pehle se maujood saara data (users, restaurants, orders...) delete kar deta hai.
const mongoose = require("mongoose");
const env = require("../src/config/env");
const User = require("../src/models/User");
const Restaurant = require("../src/models/Restaurant");
const Category = require("../src/models/Category");
const MenuItem = require("../src/models/MenuItem");
const Cart = require("../src/models/Cart");
const Order = require("../src/models/Order");

// item = [naam, tafseel, price, discountPrice, prepMinutes, ingredients]
const RESTAURANTS = [
  {
    owner: 0,
    info: { name: "Dum Pukht Biryani House", description: "Slow-cooked Karachi-style biryani, handi dishes and fresh naan since 2009.", phone: "+922134567890", email: "hello@dumpukht.example", address: "Shop 12, Burns Road", city: "Karachi", openingTime: "11:00", closingTime: "23:30" },
    categories: {
      "Biryani": [
        ["Chicken Biryani", "Dum-cooked basmati rice layered with spiced chicken and potato.", 450, null, 25, "basmati rice,chicken,potato,spices"],
        ["Beef Biryani", "Tender beef pieces in a rich masala, served with raita.", 520, 480, 30, "basmati rice,beef,yogurt,spices"],
        ["Vegetable Biryani", "Seasonal vegetables cooked with saffron rice.", 350, null, 20, "basmati rice,vegetables,saffron"],
      ],
      "Karahi & Handi": [
        ["Chicken Karahi (Half)", "Wok-cooked chicken with tomato, ginger and green chilli.", 1100, null, 30, "chicken,tomato,ginger,green chilli"],
        ["Mutton Handi", "Slow-cooked mutton in a creamy onion gravy.", 1600, 1450, 40, "mutton,onion,cream,spices"],
        ["Daal Mash", "Creamy white lentils tempered with garlic.", 380, null, 15, "lentils,garlic,butter"],
      ],
      "Breads": [
        ["Tandoori Naan", "Fresh from the tandoor.", 40, null, 5, "flour,yogurt"],
        ["Garlic Naan", "Naan brushed with garlic butter.", 70, null, 6, "flour,garlic,butter"],
        ["Roghni Naan", "Soft naan topped with sesame seeds.", 60, null, 6, "flour,sesame,milk"],
      ],
      "Sides": [
        ["Raita", "Whisked yogurt with cucumber and mint.", 80, null, 3, "yogurt,cucumber,mint"],
        ["Kachumber Salad", "Onion, tomato and cucumber with lemon.", 90, null, 3, "onion,tomato,cucumber,lemon"],
        ["Shami Kabab (2 pcs)", "Pan-fried minced beef and lentil patties.", 220, null, 10, "beef,chana daal,spices"],
      ],
      "Drinks": [
        ["Mint Margarita", "Chilled lemon and mint cooler.", 180, null, 5, "lemon,mint,soda"],
        ["Sweet Lassi", "Thick chilled yogurt drink.", 200, null, 4, "yogurt,sugar,cardamom"],
        ["Soft Drink (345ml)", "Cola, lemon-lime or orange.", 90, null, 1, ""],
      ],
    },
  },
  {
    owner: 1,
    info: { name: "Burger Yard", description: "Smash burgers, loaded fries and thick shakes made fresh to order.", phone: "+924235678901", email: "orders@burgeryard.example", address: "14 MM Alam Road, Gulberg", city: "Lahore", openingTime: "12:00", closingTime: "01:00" },
    categories: {
      "Burgers": [
        ["Classic Smash Burger", "Double beef patty, cheddar, pickles and house sauce.", 850, null, 15, "beef patty,cheddar,pickles,bun"],
        ["Crispy Chicken Burger", "Buttermilk fried chicken with slaw and chipotle mayo.", 750, 690, 15, "chicken,slaw,chipotle mayo,bun"],
        ["Zinger Supreme", "Spicy zinger fillet with lettuce and cheese slice.", 690, null, 12, "chicken,lettuce,cheese,bun"],
      ],
      "Fries & Sides": [
        ["Loaded Cheese Fries", "Crinkle fries with cheese sauce and jalapeño.", 520, null, 10, "potato,cheese sauce,jalapeño"],
        ["Peri Peri Fries", "Fries tossed in peri peri seasoning.", 320, null, 8, "potato,peri peri"],
        ["Onion Rings", "Beer-batter style crispy rings.", 380, null, 8, "onion,flour"],
      ],
      "Wraps": [
        ["Chicken Tikka Wrap", "Tikka chicken, onions and mint sauce in a paratha wrap.", 480, null, 12, "chicken tikka,paratha,onion,mint sauce"],
        ["Beef Shawarma Wrap", "Marinated beef strips with garlic sauce and pickles.", 520, null, 12, "beef,garlic sauce,pickles"],
        ["Falafel Wrap", "Chickpea falafel with hummus and salad.", 420, null, 10, "chickpeas,hummus,salad"],
      ],
      "Shakes": [
        ["Oreo Shake", "Thick vanilla shake blended with Oreo cookies.", 450, null, 6, "milk,ice cream,oreo"],
        ["Mango Shake", "Fresh Sindhri mango and milk.", 400, 360, 6, "mango,milk"],
        ["Chocolate Fudge Shake", "Rich chocolate and fudge sauce.", 450, null, 6, "milk,chocolate,ice cream"],
      ],
      "Desserts": [
        ["Chocolate Brownie", "Warm walnut brownie.", 350, null, 5, "chocolate,walnut,flour"],
        ["Cheesecake Slice", "Baked New York style cheesecake.", 520, null, 3, "cream cheese,biscuit base"],
        ["Ice Cream Scoop (2)", "Vanilla, chocolate or strawberry.", 250, null, 2, "milk,cream"],
      ],
    },
  },
  {
    owner: 1,
    info: { name: "Tandoori Nights", description: "Charcoal-grilled BBQ, tikka and kebabs from the Islamabad foothills.", phone: "+925155678902", email: "info@tandoorinights.example", address: "Food Street, F-7 Markaz", city: "Islamabad", openingTime: "13:00", closingTime: "00:00" },
    categories: {
      "BBQ": [
        ["Chicken Tikka (Leg)", "Charcoal-grilled marinated chicken leg.", 380, null, 20, "chicken,yogurt,tikka masala"],
        ["Malai Boti (8 pcs)", "Creamy marinated chicken boti.", 950, 890, 20, "chicken,cream,cheese,white pepper"],
        ["Seekh Kabab (4 pcs)", "Minced beef kababs on skewers.", 780, null, 18, "beef mince,onion,spices"],
      ],
      "Platters": [
        ["Mixed Grill Platter", "Tikka, malai boti, seekh kabab and naan for two.", 2400, 2200, 30, "chicken,beef,naan,chutney"],
        ["Family BBQ Platter", "Assorted BBQ with raita and salad for four.", 4200, null, 40, "chicken,beef,mutton,naan"],
        ["Chapli Kabab Platter", "Peshawari beef chapli kababs with naan.", 1200, null, 20, "beef,tomato,coriander,naan"],
      ],
      "Rice & Gravy": [
        ["Chicken Pulao", "Fragrant yakhni pulao with raita.", 550, null, 20, "rice,chicken,yakhni"],
        ["Butter Chicken", "Tandoori chicken in a smooth tomato butter gravy.", 1050, null, 25, "chicken,tomato,butter,cream"],
        ["Palak Paneer", "Cottage cheese in spiced spinach.", 780, null, 20, "paneer,spinach,cream"],
      ],
      "Starters": [
        ["Chicken Corn Soup", "Hot and thick, with egg ribbons.", 320, null, 10, "chicken,corn,egg"],
        ["Hara Bhara Kabab", "Spinach and pea patties.", 450, null, 12, "spinach,peas,potato"],
        ["Fish Pakora", "Crispy gram-flour fried fish.", 850, null, 15, "fish,gram flour,ajwain"],
      ],
      "Desserts": [
        ["Gulab Jamun (3 pcs)", "Warm milk dumplings in sugar syrup.", 250, null, 4, "milk powder,sugar,cardamom"],
        ["Kheer", "Rice pudding with pistachio.", 280, null, 3, "rice,milk,pistachio"],
        ["Gajar Ka Halwa", "Slow-cooked carrot halwa with khoya.", 320, null, 4, "carrot,milk,khoya,nuts"],
      ],
    },
  },
];

async function run() {
  await mongoose.connect(env.mongoUri);
  console.log("Purana data delete ho raha hai...");
  await Promise.all([User, Restaurant, Category, MenuItem, Cart, Order].map((M) => M.deleteMany({})));

  // create() use hota hai taake password hash ho
  const [superAdmin, ra1, ra2, ...customers] = await User.create([
    { name: "Super Admin", email: "admin@thaali.pk", password: "Admin@12345", phone: "+923001110001", role: "super_admin" },
    { name: "Imran Siddiqui", email: "imran@thaali.pk", password: "Owner@12345", phone: "+923001110002", role: "restaurant_admin" },
    { name: "Sana Malik", email: "sana@thaali.pk", password: "Owner@12345", phone: "+923001110003", role: "restaurant_admin" },
    { name: "Ayesha Khan", email: "ayesha@example.com", password: "Customer@123", phone: "+923211110004" },
    { name: "Bilal Ahmed", email: "bilal@example.com", password: "Customer@123", phone: "+923211110005" },
    { name: "Hira Raza", email: "hira@example.com", password: "Customer@123", phone: "+923211110006" },
  ]);
  const owners = [ra1, ra2];

  for (const def of RESTAURANTS) {
    const r = await Restaurant.create({ ...def.info, owner: owners[def.owner]._id });
    let order = 0;
    for (const [catName, items] of Object.entries(def.categories)) {
      const cat = await Category.create({ restaurant: r._id, name: catName, sortOrder: order++ });
      await MenuItem.create(
        items.map(([name, description, price, discountPrice, preparationTime, ing]) => ({
          restaurant: r._id, category: cat._id, name, description, price,
          ...(discountPrice ? { discountPrice } : {}),
          preparationTime, ingredients: ing ? ing.split(",") : [],
        }))
      );
    }
    console.log(`Banaya: ${r.name} (${Object.keys(def.categories).length} categories)`);
  }

  console.log("\nSeed mukammal. Login details:");
  console.log("  Super admin     admin@thaali.pk      Admin@12345");
  console.log("  Restaurant      imran@thaali.pk      Owner@12345   (Dum Pukht Biryani House)");
  console.log("  Restaurant      sana@thaali.pk       Owner@12345   (Burger Yard + Tandoori Nights)");
  console.log("  Customer        ayesha@example.com   Customer@123");
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
