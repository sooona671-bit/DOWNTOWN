import { useState } from 'react';
import { ArrowLeft, Bell, Check, ChevronRight, CircleHelp, Clock3, CreditCard, Heart, Info, LockKeyhole, LogOut, MapPin, Pencil, Plus, ReceiptText, ShieldCheck, ShoppingBag, Trash2, UtensilsCrossed } from 'lucide-react';
import ContentImage from './ContentImage.jsx';
import { imageSlots } from '../image-assets.js';
import ProfilePhoto from './ProfilePhoto.jsx';
import ScreenshotChecker from './ScreenshotChecker';
import { ScanLine } from 'lucide-react';

const activeStatuses = new Set(['Order Placed', 'Confirmed', 'Preparing', 'Out for Delivery']);
const profileMenu = [
  ['orders', 'My Orders', 'Active and previous orders', ReceiptText],
  ['cart', 'My Cart', 'Review items before checkout', ShoppingBag],
  ['restaurants', 'Favourite Restaurants', 'Your saved places to eat', Heart],
  ['food', 'Favourite Food', 'Your saved meals', Heart],
  ['addresses', 'Saved Addresses', 'Manage delivery locations', MapPin],
  ['payments', 'Payment Methods', 'Choose a payment preference', CreditCard],
  ['notifications', 'Notifications', 'Choose the updates you receive', Bell],
  ['preferences', 'Dine In / Take Away & Dietary', 'Set your order type and menu', UtensilsCrossed],
  ['help', 'Help & Support', 'FAQs and order help', CircleHelp],
  ['layout-check', 'Screenshot Layout Check', 'Phone screen review', ScanLine],
  ['security', 'Privacy & Security', 'Account and data information', LockKeyhole],
  ['terms', 'Terms & Conditions', 'Review the app terms', ReceiptText],
  ['privacy', 'Privacy Policy', 'How app data is used', ShieldCheck],
  ['about', 'About DOWNTOWN', 'App information and policies', Info],
];
const policySections = {
  terms: {
    title: 'Terms & Conditions',
    intro: 'These terms describe the current use of the DOWNTOWN food-ordering app. By using the app, you agree to use its ordering and account features responsibly.',
    sections: [
      ['Introduction', 'DOWNTOWN helps you browse listed restaurants and food items, build a cart, and submit an order using the options shown in the app.'],
      ['Account Usage', 'Keep your account details accurate and protect access to your device. You are responsible for activity performed using your account on this device.'],
      ['Orders and Restaurants', 'Restaurants prepare the items shown in each order. Item availability, descriptions, and preparation are managed by the restaurant. An order is subject to the confirmation shown in the app.'],
      ['Pricing and Payments', 'Prices and applicable charges are shown in the cart and checkout before an order is placed. Available payment choices are displayed at checkout. Do not enter payment credentials into the app unless a supported secure payment flow is provided.'],
      ['Cancellation and Refunds', 'Cancellation and refund handling is not automated in the current app. Contact the restaurant or support promptly about an order issue.'],
      ['Delivery', 'Delivery estimates and location details are provided for guidance. Delivery availability and timing may depend on the restaurant and delivery area.'],
      ['User Responsibilities', 'Use accurate contact and delivery information, follow applicable laws, and do not misuse the app or interfere with other users.'],
      ['Reviews and User Content', 'Only submit content that is relevant, respectful, and that you have the right to share.'],
      ['Privacy', 'The app uses the profile, address, order, and preference information described in its Privacy Policy.'],
      ['App Usage', 'App features are provided as available. Some account, payment, or support actions may require backend services that are not connected in this version.'],
      ['Changes to Terms', 'These terms may be updated when app functionality changes. Review this page for the latest in-app text.'],
      ['Contact Information', 'Use the Help & Support section in the app to find available support options.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'This policy describes information the current DOWNTOWN app may use to provide its on-device features.',
    sections: [
      ['Profile information', 'Name, email address, and phone number entered in the profile or account form are stored in this browser’s local app storage.'],
      ['Profile photo', 'A photo you choose is resized in your browser and saved with your profile on this device. You can replace or remove it in Edit Profile.'],
      ['Delivery addresses', 'Addresses you save are stored locally to support location selection and checkout.'],
      ['Orders and cart', 'Cart contents and order records created in the app are stored locally so they remain available on this device.'],
      ['App preferences', 'Selected location, order mode, table number, favourites, and profile preferences may be saved in local app storage.'],
      ['Payment information', 'The app stores a payment-method preference only. It does not store card numbers, wallet credentials, or other payment secrets. The current eSewa checkout is a simulated frontend flow.'],
      ['Passwords and authentication', 'A local DOWNTOWN profile works without external sign-in. If Google authentication is configured, sign-in is handled by the connected authentication service. This app does not collect or store passwords.'],
      ['Device permissions', 'Choosing “Use my current location” can request browser geolocation permission. The app does not use that permission until you choose the location action.'],
      ['Your choices', 'You can edit your local profile, remove your photo, clear the cart, and manage saved addresses using the app controls. If you sign in with a connected provider, you can also log out. Clearing browser storage removes locally saved app data.'],
    ],
  },
};

export default function ProfileScreen({
  user,
  addresses,
  setAddresses,
  orders,
  products,
  restaurants,
  favorites,
  toggleFavorite,
  favoriteRestaurants,
  toggleFavoriteRestaurant,
  cartCount,
  cart,
  serviceMode,
  setServiceMode,
  dietaryFilter,
  setDietaryFilter,
  isAuthenticated = false,
  onAuth,
  onEdit,
  onLogout,
  onDelete,
  onUserChange,
  onOpenOrders,
  onOpenCart,
  onBrowseFood,
  onOpenProduct,
  onReorder,
}) {
  const [view, setView] = useState('overview');
  const [orderFilter, setOrderFilter] = useState('active');
  const [expandedOrder, setExpandedOrder] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState(null);
  const [addressError, setAddressError] = useState('');
  const [faqOpen, setFaqOpen] = useState('');
  const [profileError, setProfileError] = useState('');

  const updateUser = async (next) => {
    try {
      await onUserChange(next);
      setProfileError('');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Profile changes could not be saved.');
      throw error;
    }
  };
  const changeView = (next) => {
    setView(next);
    setExpandedOrder('');
  };
  const openAddressForm = (address = null) => {
    setEditingAddress(address?.id || null);
    setAddressForm(address ? { label: address.label, address: address.address, city: address.city, note: address.note || '' } : { label: 'Home', address: '', city: '', note: '' });
    setAddressError('');
  };
  const saveAddress = (event) => {
    event.preventDefault();
    if (!addressForm.address.trim() || !addressForm.city.trim()) {
      setAddressError('Enter both a street address and city.');
      return;
    }
    if (editingAddress) {
      setAddresses(addresses.map((address) => address.id === editingAddress ? { ...address, ...addressForm } : address));
    } else {
      setAddresses([...addresses, { ...addressForm, id: `address-${Date.now()}`, isDefault: addresses.length === 0 }]);
    }
    setEditingAddress(null);
      setAddressForm(null);
      setAddressError('');
  };
  const removeAddress = (id) => setAddresses((current) => {
    const remaining = current.filter((address) => address.id !== id);
    if (remaining.length && !remaining.some((address) => address.isDefault)) remaining[0] = { ...remaining[0], isDefault: true };
    return remaining;
  });
  const makeDefaultAddress = (id) => setAddresses(addresses.map((address) => ({ ...address, isDefault: address.id === id })));

  if (policySections[view]) {
    const page = policySections[view];
    return <ProfileSubpage title={page.title} onBack={() => changeView('overview')}>
      <p className="profile-policy-intro">{page.intro}</p>
      {page.sections.map(([title, content]) => <article className="profile-policy-section" key={title}><h3>{title}</h3><p>{content}</p></article>)}
      {view === 'terms' && <p className="profile-policy-developer"><b>Developer:</b> [DEVELOPER NAME]<br /><b>App:</b> DOWNTOWN</p>}
    </ProfileSubpage>;
  }

  if (view === 'layout-check') {
    return <ProfileSubpage title="Screenshot Layout Check" onBack={() => changeView('overview')}><ScreenshotChecker /></ProfileSubpage>;
  }

  if (view === 'orders') {
    const displayedOrders = orders.filter((order) => orderFilter === 'active' ? activeStatuses.has(order.status) : !activeStatuses.has(order.status));
    return <ProfileSubpage title="My Orders" onBack={() => changeView('overview')}><div className="profile-segmented-control" role="group" aria-label="Order history filter"><button className={orderFilter === 'active' ? 'active' : ''} onClick={() => setOrderFilter('active')}>Active</button><button className={orderFilter === 'previous' ? 'active' : ''} onClick={() => setOrderFilter('previous')}>Previous</button></div>
      {displayedOrders.length ? <div className="profile-card-stack">{displayedOrders.map((order) => <article className="profile-order-card" key={order.id}><button className="profile-order-summary" onClick={() => setExpandedOrder(expandedOrder === order.id ? '' : order.id)}><span className="profile-order-icon"><Clock3 size={18} /></span><span className="profile-order-heading"><b>Order {order.number || order.id}</b><small>{order.date} · {order.items?.length || 0} item types</small></span><span className={`profile-order-status ${activeStatuses.has(order.status) ? 'active' : ''}`}>{order.status}</span><ChevronRight size={18} /></button>{expandedOrder === order.id && <div className="profile-order-details"><p>{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p><small>{order.address}{order.city ? ` · ${order.city}` : ''}</small><small>{order.payment || 'Payment method unavailable'} · {`Rs. ${Math.round(order.total || 0).toLocaleString('en-IN')}`}</small><div className="profile-order-actions"><button onClick={onOpenOrders}>Order details</button><button onClick={() => onReorder(order.items || [])}>Reorder</button></div></div>}</article>)}</div> : <ProfileEmpty icon={ReceiptText} title={orderFilter === 'active' ? 'No active orders' : 'No previous orders'} text="Orders you place will appear here with their status and details." actionLabel="Browse food" onAction={onBrowseFood} />}</ProfileSubpage>;
  }

  if (view === 'cart') {
    return <ProfileSubpage title="My Cart" onBack={() => changeView('overview')}><div className="profile-inline-card"><div className="profile-inline-icon"><ShoppingBag size={20} /></div><div><b>{cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart</b><small>{cart.length ? cart.map((item) => `${item.name} ×${item.quantity}`).join(', ') : 'Your cart is ready for something delicious.'}</small></div></div><button className="profile-primary-button" onClick={onOpenCart}>{cartCount ? 'Open cart' : 'Start ordering'} <ChevronRight size={17} /></button></ProfileSubpage>;
  }

  if (view === 'restaurants' || view === 'food') {
    const isRestaurant = view === 'restaurants';
    const savedItems = isRestaurant ? restaurants.filter((restaurant) => favoriteRestaurants.includes(restaurant.id)) : products.filter((product) => favorites.includes(product.id));
    const removeSaved = isRestaurant ? toggleFavoriteRestaurant : toggleFavorite;
    return <ProfileSubpage title={isRestaurant ? 'Favourite Restaurants' : 'Favourite Food'} onBack={() => changeView('overview')}>
      {savedItems.length ? <div className="profile-card-stack">{savedItems.map((item) => <article className="profile-saved-card" key={item.id}><ContentImage src={item.image} alt={item.name} fallbackSrc={imageSlots.fallbacks[isRestaurant ? 'restaurant' : 'food']} /><div className="profile-saved-copy"><b>{item.name}</b><small>{isRestaurant ? `${item.cuisine} · ${item.area}` : `${item.category} · Rs. ${item.price}`}</small></div>{!isRestaurant && <button aria-label={`Open ${item.name}`} onClick={() => onOpenProduct(item)}><ChevronRight size={18} /></button>}<button className="profile-remove-saved" aria-label={`Remove ${item.name} from favourites`} onClick={() => removeSaved(item)}><Heart size={17} fill="currentColor" /></button></article>)}</div> : <ProfileEmpty icon={Heart} title={isRestaurant ? 'No favourite restaurants yet' : 'No favourite food yet'} text="Tap the heart on a restaurant or meal to save it here." actionLabel="Browse food" onAction={onBrowseFood} />}</ProfileSubpage>;
  }

  if (view === 'addresses') {
    return <ProfileSubpage title="Saved Addresses" onBack={() => changeView('overview')}>
      <button className="profile-secondary-button" onClick={() => openAddressForm()}><Plus size={17} /> Add new address</button>
      {addressForm && <AddressEditor form={addressForm} setForm={setAddressForm} error={addressError} onSubmit={saveAddress} onCancel={() => { setEditingAddress(null); setAddressForm(null); setAddressError(''); }} />}
      {!addresses.length && <ProfileEmpty icon={MapPin} title="No saved addresses" text="Add a Home, Work, or Other address for faster checkout." />}
      <div className="profile-card-stack">{addresses.map((address) => <article className="profile-address-card" key={address.id}><div className="profile-address-top"><b>{address.label}</b>{address.isDefault && <span>Default</span>}</div><p>{address.address}, {address.city}</p>{address.note && <small>{address.note}</small>}<div className="profile-address-actions"><button onClick={() => openAddressForm(address)}>Edit</button>{!address.isDefault && <button onClick={() => makeDefaultAddress(address.id)}>Set as default</button>}<button className="danger-text" onClick={() => removeAddress(address.id)}>Delete</button></div></article>)}</div>
    </ProfileSubpage>;
  }

  if (view === 'payments') {
    const preference = user?.paymentPreference || 'Cash on Delivery';
    return <ProfileSubpage title="Payment Methods" onBack={() => changeView('overview')}><p className="profile-section-lead">Choose a preferred checkout option. Payment credentials are not stored in this app.</p>{profileError && <p className="profile-auth-error" role="alert">{profileError}</p>}<div className="profile-card-stack">{['eSewa', 'Cash on Delivery'].map((method) => <button className={`profile-payment-method ${preference === method ? 'selected' : ''}`} key={method} onClick={() => { updateUser({ paymentPreference: method }).catch(() => {}); }}><span className={`profile-payment-mark ${method === 'eSewa' ? 'esewa' : ''}`}>{method === 'eSewa' ? 'e' : 'Rs'}</span><span><b>{method}</b><small>{method === 'eSewa' ? 'Continue through the available wallet flow' : 'Pay when your order arrives'}</small></span>{preference === method && <Check size={18} />}</button>)}</div><div className="profile-note"><ShieldCheck size={18} /><p>Only your preferred method is saved. Card numbers, wallet passwords, and payment credentials are never stored here.</p></div></ProfileSubpage>;
  }

  if (view === 'notifications') {
    const settings = user?.notificationPreferences || { orderUpdates: Boolean(user?.notifications), offers: false, restaurantUpdates: Boolean(user?.notifications) };
    const rows = [['orderUpdates', 'Order updates', 'Order status and delivery progress'], ['offers', 'Offers and promotions', 'Occasional discounts and new deals'], ['restaurantUpdates', 'Restaurant updates', 'Important updates about saved places']];
    return <ProfileSubpage title="Notifications" onBack={() => changeView('overview')}><div className="profile-card-stack">{rows.map(([key, label, description]) => <PreferenceRow key={key} icon={Bell} title={label} description={description} checked={Boolean(settings[key])} onChange={(checked) => { updateUser({ notificationPreferences: { ...settings, [key]: checked }, notifications: rows.some(([setting]) => setting === key ? checked : settings[setting]) }).catch(() => {}); }} />)}</div><p className="profile-section-footnote">Preferences are saved on this device. Push delivery depends on platform notification support.</p>{profileError && <p className="profile-auth-error" role="alert">{profileError}</p>}</ProfileSubpage>;
  }

  if (view === 'preferences') {
    return <ProfileSubpage title="Dining & Dietary Preferences" onBack={() => changeView('overview')}><div className="profile-setting-group"><h3><UtensilsCrossed size={17} /> Order type</h3><div className="profile-choice-row">{[['take-away', 'Take Away'], ['dine-in', 'Dine In']].map(([value, label]) => <button className={serviceMode === value ? 'selected' : ''} key={value} onClick={() => setServiceMode(value)}>{label}{serviceMode === value && <Check size={15} />}</button>)}</div></div><div className="profile-setting-group"><h3><Heart size={17} /> Dietary filter</h3><div className="profile-choice-row">{[['all', 'All'], ['veg', 'Vegetarian'], ['non-veg', 'Non-Vegetarian']].map(([value, label]) => <button className={dietaryFilter === value ? 'selected' : ''} key={value} onClick={() => setDietaryFilter(value)}>{label}{dietaryFilter === value && <Check size={15} />}</button>)}</div></div><p className="profile-section-footnote">These choices update the existing order-mode and menu filters.</p></ProfileSubpage>;
  }

  if (view === 'help') {
    const faqs = [['How do I check an order?', 'Open My Orders to see active and previous order details. The app currently keeps order records on this device.'], ['How do I update a delivery address?', 'Open Saved Addresses from your profile to add, edit, remove, or set a default address.'], ['How do I report an order problem?', 'Contact the restaurant about an order issue. Support contact options can be added when an official support channel is provided.']];
    return <ProfileSubpage title="Help & Support" onBack={() => changeView('overview')}><div className="profile-help-actions"><button className="profile-secondary-button" onClick={() => setFaqOpen(faqOpen === 'contact' ? '' : 'contact')}><CircleHelp size={17} /> Contact Support</button><button className="profile-secondary-button" onClick={() => setFaqOpen(faqOpen === 'report' ? '' : 'report')}><Info size={17} /> Report a problem</button></div>{['contact', 'report'].includes(faqOpen) && <p className="profile-section-footnote">{faqOpen === 'contact' ? 'An official support contact has not been provided in this version.' : 'No problem-reporting service is connected yet. For an order issue, contact the restaurant directly.'}</p>}<h3 className="profile-subsection-title">Frequently asked questions</h3>{faqs.map(([question, answer]) => <button className="profile-faq" key={question} onClick={() => setFaqOpen(faqOpen === question ? '' : question)}><span><b>{question}</b>{faqOpen === question && <small>{answer}</small>}</span><ChevronRight size={17} /></button>)}</ProfileSubpage>;
  }

  if (view === 'security') {
    return <ProfileSubpage title="Privacy & Security" onBack={() => changeView('overview')}><div className="profile-note"><LockKeyhole size={18} /><p>Your local DOWNTOWN profile is saved on this device. Optional Google sign-in is handled by the configured authentication service.</p></div><article className="profile-info-card"><h3>Login and password</h3><p>Password changes are not available in the local profile. This app does not ask for or store a password.</p><button onClick={onAuth}>Optional sign-in options <ChevronRight size={16} /></button></article><article className="profile-info-card"><h3>Your app data</h3><p>Local profile details, uploaded profile photo, addresses, orders, cart, favourites, and preferences are stored locally by this app.</p><button onClick={() => changeView('privacy')}>Read Privacy Policy <ChevronRight size={16} /></button></article><button className="profile-danger-option" onClick={onDelete}><Trash2 size={17} /> Delete account <small>Account deletion requires a connected backend</small></button></ProfileSubpage>;
  }

  if (view === 'about') {
    return <ProfileSubpage title="About DOWNTOWN" onBack={() => changeView('overview')}><div className="profile-about-card"><ContentImage src={imageSlots.brand.logo} alt="DOWNTOWN logo" fallbackSrc={imageSlots.brand.logo} showFallbackIcon={false} /><h2>DOWNTOWN</h2><p>Discover local favourites and order meals from nearby restaurants.</p><small>Version 1.0.0</small><small>Developer: [DEVELOPER NAME]</small></div><button className="profile-link-option" onClick={() => changeView('terms')}>Terms & Conditions <ChevronRight size={17} /></button><button className="profile-link-option" onClick={() => changeView('privacy')}>Privacy Policy <ChevronRight size={17} /></button></ProfileSubpage>;
  }

  return <section className="screen utility-screen profile-screen">
    <header className="profile-page-heading"><div><p className="eyebrow">DOWNTOWN ACCOUNT</p><h1>My Profile</h1></div><span className="profile-secure-badge"><ShieldCheck size={14} /> {isAuthenticated ? 'Verified account' : 'DOWNTOWN profile'}</span></header>
    <section className="profile-header-card"><ProfilePhoto photo={user?.photo || ''} name={user?.name || ''} onChange={(photo) => updateUser({ photo })} large /><h2>{user?.name?.trim() || 'Your Name'}</h2><p>{user?.email?.trim() || 'Add your email'}</p><p>{user?.phone?.trim() || 'Add phone number'}</p>{profileError && <p className="profile-auth-error" role="alert">{profileError}</p>}<button className="profile-edit-button" onClick={onEdit}><Pencil size={15} /> Edit Profile</button></section>
    <section className="profile-quick-stats"><button onClick={() => changeView('orders')}><ReceiptText size={18} /><b>{orders.length}</b><small>Orders</small></button><button onClick={() => changeView('cart')}><ShoppingBag size={18} /><b>{cartCount}</b><small>Cart items</small></button><button onClick={() => changeView('food')}><Heart size={18} /><b>{favorites.length}</b><small>Favourites</small></button></section>
    <h2 className="profile-menu-heading">Account & preferences</h2>
    <div className="profile-menu-list">{profileMenu.map(([key, title, description, Icon]) => <button className="profile-menu-row" key={key} onClick={() => { if (key === 'addresses') changeView('addresses'); else changeView(key); }}><span className="profile-menu-icon"><Icon size={19} /></span><span className="profile-menu-label"><b>{title}</b><small>{key === 'cart' ? `${cartCount} ${cartCount === 1 ? 'item' : 'items'} · ${description}` : description}</small></span><ChevronRight size={17} /></button>)}</div>
    {isAuthenticated && <section className="profile-account-actions"><button className="profile-logout-button" onClick={onLogout}><LogOut size={17} /> Log out</button><button className="profile-delete-button" onClick={onDelete}><Trash2 size={16} /> Delete account</button></section>}
    <p className="profile-version">DOWNTOWN · Version 1.0.0</p>
  </section>;
}

function ProfileSubpage({ title, onBack, children }) {
  return <section className="screen utility-screen profile-screen profile-subpage"><header className="profile-subpage-heading"><button aria-label="Back to profile" onClick={onBack}><ArrowLeft size={19} /></button><h1>{title}</h1></header>{children}</section>;
}

function ProfileEmpty({ icon: Icon, title, text, actionLabel, onAction }) {
  return <div className="profile-empty-state"><Icon size={25} /><h2>{title}</h2><p>{text}</p>{actionLabel && <button onClick={onAction}>{actionLabel}</button>}</div>;
}

function AddressEditor({ form, setForm, error, onSubmit, onCancel }) {
  return <form className="profile-address-editor" onSubmit={onSubmit}><label>Address type<select value={form.label} onChange={(event) => setForm({ ...form, label: event.target.value })}><option>Home</option><option>Work</option><option>Other</option></select></label><label>Street address<input value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} placeholder="House, street, neighbourhood" /></label><label>City<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="City" /></label><label>Delivery note (optional)<input value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Nearby landmark or instructions" /></label>{error && <p className="form-error">{error}</p>}<div className="profile-address-actions"><button type="button" onClick={onCancel}>Cancel</button><button type="submit">Save address</button></div></form>;
}

function PreferenceRow({ icon: Icon, title, description, checked, onChange }) {
  return <label className="profile-preference-row"><span className="profile-menu-icon"><Icon size={18} /></span><span><b>{title}</b><small>{description}</small></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><i /></label>;
}
