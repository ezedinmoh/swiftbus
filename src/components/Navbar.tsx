'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('sb_theme') || 'light';
    setTheme(saved as 'light' | 'dark');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('sb_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/routes', label: 'Routes' },
    { href: '/search', label: 'Search Buses' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  async function handleLogout() {
    setDropdownOpen(false);
    setMobileOpen(false);
    await logout();
    router.push('/');
    router.refresh();
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  return (
    <>
      <header className={scrolled ? 'scrolled' : ''} style={headerStyle}>
        <div className="container">
          <div className="header-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 0' }}>
            {/* Logo */}
            <div className="logo">
              <Link href="/">
                <h1 style={{ color: 'var(--primary)', fontSize: '28px', fontWeight: 700, textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}>
                  Swift<span style={{ color: 'var(--secondary)' }}>Bus</span>
                </h1>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav style={{ display: 'flex' }}>
              <ul className="nav-links" style={navLinksStyle}>
                {navLinks.map(link => (
                  <li key={link.href} style={{ marginLeft: '25px', position: 'relative' }}>
                    <Link
                      href={link.href}
                      style={{
                        ...navLinkStyle,
                        color: pathname === link.href ? 'var(--primary)' : 'var(--dark)',
                        borderBottom: pathname === link.href ? '2px solid var(--primary)' : '2px solid transparent',
                        paddingBottom: '4px',
                      }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Auth Area */}
            <div className="auth-buttons" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {/* Dark Theme Toggle */}
              <button
                onClick={toggleTheme}
                style={{
                  background: theme === 'dark' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(100, 116, 139, 0.08)',
                  border: 'none', cursor: 'pointer',
                  fontSize: '18px', color: theme === 'dark' ? '#ffc107' : '#64748b',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '38px', height: '38px', borderRadius: '50%',
                  transition: 'all 0.3s ease',
                }}
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle dark theme"
              >
                <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
              </button>
              {loading ? (
                <div style={{ width: '80px', height: '36px', background: '#eee', borderRadius: '20px', animation: 'pulse 1.5s infinite' }} />
              ) : user ? (
                /* Logged-in user avatar + dropdown */
                <div ref={dropdownRef} style={{ position: 'relative' }}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      background: 'none', border: '2px solid var(--primary)',
                      borderRadius: '30px', padding: '6px 14px 6px 6px',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'var(--primary)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700,
                    }}>
                      {user.profileImage
                        ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                        : initials}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.firstName}
                    </span>
                    <i className={`fas fa-chevron-${dropdownOpen ? 'up' : 'down'}`} style={{ fontSize: '11px', color: 'var(--gray)' }}></i>
                  </button>

                  {dropdownOpen && (
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                      background: 'white', borderRadius: '12px', minWidth: '200px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)', zIndex: 200,
                      overflow: 'hidden', animation: 'fadeIn 0.2s ease',
                    }}>
                      <div style={{ padding: '15px', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{user.name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--gray)', marginTop: '2px' }}>{user.email}</p>
                        {user.role === 'admin' && (
                          <span style={{ fontSize: '11px', background: 'var(--secondary)', color: 'white', padding: '2px 8px', borderRadius: '10px', marginTop: '5px', display: 'inline-block' }}>Admin</span>
                        )}
                      </div>
                      <div style={{ padding: '8px 0' }}>
                        <Link href="/dashboard" onClick={() => setDropdownOpen(false)} style={dropdownItemStyle}>
                          <i className="fas fa-tachometer-alt" style={{ width: '18px', color: 'var(--primary)' }}></i> Dashboard
                        </Link>
                        <Link href="/dashboard/tickets" onClick={() => setDropdownOpen(false)} style={dropdownItemStyle}>
                          <i className="fas fa-ticket-alt" style={{ width: '18px', color: 'var(--primary)' }}></i> My Tickets
                        </Link>
                        <Link href="/dashboard/profile" onClick={() => setDropdownOpen(false)} style={dropdownItemStyle}>
                          <i className="fas fa-user-edit" style={{ width: '18px', color: 'var(--primary)' }}></i> Profile
                        </Link>
                        {user.role === 'admin' && (
                          <Link href="/admin" onClick={() => setDropdownOpen(false)} style={dropdownItemStyle}>
                            <i className="fas fa-cog" style={{ width: '18px', color: 'var(--secondary)' }}></i> Admin Panel
                          </Link>
                        )}
                        <div style={{ borderTop: '1px solid #eee', margin: '8px 0' }} />
                        <button onClick={handleLogout} style={{ ...dropdownItemStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
                          <i className="fas fa-sign-out-alt" style={{ width: '18px' }}></i> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Guest buttons */
                <>
                  <Link href="/login" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-sign-in-alt"></i> Login
                  </Link>
                  <Link href="/signup" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className="fas fa-user-plus"></i> Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={mobileMenuBtnStyle}
              aria-label="Toggle menu"
            >
              <i className={mobileOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div style={mobileNavStyle}>
            <ul style={{ listStyle: 'none', padding: '20px' }}>
              {navLinks.map((link, i) => (
                <li key={link.href} style={{ marginBottom: '10px', animationDelay: `${i * 0.1}s`, animation: 'fadeInUp 0.5s ease forwards', opacity: 0 }}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'block', padding: '12px 0',
                      borderBottom: '1px solid #eee',
                      color: pathname === link.href ? 'var(--primary)' : 'var(--dark)',
                      fontWeight: 500, transition: 'all 0.3s ease',
                    }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              {user ? (
                <>
                  <li style={{ marginTop: '15px', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                    <p style={{ fontWeight: 600 }}>{user.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--gray)' }}>{user.email}</p>
                  </li>
                  <li>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'var(--dark)' }}>
                      <i className="fas fa-tachometer-alt" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard/tickets" onClick={() => setMobileOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'var(--dark)' }}>
                      <i className="fas fa-ticket-alt" style={{ marginRight: '8px', color: 'var(--primary)' }}></i> My Tickets
                    </Link>
                  </li>
                  <li style={{ marginTop: '10px' }}>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '12px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                      <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i> Logout
                    </button>
                  </li>
                </>
              ) : (
                <li style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                  <Link href="/login" className="btn btn-outline" onClick={() => setMobileOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Login</Link>
                  <Link href="/signup" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Sign Up</Link>
                </li>
              )}
              {/* Mobile Dark Theme Toggle */}
              <li style={{ marginTop: '15px', padding: '12px 0', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dark)' }}>Dark Theme</span>
                <button
                  onClick={toggleTheme}
                  style={{
                    background: theme === 'dark' ? 'rgba(255, 193, 7, 0.15)' : 'rgba(100, 116, 139, 0.08)',
                    border: 'none', cursor: 'pointer',
                    fontSize: '18px', color: theme === 'dark' ? '#ffc107' : '#64748b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '38px', height: '38px', borderRadius: '50%',
                    transition: 'all 0.3s ease',
                  }}
                  aria-label="Toggle dark theme"
                >
                  <i className={theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'}></i>
                </button>
              </li>
            </ul>
          </div>
        )}
      </header>
    </>
  );
}

const headerStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1000,
  transition: 'all 0.4s ease',
  backdropFilter: 'blur(10px)',
};

const navLinksStyle: React.CSSProperties = {
  display: 'flex',
  listStyle: 'none',
};

const navLinkStyle: React.CSSProperties = {
  fontWeight: 500,
  transition: 'all 0.3s ease',
  padding: '5px 0',
};

const mobileMenuBtnStyle: React.CSSProperties = {
  display: 'none',
  background: 'none',
  border: 'none',
  fontSize: '24px',
  color: 'var(--dark)',
  cursor: 'pointer',
  padding: '5px',
};

const mobileNavStyle: React.CSSProperties = {
  background: 'white',
  position: 'absolute',
  top: '100%',
  right: '10px',
  width: '280px',
  maxWidth: 'calc(100vw - 40px)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
  zIndex: 99,
  transformOrigin: 'top right',
  animation: 'slideDown 0.4s ease forwards',
  borderRadius: '15px',
  maxHeight: '75vh',
  overflowY: 'auto',
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 15px',
  color: 'var(--dark)',
  fontSize: '14px',
  transition: 'background 0.2s',
  cursor: 'pointer',
  textDecoration: 'none',
};
