import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
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

      // Product
      addToCart: 'Add to Cart',
      buyNow: 'Buy Now',
      inStock: 'In Stock',
      outOfStock: 'Out of Stock',
      price: 'Price',
      category: 'Category',
      description: 'Description',
      availability: 'Availability',
      recommendations: 'Recommended for You',

      // Auth
      email: 'Email',
      password: 'Password',
      fullName: 'Full Name',
      phoneNumber: 'Phone Number',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",

      // Common
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

      // Status
      pending: 'Pending',
      confirmed: 'Confirmed',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      approved: 'Approved',
      rejected: 'Rejected',

      // Messages
      sendMessage: 'Send Message',
      typeMessage: 'Type a message...',
      noMessages: 'No messages yet',

      // Platform
      platformName: 'Kombolcha Showcase',
      tagline: 'AI-Powered Factory Products Platform',
    },
  },
  am: {
    translation: {
      // Navigation
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

      // Product
      addToCart: 'ወደ ጋሪ ጨምር',
      buyNow: 'አሁን ግዛ',
      inStock: 'አለ',
      outOfStock: 'የለም',
      price: 'ዋጋ',
      category: 'ምድብ',
      description: 'መግለጫ',
      availability: 'ተገኝነት',
      recommendations: 'ለእርስዎ የሚመከሩ',

      // Auth
      email: 'ኢሜይል',
      password: 'የይለፍ ቃል',
      fullName: 'ሙሉ ስም',
      phoneNumber: 'ስልክ ቁጥር',
      signIn: 'ግባ',
      signUp: 'ተመዝገብ',
      alreadyHaveAccount: 'አካውንት አለዎት?',
      dontHaveAccount: 'አካውንት የለዎትም?',

      // Common
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

      // Status
      pending: 'በመጠባበቅ ላይ',
      confirmed: 'ተረጋግጧል',
      shipped: 'ተልኳል',
      delivered: 'ደርሷል',
      cancelled: 'ተሰርዟል',
      approved: 'ጸድቋል',
      rejected: 'ተቀባይነት አላገኘም',

      // Messages
      sendMessage: 'መልዕክት ላክ',
      typeMessage: 'መልዕክት ይፃፉ...',
      noMessages: 'ምንም መልዕክቶች የሉም',

      // Platform
      platformName: 'ቆምቦልቻ ሾውኬዝ',
      tagline: 'AI-ሃይል ያለው የፋብሪካ ምርቶች መድረክ',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
