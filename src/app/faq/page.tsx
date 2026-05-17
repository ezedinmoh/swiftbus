'use client';

import { useState, useMemo } from 'react';
import styles from './faq.module.css';

const FAQ_DATA = [
    {
        id: 1,
        category: "booking",
        question: "How do I book a bus ticket online?",
        answer: "Booking is simple! 1) Select your departure and destination cities, 2) Choose your travel date, 3) Select a bus company and seat, 4) Enter passenger details, 5) Make payment, 6) Receive e-ticket via email/SMS."
    },
    {
        id: 2,
        category: "booking",
        question: "Can I book tickets for multiple passengers?",
        answer: "Yes, you can book for up to 10 passengers in a single transaction. Simply increase the passenger count during booking and provide details for each traveler."
    },
    {
        id: 3,
        category: "booking",
        question: "Do I need to create an account to book?",
        answer: "While you can browse without an account, you need to create a free SwiftBus account to complete bookings. This helps us manage your tickets and provide better service."
    },
    {
        id: 4,
        category: "payment",
        question: "What payment methods do you accept?",
        answer: "We accept: Telebirr mobile payment, Commercial Bank of Ethiopia, Bank of Abyssinia, Dashen Bank, and major credit/debit cards (Visa, MasterCard)."
    },
    {
        id: 5,
        category: "payment",
        question: "Is my payment information secure?",
        answer: "Absolutely! We use 256-bit SSL encryption and comply with PCI DSS standards. We never store your full card details on our servers."
    },
    {
        id: 6,
        category: "payment",
        question: "When will I receive my refund?",
        answer: "Refunds are processed within 3-5 business days after cancellation approval. The time to appear in your account depends on your bank/payment provider."
    },
    {
        id: 7,
        category: "travel",
        question: "What should I bring to the bus station?",
        answer: "Bring: 1) Your e-ticket (digital or printed), 2) Valid ID (passport or national ID), 3) Face mask (if required), 4) Essential personal items."
    },
    {
        id: 8,
        category: "travel",
        question: "Can I bring luggage on the bus?",
        answer: "Yes, each passenger can bring: 1 main suitcase (20kg max) and 1 small hand luggage. Additional luggage may incur extra charges."
    },
    {
        id: 9,
        category: "travel",
        question: "Are there amenities on the buses?",
        answer: "Most buses offer: WiFi, charging ports, AC, reclining seats, and entertainment systems. Premium buses may include meals and extra legroom."
    },
    {
        id: 10,
        category: "cancellation",
        question: "What is your cancellation policy?",
        answer: "You can cancel up to 3 hours before departure. Cancellation fees apply: 100% refund if cancelled 24+ hours before, 50% refund 3-24 hours before, no refund within 3 hours."
    },
    {
        id: 11,
        category: "cancellation",
        question: "How do I cancel my booking?",
        answer: "Log into your account, go to 'My Tickets', select the booking, and click 'Cancel'. You can also contact our support team for assistance."
    },
    {
        id: 12,
        category: "cancellation",
        question: "Can I reschedule my journey?",
        answer: "Yes, you can reschedule up to 6 hours before departure. Rescheduling fees may apply depending on the bus company's policy."
    },
    {
        id: 13,
        category: "technical",
        question: "The website/app is not working. What should I do?",
        answer: "Try these steps: 1) Refresh the page, 2) Clear browser cache, 3) Try incognito mode, 4) Update the app, 5) Contact support if issues persist."
    },
    {
        id: 14,
        category: "technical",
        question: "I didn't receive my e-ticket. What now?",
        answer: "Check your spam/junk folder first. If not found, log into your account and go to 'My Tickets'. You can download it there or contact support for resending."
    },
    {
        id: 15,
        category: "technical",
        question: "How do I update my account information?",
        answer: "Log into your account, go to 'Profile Settings', make your changes, and save. Some changes may require verification."
    }
];

const CATEGORIES = [
    { id: 'all', label: 'All Questions' },
    { id: 'booking', label: 'Booking' },
    { id: 'payment', label: 'Payment' },
    { id: 'travel', label: 'Travel' },
    { id: 'cancellation', label: 'Cancellation' },
    { id: 'technical', label: 'Technical' }
];

const POPULAR = [
    { q: "How do I book a bus ticket?", a: "Book tickets easily through our website or mobile app in just a few steps." },
    { q: "What payment methods do you accept?", a: "We accept Telebirr, CBE, Bank of Abyssinia, Dashen Bank, and major credit cards." },
    { q: "Can I cancel or modify my booking?", a: "Yes, you can cancel or modify bookings up to 3 hours before departure." },
    { q: "How early should I arrive at the bus station?", a: "We recommend arriving at least 45 minutes before departure time." }
];

export default function FAQPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const filteredFaqs = useMemo(() => {
        let faqs = FAQ_DATA;
        if (activeCategory !== 'all') {
            faqs = faqs.filter(f => f.category === activeCategory);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            faqs = faqs.filter(f => 
                f.question.toLowerCase().includes(query) || 
                f.answer.toLowerCase().includes(query)
            );
        }
        return faqs;
    }, [activeCategory, searchQuery]);

    const handleToggle = (id: number) => {
        setOpenFaq(openFaq === id ? null : id);
    };

    return (
        <main>
            <section className={styles.pageHero}>
                <div className="container">
                    <h1>Frequently Asked Questions</h1>
                    <p>Find quick answers to common questions about SwiftBus services</p>
                </div>
            </section>

            <section className={styles.faqContent}>
                <div className="container">
                    <div className={styles.sectionTitle}>
                        <h2>How Can We Help?</h2>
                        <p>Search through our FAQ or browse by category</p>
                    </div>

                    <div className={styles.faqSearch}>
                        <input 
                            type="text" 
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <i className={`fas fa-search ${styles.searchIcon}`}></i>
                    </div>

                    <div className={styles.faqCategories}>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`${styles.categoryBtn} ${activeCategory === cat.id ? styles.categoryBtnActive : ''}`}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setSearchQuery('');
                                    setOpenFaq(null);
                                }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <div className={styles.faqAccordion}>
                        {filteredFaqs.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#666' }}>No questions found matching your search.</p>
                        ) : (
                            filteredFaqs.map(faq => (
                                <div 
                                    key={faq.id} 
                                    className={`${styles.faqItem} ${openFaq === faq.id ? styles.faqItemActive : ''}`}
                                >
                                    <div 
                                        className={styles.faqQuestion}
                                        onClick={() => handleToggle(faq.id)}
                                    >
                                        <h3>{faq.question}</h3>
                                        <i className={`fas fa-chevron-down ${styles.faqIcon} ${openFaq === faq.id ? styles.faqIconActive : ''}`}></i>
                                    </div>
                                    <div className={`${styles.faqAnswer} ${openFaq === faq.id ? styles.faqAnswerActive : ''}`}>
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className={styles.popularQuestions}>
                <div className={styles.sectionTitle}>
                    <h2>Popular Questions</h2>
                    <p>Most frequently asked questions by our customers</p>
                </div>
                <div className={styles.popularGrid}>
                    {POPULAR.map((pop, i) => (
                        <div key={i} className={styles.popularCard}>
                            <h4><i className="fas fa-question-circle"></i> {pop.q}</h4>
                            <p>{pop.a}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
