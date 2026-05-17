import styles from './privacy.module.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy – SwiftBus',
    description: 'Learn how SwiftBus collects, uses, and protects your personal information.',
};

const SECTIONS = [
    {
        id: 'intro',
        title: '1. Introduction',
        icon: 'fa-shield-alt',
        content: `SwiftBus ("we", "our", or "us") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our bus booking platform. By using SwiftBus, you consent to the practices described in this policy.`,
    },
    {
        id: 'collected',
        title: '2. Information We Collect',
        icon: 'fa-database',
        content: `We collect information you provide directly, including: name and contact details, email address and phone number, government ID information for verification, payment information (processed securely – we do not store full card numbers), booking history and preferences, and profile images if uploaded. We also automatically collect usage data, IP addresses, browser type, and device information.`,
    },
    {
        id: 'use',
        title: '3. How We Use Your Information',
        icon: 'fa-cogs',
        content: `We use your personal data to: process and manage your bus ticket bookings, communicate booking confirmations and updates, send important service notifications, improve our platform and personalize your experience, prevent fraud and ensure platform security, and comply with legal obligations. We do not use your data for unsolicited marketing without your explicit consent.`,
    },
    {
        id: 'sharing',
        title: '4. Information Sharing',
        icon: 'fa-share-alt',
        content: `We share your information only with: bus companies to fulfill your bookings (limited to what is necessary), payment processors to securely handle transactions, and law enforcement or authorities when legally required. We do not sell, rent, or trade your personal information to third parties for their marketing purposes.`,
    },
    {
        id: 'security',
        title: '5. Data Security',
        icon: 'fa-lock',
        content: `We implement industry-standard security measures including 256-bit SSL encryption for data in transit, secure password hashing (bcrypt), session-based authentication with token expiry, regular security audits, and access controls limiting who can view your data. While we strive to protect your data, no method of transmission over the internet is 100% secure.`,
    },
    {
        id: 'rights',
        title: '6. Your Rights',
        icon: 'fa-user-check',
        content: `You have the right to: access the personal data we hold about you, correct inaccurate or incomplete data, request deletion of your data (subject to legal obligations), opt out of marketing communications at any time, and download a copy of your data. To exercise any of these rights, please contact us at privacy@swiftbus.et.`,
    },
    {
        id: 'cookies',
        title: '7. Cookies',
        icon: 'fa-cookie-bite',
        content: `We use cookies and similar technologies to maintain your session, remember your preferences, and analyze platform usage. You can control cookie settings through your browser. Disabling essential cookies may affect platform functionality. We use analytics cookies (anonymized) to understand how users interact with our platform.`,
    },
    {
        id: 'changes',
        title: '8. Changes to This Policy',
        icon: 'fa-file-alt',
        content: `We may update this Privacy Policy periodically. We will notify you of significant changes via email or a prominent notice on our platform. The "Last Updated" date at the top of this page indicates when the policy was last revised. Continued use of our services after changes constitutes acceptance of the updated policy.`,
    },
];

export default function PrivacyPage() {
    return (
        <main>
            <section className={styles.pageHero}>
                <div className="container">
                    <div className={styles.shieldIcon}><i className="fas fa-shield-alt"></i></div>
                    <h1>Privacy Policy</h1>
                    <p>Your privacy matters to us. Here's how we protect and use your information.</p>
                    <div className={styles.lastUpdated}>
                        <i className="fas fa-calendar-alt"></i> Last updated: January 1, 2025
                    </div>
                </div>
            </section>

            <section className={styles.content}>
                <div className="container">
                    <div className={styles.layout}>
                        <aside className={styles.toc}>
                            <h3><i className="fas fa-list"></i> Contents</h3>
                            <ul>
                                {SECTIONS.map(s => (
                                    <li key={s.id}>
                                        <a href={`#${s.id}`}><i className={`fas ${s.icon}`}></i> {s.title}</a>
                                    </li>
                                ))}
                            </ul>
                        </aside>

                        <article className={styles.article}>
                            <div className={styles.intro}>
                                <p>At SwiftBus, we believe in transparency about how we handle your data. This policy covers all SwiftBus services and applies to all users of our platform.</p>
                            </div>

                            {SECTIONS.map(s => (
                                <div key={s.id} id={s.id} className={styles.section}>
                                    <h2><i className={`fas ${s.icon}`}></i> {s.title}</h2>
                                    <p>{s.content}</p>
                                </div>
                            ))}

                            <div className={styles.contactBox}>
                                <h3><i className="fas fa-envelope"></i> Contact Our Privacy Team</h3>
                                <p>For privacy-related questions or to exercise your data rights:</p>
                                <div className={styles.contactInfo}>
                                    <span><i className="fas fa-envelope"></i> privacy@swiftbus.et</span>
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
