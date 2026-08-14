import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // ── Navigation ──────────────────────────────────────────────
      home: 'Home',
      products: 'Products',
      factories: 'Factories',
      cart: 'Cart',
      orders: 'Orders',
      messages: 'Messages',
      dashboard: 'Dashboard',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      profile: 'Profile',

      // ── Home page — Hero ────────────────────────────────────────
      hero_eyebrow: 'Kombolcha Industrial Platform',
      hero_headline_line1: "Ethiopia's Industrial",
      hero_headline_line2: 'Marketplace',
      hero_sub: 'Direct access to verified factories across textiles, steel, food processing, and construction. Powered by AI recommendations and built for serious procurement.',
      hero_cta_browse: 'Explore Products',
      hero_cta_register: 'Create Account',
      hero_scroll: 'Scroll',

      // ── Home page — Stats ───────────────────────────────────────
      stat_suppliers: 'Verified Suppliers',
      stat_products: 'Listed Products',
      stat_sectors: 'Industry Sectors',
      stat_buyers: 'Active Buyers',

      // ── Home page — Sectors ─────────────────────────────────────
      sectors_eyebrow: 'Industry Sectors',
      sectors_heading: 'Six sectors.',
      sectors_heading2: 'One platform.',
      sectors_link: 'Browse full catalog',
      sector_textiles: 'Textiles & Apparel',
      sector_steel: 'Steel & Metals',
      sector_food: 'Food Processing',
      sector_construction: 'Construction',
      sector_packaging: 'Packaging',
      sector_chemical: 'Chemical & Oil',
      sector_textiles_count: '340+ products',
      sector_steel_count: '210+ products',
      sector_food_count: '180+ products',
      sector_construction_count: '290+ products',
      sector_packaging_count: '155+ products',
      sector_chemical_count: '120+ products',

      // ── Home page — How It Works ────────────────────────────────
      how_eyebrow: 'How It Works',
      how_heading: 'From search to delivery in three steps',
      step1_title: 'Discover',
      step1_desc: 'Search and filter across verified Kombolcha factories and their full product catalog.',
      step2_title: 'Connect',
      step2_desc: 'Message suppliers directly and receive AI-powered recommendations tailored to your needs.',
      step3_title: 'Order',
      step3_desc: 'Place orders, track delivery status, and manage your procurement from one dashboard.',

      // ── Home page — Trust ───────────────────────────────────────
      trust_eyebrow: 'Why Kombolcha Showcase',
      trust_heading: 'Built for industrial procurement,',
      trust_heading2: 'not casual shopping',
      trust_item1: 'All suppliers are verified and locally registered',
      trust_item2: 'AI recommendations adapt to your order history',
      trust_item3: 'Secure payment processing with Chapa',
      trust_item4: 'Dedicated support for factory and buyer accounts',
      trust_cta_register: 'Register as Buyer',
      trust_cta_factories: 'View Factories',
      trust_badge_label: 'Active buyers',

      // ── Home page — CTA band ────────────────────────────────────
      cta_heading: 'Ready to source from Kombolcha?',
      cta_sub: "Join thousands of buyers already working with Ethiopia's most trusted industrial suppliers.",
      cta_start: 'Get Started Free',
      cta_browse: 'Browse Without Login',

      // ── Auth — Login ────────────────────────────────────────────
      login_title: 'Welcome back',
      login_subtitle: 'Sign in to your account.',
      login_email_label: 'Email',
      login_email_placeholder: 'you@example.com',
      login_password_label: 'Password',
      login_password_placeholder: '••••••••',
      login_submit: 'Sign In',
      login_submitting: 'Signing in...',
      login_no_account: "Don't have an account?",
      login_register_link: 'Register here',
      login_err_email_required: 'Email is required',
      login_err_email_invalid: 'Please enter a valid email address',
      login_err_password_required: 'Password is required',
      login_err_email_wrong: 'No account found with this email',
      login_err_password_wrong: 'Incorrect password',

      // ── Auth — Register ─────────────────────────────────────────
      register_title: 'Create an account',
      register_subtitle: 'Join the Kombolcha Showcase in your buyer or factory role.',
      register_role_buyer: '🛒 Buyer',
      register_role_factory: '🏭 Factory',
      register_fullname_label: 'Full Name',
      register_fullname_placeholder: 'Abebe Kebede',
      register_email_label: 'Email',
      register_phone_label: 'Phone Number',
      register_phone_placeholder: '+251911000000',
      register_password_label: 'Password',
      register_password_placeholder: 'Min. 6 characters, include a number',
      register_address_label: 'Address',
      register_address_placeholder: 'Addis Ababa, Ethiopia',
      register_factory_name_label: 'Factory Name',
      register_factory_name_placeholder: 'My Factory Name',
      register_location_label: 'Location',
      register_location_placeholder: 'Kombolcha Industrial Zone',
      register_factory_warning: '⚠️ Factory accounts require admin approval before you can list products.',
      register_submit: 'Create Account',
      register_submitting: 'Creating account...',
      register_have_account: 'Already have an account?',
      register_login_link: 'Sign in',
      register_success: 'Registration successful!',
      register_password_good: 'Password looks good ✓',

      // ── Products / Cart / Common ─────────────────────────────────
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      price: 'Price',
      category: 'Category',
      description: 'Description',
      availability: 'Availability',
      recommendations: 'Recommended for You',
      search: 'Search',
      filter: 'Filter',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      loading: 'Loading...',
      noResults: 'No results found',
      total: 'Total',
      quantity: 'Quantity',
      status: 'Status',
      date: 'Date',
      actions: 'Actions',

      // ── Order statuses ───────────────────────────────────────────
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      approved: 'Approved',
      rejected: 'Rejected',

      // ── Messages ─────────────────────────────────────────────────
      sendMessage: 'Send Message',
      typeMessage: 'Type a message...',
      noMessages: 'No messages yet',

      // ── Footer ───────────────────────────────────────────────────
      footer_tagline: 'AI-Powered Factory Products',
      footer_desc: "Connecting Kombolcha's industrial factories with buyers through an intelligent digital marketplace. Discover textiles, steel, food products, and construction materials.",
      footer_quick_links: 'Quick Links',
      footer_browse_products: 'Browse Products',
      footer_our_factories: 'Our Factories',
      footer_contact: 'Contact',
      footer_built_with: 'Built with React, Node.js & AI',

      // ── Products Page ────────────────────────────────────────────
      products_title: 'Products',
      products_subtitle_count: '{{count}} products available',
      products_subtitle_default: 'Browse all factory products',
      products_search_placeholder: 'Search products...',
      products_search_btn: 'Search',
      products_filters_btn: 'Filters',
      products_clear_btn: 'Clear',
      products_filter_category: 'Category',
      products_filter_all_categories: 'All Categories',
      products_filter_min_price: 'Min Price (ETB)',
      products_filter_max_price: 'Max Price (ETB)',
      products_not_found_title: 'No products found',
      products_not_found_sub: 'Try adjusting your search or filters',
      products_clear_filters: 'Clear Filters',
      products_page_of: 'Page {{page}} of {{total}}',
      products_previous: 'Previous',
      products_next: 'Next',

      // ── Product Card ─────────────────────────────────────────────
      card_in_stock: 'In Stock',
      card_out_of_stock: 'Out of Stock',
      card_no_factory: 'No Factory',
      card_add_to_cart_login: 'Please login as a buyer to add items to cart',
      card_added: 'Added to cart',

      // ── Product Detail Page ──────────────────────────────────────
      detail_back: 'Products',
      detail_not_found: 'Product not found',
      detail_back_to_products: 'Back to Products',
      detail_stock_qty: 'Stock Quantity',
      detail_units: 'units',
      detail_description: 'Description',
      detail_add_to_cart: 'Add to Cart',
      detail_contact_seller: 'Contact Seller',
      detail_login_buyer: 'Please login as a buyer',
      detail_login_contact: 'Please login to contact the seller',
      detail_seller_unavailable: 'Seller information unavailable',
      detail_admin_seller: 'Admin Seller',

      // ── Factories Page ───────────────────────────────────────────
      factories_title: 'Our Factories',
      factories_subtitle: "Discover Kombolcha's industrial partners",
      factories_products_count: '{{count}} products',
      factories_view_products: 'View Products',

      // ── Factory Detail Page ──────────────────────────────────────
      factory_back: 'Back to Factories',
      factory_not_found: 'Factory not found',
      factory_products_from: 'Products from {{name}}',
      factory_no_products: 'No products available',

      // ── Platform ─────────────────────────────────────────────────
      platformName: 'Kombolcha Showcase',
      tagline: 'AI-Powered Factory Products Platform',
    },
  },

  am: {
    translation: {
      // ── Navigation ──────────────────────────────────────────────
      home: 'መነሻ',
      products: 'ምርቶች',
      factories: 'ፋብሪካዎች',
      cart: 'ጋሪ',
      orders: 'ትዕዛዞች',
      messages: 'መልዕክቶች',
      dashboard: 'ዳሽቦርድ',
      login: 'ግባ',
      register: 'ተመዝገብ',
      logout: 'ውጣ',
      profile: 'መገለጫ',

      // ── Home page — Hero ────────────────────────────────────────
      hero_eyebrow: 'የቆምቦልቻ ኢንዱስትሪ መድረክ',
      hero_headline_line1: 'የኢትዮጵያ የኢንዱስትሪ',
      hero_headline_line2: 'ገበያ',
      hero_sub: 'በጨርቃጨርቅ፣ ብረታ ብረት፣ ምግብ ማቀነባበር እና ግንባታ ዘርፎች ውስጥ ወደ ተረጋገጡ ፋብሪካዎች ቀጥተኛ መዳረሻ። በ AI ምክሮች የሚሰራ እና ለከባድ ግዥ የተሰራ።',
      hero_cta_browse: 'ምርቶችን ያስሱ',
      hero_cta_register: 'አካውንት ፍጠር',
      hero_scroll: 'ወደ ታች',

      // ── Home page — Stats ───────────────────────────────────────
      stat_suppliers: 'የተረጋገጡ አቅራቢዎች',
      stat_products: 'ተዘርዝረው ያሉ ምርቶች',
      stat_sectors: 'የኢንዱስትሪ ዘርፎች',
      stat_buyers: 'ንቁ ገዥዎች',

      // ── Home page — Sectors ─────────────────────────────────────
      sectors_eyebrow: 'የኢንዱስትሪ ዘርፎች',
      sectors_heading: 'ስድስት ዘርፎች።',
      sectors_heading2: 'አንድ መድረክ።',
      sectors_link: 'ሙሉ ካታሎጉን ያስሱ',
      sector_textiles: 'ጨርቃጨርቅ እና አልባሳት',
      sector_steel: 'ብረት እና ብረታ ብረቶች',
      sector_food: 'የምግብ ማቀነባበሪያ',
      sector_construction: 'ግንባታ',
      sector_packaging: 'ማሸጊያ',
      sector_chemical: 'ኬሚካልና ዘይት',
      sector_textiles_count: '340+ ምርቶች',
      sector_steel_count: '210+ ምርቶች',
      sector_food_count: '180+ ምርቶች',
      sector_construction_count: '290+ ምርቶች',
      sector_packaging_count: '155+ ምርቶች',
      sector_chemical_count: '120+ ምርቶች',

      // ── Home page — How It Works ────────────────────────────────
      how_eyebrow: 'እንዴት ይሰራል',
      how_heading: 'ከፍለጋ እስከ ማስረከብ በሶስት ደረጃዎች',
      step1_title: 'ፈልግ',
      step1_desc: 'በቆምቦልቻ ውስጥ በተረጋገጡ ፋብሪካዎች እና ሙሉ ምርት ካታሎጋቸው ውስጥ ፈልጉ እና አጣሩ።',
      step2_title: 'ተገናኝ',
      step2_desc: 'ከአቅራቢዎች ጋር ቀጥታ ይጻፉ እና ለፍላጎቶችዎ የተስማሙ AI-ሃይል ያላቸው ምክሮችን ይቀበሉ።',
      step3_title: 'ትዕዛዝ ስጥ',
      step3_desc: 'ትዕዛዞችን ያስቀምጡ፣ የማድረሻ ሁኔታን ይከታተሉ እና ግዥዎን ከአንድ ዳሽቦርድ ያስተዳድሩ።',

      // ── Home page — Trust ───────────────────────────────────────
      trust_eyebrow: 'ለምን ቆምቦልቻ ሾውኬዝ',
      trust_heading: 'ለኢንዱስትሪ ግዥ የተሰራ፣',
      trust_heading2: 'ለተራ ግዢ አይደለም',
      trust_item1: 'ሁሉም አቅራቢዎች ተረጋግጠው የምዝገባ ሰርተፍኬት አላቸው',
      trust_item2: 'AI ምክሮች ከትዕዛዝ ታሪክዎ ጋር ይላሙ',
      trust_item3: 'በቻፓ በኩል ደህንነቱ የተጠበቀ ክፍያ',
      trust_item4: 'ለፋብሪካ እና ለገዥ አካውንቶች የተዘጋጀ ድጋፍ',
      trust_cta_register: 'እንደ ገዥ ይመዝገቡ',
      trust_cta_factories: 'ፋብሪካዎችን ይመልከቱ',
      trust_badge_label: 'ንቁ ገዥዎች',

      // ── Home page — CTA band ────────────────────────────────────
      cta_heading: 'ከቆምቦልቻ ለማቅረብ ዝግጁ ነዎት?',
      cta_sub: 'ከኢትዮጵያ በጣም ታማኝ ኢንዱስትሪ አቅራቢዎች ጋር ቀድሞ የሚሰሩ በሺዎች የሚቆጠሩ ገዥዎችን ይቀላቀሉ።',
      cta_start: 'በነጻ ጀምር',
      cta_browse: 'ያለ ግባ ያስሱ',

      // ── Auth — Login ────────────────────────────────────────────
      login_title: 'እንኳን ደህና መጡ',
      login_subtitle: 'ወደ አካውንትዎ ይግቡ።',
      login_email_label: 'ኢሜይል',
      login_email_placeholder: 'you@example.com',
      login_password_label: 'የይለፍ ቃል',
      login_password_placeholder: '••••••••',
      login_submit: 'ግባ',
      login_submitting: 'በመግባት ላይ...',
      login_no_account: 'አካውንት የለዎትም?',
      login_register_link: 'እዚህ ይመዝገቡ',
      login_err_email_required: 'ኢሜይል ያስፈልጋል',
      login_err_email_invalid: 'እባክዎ ትክክለኛ ኢሜይል አድራሻ ያስገቡ',
      login_err_password_required: 'የይለፍ ቃል ያስፈልጋል',
      login_err_email_wrong: 'በዚህ ኢሜይል ምንም አካውንት አልተገኘም',
      login_err_password_wrong: 'ትክክለኛ ያልሆነ የይለፍ ቃል',

      // ── Auth — Register ─────────────────────────────────────────
      register_title: 'አካውንት ፍጠር',
      register_subtitle: 'በቆምቦልቻ ሾውኬዝ ውስጥ እንደ ገዥ ወይም ፋብሪካ ይቀላቀሉ።',
      register_role_buyer: '🛒 ገዥ',
      register_role_factory: '🏭 ፋብሪካ',
      register_fullname_label: 'ሙሉ ስም',
      register_fullname_placeholder: 'አበበ ከበደ',
      register_email_label: 'ኢሜይል',
      register_phone_label: 'ስልክ ቁጥር',
      register_phone_placeholder: '+251911000000',
      register_password_label: 'የይለፍ ቃል',
      register_password_placeholder: 'ቢያንስ 6 ቁምፊዎች፣ ቁጥር ይጨምሩ',
      register_address_label: 'አድራሻ',
      register_address_placeholder: 'አዲስ አበባ፣ ኢትዮጵያ',
      register_factory_name_label: 'የፋብሪካ ስም',
      register_factory_name_placeholder: 'የፋብሪካዬ ስም',
      register_location_label: 'አካባቢ',
      register_location_placeholder: 'ቆምቦልቻ ኢንዱስትሪ ዞን',
      register_factory_warning: '⚠️ የፋብሪካ አካውንቶች ምርቶችን ከዘረዘሩ በፊት የአስተዳዳሪ ፈቃድ ያስፈልጋቸዋል።',
      register_submit: 'አካውንት ፍጠር',
      register_submitting: 'አካውንት በመፍጠር ላይ...',
      register_have_account: 'አካውንት አለዎት?',
      register_login_link: 'ይግቡ',
      register_success: 'ምዝገባ ተሳክቷል!',
      register_password_good: 'የይለፍ ቃሉ ጥሩ ነው ✓',

      // ── Products / Cart / Common ─────────────────────────────────
      addToCart: 'ወደ ጋሪ ጨምር',
      buyNow: 'አሁን ግዛ',
      inStock: 'አለ',
      outOfStock: 'የለም',
      price: 'ዋጋ',
      category: 'ምድብ',
      description: 'መግለጫ',
      availability: 'ተገኝነት',
      recommendations: 'ለእርስዎ የሚመከሩ',
      search: 'ፈልግ',
      filter: 'አጣራ',
      save: 'አስቀምጥ',
      cancel: 'ሰርዝ',
      delete: 'ሰርዝ',
      edit: 'አርትዕ',
      view: 'ይመልከቱ',
      loading: 'በመጫን ላይ...',
      noResults: 'ምንም ውጤት አልተገኘም',
      total: 'ጠቅላላ',
      quantity: 'ብዛት',
      status: 'ሁኔታ',
      date: 'ቀን',
      actions: 'ድርጊቶች',

      // ── Order statuses ───────────────────────────────────────────
      pending: 'በመጠባበቅ ላይ',
      confirmed: 'ተረጋግጧል',
      shipped: 'ተልኳል',
      delivered: 'ደርሷል',
      cancelled: 'ተሰርዟል',
      approved: 'ጸድቋል',
      rejected: 'ተቀባይነት አላገኘም',

      // ── Messages ─────────────────────────────────────────────────
      sendMessage: 'መልዕክት ላክ',
      typeMessage: 'መልዕክት ይፃፉ...',
      noMessages: 'ምንም መልዕክቶች የሉም',

      // ── Footer ───────────────────────────────────────────────────
      footer_tagline: 'AI-ሃይል ያለው የፋብሪካ ምርቶች',
      footer_desc: 'የቆምቦልቻን ኢንዱስትሪ ፋብሪካዎች ከገዥዎች ጋር በዲጂታል ገበያ ያገናኛል። ጨርቃጨርቅ፣ ብረት፣ የምግብ ምርቶች እና የግንባታ ቁሶችን ያስሱ።',
      footer_quick_links: 'ፈጣን አገናኞች',
      footer_browse_products: 'ምርቶችን ያስሱ',
      footer_our_factories: 'ፋብሪካዎቻችን',
      footer_contact: 'አድራሻ',
      footer_built_with: 'React፣ Node.js እና AI በመጠቀም የተሰራ',

      // ── Products Page ────────────────────────────────────────────
      products_title: 'ምርቶች',
      products_subtitle_count: '{{count}} ምርቶች አሉ',
      products_subtitle_default: 'ሁሉንም የፋብሪካ ምርቶች ያስሱ',
      products_search_placeholder: 'ምርቶችን ፈልግ...',
      products_search_btn: 'ፈልግ',
      products_filters_btn: 'አጣሪ',
      products_clear_btn: 'አጥፋ',
      products_filter_category: 'ምድብ',
      products_filter_all_categories: 'ሁሉም ምድቦች',
      products_filter_min_price: 'አነስተኛ ዋጋ (ብር)',
      products_filter_max_price: 'ከፍተኛ ዋጋ (ብር)',
      products_not_found_title: 'ምንም ምርት አልተገኘም',
      products_not_found_sub: 'ፍለጋዎን ወይም አጣሪዎን ያስተካክሉ',
      products_clear_filters: 'አጣሪዎችን አጥፋ',
      products_page_of: 'ገጽ {{page}} ከ {{total}}',
      products_previous: 'ቀዳሚ',
      products_next: 'ቀጣይ',

      // ── Product Card ─────────────────────────────────────────────
      card_in_stock: 'አለ',
      card_out_of_stock: 'የለም',
      card_no_factory: 'ፋብሪካ የለም',
      card_add_to_cart_login: 'እቃዎችን ወደ ጋሪ ለመጨምር እንደ ገዥ ይግቡ',
      card_added: 'ወደ ጋሪ ተጨምሯል',

      // ── Product Detail Page ──────────────────────────────────────
      detail_back: 'ምርቶች',
      detail_not_found: 'ምርቱ አልተገኘም',
      detail_back_to_products: 'ወደ ምርቶች ተመለስ',
      detail_stock_qty: 'የክምችት ብዛት',
      detail_units: 'ዩኒቶች',
      detail_description: 'መግለጫ',
      detail_add_to_cart: 'ወደ ጋሪ ጨምር',
      detail_contact_seller: 'ሻጩን ያነጋግሩ',
      detail_login_buyer: 'እባክዎ እንደ ገዥ ይግቡ',
      detail_login_contact: 'ሻጩን ለማነጋገር እባክዎ ይግቡ',
      detail_seller_unavailable: 'የሻጭ መረጃ አይገኝም',
      detail_admin_seller: 'አስተዳዳሪ ሻጭ',

      // ── Factories Page ───────────────────────────────────────────
      factories_title: 'ፋብሪካዎቻችን',
      factories_subtitle: 'የቆምቦልቻ የኢንዱስትሪ አጋሮችን ያስሱ',
      factories_products_count: '{{count}} ምርቶች',
      factories_view_products: 'ምርቶችን ይመልከቱ',

      // ── Factory Detail Page ──────────────────────────────────────
      factory_back: 'ወደ ፋብሪካዎች ተመለስ',
      factory_not_found: 'ፋብሪካው አልተገኘም',
      factory_products_from: 'ከ {{name}} ምርቶች',
      factory_no_products: 'ምንም ምርቶች አልተገኙም',

      // ── Platform ─────────────────────────────────────────────────
      platformName: 'ቆምቦልቻ ሾውኬዝ',
      tagline: 'AI-ሃይል ያለው የፋብሪካ ምርቶች መድረክ',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

// Persist language choice across page refreshes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('lang', lng);
});

export default i18n;
