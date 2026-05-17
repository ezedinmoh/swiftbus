import Link from 'next/link';

export default function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          {/* About Column */}
          <div className="footer-column">
            <h3>SwiftBus</h3>
            <p>Your trusted partner for bus travel across Ethiopia. We connect you to your destination safely and comfortably.</p>
            <div className="social-links">
              <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-column">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/routes">Routes</Link></li>
              <li><Link href="/search">Search Buses</Link></li>
              <li><Link href="/search">Book Ticket</Link></li>
              <li><Link href="/dashboard/tickets">My Tickets</Link></li>
              <li><Link href="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-column">
            <h3>Support</h3>
            <ul className="footer-links">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/reviews">Customer Reviews</Link></li>
              <li><Link href="/feedback">Submit Feedback</Link></li>
              <li><Link href="/terms">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-column">
            <h3>Contact Info</h3>
            <ul className="footer-links">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Kombolcha, Ethiopia</span>
              </li>
              <li>
                <i className="fas fa-phone"></i>
                <span>+251 945 710 924</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>info@swiftbus.et</span>
              </li>
              <li>
                <i className="fas fa-clock"></i>
                <span>Mon–Sun: 6:00 AM – 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="copyright">
          <p>&copy; 2025 SwiftBus. All rights reserved. Made with ❤️ in Ethiopia 🇪🇹</p>
        </div>
      </div>
    </footer>
  );
}
