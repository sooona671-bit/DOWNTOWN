import { StrictMode, useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { ArrowRight, ChevronDown, Heart, House, MapPin, ReceiptText, Search, ShoppingBag, Sparkles, UserRound } from 'lucide-react';
import ContentImage from './components/ContentImage.jsx';
import ProfilePhoto from './components/ProfilePhoto.jsx';
import ProfileScreen from './components/ProfileScreen.jsx';
import { AppHeader, ScreenFrame, ViewportScroll } from './components/ScreenFrame.jsx';
import { beginGoogleSignIn, endAuthSession, getAuthenticatedUser, isAuthConfigured, updateAuthenticatedProfile } from './auth-api.js';
import { imageSlots } from './image-assets.js';

const locations = ['Kalaiya', 'Birgunj', 'Kathmandu', 'Pokhara', 'Bharatpur', 'Biratnagar', 'Butwal', 'Janakpur', 'Hetauda', 'Dharan'];
const categories = [['pizza', 'Pizza'], ['burger', 'Burger'], ['drinks', 'Cold Drinks']];
const restaurants = [
  { id: 'firestone-pizza', name: 'Firestone Pizza', area: 'Boudha, Kathmandu', cuisine: 'Pizza · Italian', eta: '35–45 min', rating: '4.6', delivery: 69, image: imageSlots.restaurantCover('firestone-pizza'), logo: imageSlots.restaurantLogo('firestone-pizza'), featured: true },
  { id: 'kathmandu-burger-co', name: 'Kathmandu Burger Co.', area: 'Patan, Lalitpur', cuisine: 'Burgers · Grill', eta: '20–30 min', rating: '4.6', delivery: 49, image: imageSlots.restaurantCover('kathmandu-burger-co'), logo: imageSlots.restaurantLogo('kathmandu-burger-co'), featured: true },
  { id: 'rooftop-refresh', name: 'Rooftop Refresh', area: 'Lakeside, Pokhara', cuisine: 'Cold Drinks · Cafe', eta: '15–25 min', rating: '4.7', delivery: 39, image: imageSlots.restaurantCover('rooftop-refresh'), logo: imageSlots.restaurantLogo('rooftop-refresh'), featured: true }
];
const item = (id, restaurantId, name, category, price, tag, description, addons = []) => ({ id, restaurantId, name, category, price, tag, description, image: imageSlots.food(id), addons, isVeg: isVegName(name, category) });
const isVegName = (name, category) => category === 'drinks' || (category === 'burger' ? /(paneer|mushroom|vegan|bean)/i.test(name) : !/(chicken|pepperoni|buff|prosciutto|salami|lamb|beef|teriyaki|bbq|diavola)/i.test(name));
const products = [
  item('spicy-burger-combo', 'kathmandu-burger-co', 'Spicy Burger Combo', 'burger', 599, 'Limited Time Offer', 'Crispy spicy chicken burger with golden fries and a chilled cola.', [{ name: 'Extra Fries', price: 90 }]),
  item('margherita', 'firestone-pizza', 'Margherita Pizza', 'pizza', 649, 'Classic', 'Stone-baked tomato, mozzarella, basil and olive oil.', [{ name: 'Extra Cheese', price: 100 }]),
  item('pepperoni-pizza', 'firestone-pizza', 'Pepperoni Pizza', 'pizza', 749, 'Best Seller', 'Crisp base layered with pepperoni, mozzarella and oregano.'),
  item('tandoori-pizza', 'firestone-pizza', 'Tandoori Chicken Pizza', 'pizza', 799, 'Smoky', 'Tandoori chicken, peppers, onion and mozzarella with mint drizzle.'),
  item('paneer-pizza', 'firestone-pizza', 'Paneer Tikka Pizza', 'pizza', 729, 'Local Favourite', 'Tikka paneer, roasted peppers, onion and coriander on a cheesy base.'),
  item('mushroom-pizza', 'firestone-pizza', 'Mushroom Pizza', 'pizza', 699, 'Fresh', 'Garlic mushrooms, herbs, mozzarella and cracked black pepper.'),
  item('four-cheese-pizza', 'firestone-pizza', 'Four Cheese Pizza', 'pizza', 849, 'Cheesy', 'Mozzarella, cheddar, parmesan and blue cheese with chilli honey.'),
  item('bbq-chicken-pizza', 'firestone-pizza', 'BBQ Chicken Pizza', 'pizza', 779, 'Smoky', 'Barbecue chicken, red onion, sweet corn and smoky sauce.'),
  item('spinach-pizza', 'firestone-pizza', 'Spinach Corn Pizza', 'pizza', 679, 'Value', 'Creamy spinach, sweet corn, onion and mozzarella.'),
  item('buff-pizza', 'firestone-pizza', 'Buff Chilli Pizza', 'pizza', 819, 'Nepal Special', 'Spiced buff, green chilli, onion and smoked cheese.'),
  item('garlic-pizza', 'firestone-pizza', 'Roasted Garlic Pizza', 'pizza', 599, 'Light Bite', 'Roasted garlic, herbs, tomato and mozzarella.'),
  item('prosciutto-pizza', 'firestone-pizza', 'Prosciutto Pizza', 'pizza', 899, 'Premium', 'Thin-crust pizza with prosciutto, rocket and parmesan.'),
  item('pesto-pizza', 'firestone-pizza', 'Pesto Tomato Pizza', 'pizza', 719, 'Green Fresh', 'Basil pesto, cherry tomatoes, mozzarella and toasted pine nuts.'),
  item('hawaiian-pizza', 'firestone-pizza', 'Pineapple Chicken Pizza', 'pizza', 769, 'Sweet & Savoury', 'Roasted chicken, pineapple, mozzarella and chilli flakes.'),
  item('diavola-pizza', 'firestone-pizza', 'Diavola Pizza', 'pizza', 829, 'Spicy', 'Spicy salami, chilli, tomato and mozzarella on a blistered crust.'),
  item('corn-pizza', 'firestone-pizza', 'Sweet Corn Pizza', 'pizza', 629, 'Value', 'Sweet corn, peppers, onion and mozzarella with herb oil.'),
  item('nepalese-pizza', 'firestone-pizza', 'Kathmandu Chilli Pizza', 'pizza', 789, 'DOWNTOWN Special', 'Green chilli, tomato relish, chicken and fresh local herbs.'),
  item('classic-burger', 'kathmandu-burger-co', 'Classic Burger', 'burger', 329, 'Classic', 'Grilled beef patty, lettuce, tomato, onion and house sauce.'),
  item('cheese-burger', 'kathmandu-burger-co', 'Classic Cheese Burger', 'burger', 399, 'Best Seller', 'Grilled beef patty, cheddar, lettuce, tomato and house sauce.'),
  item('spicy-chicken-burger', 'kathmandu-burger-co', 'Spicy Chicken Burger', 'burger', 429, 'Spicy', 'Crispy chicken, jalapeño, slaw and smoky chilli mayo.'),
  item('double-burger', 'kathmandu-burger-co', 'Double Stack Burger', 'burger', 549, 'Best Seller', 'Two grilled patties, double cheese, pickles and burger sauce.'),
  item('buff-burger', 'kathmandu-burger-co', 'Buff Burger', 'burger', 379, 'Local Favourite', 'Spiced buff patty, tomato relish, greens and cheddar.'),
  item('paneer-burger', 'kathmandu-burger-co', 'Paneer Crunch Burger', 'burger', 399, 'Veg Favourite', 'Crispy paneer, lettuce, roasted peppers and mint chutney.'),
  item('mushroom-burger', 'kathmandu-burger-co', 'Wild Mushroom Burger', 'burger', 449, 'Fresh', 'Garlic mushroom patty, caramelised onion and Swiss cheese.'),
  item('bbq-burger', 'kathmandu-burger-co', 'BBQ Smokehouse Burger', 'burger', 499, 'Smoky', 'Grilled beef, crispy onion, barbecue glaze and smoked cheddar.'),
  item('crispy-burger', 'kathmandu-burger-co', 'Crispy Chicken Burger', 'burger', 419, 'Crispy', 'Golden chicken fillet, cabbage slaw and lemon pepper mayo.'),
  item('chilli-burger', 'kathmandu-burger-co', 'Chilli Cheese Burger', 'burger', 469, 'Hot', 'Beef patty, green chilli relish, melted cheese and pickles.'),
  item('avocado-burger', 'kathmandu-burger-co', 'Avocado Chicken Burger', 'burger', 529, 'Premium', 'Grilled chicken, avocado, greens and coriander lime sauce.'),
  item('lamb-burger', 'kathmandu-burger-co', 'Herb Lamb Burger', 'burger', 579, 'Chef Special', 'Herb-seasoned lamb patty, feta, greens and tomato relish.'),
  item('mozzarella-burger', 'kathmandu-burger-co', 'Mozzarella Beef Burger', 'burger', 489, 'Cheesy', 'Beef patty, mozzarella, basil, tomato and garlic aioli.'),
  item('jalapeno-burger', 'kathmandu-burger-co', 'Jalapeño Smash Burger', 'burger', 459, 'Spicy', 'Smash beef patty, jalapeño, cheddar and smoky house sauce.'),
  item('teriyaki-burger', 'kathmandu-burger-co', 'Teriyaki Chicken Burger', 'burger', 439, 'New', 'Grilled chicken, teriyaki glaze, sesame slaw and greens.'),
  item('truffle-burger', 'kathmandu-burger-co', 'Truffle Mushroom Burger', 'burger', 599, 'Premium', 'Mushroom patty, truffle mayo, Swiss cheese and rocket.'),
  item('vegan-burger', 'kathmandu-burger-co', 'Himalayan Bean Burger', 'burger', 389, 'Plant Based', 'Crispy bean patty, greens, tomato and roasted sesame spread.'),
  item('coke', 'rooftop-refresh', 'Coca-Cola', 'drinks', 120, 'Classic', 'Chilled Coca-Cola served cold for the perfect burger pairing.'),
  item('sprite', 'rooftop-refresh', 'Sprite', 'drinks', 120, 'Refreshing', 'Crisp lemon-lime soda served chilled.'),
  item('fanta', 'rooftop-refresh', 'Fanta Orange', 'drinks', 120, 'Fruity', 'Bright, bubbly orange soda served over ice.'),
  item('pepsi', 'rooftop-refresh', 'Pepsi', 'drinks', 120, 'Classic', 'Chilled cola with a bold, refreshing taste.'),
  item('iced-tea', 'rooftop-refresh', 'Lemon Iced Tea', 'drinks', 180, 'Fresh', 'Brewed black tea, lemon and ice with a light sweetness.'),
  item('peach-tea', 'rooftop-refresh', 'Peach Iced Tea', 'drinks', 190, 'Fruity', 'Cold brewed tea with ripe peach and a citrus finish.'),
  item('sparkling-water', 'rooftop-refresh', 'Sparkling Water', 'drinks', 100, 'Light', 'Cold sparkling mineral water with a clean finish.'),
  item('lemon-soda', 'rooftop-refresh', 'Fresh Lemon Soda', 'drinks', 160, 'Local Favourite', 'Fresh lemon, soda and mint served over plenty of ice.'),
  item('lime-soda', 'rooftop-refresh', 'Mint Lime Soda', 'drinks', 170, 'Refreshing', 'Crushed lime, mint, soda and a touch of Himalayan salt.'),
  item('blueberry-soda', 'rooftop-refresh', 'Blueberry Fizz', 'drinks', 220, 'Fruity', 'Blueberry syrup, lemon and sparkling soda over ice.'),
  item('orange-juice', 'rooftop-refresh', 'Fresh Orange Juice', 'drinks', 220, 'Fresh', 'Pressed orange juice served chilled without added water.'),
  item('apple-juice', 'rooftop-refresh', 'Apple Juice', 'drinks', 190, 'Fresh', 'Chilled, crisp apple juice with natural fruit sweetness.'),
  item('mango-shake', 'rooftop-refresh', 'Mango Shake', 'drinks', 260, 'Seasonal', 'Thick mango shake blended with chilled milk.'),
  item('chocolate-shake', 'rooftop-refresh', 'Chocolate Shake', 'drinks', 280, 'Rich', 'Creamy chocolate shake topped with cocoa and whipped cream.'),
  item('vanilla-shake', 'rooftop-refresh', 'Vanilla Shake', 'drinks', 260, 'Classic', 'Smooth vanilla milkshake with a soft, creamy finish.'),
  item('strawberry-shake', 'rooftop-refresh', 'Strawberry Shake', 'drinks', 280, 'Fruity', 'Fresh strawberry shake blended cold and creamy.'),
  item('cold-coffee', 'rooftop-refresh', 'Cold Coffee', 'drinks', 240, 'Cafe Favourite', 'Cold brewed coffee, milk and ice with a smooth foam top.')
];
const money = (value) => `Rs. ${Math.round(value).toLocaleString('en-IN')}`;
const load = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const defaultAddresses = [{ id: 'home', label: 'Home', address: 'Lalitpur, Bagmati Province', city: 'Lalitpur', note: 'Near Patan Durbar Square', isDefault: true }];
export default function DowntownApp() {
  const [screen, setScreen] = useState('home');
  const [openingStage, setOpeningStage] = useState('splash');
  const splashTimer = useRef(null);
  const onboardingComplete = useRef(Boolean(load('downtown-onboarding-complete', false) || load('downtown-orders', []).length || load('downtown-cart', []).length || load('downtown-favorites', []).length));
  const homeScreenRef = useRef(null);
  const viewportScrollRef = useRef(null);
  const homeScrollTop = useRef(0);
  useLayoutEffect(() => {
    const scrollport = window.matchMedia('(max-width:600px)').matches ? viewportScrollRef.current : homeScreenRef.current;
    if (scrollport) scrollport.scrollTop = screen === 'home' ? homeScrollTop.current : 0;
  }, [screen]);
  useEffect(() => {
    splashTimer.current = window.setTimeout(() => setOpeningStage(onboardingComplete.current ? 'closing' : 'welcome'), 1600);
    return () => window.clearTimeout(splashTimer.current);
  }, []);
  useEffect(() => {
    if (openingStage !== 'closing') return undefined;
    const timer = window.setTimeout(() => setOpeningStage('closed'), 500);
    return () => window.clearTimeout(timer);
  }, [openingStage]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState(() => load('downtown-cart', []).map((item) => ({ ...item, image: imageSlots.food(item.id) })));
  const [favorites, setFavorites] = useState(() => load('downtown-favorites', []));
  const [favoriteRestaurants, setFavoriteRestaurants] = useState(() => load('downtown-favorite-restaurants', []));
  const [orders, setOrders] = useState(() => load('downtown-orders', []));
  const [user, setUser] = useState(null);
  const [localProfile, setLocalProfile] = useState(() => {
    const profile = load('downtown-profile', {});
    return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : {};
  });
  const [authError, setAuthError] = useState('');
  const [addresses, setAddresses] = useState(() => load('downtown-addresses', defaultAddresses));
    const [location, setLocation] = useState(() => { const savedLocation = load('downtown-location', null); return locations.includes(savedLocation) ? savedLocation : 'Kalaiya'; });
  const [serviceMode, setServiceMode] = useState(() => load('downtown-service-mode', 'take-away'));
  const [tableNumber, setTableNumber] = useState(() => load('downtown-table-number', ''));
  const [dietaryFilter, setDietaryFilter] = useState(() => load('downtown-dietary-filter', 'all'));
  const [toast, setToast] = useState('');
  const [overlay, setOverlay] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  useEffect(() => save('downtown-cart', cart), [cart]); useEffect(() => save('downtown-favorites', favorites), [favorites]); useEffect(() => save('downtown-favorite-restaurants', favoriteRestaurants), [favoriteRestaurants]); useEffect(() => save('downtown-orders', orders), [orders]); useEffect(() => save('downtown-addresses', addresses), [addresses]); useEffect(() => save('downtown-location', location), [location]); useEffect(() => save('downtown-service-mode', serviceMode), [serviceMode]); useEffect(() => save('downtown-table-number', tableNumber), [tableNumber]); useEffect(() => save('downtown-dietary-filter', dietaryFilter), [dietaryFilter]);
  useEffect(() => {
    if (!isAuthConfigured) return undefined;
    let active = true;
    getAuthenticatedUser().then((account) => {
      if (active) setUser(account);
    }).catch((error) => {
      if (active) setAuthError(error instanceof Error ? error.message : 'Unable to verify your sign-in session.');
    });
    return () => { active = false; };
  }, []);
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(''), 2400); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { if (!location && !overlay) setOverlay('location'); }, [location, overlay]);
  const notify = (text) => setToast(text);
  const saveProfileChanges = async (changes) => {
    const accountFields = new Set(['name', 'email', 'phone', 'photo', 'dateOfBirth', 'gender']);
    let account = user;
    if (user && Object.keys(changes).some((key) => accountFields.has(key))) {
      account = await updateAuthenticatedProfile({ ...user, ...changes }, user);
      if (!account) throw new Error('Your sign-in session has expired. Please sign in again.');
    }
    const localChanges = Object.fromEntries(Object.entries(changes).filter(([key]) => !user || !accountFields.has(key)));
    if (Object.keys(localChanges).length) {
      const nextProfile = { ...localProfile, ...localChanges };
      save('downtown-profile', nextProfile);
      setLocalProfile(nextProfile);
    }
    if (account !== user) {
      setUser(account);
      setAuthError('');
    }
    return account || { ...localProfile, ...changes };
  };
  const markOnboardingComplete = () => {
    save('downtown-onboarding-complete', true);
    onboardingComplete.current = true;
  };
  const skipSplash = () => {
    window.clearTimeout(splashTimer.current);
    setOpeningStage(onboardingComplete.current ? 'closing' : 'welcome');
  };
  const continueToLocation = () => { setOpeningStage('closing'); setOverlay('location'); };
  const openWelcomeSignIn = () => { setOpeningStage('closing'); setOverlay('auth'); };
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = cart.length ? (restaurants.find((r) => r.id === cart[0].restaurantId)?.delivery ?? 59) : 0;
  const service = cart.length ? Math.round(subtotal * 0.03) : 0;
  const discount = couponApplied ? 100 : 0;
  const total = Math.max(0, subtotal + delivery + service - discount);
  const visibleProducts = useMemo(() => { const text = query.trim().toLowerCase(); return products.filter((p) => (!text ? category === 'all' || p.category === category : `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(text))).filter((p) => dietaryFilter === 'all' || (dietaryFilter === 'veg' ? p.isVeg : !p.isVeg)); }, [query, category, dietaryFilter]);
  const go = (next) => { setOverlay(null); setScreen(next); };
  const openProduct = (product) => { setSelected(product); setScreen('details'); };
  const toggleFavorite = (product) => setFavorites((current) => current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id]);
  const toggleFavoriteRestaurant = (restaurant) => setFavoriteRestaurants((current) => current.includes(restaurant.id) ? current.filter((id) => id !== restaurant.id) : [...current, restaurant.id]);
  const addToCart = (product, quantity = 1, addon = null) => { setCart((current) => { const key = `${product.id}-${addon?.name ?? 'none'}`; const existing = current.find((item) => item.key === key); return existing ? current.map((item) => item.key === key ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { ...product, key, quantity, addon }]; }); notify(`${product.name} added to cart`); };
  const updateQuantity = (key, delta) => setCart((current) => current.map((item) => item.key === key ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item).filter((item) => item.quantity));
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const activeLocation = typeof location === 'string' && location.trim() ? location : 'Kalaiya';
  const profileUser = user
    ? { ...localProfile, ...user, paymentPreference: localProfile.paymentPreference ?? user.paymentPreference, notificationPreferences: localProfile.notificationPreferences ?? user.notificationPreferences }
    : localProfile;
  const orderModeLabel = serviceMode === 'dine-in' ? `Dine In · Table ${tableNumber || 'Unassigned'}` : 'Take Away';
  return <ScreenFrame hasDock={!['details', 'checkout', 'confirmation'].includes(screen)}>
    {openingStage !== 'closed' && <OpeningFlow stage={openingStage} onSkip={skipSplash} onContinue={continueToLocation} onSignIn={openWelcomeSignIn} />}
    <ViewportScroll ref={viewportScrollRef} onScroll={(event) => { if (screen === 'home' && event.target === event.currentTarget) homeScrollTop.current = event.currentTarget.scrollTop; }}>
    <AppHeader><div className="status-bar"><span className="brand-mini">DOWNTOWN</span><span className="header-time">Sunday · 9:41</span></div><div className="location-bar"><button className="location-row" onClick={() => setOverlay('location')} aria-label={`Change delivery location from ${activeLocation}`}><MapPin size={18} strokeWidth={2.2} /><span><small>Delivering to</small><strong>{activeLocation}</strong></span><ChevronDown className="location-chevron" size={16} strokeWidth={2.5} /></button><AccountAvatar user={profileUser} orders={orders} addresses={addresses} onOpenProfile={() => go('profile')} onViewOrder={() => go('orders')} onAddresses={() => go('profile')} onOrders={() => go('orders')} onLogout={() => setOverlay('logout-confirm')} onDelete={() => setOverlay('delete-account-confirm')} /></div></AppHeader>
    {screen === 'home' && <><ServicePanel mode={serviceMode} setMode={setServiceMode} tableNumber={tableNumber} setTableNumber={setTableNumber} showTable={false} /><DietaryFilter value={dietaryFilter} onChange={setDietaryFilter} /></>}
    {screen === 'home' && query.trim() && <div className="home-search-results-overlay"><InlineSearchResults query={query} products={visibleProducts} favorites={favorites} toggleFavorite={toggleFavorite} openProduct={openProduct} addToCart={addToCart} /></div>}
    {screen === 'search' && <><DietaryFilter value={dietaryFilter} onChange={setDietaryFilter} /><SearchScreen {...{query, setQuery, category, setCategory, visibleProducts, favorites, toggleFavorite, openProduct, addToCart, dietaryFilter, setDietaryFilter}} /></>}
    {screen === 'details' && selected && <Details product={selected} favorite={favorites.includes(selected.id)} onBack={() => go('home')} onFavorite={() => toggleFavorite(selected)} onAdd={addToCart} />}
    {screen === 'home' && <Home {...{query, setQuery, category, setCategory, visibleProducts, favorites, toggleFavorite, favoriteRestaurants, toggleFavoriteRestaurant, openProduct, addToCart, location: activeLocation, setOverlay, go, orders, user, serviceMode, setServiceMode, dietaryFilter, setDietaryFilter, scrollRef: homeScreenRef, onScroll: (top) => { homeScrollTop.current = top; }}} />}
    {screen === 'orders' && <Orders orders={orders} onHome={() => go('home')} onReorder={(items) => { items.forEach((item) => addToCart(products.find((p) => p.id === item.id) || item, item.quantity)); go('cart'); }} />}
    {screen === 'cart' && <><ServicePanel mode={serviceMode} setMode={setServiceMode} tableNumber={tableNumber} setTableNumber={setTableNumber} /><LegacyCart cart={cart} subtotal={subtotal} delivery={delivery} service={service} discount={discount} total={total} updateQuantity={updateQuantity} onHome={() => go('home')} onCheckout={() => user ? go('checkout') : setOverlay('auth')} onClear={() => setCart([])} coupon={coupon} setCoupon={setCoupon} couponApplied={couponApplied} applyCoupon={() => { if (coupon.trim().toUpperCase() === 'DOWNTOWN100') { setCouponApplied(true); notify('Rs. 100 coupon applied'); } else notify('Try code DOWNTOWN100'); }} serviceMode={serviceMode} setServiceMode={setServiceMode} tableNumber={tableNumber} setTableNumber={setTableNumber} /></>}
    {screen === 'checkout' && <><ServicePanel mode={serviceMode} setMode={setServiceMode} tableNumber={tableNumber} setTableNumber={setTableNumber} /><Checkout {...{cart, subtotal, delivery, service, discount, total, addresses, defaultAddress, user, location: activeLocation, couponApplied, serviceMode, tableNumber, setTableNumber, onPaymentChange: (paymentPreference) => user && setUser({ ...user, paymentPreference }), onBack: () => go('cart'), onPlace: (order) => { setOrders((current) => [{ ...order, city: `${order.city} · ${orderModeLabel}` }, ...current]); setCart([]); go('confirmation'); } }} /></>}
    {screen === 'confirmation' && <Confirmation onOrders={() => go('orders')} onHome={() => go('home')} />}
    {screen === 'profile' && <ProfileScreen user={profileUser} isAuthenticated={Boolean(user)} addresses={addresses} setAddresses={setAddresses} orders={orders} products={products} restaurants={restaurants} favorites={favorites} toggleFavorite={toggleFavorite} favoriteRestaurants={favoriteRestaurants} toggleFavoriteRestaurant={toggleFavoriteRestaurant} cartCount={cartCount} cart={cart} serviceMode={serviceMode} setServiceMode={setServiceMode} dietaryFilter={dietaryFilter} setDietaryFilter={setDietaryFilter} onAuth={() => setOverlay('auth')} onEdit={() => setOverlay('edit-profile')} onLogout={() => setOverlay('logout-confirm')} onDelete={() => setOverlay('delete-account-confirm')} onOpenOrders={() => go('orders')} onOpenCart={() => go('cart')} onBrowseFood={() => go('search')} onUserChange={saveProfileChanges} onOpenProduct={openProduct} onReorder={(items) => { items.forEach((item) => addToCart(products.find((p) => p.id === item.id) || item, item.quantity)); go('cart'); }} />}
    </ViewportScroll>
    {screen !== 'details' && screen !== 'checkout' && screen !== 'confirmation' && <Nav screen={screen} cartCount={cartCount} go={go} />}
    {toast && <div className="toast">● &nbsp;{toast}</div>}
    {overlay === 'auth' && <Auth configured={isAuthConfigured} error={authError} onGoogleSignIn={() => { try { beginGoogleSignIn(); } catch (error) { setAuthError(error instanceof Error ? error.message : 'Google sign-in is unavailable.'); } }} onClose={() => { setOverlay(null); if (!onboardingComplete.current) setOpeningStage('welcome'); }} />}
    {overlay === 'location' && <LocationModal location={activeLocation} addresses={addresses} onClose={() => { setOverlay(null); if (!onboardingComplete.current) setOpeningStage('welcome'); }} onSelect={(next) => { setLocation(next); markOnboardingComplete(); setOverlay(null); notify(`Delivering to ${next}`); }} onSave={(address) => { setAddresses((current) => [...current, { ...address, id: `address-${Date.now()}`, isDefault: current.length === 0 }]); setLocation(address.city); markOnboardingComplete(); setOverlay(null); notify('Address saved'); }} />}
    {overlay === 'edit-profile' && <EditProfile user={profileUser} isAuthenticated={Boolean(user)} onClose={() => setOverlay(null)} onSave={async (next) => { await saveProfileChanges(next); setOverlay(null); notify('Profile updated'); }} />}
    {overlay === 'filter' && <Filter onClose={() => setOverlay(null)} />}
    {overlay === 'logout-confirm' && <ConfirmDialog title="Log out?" message="You can sign in again at any time. Your saved order and address information will remain on this device." confirmLabel="Log out" onCancel={() => setOverlay(null)} onConfirm={async () => { try { await endAuthSession(); setUser(null); setOverlay(null); notify('Logged out'); } catch (error) { setAuthError(error instanceof Error ? error.message : 'Unable to log out.'); setOverlay(null); } }} />}
    {overlay === 'delete-account-confirm' && <ConfirmDialog title="Delete account" message="Account deletion is not connected to a backend yet. No account data will be deleted from this app. Close this dialog; deletion can be enabled after a secure backend is connected." confirmLabel="Close" destructive onCancel={() => setOverlay(null)} onConfirm={() => setOverlay(null)} />}
  </ScreenFrame>;
}
function OpeningFlow({ stage, onSkip, onContinue, onSignIn }) {
  return <div className={`opening-flow ${stage === 'closing' ? 'opening-flow-exit' : ''}`} role="dialog" aria-modal="true" aria-label={stage === 'splash' ? 'DOWNTOWN splash screen' : 'Welcome to DOWNTOWN'}>
    <section className={`opening-panel splash-screen ${imageSlots.opening.splashBackgroundClass} ${stage === 'splash' ? 'opening-panel-active' : ''}`} aria-hidden={stage !== 'splash'}>
      <div className="splash-top"><button className="splash-skip" onClick={onSkip}>Skip <ArrowRight size={13} /></button></div>
      <div className="splash-center">
        <div className="splash-logo-wrap">
          <span className="splash-glow" />
          <span className="splash-ring" />
          <ContentImage className="splash-logo" src={imageSlots.opening.splashLogo} alt="Downtown Pizza emblem" fallbackSrc={imageSlots.opening.splashLogo} loading="eager" showFallbackIcon={false} />
        </div>
        <h1 className="splash-title"><span>Downtown</span> Pizza</h1>
        <p className="splash-subtitle">Kathmandu · Nepal</p>
      </div>
      <div className="splash-bottom">
        <div className="splash-progress"><i /></div>
        <span>Fired with Himalayan Passion</span>
      </div>
    </section>
    <section className={`opening-panel welcome-screen ${stage === 'welcome' ? 'opening-panel-active' : ''}`} aria-hidden={stage !== 'welcome'}>
      <header className="welcome-header">
        <div className="welcome-brand"><ContentImage src={imageSlots.brand.logo} alt="" fallbackSrc={imageSlots.brand.logo} showFallbackIcon={false} /><span>Downtown</span></div>
        <span className="welcome-location">Kathmandu, Nepal</span>
      </header>
      <div className="welcome-hero">
        <ContentImage src={imageSlots.opening.welcome} alt="Wood-fired pizza and Himalayan momos on a Kathmandu rooftop" fallbackSrc={imageSlots.opening.welcome} loading="eager" showFallbackIcon={false} />
        <div className="welcome-hero-shade" />
        <span className="welcome-food-tag"><i /> Fresh Woodfired · Rooftop Crafted</span>
      </div>
      <div className="welcome-copy">
        <h2>Good Food.<br /><span>Right Around You.</span></h2>
        <p>Discover artisanal sourdough pizzas, authentic Himalayan momos, and chilled craft delights delivered hot to your doorstep.</p>
      </div>
      <div className="welcome-actions">
        <button className="welcome-primary" onClick={onContinue}>Get Started <ArrowRight size={17} /></button>
        <div className="welcome-secondary">
          <button className="welcome-sign-in" onClick={onSignIn}>Sign In / Log In</button>
          <button className="welcome-guest" onClick={onContinue}>Continue as Guest</button>
        </div>
      </div>
    </section>
  </div>;
}
function AccountAvatar({ user, orders, addresses, onOpenProfile, onViewOrder, onAddresses, onOrders, onLogout, onDelete }) {
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return <div className="account-avatar-wrap">
    <button className="avatar" onClick={() => setOpen((o) => !o)} aria-label="Account menu"><ContentImage src={user?.photo || imageSlots.profile.fallback} alt={user?.name ? `${user.name} profile` : 'Guest profile'} fallbackSrc={imageSlots.profile.fallback} /></button>
    {open && <div className="account-popover">
      <div className="account-popover-header"><div className="account-popover-avatar"><ContentImage src={user?.photo || imageSlots.profile.fallback} alt="" fallbackSrc={imageSlots.profile.fallback} /></div><div><b>{user?.name || 'Guest'}</b><small>{user?.email || 'Not logged in'}</small></div></div>
      {settingsOpen ? <>
        <div className="account-settings-list">
          <div className="account-settings-row"><span>Notifications</span><i className={user?.notifications ? 'mini-toggle on' : 'mini-toggle'} /></div>
          <div className="account-settings-row"><span>Language</span><small>English</small></div>
          <div className="account-settings-row"><span>Dark mode</span><i className="mini-toggle on" /></div>
          <button className="account-menu-item" onClick={() => { onOpenProfile(); setOpen(false); setSettingsOpen(false); }}>Help & Support</button>
          <button className="account-menu-item danger" onClick={onDelete}>Delete account</button>
        </div>
        <button className="account-popover-back" onClick={() => setSettingsOpen(false)}>‹ Back</button>
      </> : <>
        <div className="account-popover-orders"><p className="account-popover-label">Recent orders</p>{orders.length ? orders.slice(0, 2).map((o) => <button key={o.id} className="account-order-row" onClick={() => { onViewOrder(o.id); setOpen(false); }}><span>{o.number || o.id}</span><small>{o.status}</small></button>) : <p className="account-popover-empty">No orders yet</p>}</div>
        <div className="account-menu-list">
          <button className="account-menu-item" onClick={() => { onOpenProfile(); setOpen(false); }}>Edit profile</button>
          <button className="account-menu-item" onClick={() => { onAddresses(); setOpen(false); }}>Saved addresses <small>{addresses?.length || 0}</small></button>
          <button className="account-menu-item" onClick={() => { onOrders(); setOpen(false); }}>Order history</button>
          <button className="account-menu-item" onClick={() => setSettingsOpen(true)}>Settings</button>
          {user && <button className="account-menu-item danger" onClick={() => { onLogout(); setOpen(false); }}>Log out</button>}
        </div>
      </>}
    </div>}
  </div>;
}
function Home({ query, setQuery, category, setCategory, visibleProducts, favorites, toggleFavorite, favoriteRestaurants, toggleFavoriteRestaurant, openProduct, addToCart, location, setOverlay, go, orders, user, scrollRef, onScroll }) {
  return <section className="screen home-screen" ref={scrollRef} onScroll={(event) => onScroll && onScroll(event.currentTarget.scrollTop)}>
    <Promo onClick={() => openProduct(products[0])} /><OfferBanner onClick={() => openProduct(products[0])} />
    <div className="section-heading"><h2>Explore categories</h2><button onClick={() => setCategory('all')}>View all</button></div>
    <div className="category-row">{categories.map(([id, label]) => <button key={id} className={`category ${category === id ? 'active' : ''}`} onClick={() => setCategory(id)}><strong><ContentImage className="category-icon" src={imageSlots.categories(id)} alt={`${label} category`} fallbackSrc={imageSlots.fallbacks.food} /></strong><span>{label}</span></button>)}</div>
    <div className="section-heading"><h2>Popular near you</h2><button onClick={() => go('search')}>See all</button></div>
    <div className="restaurant-list">{restaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} favorite={favoriteRestaurants.includes(restaurant.id)} onFavorite={() => toggleFavoriteRestaurant(restaurant)} />)}</div>
    <div className="section-heading"><h2>Featured restaurants</h2><button onClick={() => go('search')}>View all</button></div>
    <div className="featured-restaurant-list">{restaurants.filter((restaurant) => restaurant.featured).map((restaurant) => <FeaturedRestaurantCard key={restaurant.id} restaurant={restaurant} favorite={favoriteRestaurants.includes(restaurant.id)} onFavorite={() => toggleFavoriteRestaurant(restaurant)} />)}</div>
    <div className="section-heading"><h2>Popular food</h2><button onClick={() => go('search')}>See all</button></div>
    <div className="product-scroller">{visibleProducts.slice(0, 5).map((product) => <LegacyProductCardOriginal key={product.id} product={{ ...product, image: imageSlots.popularFood(product.id) }} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product)} onOpen={() => openProduct(product)} onAdd={() => addToCart(product)} />)}</div>
    {orders[0] && <button className="recent-order" onClick={() => go('orders')}>↻ &nbsp; Reorder from your last meal <b>{orders[0].number}</b></button>}
  </section>;
}
function InlineSearchResults({ query, products: items, favorites, toggleFavorite, openProduct, addToCart }) { return <div className="inline-search-results"><div className="section-heading"><h2>Results for “{query}”</h2><span>{items.length} found</span></div>{items.length ? <div className="product-scroller">{items.map((product) => <LegacyProductCardOriginal key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product)} onOpen={() => openProduct(product)} onAdd={() => addToCart(product)} />)}</div> : <Empty title="No meals found" text="Try pizza, burger, or drink." />}</div>; }
function SearchScreen({ query, setQuery, category, setCategory, visibleProducts, favorites, toggleFavorite, openProduct, addToCart }) { return <section className="screen collection-screen"><div className="page-heading"><p>DOWNTOWN discovery</p><h2>Find your next meal</h2><label className="search-box"><span>⌕</span><input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Kathmandu favourites" aria-label="Search meals" /></label></div><div className="category-row">{categories.map(([id, label]) => <button key={id} className={`category ${category === id ? 'active' : ''}`} onClick={() => setCategory(id)}><strong><ContentImage className="category-icon" src={imageSlots.categories(id)} alt={`${label} category`} fallbackSrc={imageSlots.fallbacks.food} /></strong><span>{label}</span></button>)}</div><div className="collection-grid">{visibleProducts.map((product) => <LegacyProductCardOriginal key={product.id} product={product} favorite={favorites.includes(product.id)} onFavorite={() => toggleFavorite(product)} onOpen={() => openProduct(product)} onAdd={() => addToCart(product)} />)}</div>{!visibleProducts.length && <Empty title="No meals found" text="Try another dish or category." />}</section>; }
function Promo({ onClick }) { return <button className="promo-banner" onClick={onClick}><div className="promo-copy"><small className="promo-badge"><Sparkles size={12} strokeWidth={2.5} /> Limited Time Offer</small><h2>Spicy Burger<br /><em>Combo</em></h2><span className="order-pill">Order Now</span></div><b className="discount-badge">20%<small>OFF</small></b><ContentImage className="promo-photo" src={imageSlots.home.promotion} alt="Spicy burger combo offer" fallbackSrc={imageSlots.fallbacks.food} /></button>; }
function OfferBanner({ onClick }) { return <button className="offer-banner" onClick={onClick}><ContentImage src={imageSlots.offers.banner} alt="DOWNTOWN special meal offer" fallbackSrc={imageSlots.fallbacks.food} /><span><b>More to love</b><small>Browse today’s special offer</small></span><strong>View offer</strong></button>; }
function RestaurantCard({ restaurant, favorite, onFavorite }) { return <article className="restaurant-card"><div className="restaurant-cover"><ContentImage className="restaurant-cover-image" src={restaurant.image} alt={`${restaurant.name} restaurant`} fallbackSrc={imageSlots.fallbacks.restaurant} /><ContentImage className="restaurant-logo" src={restaurant.logo} alt={`${restaurant.name} logo`} fallbackSrc={imageSlots.fallbacks.restaurantLogo} /><button className={`restaurant-favorite-button ${favorite ? 'active' : ''}`} aria-label={`${favorite ? 'Remove' : 'Add'} ${restaurant.name} ${favorite ? 'from' : 'to'} favourites`} aria-pressed={favorite} onClick={onFavorite}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button></div><div><div className="restaurant-meta"><span>★ {restaurant.rating}</span><span>{restaurant.eta}</span></div><h3>{restaurant.name}</h3><p>{restaurant.cuisine} · {restaurant.area}</p><small>Delivery from {money(restaurant.delivery)}</small></div></article>; }
function FeaturedRestaurantCard({ restaurant, favorite, onFavorite }) { return <article className="featured-restaurant-card"><ContentImage src={imageSlots.featuredRestaurant(restaurant.id)} alt={`${restaurant.name} featured`} fallbackSrc={imageSlots.fallbacks.restaurant} /><button className={`restaurant-favorite-button ${favorite ? 'active' : ''}`} aria-label={`${favorite ? 'Remove' : 'Add'} ${restaurant.name} ${favorite ? 'from' : 'to'} favourites`} aria-pressed={favorite} onClick={onFavorite}><Heart size={16} fill={favorite ? 'currentColor' : 'none'} /></button><div><b>{restaurant.name}</b><small>{restaurant.cuisine} · ★ {restaurant.rating}</small></div></article>; }
function DietaryIcon({ isVeg }) { return <span className={`dietary-icon ${isVeg ? 'veg' : 'non-veg'}`} aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}><i /></span>; }
function ServiceToggle({ value, onChange }) { return <div className="service-toggle" role="group" aria-label="Order type"><button className={value === 'take-away' ? 'active' : ''} onClick={() => onChange('take-away')}>Take Away</button><button className={value === 'dine-in' ? 'active' : ''} onClick={() => onChange('dine-in')}>Dine In</button></div>; }
function DietaryFilter({ value, onChange }) { return <div className="dietary-filter" role="group" aria-label="Dietary filter"><span>Menu</span><button className={value === 'all' ? 'active' : ''} onClick={() => onChange('all')}>All</button><button className={value === 'veg' ? 'active veg' : ''} onClick={() => onChange('veg')}>Veg</button><button className={value === 'non-veg' ? 'active non-veg' : ''} onClick={() => onChange('non-veg')}>Non-Veg</button></div>; }
function ServicePanel({ mode, setMode, tableNumber, setTableNumber, showTable = true }) { return <div className="service-panel"><ServiceToggle value={mode} onChange={setMode} />{showTable && mode === 'dine-in' && <label className="table-number"><span>Table Number</span><input value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} inputMode="numeric" placeholder="Optional" aria-label="Table Number" /></label>}</div>; }
function ProductCard({ product, favorite, onFavorite, onOpen, onAdd }) { return <article className="product-card" onClick={onOpen}><button className={`heart-button ${favorite ? 'favorite' : ''}`} aria-label={`${favorite ? 'Remove' : 'Add'} ${product.name} favorite`} onClick={(e) => { e.stopPropagation(); onFavorite(); }}>♥</button><div className="product-image"><ContentImage src={product.image} alt={product.name} fallbackSrc={imageSlots.fallbacks.food} /><span>{product.tag}</span></div><div className="product-name-row"><DietaryIcon isVeg={product.isVeg} /><h3>{product.name}</h3></div><p>{restaurants.find((r) => r.id === product.restaurantId)?.name}</p><div className="card-footer"><strong>{money(product.price)}</strong><button className="add-button" aria-label={`Add ${product.name} to cart`} onClick={(e) => { e.stopPropagation(); onAdd(); }}>+</button></div></article>; }
function LegacyProductCard({ ...props }) { return <ProductCard {...props} />; }
function LegacyProductCardOriginal({ product, favorite, onFavorite, onOpen, onAdd }) { return <article className="product-card" onClick={onOpen}><button className={`heart-button ${favorite ? 'favorite' : ''}`} aria-label={`${favorite ? 'Remove' : 'Add'} ${product.name} favorite`} onClick={(e) => { e.stopPropagation(); onFavorite(); }}>♥</button><div className="product-image"><ContentImage src={product.image} alt={product.name} fallbackSrc={imageSlots.fallbacks.food} /><span>{product.tag}</span></div><h3>{product.name}</h3><p>{restaurants.find((r) => r.id === product.restaurantId)?.name}</p><div className="card-footer"><strong>{money(product.price)}</strong><button className="add-button" aria-label={`Add ${product.name} to cart`} onClick={(e) => { e.stopPropagation(); onAdd(); }}>+</button></div></article>; }
function Details({ product, favorite, onBack, onFavorite, onAdd }) { const [quantity, setQuantity] = useState(1); const [addon, setAddon] = useState(null); const itemTotal = (product.price + (addon?.price || 0)) * quantity; return <section className="details-screen screen"><div className="detail-hero"><ContentImage src={product.image} alt={product.name} fallbackSrc={imageSlots.fallbacks.food} /><div className="detail-actions"><button className="icon-button" onClick={onBack}>‹</button><button className={`icon-button ${favorite ? 'favorite' : ''}`} onClick={onFavorite}>♥</button></div></div><div className="detail-sheet"><span className="detail-badge">✦ {product.tag}</span><div className="detail-title-row"><div><h2>{product.name}</h2><p>★ <b>4.8</b> <span> · {restaurants.find((r) => r.id === product.restaurantId)?.name}</span></p></div><strong>{money(product.price)}</strong></div><p className="description">{product.description}</p>{product.addons.length > 0 && <div className="customize"><h3>Add something extra</h3>{product.addons.map((option) => <button className="toggle-row" key={option.name} onClick={() => setAddon(addon?.name === option.name ? null : option)}><span>{option.name} <small>(+{money(option.price)})</small></span><i className={addon?.name === option.name ? 'toggle on' : 'toggle'}><b /></i></button>)}</div>}<div className="detail-footer"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button><b>{quantity}</b><button onClick={() => setQuantity(quantity + 1)}>+</button></div><button className="primary-action" onClick={() => onAdd(product, quantity, addon)}>🛍 Add to cart <strong>{money(itemTotal)}</strong></button></div></div></section>; }
function Cart({ cart, subtotal, delivery, service, discount, total, updateQuantity, onHome, onCheckout, onClear, coupon, setCoupon, couponApplied, applyCoupon }) { return <section className="screen utility-screen"><PageTitle title="Your cart" onBack={onHome} />{cart.length ? <><p className="cart-context">Delivering to your saved address in Nepal</p><div className="cart-list">{cart.map((item) => <div className={`cart-item ${item.isVeg ? 'veg' : 'non-veg'}`} key={item.key}><ContentImage src={item.image} alt={item.name} fallbackSrc={imageSlots.fallbacks.food} /><div><h3><DietaryIcon isVeg={item.isVeg} />{item.name}</h3><small>{item.addon?.name || 'Regular'}</small><strong>{money(item.price + (item.addon?.price || 0))}</strong><div className="quantity small"><button onClick={() => updateQuantity(item.key, -1)}>−</button><b>{item.quantity}</b><button onClick={() => updateQuantity(item.key, 1)}>+</button></div></div><button className="remove" onClick={() => updateQuantity(item.key, -item.quantity)}>×</button></div>)}</div><div className="coupon"><input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" aria-label="Coupon code" /><button onClick={applyCoupon}>{couponApplied ? 'Applied' : 'Apply'}</button></div><Summary {...{subtotal, delivery, service, discount, total}} /><button className="secondary-action" onClick={onClear}>Clear cart</button><button className="primary-action full" onClick={onCheckout}>Continue to checkout <strong>{money(total)}</strong></button></> : <Empty title="Your cart is empty" text="Add a local favourite to get started." action="Browse DOWNTOWN" onAction={onHome} />}</section>; }
function LegacyCart({ cart, subtotal, delivery, service, discount, total, updateQuantity, onHome, onCheckout, onClear, coupon, setCoupon, couponApplied, applyCoupon }) { return <Cart {...{ cart, subtotal, delivery, service, discount, total, updateQuantity, onHome, onCheckout, onClear, coupon, setCoupon, couponApplied, applyCoupon }} />; }
function Checkout({ cart, subtotal, delivery, service, discount, total, defaultAddress, user, location, onBack, onPlace, onPaymentChange }) {
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: defaultAddress?.address || '', payment: user?.paymentPreference === 'eSewa' ? 'eSewa' : 'Cash on Delivery' });
  const [error, setError] = useState('');
  const [esewaStatus, setEsewaStatus] = useState('idle');
  const choosePayment = (payment) => {
    setForm((current) => ({ ...current, payment }));
    onPaymentChange?.(payment);
  };
  const placeFinalOrder = () => {
    onPlace({ id: `order-${Date.now()}`, number: `#DW${Math.floor(1000 + Math.random() * 9000)}`, date: new Date().toLocaleDateString('en-NP'), status: 'Order Placed', items: cart, total, address: form.address, city: location, payment: form.payment, timeline: ['Order Placed'] });
  };
  const submit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !/^\+977\s?9\d{9}$/.test(form.phone.replace(/-/g, '')) || !form.address.trim()) {
      setError('Enter your name, a valid Nepal phone (+977 98XXXXXXXX) and delivery address.');
      return;
    }
    setError('');
    if (form.payment === 'eSewa') {
      setEsewaStatus('processing');
      setTimeout(() => { setEsewaStatus('success'); setTimeout(placeFinalOrder, 700); }, 1400);
    } else placeFinalOrder();
  };
  return <section className="screen utility-screen"><PageTitle title="Checkout" onBack={onBack} /><form className="checkout-form" onSubmit={submit}>
    <div className="checkout-location">⌖ <div><small>Delivering to</small><b>{location}</b><span>{form.address}</span></div></div>
    <label>Full name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Aarav Shrestha" /></label>
    <label>Nepal phone number<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+977 9800000000" /></label>
    <label>Delivery address<textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="House, street, neighbourhood" /></label>
    <div className="payment"><h3>Payment method</h3>
      <button type="button" className={`payment-option ${form.payment === 'eSewa' ? 'selected' : ''}`} onClick={() => choosePayment('eSewa')}><span className="payment-logo esewa-logo">e</span><span className="payment-label"><b>eSewa</b><small>Pay securely with your eSewa wallet</small></span><i className={form.payment === 'eSewa' ? 'radio on' : 'radio'} /></button>
      <button type="button" className={`payment-option ${form.payment === 'Cash on Delivery' ? 'selected' : ''}`} onClick={() => choosePayment('Cash on Delivery')}><span className="payment-logo cod-logo">Rs</span><span className="payment-label"><b>Cash on Delivery</b><small>Pay when your order arrives</small></span><i className={form.payment === 'Cash on Delivery' ? 'radio on' : 'radio'} /></button>
    </div>
    {form.payment === 'eSewa' && esewaStatus !== 'idle' && <div className="esewa-status"><p>{esewaStatus === 'processing' ? '⏳ Redirecting to eSewa...' : '✓ Payment Successful — placing your order'}</p></div>}
    {error && <p className="form-error">{error}</p>}
    <Summary {...{subtotal, delivery, service, discount, total}} />
    <button className="primary-action full" type="submit" disabled={esewaStatus === 'processing'}>{form.payment === 'eSewa' ? (esewaStatus === 'processing' ? 'Processing…' : 'Pay with eSewa') : 'Place order'} <strong>{money(total)}</strong></button>
  </form></section>;
}
function Orders({ orders, onHome, onReorder }) { return <section className="screen utility-screen"><PageTitle title="Your orders" onBack={onHome} />{orders.length ? <div className="orders-list">{orders.map((order) => <article className="order-card" key={order.id}><div className="order-top"><span>Order {order.number}</span><strong>{order.status}</strong></div><h3>{order.items.map((item) => `${item.name} ×${item.quantity}`).join(', ')}</h3><small>{order.date} · {order.city}</small><div className="timeline">{['Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].map((state, index) => <span className={index <= ['Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'].indexOf(order.status) ? 'done' : ''} key={state}><i />{state}</span>)}</div><b className="order-total">{money(order.total)}</b><button className="secondary-action" onClick={() => onReorder(order.items)}>Reorder</button></article>)}</div> : <Empty title="No orders yet" text="Your DOWNTOWN orders and delivery status will appear here." action="Start ordering" onAction={onHome} />}</section>; }
function Auth({ configured, error, onClose, onGoogleSignIn }) {
  return <div className="modal-backdrop"><section className="auth-modal auth-setup-modal" role="dialog" aria-modal="true" aria-labelledby="auth-setup-title">
    <div className="modal-title"><div><p className="eyebrow">Secure account access</p><h2 id="auth-setup-title">DOWNTOWN</h2></div><button type="button" onClick={onClose} aria-label="Close sign in">×</button></div>
    <p>{configured ? 'Continue with Google. Your profile details will load from the verified sign-in session.' : 'Google sign-in is not configured for this app yet. You can continue browsing as a guest.'}</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button className="primary-action full" type="button" onClick={onGoogleSignIn} disabled={!configured}>Continue with Google</button>
    <button className="secondary-action" type="button" onClick={onClose}>Continue as guest</button>
  </section></div>;
}
function LocationModal({ location, addresses, onClose, onSelect, onSave }) { const [manual, setManual] = useState(''); const [showForm, setShowForm] = useState(false); const [form, setForm] = useState({ label: 'Other', address: '', city: location === 'Choose location' ? '' : location, note: '' }); const cityPromotion = imageSlots.cityPromotion(location); const useCurrent = () => { if (!navigator.geolocation) { onClose(); return; } navigator.geolocation.getCurrentPosition(() => onSelect('Current location'), () => onClose()); }; return <div className="modal-backdrop"><div className="location-modal"><div className="modal-title"><div><p className="eyebrow">Delivery location</p><h2>Where should we deliver?</h2></div><button onClick={onClose}>×</button></div><div className="city-promo"><ContentImage className={`location-promo-image-${cityPromotion.className}`} src={cityPromotion.src} alt={cityPromotion.alt} fallbackSrc={imageSlots.cityPromotion('Nepal').src} loading="eager" /><span>Fresh picks around <b>{location}</b></span></div><button className="current-location" onClick={useCurrent}>⌖ Use my current location <small>Browser permission required</small></button><label className="location-search">⌕<input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="Search a city or neighbourhood" /></label>{locations.filter((city) => !manual || city.toLowerCase().includes(manual.toLowerCase())).map((city) => <button className={`location-option ${city === location ? 'selected' : ''}`} key={city} onClick={() => onSelect(city)}>⌖ <span>{city}<small>Nepal</small></span>{city === location && '✓'}</button>)}<button className="secondary-action" onClick={() => setShowForm(!showForm)}>+ Enter location manually</button>{showForm && <div className="address-form"><select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}><option>Home</option><option>Work</option><option>Other</option></select><input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" /><input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" /><button className="primary-action full" onClick={() => form.address && form.city && onSave(form)}>Save address</button></div>}{addresses.length > 0 && <p className="saved-note">{addresses.length} saved address{addresses.length > 1 ? 'es' : ''} available from your profile.</p>}</div></div>; }
function EditProfile({ user, isAuthenticated, onClose, onSave }) {
  const [form, setForm] = useState(() => ({ ...user, name: user.name || '', email: user.email || '', phone: user.phone || '', photo: user.photo || '' }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave(form);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Profile changes could not be saved.');
    } finally {
      setSaving(false);
    }
  };
  return <div className="modal-backdrop"><form className="auth-modal edit-profile-modal" onSubmit={submit}>
    <div className="modal-title"><h2>Edit Profile</h2><button type="button" onClick={onClose} aria-label="Close edit profile">×</button></div>
    <ProfilePhoto photo={form.photo} name={form.name} onChange={(photo) => setForm((current) => ({ ...current, photo }))} large />
    <label>Full name<input required autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
    <label>Email address<input type="email" autoComplete="email" placeholder="Add your email" value={form.email} readOnly={isAuthenticated} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
    <label>Phone number<input type="tel" autoComplete="tel" placeholder="Add phone number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
    <label>Date of birth (optional)<input type="date" value={form.dateOfBirth || ''} onChange={(event) => setForm({ ...form, dateOfBirth: event.target.value })} /></label>
    <label>Gender (optional)<select value={form.gender || ''} onChange={(event) => setForm({ ...form, gender: event.target.value })}><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="non-binary">Non-binary</option><option value="self-describe">Self-describe</option></select></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="edit-profile-actions"><button type="button" className="profile-secondary-button" onClick={onClose}>Cancel</button><button className="profile-primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button></div>
  </form></div>;
}
function ConfirmDialog({ title, message, confirmLabel, destructive = false, onCancel, onConfirm }) {
  return <div className="modal-backdrop"><section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title"><h2 id="confirm-dialog-title">{title}</h2><p>{message}</p><div className="confirm-dialog-actions"><button className="profile-secondary-button" onClick={onCancel}>Cancel</button><button className={destructive ? 'profile-delete-button' : 'profile-primary-button'} onClick={onConfirm}>{confirmLabel}</button></div></section></div>;
}
function CartSummary({ subtotal, delivery, service, discount, total }) { return <div className="summary"><p><span>Subtotal</span><b>{money(subtotal)}</b></p><p><span>Delivery fee</span><b>{money(delivery)}</b></p><p><span>Service charge</span><b>{money(service)}</b></p>{discount > 0 && <p><span>Coupon discount</span><b className="discount">−{money(discount)}</b></p>}<p className="total"><span>Total</span><b>{money(total)}</b></p></div>; }
function Summary(props) { return <CartSummary {...props} />; }
function PageTitle({ title, onBack }) { return <div className="page-title"><button className="icon-button" onClick={onBack}>‹</button><h2>{title}</h2><span /></div>; }
function Empty({ title, text, action, onAction }) { return <div className="empty-state"><ContentImage className="empty-state-illustration" src={imageSlots.emptyState} alt="" fallbackSrc={imageSlots.emptyState} /><h3>{title}</h3><p>{text}</p>{action && <button className="primary-action" onClick={onAction}>{action}</button>}</div>; }
function Confirmation({ onOrders, onHome }) { return <section className="screen confirmation"><div className="success-mark">✓</div><h2>Order placed!</h2><p>Your DOWNTOWN kitchen is getting started. You can track delivery progress from Orders.</p><button className="primary-action full" onClick={onOrders}>Track my order</button><button className="secondary-action" onClick={onHome}>Back to home</button></section>; }
function Nav({ screen, cartCount, go }) { const items = [['home', House, 'Home'], ['search', Search, 'Search'], ['orders', ReceiptText, 'Orders'], ['cart', ShoppingBag, 'Cart'], ['profile', UserRound, 'Profile']]; return <nav className="bottom-nav">{items.map(([id, Icon, label]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => go(id)} aria-label={label}><span className="nav-icon-wrap"><Icon size={22} strokeWidth={screen === id ? 2.5 : 1.8} />{id === 'cart' && cartCount > 0 && <b className="cart-badge">{cartCount}</b>}</span><small>{label}</small><i /></button>)}</nav>; }
function Filter({ onClose }) { return <div className="modal-backdrop"><div className="filter-modal"><div className="modal-title"><h2>Filter discovery</h2><button onClick={onClose}>×</button></div><p className="saved-note">Browse DOWNTOWN by Pizza, Burger, or Cold Drinks using the category tabs.</p><button className="primary-action full" onClick={onClose}>Done</button></div></div>; }

LegacyProductCardOriginal = ProductCard;
