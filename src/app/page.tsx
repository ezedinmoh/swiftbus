'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './home.module.css';

type City = { city_code: string; name: string };

// Fallback if API is unavailable — codes must match the seeded city_code values
const FALLBACK_CITIES: City[] = [
  { city_code: 'addis-ababa', name: 'Addis Ababa' },
  { city_code: 'kombolcha',   name: 'Kombolcha' },
  { city_code: 'bahir-dar',   name: 'Bahir Dar' },
  { city_code: 'dessie',      name: 'Dessie' },
  { city_code: 'adama',       name: 'Adama (Nazreth)' },
  { city_code: 'hawassa',     name: 'Hawassa' },
  { city_code: 'arbaminch',   name: 'Arba Minch' },
  { city_code: 'gondar',      name: 'Gondar' },
  { city_code: 'mekele',      name: 'Mekele' },
  { city_code: 'jimma',       name: 'Jimma' },
];

const ROUTES = [
  { origin: 'Addis Ababa', destination: 'Kombolcha', duration: '5-6 hours', price: 250, distance: '380km' },
  { origin: 'Dessie', destination: 'Bahirdar', duration: '10-11 hours', price: 350, distance: '580km' },
  { origin: 'Addis Ababa', destination: 'Hawasa', duration: '4-5 hours', price: 220, distance: '275km' },
  { origin: 'Addis Ababa', destination: 'Mekele', duration: '12-13 hours', price: 420, distance: '780km' },
  { origin: 'Bahirdar', destination: 'Gonder', duration: '3-4 hours', price: 180, distance: '180km' },
  { origin: 'Adama', destination: 'Hawasa', duration: '3-4 hours', price: 160, distance: '220km' },
];

const FEATURES = [
  { icon: 'fa-bolt', title: 'Quick Booking', desc: 'Book your bus tickets in just a few clicks with our user-friendly platform.' },
  { icon: 'fa-shield-alt', title: 'Safe & Secure', desc: 'Your payments and personal information are protected with advanced security.' },
  { icon: 'fa-headset', title: '24/7 Support', desc: 'Our customer support team is available round the clock to assist you.' },
  { icon: 'fa-tags', title: 'Best Prices', desc: 'We offer competitive prices with no hidden charges on all bus routes.' },
];

const COMPANIES = [
  { name: 'Selam Bus', rating: 4.8, color: '#1a73e8', icon: '🚌', desc: 'Premium service with WiFi, AC, meals', routes: 15 },
  { name: 'Abay Bus', rating: 4.5, color: '#ff6d00', icon: '🚍', desc: 'Reliable northern routes, comfortable seats', routes: 12 },
  { name: 'Ethio Bus', rating: 4.2, color: '#28a745', icon: '🚎', desc: 'Affordable daily travel, frequent departures', routes: 20 },
  { name: 'Habesha Bus', rating: 4.4, color: '#6f42c1', icon: '🚐', desc: 'Cultural experience, traditional snacks', routes: 10 },
];

const CITY_DATA = [
  { name: 'Addis Ababa', icon: '🏙️', desc: 'Capital city, heart of Ethiopia', routes: 8 },
  { name: 'Bahirdar', icon: '🌊', desc: 'Lake Tana & Blue Nile Falls', routes: 5 },
  { name: 'Hawasa', icon: '🦋', desc: 'Sidama region\'s beautiful lake city', routes: 6 },
  { name: 'Mekele', icon: '⛰️', desc: 'Gateway to Danakil Depression', routes: 4 },
  { name: 'Gonder', icon: '🏰', desc: 'City of castles & churches', routes: 5 },
  { name: 'Jimma', icon: '☕', desc: 'Birthplace of coffee culture', routes: 4 },
  { name: 'Adama', icon: '🌿', desc: 'Nasret — gateway to east Ethiopia', routes: 6 },
  { name: 'Dessie', icon: '🌄', desc: 'Mountain scenery of South Wollo', routes: 5 },
  { name: 'Kombolcha', icon: '🏭', desc: 'Industrial hub of Amhara region', routes: 4 },
  { name: 'Arbaminch', icon: '🐊', desc: 'Twin lakes & Nechisar National Park', routes: 3 },
];

const PAYMENT_METHODS = [
  { icon: 'fa-mobile-alt', name: 'Telebirr', desc: 'Fast and secure mobile payments' },
  { icon: 'fa-university', name: 'Commercial Bank of Ethiopia', desc: 'Direct bank transfer and online banking' },
  { icon: 'fa-landmark', name: 'Bank of Abyssinia', desc: 'Secure online payment gateway' },
  { icon: 'fa-piggy-bank', name: 'Dashen Bank', desc: 'Easy mobile and internet banking' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '3px', color: '#ffc107', fontSize: '14px' }}>
      {[1,2,3,4,5].map(i => (
        <i key={i} className={i <= Math.floor(rating) ? 'fas fa-star' : i - 0.5 <= rating ? 'fas fa-star-half-alt' : 'far fa-star'}></i>
      ))}
      <span style={{ color: '#6c757d', marginLeft: '5px', fontSize: '13px' }}>({rating})</span>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>(FALLBACK_CITIES);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [showBackTop, setShowBackTop] = useState(false);
  const [minDate, setMinDate] = useState('');
  const heroRef = useRef<HTMLElement>(null);

  // Load cities from DB and set minDate
  useEffect(() => {
    setMinDate(new Date().toISOString().split('T')[0]);
    fetch('/api/search?action=get_cities')
      .then(r => r.json())
      .then(json => { if (json.success && json.data?.length) setCities(json.data); })
      .catch(() => {}); // silently fall back to hardcoded list
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) {
      alert('Please select both departure and destination cities');
      return;
    }
    if (origin === destination) {
      alert('Departure and destination cannot be the same city');
      return;
    }
    const params = new URLSearchParams({ from: origin, to: destination, date });
    router.push(`/search?${params.toString()}`);
  };

  const handleCityCardClick = (cityName: string) => {
    const cleanName = cityName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const city = cities.find(c => {
      const dbClean = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const codeClean = c.city_code.replace(/[^a-z0-9]/g, '');
      return dbClean === cleanName || dbClean.includes(cleanName) || cleanName.includes(dbClean) || codeClean === cleanName;
    });
    const code = city ? city.city_code : cityName.toLowerCase().replace(/\s+/g, '-');
    setDestination(code);
    if (!origin || origin === code) {
      const addis = cities.find(c => c.name.toLowerCase().includes('addis'));
      setOrigin(addis ? addis.city_code : 'addis-ababa');
    }
    heroRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero} ref={heroRef}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Journey Across<br />Ethiopia</h1>
          <p className={styles.heroSubtitle}>Experience comfort and reliability on every route</p>

          {/* Search Card */}
          <form className={styles.searchCard} onSubmit={handleSearch}>
            <div className={styles.field}>
              <label>From</label>
              <select value={origin} onChange={e => setOrigin(e.target.value)} id="originSelect">
                <option value="">Select city</option>
                {cities.map(c => <option key={c.city_code} value={c.city_code}>{c.name}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>To</label>
              <select value={destination} onChange={e => setDestination(e.target.value)} id="destinationSelect">
                <option value="">Select city</option>
                {cities.map(c => <option key={c.city_code} value={c.city_code}>{c.name}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Travel Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} id="travelDate" min={minDate} />
            </div>
            <button type="submit" className={styles.searchBtn} id="heroSearchBtn">
              <i className="fas fa-search"></i> Search Buses
            </button>
          </form>

          {/* Stats */}
          <div className={styles.heroStats}>
            {[
              { num: '10', label: 'Cities' },
              { num: '4', label: 'Bus Companies' },
              { num: '50+', label: 'Routes' },
              { num: '24/7', label: 'Support' },
            ].map(s => (
              <div key={s.label} className={styles.stat}>
                <span className={styles.statNumber}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className="container">
          <div className="section-title">
            <h2>Why Choose SwiftBus?</h2>
            <p>We provide the best bus booking experience with these amazing features</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map(f => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  <i className={`fas ${f.icon}`}></i>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className={styles.routesSection} id="routes">
        <div className="container">
          <div className="section-title">
            <h2>Popular Routes</h2>
            <p>Explore our most popular bus routes across Ethiopia</p>
          </div>
          <div className={styles.routesContainer}>
            {ROUTES.map(r => (
              <div key={`${r.origin}-${r.destination}`} className={styles.routeCard}>
                <div className={styles.routeInfo}>
                  <span className={styles.routeOrigin}>{r.origin}</span>
                  <span className={styles.routeArrow}><i className="fas fa-arrow-right"></i></span>
                  <span className={styles.routeDestination}>{r.destination}</span>
                </div>
                <div className={styles.routeDetails}>
                  <span><i className="fas fa-clock"></i> {r.duration}</span>
                  <span><i className="fas fa-road"></i> {r.distance}</span>
                  <span className={styles.routePrice}>ETB {r.price}</span>
                </div>
                <Link
                  href={`/search?from=${encodeURIComponent(r.origin)}&to=${encodeURIComponent(r.destination)}`}
                  className={styles.bookRouteBtn}
                >
                  Book Now <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bus Companies Section */}
      <section className={styles.companies} id="companies">
        <div className="container">
          <div className="section-title">
            <h2>Our Bus Partners</h2>
            <p>Travel with trusted and reliable bus companies across Ethiopia</p>
          </div>
          <div className={styles.companiesGrid}>
            {COMPANIES.map(c => (
              <div key={c.name} className={styles.companyCard}>
                <div className={styles.companyLogo} style={{ background: `${c.color}20`, color: c.color }}>
                  <span style={{ fontSize: '40px' }}>{c.icon}</span>
                </div>
                <div className={styles.companyInfo}>
                  <h3>{c.name}</h3>
                  <StarRating rating={c.rating} />
                  <p>{c.desc}</p>
                  <div className={styles.companyMeta}>
                    <span><i className="fas fa-route"></i> {c.routes} Routes</span>
                    <Link href={`/search?company=${encodeURIComponent(c.name)}`} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: '13px' }}>
                      View Schedules
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className={styles.citiesSection} id="cities">
        <div className="container">
          <div className={styles.citiesHeader}>
            <h2>Explore Ethiopian Cities</h2>
            <p>Discover the diverse destinations we connect across beautiful Ethiopia</p>
          </div>
          <div className={styles.citiesGrid}>
            {CITY_DATA.map(city => (
              <div key={city.name} className={styles.cityCard}>
                <div className={styles.cityIcon}>{city.icon}</div>
                <h3>{city.name}</h3>
                <p className={styles.cityDesc}>{city.desc}</p>
                <div className={styles.cityRoutes}>
                  <i className="fas fa-route"></i>
                  <span>{city.routes} routes available</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className={styles.paymentSection} id="payment-methods">
        <div className="container">
          <div className="section-title">
            <h2>Secure Payment Methods</h2>
            <p>Choose from our trusted payment partners</p>
          </div>
          <div className={styles.paymentGrid}>
            {PAYMENT_METHODS.map(p => (
              <div key={p.name} className={styles.paymentCard}>
                <div className={styles.paymentIcon}>
                  <i className={`fas ${p.icon}`}></i>
                </div>
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={styles.ctaContent}>
            <h2>Ready to Travel?</h2>
            <p>Join thousands of happy travelers and book your next bus journey across Ethiopia</p>
            <div className={styles.ctaButtons}>
              <Link href="/search" className="btn btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
                <i className="fas fa-search"></i> Search Buses
              </Link>
              <Link href="/signup" className="btn btn-outline" style={{ fontSize: '16px', padding: '14px 32px', borderColor: 'white', color: 'white' }}>
                <i className="fas fa-user-plus"></i> Create Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top */}
      {showBackTop && (
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <i className="fas fa-chevron-up"></i>
        </button>
      )}
    </>
  );
}
