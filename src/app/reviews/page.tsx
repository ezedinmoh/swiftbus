'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './reviews.module.css';

const AVATAR_COLORS = ['#1a73e8','#ff6d00','#28a745','#6f42c1','#dc3545','#17a2b8'];

const REVIEWS_DATA = [
    { id:1, name:'Samuel Bekele', initials:'SB', route:'Addis Ababa → Bahir Dar', rating:5, date:'Nov 15, 2025', text:'Excellent service! The bus was clean, comfortable, and arrived on time. The online booking was seamless and the customer support team was very helpful.', verified:true, color:'#1a73e8' },
    { id:2, name:'Meron Tekle', initials:'MT', route:'Hawasa → Adama', rating:4, date:'Nov 10, 2025', text:'Good experience overall. The bus was modern and had WiFi, which was great. Minor delay in departure, but we arrived at the destination on time.', verified:true, color:'#ff6d00' },
    { id:3, name:'Kebede Alemu', initials:'KA', route:'Mekele → Addis Ababa', rating:5, date:'Nov 5, 2025', text:"Best bus travel experience I've had in Ethiopia. Comfortable seats, professional driver, and all promised amenities. Will definitely use SwiftBus again!", verified:true, color:'#28a745' },
    { id:4, name:'Tigist Haile', initials:'TH', route:'Gonder → Bahir Dar', rating:5, date:'Oct 28, 2025', text:'The online booking system is fantastic! So easy to find a good route, pay securely, and receive my e-ticket. The bus itself was comfortable with working AC.', verified:false, color:'#6f42c1' },
    { id:5, name:'Dawit Mengistu', initials:'DM', route:'Addis Ababa → Jimma', rating:3, date:'Oct 20, 2025', text:'The booking process was smooth but the bus was slightly old and AC was not working well. The driver was professional. Hope they upgrade the fleet soon.', verified:true, color:'#dc3545' },
    { id:6, name:'Hiwot Tadesse', initials:'HT', route:'Adama → Hawasa', rating:5, date:'Oct 14, 2025', text:'Outstanding! Comfortable seats, panoramic views, on-time departure. The bus had charging ports and entertainment. SwiftBus raised the bar for travel in Ethiopia!', verified:true, color:'#17a2b8' },
];

const STATS = [
    { num:'100k+', label:'Travelers Served', desc:'Since we started' },
    { num:'98%', label:'On-time Departures', desc:'Based on recent data' },
    { num:'4.8/5', label:'Customer Rating', desc:'Average satisfaction score' },
    { num:'50+', label:'Destinations', desc:'Across Ethiopia' },
];

function StarDisplay({ rating }: { rating: number }) {
    return (
        <div className={styles.reviewStars}>
            {[1,2,3,4,5].map(i => (
                <i key={i} className={i <= rating ? 'fas fa-star' : 'far fa-star'} style={{ color: '#ffc107' }}></i>
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const [filter, setFilter] = useState('all');
    const [form, setForm] = useState({ name: '', route: '', date: '', title: '', content: '' });
    const [formRating, setFormRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const filtered = useMemo(() => {
        if (filter === 'all') return REVIEWS_DATA;
        return REVIEWS_DATA.filter(r => r.rating === parseInt(filter));
    }, [filter]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formRating === 0) return alert('Please provide a star rating.');
        setSubmitting(true);
        await new Promise(r => setTimeout(r, 1200));
        setSubmitting(false);
        alert('Thank you! Your review has been submitted for moderation.');
        setForm({ name:'', route:'', date:'', title:'', content:'' });
        setFormRating(0);
    };

    return (
        <main>
            <section className={styles.pageHero}>
                <div className="container">
                    <h1>Customer Reviews</h1>
                    <p>See what our passengers have to say about their SwiftBus experience</p>
                </div>
            </section>

            <section className={styles.reviewsContent}>
                <div className="container">
                    <div className={styles.sectionTitle}>
                        <h2>Real Stories from Real Travelers</h2>
                        <p>Join thousands of satisfied customers who trust SwiftBus for their journeys</p>
                    </div>

                    <div className={styles.overallRating}>
                        <div className={styles.ratingNumber}>4.8</div>
                        <div className={styles.ratingStars}>
                            {[1,2,3,4].map(i => <i key={i} className="fas fa-star"></i>)}
                            <i className="fas fa-star-half-alt"></i>
                        </div>
                        <div className={styles.ratingCount}>Based on 2,347 reviews</div>
                    </div>

                    <div className={styles.filterRow}>
                        {['all','5','4','3','2','1'].map(f => (
                            <button key={f}
                                className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                                onClick={() => setFilter(f)}
                            >{f === 'all' ? 'All Reviews' : `${f} Star${f === '1' ? '' : 's'}`}</button>
                        ))}
                    </div>

                    <div className={styles.reviewsGrid}>
                        {filtered.length === 0 ? (
                            <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>No reviews for this rating.</p>
                        ) : filtered.map(r => (
                            <div key={r.id} className={styles.reviewCard}>
                                <div className={styles.reviewHeader}>
                                    <div className={styles.reviewerInfo}>
                                        <div className={styles.avatar} style={{ background: r.color }}>{r.initials}</div>
                                        <div>
                                            <div className={styles.reviewerName}>{r.name}</div>
                                            <div className={styles.reviewerRoute}><i className="fas fa-route" style={{ marginRight: 5 }}></i>{r.route}</div>
                                        </div>
                                    </div>
                                    <StarDisplay rating={r.rating} />
                                </div>
                                <p className={styles.reviewText}>"{r.text}"</p>
                                <div className={styles.reviewFooter}>
                                    <span><i className="fas fa-calendar-alt" style={{ marginRight: 5 }}></i>{r.date}</span>
                                    {r.verified && <span className={styles.verifiedBadge}><i className="fas fa-check-circle" style={{ marginRight: 4 }}></i>Verified</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Write Review Section */}
            <section className={styles.writeSection}>
                <div className="container">
                    <div className={styles.sectionTitle}>
                        <h2>Share Your Experience</h2>
                        <p>Help other travelers by sharing your SwiftBus journey</p>
                    </div>
                    <form className={styles.writeForm} onSubmit={handleSubmitReview}>
                        {[
                            { id:'rev-name', label:'Your Name', type:'text', field:'name', placeholder:'Enter your name' },
                            { id:'rev-route', label:'Route Traveled', type:'text', field:'route', placeholder:'e.g. Addis Ababa to Hawasa' },
                        ].map(f => (
                            <div key={f.id} className={styles.formGroup}>
                                <label htmlFor={f.id}>{f.label}</label>
                                <input id={f.id} type={f.type} placeholder={f.placeholder}
                                    value={(form as any)[f.field]}
                                    onChange={e => setForm({ ...form, [f.field]: e.target.value })} />
                            </div>
                        ))}

                        <div className={styles.formGroup}>
                            <label htmlFor="rev-date">Travel Date</label>
                            <input id="rev-date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Your Rating *</label>
                            <div className={styles.starRow}>
                                {[1,2,3,4,5].map(s => (
                                    <button key={s} type="button"
                                        className={`${styles.starBtn} ${s <= (hoverRating || formRating) ? styles.starActive : ''}`}
                                        onMouseEnter={() => setHoverRating(s)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setFormRating(s)}
                                        aria-label={`Rate ${s}`}
                                    ><i className={s <= (hoverRating || formRating) ? 'fas fa-star' : 'far fa-star'}></i></button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="rev-title">Review Title</label>
                            <input id="rev-title" type="text" placeholder="Brief summary of your experience"
                                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="rev-content">Your Review *</label>
                            <textarea id="rev-content" placeholder="Share details about your travel experience..."
                                value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? <><span className="spinner"></span> Submitting…</> : <><i className="fas fa-paper-plane"></i> Submit Review</>}
                        </button>
                    </form>
                </div>
            </section>

            {/* Stats */}
            <section className={styles.statsSection}>
                <div className="container">
                    <div className={styles.sectionTitle}>
                        <h2>Traveler Statistics</h2>
                        <p>Numbers that tell our story</p>
                    </div>
                    <div className={styles.statsGrid}>
                        {STATS.map(s => (
                            <div key={s.label} className={styles.statCard}>
                                <span className={styles.statNumber}>{s.num}</span>
                                <h4>{s.label}</h4>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
