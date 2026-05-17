import Link from 'next/link';

export const metadata = {
  title: 'About Us - SwiftBus',
  description: 'Learn about SwiftBus, Ethiopia\'s premier bus booking platform.',
};

export default function AboutPage() {
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '60px', backgroundColor: 'var(--light)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <div className="section-title">
          <h2>About SwiftBus</h2>
          <p>Connecting Ethiopia, One Journey at a Time</p>
        </div>

        <div style={{ background: 'white', borderRadius: '15px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
          <h3 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--primary)' }}>Our Mission</h3>
          <p style={{ color: 'var(--gray)', fontSize: '16px', lineHeight: '1.8', marginBottom: '30px' }}>
            SwiftBus is dedicated to revolutionizing long-distance travel in Ethiopia by providing a seamless, secure, and user-friendly ticket booking platform. We aim to bridge the gap between bus operators and travelers, ensuring convenience, reliability, and comfort for every passenger.
          </p>

          <h3 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--primary)' }}>Why We Started</h3>
          <p style={{ color: 'var(--gray)', fontSize: '16px', lineHeight: '1.8', marginBottom: '30px' }}>
            We noticed the challenges travelers faced when booking bus tickets—long queues, lack of information, and unreliable schedules. SwiftBus was born out of the desire to digitize the Ethiopian transportation sector, bringing bus ticketing into the modern era.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '40px', color: 'var(--secondary)', marginBottom: '20px' }}><i className="fas fa-bus"></i></div>
            <h4 style={{ fontSize: '20px', marginBottom: '15px' }}>Top Bus Operators</h4>
            <p style={{ color: 'var(--gray)' }}>We partner with the most reliable and comfortable bus companies in Ethiopia.</p>
          </div>
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '40px', color: 'var(--secondary)', marginBottom: '20px' }}><i className="fas fa-shield-alt"></i></div>
            <h4 style={{ fontSize: '20px', marginBottom: '15px' }}>Secure Booking</h4>
            <p style={{ color: 'var(--gray)' }}>Your transactions are protected with industry-standard security protocols.</p>
          </div>
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '40px', color: 'var(--secondary)', marginBottom: '20px' }}><i className="fas fa-headset"></i></div>
            <h4 style={{ fontSize: '20px', marginBottom: '15px' }}>24/7 Support</h4>
            <p style={{ color: 'var(--gray)' }}>Our dedicated support team is always ready to assist you with your journey.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
