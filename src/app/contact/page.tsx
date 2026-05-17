'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: json.message ?? 'Message sent successfully!' });
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setMsg({ type: 'error', text: json.message ?? 'Failed to send message' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <div style={{ paddingTop: '100px', paddingBottom: '60px', backgroundColor: 'var(--light)', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">
        <div className="section-title">
          <h2>Contact Us</h2>
          <p>We're here to help you with any questions or concerns</p>
        </div>

        {msg && (
          <div style={{
            padding: '14px 18px', borderRadius: '10px', marginBottom: '25px',
            background: msg.type === 'success' ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
            color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
            border: `1px solid ${msg.type === 'success' ? 'rgba(40,167,69,0.3)' : 'rgba(220,53,69,0.3)'}`,
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            {msg.text}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px' }}>
          {/* Contact Info */}
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ background: 'white', borderRadius: '15px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', height: '100%' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '30px', color: 'var(--dark)' }}>Get In Touch</h3>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', alignItems: 'flex-start' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '20px', flexShrink: 0 }}>
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', marginBottom: '5px' }}>Head Office</h4>
                  <p style={{ color: 'var(--gray)', lineHeight: '1.6' }}>Piassa, near Arada Giorgis<br />Addis Ababa, Ethiopia</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', alignItems: 'flex-start' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '20px', flexShrink: 0 }}>
                  <i className="fas fa-phone-alt"></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', marginBottom: '5px' }}>Phone</h4>
                  <p style={{ color: 'var(--gray)', lineHeight: '1.6' }}>+251 911 234 567<br />+251 112 345 678</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', marginBottom: '25px', alignItems: 'flex-start' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(26, 115, 232, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '20px', flexShrink: 0 }}>
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '18px', marginBottom: '5px' }}>Email</h4>
                  <p style={{ color: 'var(--gray)', lineHeight: '1.6' }}>support@swiftbus.et<br />info@swiftbus.et</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ flex: '2 1 500px' }}>
            <div style={{ background: 'white', borderRadius: '15px', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '24px', marginBottom: '30px', color: 'var(--dark)' }}>Send us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Full Name</label>
                    <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your Name" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', outline: 'none' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Email Address</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="Your Email" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', outline: 'none' }} required />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Subject</label>
                  <input type="text" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Message Subject" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', outline: 'none' }} required />
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Message</label>
                  <textarea rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="How can we help you?" style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #e0e0e0', outline: 'none', resize: 'vertical' }} required></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '15px', fontSize: '16px' }} disabled={submitting}>
                  {submitting ? <><i className="fas fa-spinner fa-spin"></i> Sending…</> : <><i className="fas fa-paper-plane"></i> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
