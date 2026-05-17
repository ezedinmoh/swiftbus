'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './feedback.module.css';

const CATEGORIES = [
    { id: 'booking', label: 'Booking Process' },
    { id: 'travel', label: 'Travel Experience' },
    { id: 'support', label: 'Customer Support' },
    { id: 'website', label: 'Website / App' },
    { id: 'suggestion', label: 'Suggestions' },
    { id: 'other', label: 'Other' },
];

export default function FeedbackPage() {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [category, setCategory] = useState('');
    const [form, setForm] = useState({ name: '', email: '', title: '', details: '', suggestions: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const displayRating = hoverRating || rating;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.details) return alert('Please fill all required fields.');
        if (rating === 0) return alert('Please provide a star rating.');
        if (!category) return alert('Please select a feedback category.');

        setLoading(true);
        await new Promise(r => setTimeout(r, 1200));
        setLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <main>
                <section className={styles.pageHero}>
                    <div className="container">
                        <h1>Share Your Feedback</h1>
                        <p>Your opinion helps us improve our services</p>
                    </div>
                </section>
                <section className={styles.feedbackContent}>
                    <div className="container">
                        <div className={styles.formContainer} style={{ textAlign: 'center', padding: '60px 40px' }}>
                            <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
                            <h2 style={{ fontSize: 28, marginBottom: 14, color: '#222' }}>Thank You!</h2>
                            <p style={{ color: '#666', marginBottom: 28, fontSize: 16 }}>
                                Your feedback has been submitted. We appreciate your time and will use your suggestions to improve our services.
                            </p>
                            <Link href="/" className="btn btn-primary">Back to Home</Link>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main>
            <section className={styles.pageHero}>
                <div className="container">
                    <h1>Share Your Feedback</h1>
                    <p>Your opinion helps us improve our services and create better travel experiences</p>
                </div>
            </section>

            <section className={styles.feedbackContent}>
                <div className="container">
                    <div className={styles.sectionTitle}>
                        <h2>We Value Your Opinion</h2>
                        <p>Help us make SwiftBus better by sharing your experience</p>
                    </div>

                    <form className={styles.formContainer} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="fb-name">Your Name <span style={{ color: '#888', fontWeight: 400 }}>(Optional)</span></label>
                            <input id="fb-name" type="text" placeholder="Enter your name"
                                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="fb-email">Email Address <span style={{ color: '#888', fontWeight: 400 }}>(Optional)</span></label>
                            <input id="fb-email" type="email" placeholder="your@email.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>

                        {/* Star Rating */}
                        <div className={styles.ratingSection}>
                            <span className={styles.ratingLabel}>Overall Experience Rating *</span>
                            <div className={styles.starRow}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button key={star} type="button"
                                        className={`${styles.starBtn} ${star <= displayRating ? styles.starActive : ''}`}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setRating(star)}
                                        aria-label={`Rate ${star} stars`}
                                    >
                                        <i className={star <= displayRating ? 'fas fa-star' : 'far fa-star'}></i>
                                    </button>
                                ))}
                            </div>
                            <div className={styles.ratingLabels}><span>Poor</span><span>Excellent</span></div>
                        </div>

                        {/* Category */}
                        <div className={styles.formGroup}>
                            <label>Feedback Category *</label>
                            <div className={styles.categoryGrid}>
                                {CATEGORIES.map(cat => (
                                    <button key={cat.id} type="button"
                                        className={`${styles.categoryBtn} ${category === cat.id ? styles.categoryBtnActive : ''}`}
                                        onClick={() => setCategory(cat.id)}
                                    >{cat.label}</button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="fb-title">Feedback Title *</label>
                            <input id="fb-title" type="text" placeholder="Brief description of your feedback"
                                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="fb-details">Detailed Feedback *</label>
                            <textarea id="fb-details" placeholder="Please share your experience in detail..."
                                value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} required />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="fb-suggestions">Suggestions for Improvement <span style={{ color: '#888', fontWeight: 400 }}>(Optional)</span></label>
                            <textarea id="fb-suggestions" placeholder="How can we make our service better?"
                                value={form.suggestions} onChange={e => setForm({ ...form, suggestions: e.target.value })} />
                        </div>

                        <button type="submit" className={styles.submitBtn} disabled={loading}>
                            {loading ? <><span className="spinner"></span> Submitting…</> : <><i className="fas fa-paper-plane"></i> Submit Feedback</>}
                        </button>
                    </form>
                </div>
            </section>

            <section className={styles.valueSection}>
                <div className={styles.sectionTitle}>
                    <h2>Why Your Feedback Matters</h2>
                    <p>Every suggestion helps us improve and serve you better</p>
                </div>
                <div className={styles.valueGrid}>
                    {[
                        { icon: 'fa-chart-line', title: 'Continuous Improvement', text: 'Your feedback helps us identify areas for improvement and implement changes that enhance your travel experience.' },
                        { icon: 'fa-users', title: 'Customer-Centric', text: "We're committed to putting our customers first. Your suggestions directly influence our service development." },
                        { icon: 'fa-lightbulb', title: 'Innovation Driver', text: 'Many of our best features started as customer suggestions. Your ideas help us innovate and grow.' },
                        { icon: 'fa-handshake', title: 'Build Trust', text: 'Listening to feedback and acting on it helps build trust and long-term relationships with our customers.' },
                    ].map(v => (
                        <div key={v.title} className={styles.valueCard}>
                            <div className={styles.valueIcon}><i className={`fas ${v.icon}`}></i></div>
                            <h4>{v.title}</h4>
                            <p>{v.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
