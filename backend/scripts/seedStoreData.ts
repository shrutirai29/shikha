import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import connectDatabase from "../src/database/database";
import Category from "../src/models/category/category.model";
import Product from "../src/models/product/product.model";
import Coupon from "../src/models/coupon/coupon.model";
import Review from "../src/models/review/review.model";
import User from "../src/models/auth/auth.model";
import Order from "../src/models/order/order.model";
import Payment from "../src/models/payment/payment.model";

const categoriesData = [
  {
    name: "Earbuds Cases",
    slug: "earbuds-cases",
    description: "Snug, handmade protective crochet cases for AirPods and wireless earbuds",
    image: "/images/categories/earbuds-covers.jpg",
    isActive: true,
  },
  {
    name: "Door Torans",
    slug: "torans",
    description: "Handcrafted traditional Indian auspicious door hangings and marigold torans",
    image: "/images/categories/door-torans.jpg",
    isActive: true,
  },
  {
    name: "Plushies & Toys",
    slug: "plushies",
    description: "Lovingly hand-stitched amigurumi plush animals and cuddly toys for all ages",
    image: "/images/categories/plush-toys.jpg",
    isActive: true,
  },
  {
    name: "Bags & Totes",
    slug: "bags",
    description: "Handwoven crochet shoulder totes, sling bags and bohemian granny square bags",
    image: "/images/categories/tote-bags.jpg",
    isActive: true,
  },
  {
    name: "Flower Bouquets",
    slug: "flowers",
    description: "Everlasting hand-knitted flower arrangements, sunflowers, daisies and roses",
    image: "/images/categories/flower-bouquets.jpg",
    isActive: true,
  },
  {
    name: "Home Décor",
    slug: "home-decor",
    description: "Floral coasters, table runners, mug cozies and cozy boho home accents",
    image: "/images/categories/home-decor.jpg",
    isActive: true,
  },
];

const seedData = async () => {
  try {
    console.log("Connecting to database...");
    await connectDatabase();

    // 1. Seed Categories
    console.log("Seeding categories...");
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();

    for (const catData of categoriesData) {
      let category = await Category.findOne({ slug: catData.slug });
      if (!category) {
        category = await Category.create(catData);
        console.log(`+ Created category: ${category.name}`);
      } else {
        category.name = catData.name;
        category.description = catData.description;
        category.image = catData.image;
        category.isActive = true;
        await category.save();
        console.log(`~ Updated category: ${category.name}`);
      }
      categoryMap.set(catData.slug, category._id as mongoose.Types.ObjectId);
    }

    // 2. Seed Products
    console.log("Seeding products...");
    const productsData = [
      {
        name: "Pastel Daisy AirPods Case Cover",
        slug: "pastel-daisy-airpods-case",
        description: "Delicately crocheted with pastel pink and cream cotton yarn. Includes a silicone inner sleeve for grip and a sturdy gold carabiner clip.",
        price: 499,
        discountPrice: 349,
        stock: 25,
        images: ["/images/categories/earbuds-covers.jpg"],
        category: categoryMap.get("earbuds-cases"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.9,
        totalReviews: 8,
      },
      {
        name: "Mini Bear AirPods Pouch with Clasp",
        slug: "mini-bear-airpods-pouch",
        description: "Adorable bear-eared earphone case in warm beige and brown yarn. Fits standard AirPods 1/2/3 and Pro models snug and secure.",
        price: 449,
        discountPrice: 299,
        stock: 18,
        images: ["/images/categories/earbuds-covers.jpg"],
        category: categoryMap.get("earbuds-cases"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.8,
        totalReviews: 5,
      },
      {
        name: "Marigold & Jasmine Door Toran (3.5 ft)",
        slug: "marigold-jasmine-door-toran",
        description: "Auspicious yellow and orange marigold blossoms hand-stitched with white jasmine buds and pearl beads. Perfect for festive entrance décor.",
        price: 1199,
        discountPrice: 799,
        stock: 12,
        images: ["/images/categories/door-torans.jpg"],
        category: categoryMap.get("torans"),
        isFeatured: true,
        isActive: true,
        averageRating: 5.0,
        totalReviews: 12,
      },
      {
        name: "Traditional Mango Leaf Bandanwar Toran",
        slug: "traditional-mango-leaf-bandanwar",
        description: "Classic green mango leaves crocheted with gold thread accents and auspicious red pom-poms. Reusable, washable, and timeless.",
        price: 1399,
        discountPrice: 949,
        stock: 8,
        images: ["/images/categories/door-torans.jpg"],
        category: categoryMap.get("torans"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.9,
        totalReviews: 6,
      },
      {
        name: "Amigurumi Bunny in Knitted Overalls",
        slug: "amigurumi-bunny-overalls",
        description: "Soft, baby-safe amigurumi bunny toy dressed in tiny removable denim-blue overalls. Stuffed with hypoallergenic polyfill.",
        price: 799,
        discountPrice: 549,
        stock: 15,
        images: ["/images/categories/plush-toys.jpg"],
        category: categoryMap.get("plushies"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.9,
        totalReviews: 9,
      },
      {
        name: "Cute Amigurumi Strawberry Plush Keychain",
        slug: "amigurumi-strawberry-plush",
        description: "Vibrant red strawberry keychain hand-knit with delicate seeds and green leaves. Makes an irresistible return gift or backpack charm.",
        price: 259,
        discountPrice: 189,
        stock: 30,
        images: ["/images/categories/plush-toys.jpg"],
        category: categoryMap.get("plushies"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.7,
        totalReviews: 4,
      },
      {
        name: "Granny Square Sunflower Tote Bag",
        slug: "granny-square-sunflower-tote",
        description: "Bohemian aesthetic shoulder tote featuring 12 hand-crocheted sunflower granny squares. Reinforced cotton straps and roomy interior.",
        price: 1299,
        discountPrice: 899,
        stock: 10,
        images: ["/images/categories/tote-bags.jpg"],
        category: categoryMap.get("bags"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.8,
        totalReviews: 7,
      },
      {
        name: "Boho Daisy Crochet Crossbody Sling",
        slug: "boho-daisy-crochet-crossbody",
        description: "Compact round crossbody bag with daisy floral medallion motif, secure magnetic closure, and braided macramé shoulder strap.",
        price: 999,
        discountPrice: 699,
        stock: 14,
        images: ["/images/categories/tote-bags.jpg"],
        category: categoryMap.get("bags"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.9,
        totalReviews: 5,
      },
      {
        name: "Sunflower & Rose Crochet Bouquet",
        slug: "sunflower-rose-crochet-bouquet",
        description: "Everlasting bouquet of 3 blooming sunflowers, 2 blush roses, and eucalyptus leaves wrapped in kraft paper and twine. Never wilts!",
        price: 699,
        discountPrice: 499,
        stock: 20,
        images: ["/images/categories/flower-bouquets.jpg"],
        category: categoryMap.get("flowers"),
        isFeatured: true,
        isActive: true,
        averageRating: 5.0,
        totalReviews: 14,
      },
      {
        name: "Everlasting Daisy Stem Set of 3",
        slug: "everlasting-daisy-stem-set",
        description: "Trio of cheerful white and yellow daisies on bendable wire stems, wrapped in green yarn. Beautiful placed in small ceramic bud vases.",
        price: 449,
        discountPrice: 329,
        stock: 22,
        images: ["/images/categories/flower-bouquets.jpg"],
        category: categoryMap.get("flowers"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.8,
        totalReviews: 6,
      },
      {
        name: "Floral Coasters & Dining Mat Set (Pack of 4)",
        slug: "floral-coasters-dining-mat-set",
        description: "Handcrafted round flower coasters in earthy sage and terracotta hues. Heat-resistant and absorbent, perfect for tea, coffee, and dining.",
        price: 599,
        discountPrice: 399,
        stock: 16,
        images: ["/images/categories/home-decor.jpg"],
        category: categoryMap.get("home-decor"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.9,
        totalReviews: 8,
      },
      {
        name: "Handmade Blossom Mug Cozy & Coaster",
        slug: "blossom-mug-cozy-coaster",
        description: "Charming buttoned mug sleeve with matching petal coaster. Keeps your morning coffee warm while protecting your hands from heat.",
        price: 299,
        discountPrice: 199,
        stock: 28,
        images: ["/images/categories/home-decor.jpg"],
        category: categoryMap.get("home-decor"),
        isFeatured: true,
        isActive: true,
        averageRating: 4.9,
        totalReviews: 5,
      },
    ];

    const seededProducts = [];

    for (const prodData of productsData) {
      let product = await Product.findOne({ slug: prodData.slug });
      if (!product) {
        product = await Product.create(prodData);
        console.log(`+ Created product: ${product.name}`);
      } else {
        Object.assign(product, prodData);
        await product.save();
        console.log(`~ Updated product: ${product.name}`);
      }
      seededProducts.push(product);
    }

    // 3. Seed Coupons
    console.log("Seeding coupons...");
    const coupons = [
      {
        code: "KNOTTY10",
        description: "Flat 10% OFF on your first handcrafted order",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minimumPurchase: 200,
        maximumDiscount: 200,
        usageLimit: 1000,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
      {
        code: "HANDMADE50",
        description: "Flat ₹50 OFF on orders above ₹400",
        discountType: "FIXED",
        discountValue: 50,
        minimumPurchase: 400,
        maximumDiscount: 50,
        usageLimit: 500,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        isActive: true,
      },
    ];

    for (const coup of coupons) {
      await Coupon.findOneAndUpdate(
        { code: coup.code },
        coup,
        { upsert: true, new: true }
      );
      console.log(`+ Synced coupon: ${coup.code}`);
    }

    // 4. Seed sample customer orders for admin metrics & analytics
    const existingOrdersCount = await Order.countDocuments();
    if (existingOrdersCount === 0) {
      console.log("Seeding sample orders for admin metrics & analytics...");
      const customer = await User.findOne({ role: "customer" });
      if (customer && seededProducts.length >= 2) {
        const p1 = seededProducts[0];
        const p2 = seededProducts[2];

        const sampleOrder = await Order.create({
          user: customer._id,
          items: [
            {
              product: p1._id,
              name: p1.name,
              image: p1.images[0],
              quantity: 1,
              price: p1.discountPrice || p1.price,
            },
            {
              product: p2._id,
              name: p2.name,
              image: p2.images[0],
              quantity: 1,
              price: p2.discountPrice || p2.price,
            },
          ],
          shippingAddress: {
            fullName: customer.name,
            phone: customer.phone || "9876543210",
            addressLine1: "42 Crafts Street, Indiranagar",
            addressLine2: "Near Metro Pillar 120",
            city: "Bengaluru",
            state: "Karnataka",
            country: "India",
            postalCode: "560038",
          },
          paymentMethod: "COD",
          paymentStatus: "Pending",
          orderStatus: "Processing",
          subtotal: (p1.discountPrice || p1.price) + (p2.discountPrice || p2.price),
          discount: 0,
          shippingCharge: 0,
          tax: 206.64,
          totalAmount: 1354.64,
        });

        console.log(`+ Created sample order: #${sampleOrder._id}`);
      }
    }

    console.log("\n====================================");
    console.log("🎉 Knottiingale Store Data Seeded Successfully!");
    console.log("====================================");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to seed store data:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
