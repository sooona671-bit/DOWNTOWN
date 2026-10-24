const locationPromotionFallback = {
  src: '/images/locations/nepal-himalaya.jpg',
  alt: 'Himalayan landscape in Nepal',
  className: 'nepal',
};

const locationPromotions = {
  Kalaiya: {
    src: '/images/locations/kalaiya.jpg',
    alt: 'Gadhimai Temple near Kalaiya in Bara',
    className: 'kalaiya',
  },
  Birgunj: {
    src: '/images/locations/birgunj.jpg',
    alt: 'Ghantaghar clock tower in Birgunj',
    className: 'birgunj',
  },
  Kathmandu: {
    src: '/images/locations/kathmandu.jpg',
    alt: 'Historic pagoda architecture in Kathmandu Durbar Square',
    className: 'kathmandu',
  },
  Pokhara: {
    src: '/images/locations/pokhara.jpg',
    alt: 'Phewa Lake at sunset in Pokhara',
    className: 'pokhara',
  },
  Bharatpur: {
    src: '/images/locations/bharatpur.jpg',
    alt: 'Sunset on the Rapti River at Chitwan National Park near Bharatpur',
    className: 'bharatpur',
  },
  Biratnagar: {
    src: '/images/locations/biratnagar.jpg',
    alt: 'Aerial view of Biratnagar',
    className: 'biratnagar',
  },
  Butwal: {
    src: '/images/locations/butwal.jpg',
    alt: 'Siddhababa Temple in Butwal',
    className: 'butwal',
  },
  Janakpur: {
    src: '/images/locations/janakpur.jpg',
    alt: 'Janaki Temple in Janakpur',
    className: 'janakpur',
  },
  Hetauda: {
    src: '/images/locations/hetauda.jpg',
    alt: 'Makwanpur Gadhi heritage ruins near Hetauda',
    className: 'hetauda',
  },
  Dharan: {
    src: '/images/locations/dharan.jpg',
    alt: 'Budhasubba Temple in Dharan',
    className: 'dharan',
  },
};

const getLocationPromotion = (city) => locationPromotions[city] ?? locationPromotionFallback;

export const imageSlots = {
  brand: {
    logo: '/images/brand/downtown-emblem.png',
  },
  opening: {
    splashBackgroundClass: 'splash-screen-background',
    splashLogo: '/images/brand/downtown-emblem.png',
    welcome: '/images/opening/welcome-food.png',
  },
  home: {
    promotion: '/images/home/promo-hero.png',
  },
  offers: {
    banner: '/images/offers/special-offer.jpg',
  },
  categories: (id) => `/images/categories/${id}.svg`,
  restaurantCover: (id) => `/images/restaurants/covers/${id}.jpg`,
  restaurantLogo: (id) => `/images/restaurants/logos/${id}.svg`,
  featuredRestaurant: (id) => `/images/featured-restaurants/${id}.jpg`,
  food: (id) => `/images/food/${id}.jpg`,
  popularFood: (id) => `/images/popular-food/${id}.jpg`,
  cityPromotion: getLocationPromotion,
  emptyState: '/images/placeholders/empty-state.svg',
  profile: {
    fallback: '/images/placeholders/profile.svg',
  },
  fallbacks: {
    food: '/images/placeholders/food.svg',
    restaurant: '/images/placeholders/restaurant.svg',
    restaurantLogo: '/images/placeholders/restaurant-logo.svg',
    location: '/images/placeholders/location.svg',
  },
};
