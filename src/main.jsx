import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase, isSupabaseConfigured } from './supabase';
import './styles.css';

const PRODUCTS = [
  { id: 'skewers', name: 'Chicken Skewers', price: 49, desc: 'Juicy charcoal-grilled chicken skewers.', pos: '0% 55%' },
  { id: 'wings', name: 'Chicken Wings', price: 129, desc: 'Smoky, spicy and freshly grilled wings.', image: '/assets/wings.png' },
  { id: 'kababs', name: 'Chicken Kababs', price: 99, desc: 'Charred, tender kababs with FIREBITE flavour.', image: '/assets/kabab.png' },
  { id: 'combo', name: 'FIREBITE Combo', price: 249, desc: 'Skewers + wings + kababs. Perfect for sharing.', pos: '50% 100%' }
];

function money(n) { return `₹${n}`; }

function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('firebite-cart') || '[]'));
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { localStorage.setItem('firebite-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user || null));
    return () => listener.subscription.unsubscribe();
  }, []);

  const count = cart.reduce((s, x) => s + x.qty, 0);
  const total = cart.reduce((s, x) => s + x.price * x.qty, 0);

  function add(product) {
    setCart(prev => {
      const found = prev.find(x => x.id === product.id);
      return found ? prev.map(x => x.id === product.id ? { ...x, qty: x.qty + 1 } : x) : [...prev, { ...product, qty: 1 }];
    });
    setMessage(`${product.name} added to cart`);
    setTimeout(() => setMessage(''), 1800);
  }
  function change(id, delta) {
    setCart(prev => prev.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0));
  }

  async function submitAuth(e) {
    e.preventDefault(); setMessage('');
    if (!supabase) {
      setUser({ id: 'demo-user', email }); setAuthOpen(false); setMessage('Demo login successful. Connect Supabase to enable real accounts.'); return;
    }
    const result = authMode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    if (result.error) setMessage(result.error.message);
    else { setAuthOpen(false); setMessage(authMode === 'login' ? 'Welcome back!' : 'Account created. Check email if confirmation is enabled.'); }
  }

  async function placeOrder(e) {
    e.preventDefault(); setMessage('');
    if (!cart.length) return;
    if (!user) { setCheckoutOpen(false); setAuthOpen(true); setMessage('Please login to place your order.'); return; }
    if (!supabase || user.id === 'demo-user') {
      setCart([]); setCheckoutOpen(false); setMessage('Order captured in demo mode. Connect Supabase for live orders.'); return;
    }
    const { error } = await supabase.from('orders').insert({
      user_id: user.id, customer_name: name, phone,
      items: cart.map(({ id, name, price, qty }) => ({ id, name, price, qty })), total
    });
    if (error) setMessage(error.message);
    else { setCart([]); setCheckoutOpen(false); setMessage('Order placed successfully! 🔥'); }
  }

  return <>
    <header className="nav">
      <a className="brand" href="#home"><span className="flame">🔥</span><b>FIRE</b><strong>BITE</strong></a>
      <nav><a href="#menu">Menu</a><a href="#about">About</a><a href="#contact">Contact</a></nav>
      <div className="navActions">
        <button className="loginBtn" onClick={() => setAuthOpen(true)}>{user ? 'Account' : 'Login'}</button>
        <button className="cartBtn" onClick={() => setCheckoutOpen(true)}>🛒 <span>{count}</span></button>
      </div>
    </header>

    <main>
      <section id="home" className="hero">
        <div className="heroCopy">
          <div className="eyebrow">🔥 CHARCOAL GRILLED • FRESH EVERY ORDER</div>
          <h1>FIRE<span>BITE</span></h1>
          <h2>CHARCOAL CHICKEN & KABABS</h2>
          <p>Smoked. Grilled. Irresistible.</p>
          <div className="heroButtons"><a className="primary" href="#menu">Order Now</a><a className="secondary" href="#about">Our Story</a></div>
        </div>
        <div className="heroVisual" aria-label="FIREBITE charcoal chicken banner"></div>
      </section>

      <section className="trust"><div>🔥 <b>Charcoal Grilled</b></div><div>🌿 <b>Fresh Ingredients</b></div><div>👨‍🍳 <b>Hygienic Preparation</b></div><div>👍 <b>Great Taste</b></div></section>

      <section id="menu" className="section menuSection">
        <div className="sectionHead"><div><span>OUR MENU</span><h2>Pick Your FIREBITE</h2></div><p>Hot off the charcoal grill, made fresh for every order.</p></div>
        <div className="cards">{PRODUCTS.map(p => <article className="card" key={p.id}>
          <div className="productImg" style={{ backgroundImage: `url(${p.image || '/assets/firebite-banner.png'})`, backgroundPosition: p.pos || 'center' }}></div>
          <div className="cardBody"><div><h3>{p.name}</h3><p>{p.desc}</p></div><div className="cardBottom"><b>{money(p.price)}</b><button onClick={() => add(p)}>+ Add</button></div></div>
        </article>)}</div>
      </section>

      <section id="about" className="about section"><div className="aboutImg"></div><div><span>WHY FIREBITE</span><h2>Real fire. Real flavour.</h2><p>We bring smoky charcoal flavour to chicken skewers, wings and kababs. Simple ingredients, proper grilling and bold FIREBITE taste.</p><div className="stats"><div><b>100%</b><small>Charcoal Grilled</small></div><div><b>Fresh</b><small>Every Order</small></div><div><b>Hot</b><small>Off The Grill</small></div></div></div></section>

      <section id="contact" className="cta"><h2>Ready for a FIREBITE?</h2><p>Order your favourites and taste the grill.</p><a className="primary" href="#menu">Explore Menu</a></section>
    </main>

    <footer><div className="brand"><span className="flame">🔥</span><b>FIRE</b><strong>BITE</strong></div><p>Charcoal Chicken & Kababs</p><small>© {new Date().getFullYear()} FIREBITE. Smoked. Grilled. Irresistible.</small></footer>

    {message && <div className="toast">{message}</div>}

    {authOpen && <div className="overlay" onMouseDown={() => setAuthOpen(false)}><div className="modal" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setAuthOpen(false)}>×</button><div className="modalLogo">🔥 FIRE<span>BITE</span></div><h2>{authMode === 'login' ? 'Welcome back' : 'Create your account'}</h2><p>{authMode === 'login' ? 'Login to continue your order.' : 'Create an account to order FIREBITE.'}</p><form onSubmit={submitAuth}>{authMode === 'signup' && <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" required />}<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required /><input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" minLength="6" required /><button className="primary full">{authMode === 'login' ? 'Login' : 'Create Account'}</button></form><button className="switch" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>{authMode === 'login' ? 'New here? Create an account' : 'Already have an account? Login'}</button></div></div>}

    {checkoutOpen && <div className="overlay" onMouseDown={() => setCheckoutOpen(false)}><div className="modal checkout" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setCheckoutOpen(false)}>×</button><h2>Your FIREBITE Cart</h2>{cart.length === 0 ? <div className="empty">Your cart is empty.<br/><a href="#menu" onClick={() => setCheckoutOpen(false)}>Browse menu →</a></div> : <><div className="cartLines">{cart.map(x => <div className="cartLine" key={x.id}><div><b>{x.name}</b><small>{money(x.price)} each</small></div><div className="qty"><button onClick={() => change(x.id,-1)}>−</button><b>{x.qty}</b><button onClick={() => change(x.id,1)}>+</button></div><strong>{money(x.price*x.qty)}</strong></div>)}</div><div className="total"><span>Total</span><b>{money(total)}</b></div>{!user && <div className="loginHint">Login is required before placing an order.</div>}<form onSubmit={placeOrder}><input value={name} onChange={e => setName(e.target.value)} placeholder="Customer name" required /><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" required /><button className="primary full">{user ? 'Place Order 🔥' : 'Login & Continue'}</button></form></>}</div></div>}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);
