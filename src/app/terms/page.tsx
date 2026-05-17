import styles from './terms.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms & Conditions – SwiftBus',
    description: 'Read the Terms and Conditions governing use of SwiftBus services.',
};

const SECTIONS = [
    {
        id: 'acceptance',
        title: '1. Acceptance of Terms',
        content: `By accessing and using SwiftBus services, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. SwiftBus reserves the right to update these terms at any time without prior notice. Continued use of the service after changes constitutes acceptance of the new terms.`,
    },
    {
        id: 'booking',
        title: '2. Booking & Reservations',
        content: `All bookings are subject to seat availability at the time of booking. Reservations are confirmed only upon successful payment. SwiftBus acts as an intermediary between passengers and bus companies and is not liable for changes or cancellations made by the bus operator. You must provide accurate passenger details during booking.`,
    },
    {
        id: 'payment',
        title: '3. Payment Terms',
        content: `All prices displayed are in Ethiopian Birr (ETB) unless otherwise stated. Payments must be made through our approved payment channels (Telebirr, CBE, Dashen Bank, or card). SwiftBus does not store full card details. By submitting payment, you confirm you are authorized to use the payment method provided.`,
    },
    {
        id: 'cancellation',
        title: '4. Cancellation & Refund Policy',
        content: `Cancellations made more than 24 hours before departure are eligible for a full refund. Cancellations made 3–24 hours before departure are eligible for a 50% refund. Cancellations within 3 hours of departure are non-refundable. Refunds are processed within 3–5 business days to the original payment method.`,
    },
    {
        id: 'travel',
        title: '5. Passenger Obligations',
        content: `Passengers must arrive at the bus terminal at least 45 minutes before departure. Passengers must carry a valid government-issued photo ID. Each passenger is allowed one main piece of luggage (up to 20 kg) and one carry-on item. SwiftBus and its partner companies reserve the right to refuse service for disruptive behavior.`,
    },
    {
        id: 'liability',
        title: '6. Limitation of Liability',
        content: `SwiftBus is not responsible for delays, cancellations, or service disruptions caused by unforeseen circumstances including but not limited to weather, road conditions, or force majeure events. Our maximum liability in any claim shall not exceed the value of the ticket purchased.`,
    },
    {
        id: 'privacy',
        title: '7. Privacy & Data',
        content: `Your personal data is collected and processed in accordance with our Privacy Policy. We use your data solely to facilitate bookings and improve our services. We do not sell your data to third parties. By using SwiftBus, you consent to the data practices described in our Privacy Policy.`,
    },
    {
        id: 'governing',
        title: '8. Governing Law',
        content: `These Terms and Conditions are governed by the laws of the Federal Democratic Republic of Ethiopia. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of Ethiopian courts.`,
    },
];

export default function TermsPage() {
    return (
        <main>
            <section className={styles.pageHero}>
                <div className="container">
                    <h1>Terms & Conditions</h1>
                    <p>Please read these terms carefully before using SwiftBus services</p>
                    <div className={styles.lastUpdated}>
                        <i className="fas fa-calendar-alt"></i> Last updated: January 1, 2025
                    </div>
                </div>
            </section>

            <section className={styles.content}>
                <div className="container">
                    <div className={styles.layout}>
                        {/* Sidebar TOC */}
                        <aside className={styles.toc}>
                            <h3><i className="fas fa-list"></i> Contents</h3>
                            <ul>
                                {SECTIONS.map(s => (
                                    <li key={s.id}>
                                        <a href={`#${s.id}`}>{s.title}</a>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        {/* Main content */}
                        <article className={styles.article}>
                            <div className={styles.intro}>
                                <i className="fas fa-file-contract" style={{ fontSize: 32, color: '#1a73e8', marginBottom: 16, display: 'block' }}></i>
                                <p>
                                    Welcome to SwiftBus. These Terms and Conditions govern your use of our bus booking platform and related services. By using SwiftBus, you agree to these terms.
                                </p>
                            </div>

                            {SECTIONS.map(s => (
                                <div key={s.id} id={s.id} className={styles.section}>
                                    <h2>{s.title}</h2>
                                    <p>{s.content}</p>
                                </div>
                            ))}

                            <div className={styles.contactBox}>
                                <h3><i className="fas fa-question-circle"></i> Questions About These Terms?</h3>
                                <p>If you have any questions about our Terms and Conditions, please contact us:</p>
                                <div className={styles.contactInfo}>
                                    <span><i className="fas fa-envelope"></i> legal@swiftbus.et</span>
                                    <span><i className="fas fa-phone"></i> +251 945 710 924</span>
                                    <span><i className="fas fa-map-marker-alt"></i> Kombolcha, Ethiopia</span>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>
            </section>
        </main>
    );
}
