/**
 * DvgCart E-Commerce - Product Catalog Seed & Database Client
 */

// Supabase Database Credentials (anon keys are public by design, protected by RLS)
const DEFAULT_SUPABASE_URL = "https://lbdadqkzpzorcxzkjbqh.supabase.co"; 
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZGFkcWt6cHpvcmN4emtqYnFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ2MTMyMjIsImV4cCI6MjEwMDE4OTIyMn0.S3z9LLDBHUMCVX19g52Ep3C2btZElpf5bANyWuKblYU";

const DEFAULT_PRODUCTS = [
  {
    id: "prod-001",
    title: "Signature Pima Tee",
    category: "Apparel",
    price: 9999,
    rating: 4.9,
    reviewsCount: 128,
    badge: "Bestseller",
    stockLeft: 6,
    description: "A mastercrafted heavyweight t-shirt tailored from hand-harvested Peruvian Pima cotton. Features an architectural drape, reinforced collar binding, and silk-screened minimalist branding.",
    image: "images/tshirt.png",
    images: ["images/tshirt.png"],
    featured: true,
    sizes: ["S", "M", "L", "XL"],
    specs: [
      "Material: 100% Long-Staple Peruvian Pima Cotton",
      "Fabric Weight: 280 GSM Heavyweight Jersey",
      "Origin: Hand-tailored in Lima, Peru",
      "Fit: Contemporary relaxed architectural drape",
      "Care: Cold gentle wash, flat dry"
    ]
  },
  {
    id: "prod-002",
    title: "Voyager Leather Duffle",
    category: "Leather Goods",
    price: 28999,
    rating: 5.0,
    reviewsCount: 84,
    badge: "Masterpiece",
    stockLeft: 3,
    description: "Hand-stitched full-grain Italian Tuscan leather duffle designed for discerning jet-setters. Accented with brushed 24k gold-plated hardware and water-resistant suede interior lining.",
    image: "images/bag.png",
    images: ["images/bag.png"],
    featured: true,
    specs: [
      "Material: Full-Grain Vegetable-Tanned Italian Leather",
      "Hardware: Solid brass plated in 24k champagne gold",
      "Compartments: Padded 16\" laptop sleeve & shoe vault",
      "Dimensions: 52cm x 28cm x 26cm (Cabin Approved)",
      "Warranty: Lifetime artisanal guarantee"
    ]
  },
  {
    id: "prod-003",
    title: "Oud Royal Extrait de Parfum",
    category: "Fragrances",
    price: 18499,
    rating: 4.95,
    reviewsCount: 210,
    badge: "Exclusive",
    stockLeft: 8,
    description: "An intoxicating blend of 30-year aged Cambodian agarwood, Damascus rose petals, smoked ambergris, and Sicilian bergamot. Hand-poured in a faceted crystal flacon.",
    image: "images/perfume.png",
    images: ["images/perfume.png"],
    featured: true,
    specs: [
      "Concentration: 35% Pure Extrait de Parfum Oil",
      "Top Notes: Calabrian Bergamot, Pink Peppercorn",
      "Heart Notes: Taif Rose, Rare Saffron, Jasmine Sambac",
      "Base Notes: Cambodian Oud, Ambergris, Bourbon Vanilla",
      "Longevity: 18+ Hours intense sillage"
    ]
  },
  {
    id: "prod-004",
    title: "Monaco Aviator Eyewear",
    category: "Accessories",
    price: 14999,
    rating: 4.85,
    reviewsCount: 96,
    badge: "Limited Edition",
    stockLeft: 5,
    description: "Aerospace-grade Japanese beta-titanium aviators fitted with anti-reflective polarized Zeiss lenses. Featherlight 18-gram silhouette engineered for total glare elimination.",
    image: "images/sunglasses.png",
    images: ["images/sunglasses.png"],
    featured: true,
    specs: [
      "Frame: Ultra-lightweight Japanese Beta-Titanium",
      "Lenses: Carl Zeiss 100% UVA/UVB Category 3 Polarized",
      "Nose Pads: Hypoallergenic ceramic and silicone composite",
      "Weight: 18 grams featherweight profile",
      "Case: Handcrafted magnetic leather vault included"
    ]
  }
];

const DEFAULT_CATEGORIES = ["Apparel", "Leather Goods", "Fragrances", "Accessories"];

/**
 * Initialize catalog in LocalStorage if it doesn't exist.
 */
function initializeCatalog() {
  if (!localStorage.getItem("dvgcart_products_v5")) {
    localStorage.setItem("dvgcart_products_v5", JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem("dvgcart_categories_v5")) {
    localStorage.setItem("dvgcart_categories_v5", JSON.stringify(DEFAULT_CATEGORIES));
  }
}

/**
 * Fetch products from LocalStorage
 */
function getProducts() {
  initializeCatalog();
  let prods = [];
  try {
    prods = JSON.parse(localStorage.getItem("dvgcart_products_v5")) || [];
  } catch (e) {
    prods = [];
  }
  if (!Array.isArray(prods) || prods.length === 0) {
    prods = DEFAULT_PRODUCTS;
    localStorage.setItem("dvgcart_products_v5", JSON.stringify(DEFAULT_PRODUCTS));
  }
  // Ensure images array exists on each product
  return prods.map(p => {
    if (!p.images || !Array.isArray(p.images) || p.images.length === 0) {
      p.images = p.image ? [p.image] : [];
    }
    return p;
  });
}

/**
 * Save products list to LocalStorage
 */
function saveProducts(products) {
  localStorage.setItem("dvgcart_products_v5", JSON.stringify(products));
}

/**
 * Fetch categories from LocalStorage
 */
function getCategories() {
  initializeCatalog();
  let cats = [];
  try {
    cats = JSON.parse(localStorage.getItem("dvgcart_categories_v5")) || [];
  } catch (e) {
    cats = [];
  }
  if (!Array.isArray(cats) || cats.length === 0) {
    cats = DEFAULT_CATEGORIES;
    localStorage.setItem("dvgcart_categories_v5", JSON.stringify(DEFAULT_CATEGORIES));
  }
  return cats;
}

/**
 * Save categories to LocalStorage
 */
function saveCategories(categories) {
  localStorage.setItem("dvgcart_categories_v5", JSON.stringify(categories));
}

/**
 * Initialize Supabase Client
 */
const getSupabaseClient = () => {
  let url = localStorage.getItem("dvgcart_supabase_url") || DEFAULT_SUPABASE_URL || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.url);
  const key = localStorage.getItem("dvgcart_supabase_anon_key") || DEFAULT_SUPABASE_ANON_KEY || (window.SUPABASE_CONFIG && window.SUPABASE_CONFIG.anonKey);

  if (url && key && typeof supabase !== "undefined") {
    try {
      return supabase.createClient(url, key);
    } catch (e) {
      console.error("Supabase client init error:", e);
    }
  }
  return null;
};

/**
 * Upload a base64 image to Supabase Storage and return public URL.
 * Falls back to returning the original base64 if storage upload fails.
 */
async function uploadImageToStorage(base64DataUrl, folder = "products") {
  const client = getSupabaseClient();
  if (!client || !base64DataUrl || !base64DataUrl.startsWith("data:")) {
    return base64DataUrl; // Return as-is if not a base64 image or no client
  }

  try {
    // Convert base64 to Blob
    const [header, data] = base64DataUrl.split(",");
    const mimeMatch = header.match(/data:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const ext = mime.split("/")[1] || "jpg";
    const byteChars = atob(data);
    const byteArray = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArray[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mime });

    // Generate unique filename
    const filename = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    // Upload to Supabase Storage bucket "images"
    const { data: uploadData, error: uploadError } = await client.storage
      .from("images")
      .upload(filename, blob, { contentType: mime, upsert: true });

    if (uploadError) {
      console.warn("Storage upload failed, using base64 fallback:", uploadError.message);
      return base64DataUrl;
    }

    // Get public URL
    const { data: urlData } = client.storage.from("images").getPublicUrl(filename);
    if (urlData && urlData.publicUrl) {
      return urlData.publicUrl;
    }

    return base64DataUrl;
  } catch (err) {
    console.warn("Image upload error, using base64 fallback:", err);
    return base64DataUrl;
  }
}

// Global DB client
let db = getSupabaseClient();

/**
 * Fetch full catalog from Supabase Relational Database
 */
async function fetchCloudCatalog() {
  db = getSupabaseClient();
  if (!db) {
    console.warn("Supabase credentials not configured. Local fallback enabled.");
    return null;
  }

  // Create a 4-second timeout promise
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error("Supabase query timed out")), 4000)
  );

  const fetchPromise = (async () => {
    // 1. Fetch categories
    const { data: catData, error: catError } = await db
      .from("categories")
      .select("name")
      .order("name", { ascending: true });
      
    if (catError) throw catError;
    
    // 2. Fetch products
    const { data: prodData, error: prodError } = await db
      .from("products")
      .select("*")
      .order("created_at", { ascending: true });
      
    if (prodError) throw prodError;

    let categoriesList = (catData || []).map(c => c.name);
    let normalizedProdData = (prodData || []).map(p => {
      let imgs = p.images;
      if (typeof imgs === "string") {
        try { imgs = JSON.parse(imgs); } catch(e) { imgs = []; }
      }
      if (!imgs || !Array.isArray(imgs) || imgs.length === 0) {
        imgs = p.image ? [p.image] : [];
      }
      p.images = imgs;

      let spcs = p.specs;
      if (typeof spcs === "string") {
        try { spcs = JSON.parse(spcs); } catch(e) { spcs = [spcs]; }
      }
      p.specs = Array.isArray(spcs) ? spcs : [];

      return p;
    });

    // Update Local Cache with exact database records
    if (normalizedProdData && normalizedProdData.length > 0) {
      localStorage.setItem("dvgcart_products_v5", JSON.stringify(normalizedProdData));
      localStorage.setItem("dvgcart_categories_v5", JSON.stringify(categoriesList));
    }

    return {
      products: normalizedProdData,
      categories: categoriesList
    };
  })();

  try {
    return await Promise.race([fetchPromise, timeoutPromise]);
  } catch (err) {
    console.error("Supabase Cloud Sync Fetch Error:", err);
  }
  return null;
}

/**
 * Perform bulk database save (Backup Import / Truncate & Seed)
 */
async function saveCloudCatalog(products, categories) {
  db = getSupabaseClient();
  if (!db) return { success: false, error: "Database client not initialized" };

  try {
    // 1. Delete all existing records (Cascade constraints handle dependencies)
    const { error: delProdError } = await db.from("products").delete().neq("id", "dummy");
    if (delProdError) throw delProdError;

    const { error: delCatError } = await db.from("categories").delete().neq("name", "dummy");
    if (delCatError) throw delCatError;

    // 2. Insert new categories list
    const categoryRows = categories.map(cat => ({ name: cat }));
    const { error: insCatError } = await db.from("categories").insert(categoryRows);
    if (insCatError) throw insCatError;

    // 3. Insert new products list
    if (products.length > 0) {
      const fullRows = products.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        description: p.description,
        image: p.image || (p.images && p.images[0]) || "",
        images: p.images && p.images.length > 0 ? p.images : (p.image ? [p.image] : []),
        featured: p.featured,
        specs: p.specs
      }));

      // Try inserting full rows including images
      let { error: insProdError } = await db.from("products").insert(fullRows);
      
      // If error occurs (e.g. missing 'images' column in Supabase schema), fallback to standard schema
      if (insProdError) {
        console.warn("Retrying product insert without optional images column:", insProdError.message);
        const stdRows = products.map(p => ({
          id: p.id,
          title: p.title,
          category: p.category,
          price: p.price,
          description: p.description,
          image: p.image || (p.images && p.images[0]) || "",
          featured: p.featured,
          specs: p.specs
        }));
        const retryResult = await db.from("products").insert(stdRows);
        if (retryResult.error) throw retryResult.error;
      }
    }

    return { success: true };
  } catch (err) {
    console.error("Supabase Bulk Seed Error:", err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Fetch admin settings from Supabase 'settings' table
 */
async function fetchCloudSettings() {
  db = getSupabaseClient();
  if (!db) return null;

  try {
    const { data, error } = await db.from("settings").select("key, value");
    if (error) throw error;
    if (!data || data.length === 0) return null;

    const settings = {};
    data.forEach(row => { settings[row.key] = row.value; });

    // Store all fetched settings into localStorage for offline use
    const keyMap = {
      admin_phone: "dvgcart_admin_phone",
      link_insta: "dvgcart_link_insta",
      link_fb: "dvgcart_link_fb",
      link_yt: "dvgcart_link_yt",
      link_wa: "dvgcart_link_wa",
      admin_passcode: "dvgcart_admin_passcode",
      hero_tag: "dvgcart_hero_tag",
      hero_title: "dvgcart_hero_title",
      hero_desc: "dvgcart_hero_desc",
      hero_image: "dvgcart_hero_image",
      hero_price_title: "dvgcart_hero_price_title",
      hero_price_amount: "dvgcart_hero_price_amount",
      announcement_shipping: "dvgcart_announcement_shipping",
      announcement_promo: "dvgcart_announcement_promo",
      logo: "dvgcart_logo"
    };

    for (const [dbKey, lsKey] of Object.entries(keyMap)) {
      if (settings[dbKey] !== undefined) {
        localStorage.setItem(lsKey, settings[dbKey]);
      }
    }

    return settings;
  } catch (err) {
    console.error("Fetch cloud settings error:", err);
    return null;
  }
}

/**
 * Save a single admin setting to Supabase 'settings' table
 */
async function saveCloudSetting(key, value) {
  db = getSupabaseClient();
  if (!db) return false;

  try {
    const { error } = await db.from("settings").upsert(
      { key: key, value: value },
      { onConflict: "key" }
    );
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Save cloud setting error:", err);
    return false;
  }
}

/**
 * Save multiple admin settings to Supabase at once
 */
async function saveCloudSettingsBatch(settingsObj) {
  db = getSupabaseClient();
  if (!db) return false;

  try {
    const rows = Object.entries(settingsObj).map(([key, value]) => ({ key, value }));
    const { error } = await db.from("settings").upsert(rows, { onConflict: "key" });
    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Save cloud settings batch error:", err);
    return false;
  }
}

/**
 * Save a Client Order into Supabase 'orders' table
 */
async function saveCloudOrder(orderData) {
  db = getSupabaseClient();
  if (!db) return { success: false, error: "No database client" };

  try {
    const { data, error } = await db.from("orders").insert([
      {
        order_id: orderData.orderId,
        client_name: orderData.clientName,
        client_phone: orderData.clientPhone,
        client_address: orderData.clientAddress || "",
        city: orderData.city || "",
        pincode: orderData.pincode || "",
        payment_method: orderData.paymentMethod || "WhatsApp Direct",
        notes: orderData.notes || "",
        items: orderData.items || [],
        subtotal: orderData.subtotal || orderData.total,
        discount: orderData.discount || 0,
        total: orderData.total,
        status: orderData.status || "Transmitted"
      }
    ]);

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.warn("Save cloud order note (table might need creation in SQL editor):", err.message || err);
    return { success: false, error: err.message || String(err) };
  }
}

/**
 * Fetch Client Orders from Supabase 'orders' table
 */
async function fetchCloudOrders() {
  db = getSupabaseClient();
  if (!db) return null;

  try {
    const { data, error } = await db
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Fetch cloud orders note:", err.message || err);
    return null;
  }
}

// Run initial offline catalog check
initializeCatalog();
