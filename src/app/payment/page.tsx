'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './payment.module.css';

const PAYMENT_METHODS = [
  { id: 'telebirr', label: 'Telebirr', icon: 'fa-mobile-alt', desc: 'Pay with Telebirr app', shortcode: '987654' },
  { id: 'cbe',      label: 'CBE Birr', icon: 'fa-university', desc: 'Commercial Bank of Ethiopia', shortcode: '123456' },
  { id: 'dashen',   label: 'Dashen Bank', icon: 'fa-credit-card', desc: 'Dashen Bank mobile', shortcode: '654321' },
  { id: 'card',     label: 'Card Payment', icon: 'fa-credit-card', desc: 'Visa / Mastercard', shortcode: null },
];

function PaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Booking data passed from /book page
  const bookingId  = searchParams.get('bookingId') ?? '';
  const from       = searchParams.get('from') ?? '';
  const to         = searchParams.get('to') ?? '';
  const date       = searchParams.get('date') ?? '';
  const time       = searchParams.get('time') ?? '';
  const company    = searchParams.get('company') ?? '';
  const seats      = searchParams.get('seats') ?? '';
  const passengers = searchParams.get('passengers') ?? '1';
  const amount     = Number(searchParams.get('amount') ?? '0');

  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!bookingId) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', color: 'var(--danger)', marginBottom: '15px', display: 'block' }}></i>
        <h2>No booking found</h2>
        <p style={{ color: 'var(--gray)', margin: '10px 0 20px' }}>Please start your booking from the search page.</p>
        <button className="btn btn-primary" onClick={() => router.push('/search')}>Search Buses</button>
      </div>
    );
  }

  async function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    if (!paymentMethod) { setError('Please select a payment method.'); return; }
    setError(null);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentMethod }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.message ?? 'Payment failed. Please try again.');
        return;
      }

      setShowSuccess(true);
      setTimeout(() => router.push('/dashboard/tickets'), 3000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === paymentMethod);
  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '60px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">

        <div className={styles.paymentHeader}>
          <h1>Complete Payment</h1>
          <p>Choose your preferred payment method to secure your booking</p>
        </div>

        <div className={styles.paymentContainer}>

          {/* Order Summary */}
          <div className={styles.orderSummary}>
            <h3><i className="fas fa-receipt" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>Order Summary</h3>

            <div style={{ background: '#f0f4ff', borderRadius: '10px', padding: '15px', marginBottom: '20px', marginTop: '15px' }}>
              <p style={{ fontWeight: 700, fontSize: '16px', marginBottom: '4px' }}>{from} → {to}</p>
              <p style={{ color: 'var(--gray)', fontSize: '13px' }}>{formattedDate} at {time}</p>
            </div>

            <SummaryRow label="Bus Company" value={company} />
            <SummaryRow label="Seats" value={seats} />
            <SummaryRow label="Passengers" value={`${passengers} Adult${Number(passengers) > 1 ? 's' : ''}`} />
            <SummaryRow label="Booking ID" value={`#${bookingId}`} />

            <div style={{ borderTop: '2px solid #eee', marginTop: '15px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Total Amount</span>
              <span style={{ fontWeight: 800, fontSize: '22px', color: 'var(--primary)' }}>ETB {amount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Methods */}
          <form className={styles.paymentMethods} onSubmit={handlePayment}>
            <h3><i className="fas fa-wallet" style={{ marginRight: '8px', color: 'var(--primary)' }}></i>Select Payment Method</h3>

            {error && (
              <div style={{ padding: '12px 15px', borderRadius: '8px', background: 'rgba(220,53,69,0.1)', color: 'var(--danger)', marginBottom: '15px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fas fa-exclamation-circle"></i> {error}
              </div>
            )}

            <div className={styles.optionsGrid}>
              {PAYMENT_METHODS.map(method => (
                <div
                  key={method.id}
                  className={`${styles.paymentOption} ${paymentMethod === method.id ? styles.selected : ''}`}
                  onClick={() => { setPaymentMethod(method.id); setError(null); }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setPaymentMethod(method.id)}
                >
                  <div className={styles.radioBtn}>
                    <div className={styles.radioInner} style={{ opacity: paymentMethod === method.id ? 1 : 0 }}></div>
                  </div>
                  <div className={styles.optionContent}>
                    <i className={`fas ${method.icon}`}></i>
                    <h4>{method.label}</h4>
                    <p>{method.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment instructions */}
            {selectedMethod && selectedMethod.shortcode && (
              <div className={styles.paymentInstruction}>
                <h4><i className="fas fa-info-circle"></i> {selectedMethod.label} Instructions</h4>
                <ol style={{ textAlign: 'left', paddingLeft: '20px', marginTop: '10px', color: 'var(--gray)', fontSize: '14px', lineHeight: '1.8' }}>
                  <li>Open your <strong>{selectedMethod.label}</strong> app</li>
                  <li>Select <strong>"Pay with shortcode"</strong></li>
                  <li>Enter shortcode: <strong>{selectedMethod.shortcode}</strong></li>
                  <li>Enter amount: <strong>ETB {amount.toLocaleString()}</strong></li>
                  <li>Click <strong>"Complete Payment"</strong> below after paying</li>
                </ol>
              </div>
            )}

            {selectedMethod?.id === 'card' && (
              <div className={styles.paymentInstruction}>
                <h4><i className="fas fa-credit-card"></i> Card Payment</h4>
                <p style={{ color: 'var(--gray)', fontSize: '14px', marginTop: '10px' }}>
                  You will be redirected to a secure payment gateway to complete your card payment.
                </p>
              </div>
            )}

            <div className={styles.actionButtons}>
              <button type="button" className="btn btn-secondary" onClick={() => router.back()} disabled={isProcessing}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={isProcessing || !paymentMethod}>
                {isProcessing
                  ? <><i className="fas fa-spinner fa-spin"></i> Processing…</>
                  : <><i className="fas fa-lock"></i> Complete Payment — ETB {amount.toLocaleString()}</>}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.successIcon}>
              <i className="fas fa-check"></i>
            </div>
            <h2>Payment Successful!</h2>
            <p>Your booking <strong>#{bookingId}</strong> is confirmed.</p>
            <p style={{ color: 'var(--gray)', fontSize: '14px', marginTop: '8px' }}>A confirmation has been recorded. Redirecting to your tickets…</p>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px' }}>
      <span style={{ color: 'var(--gray)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '120px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i></div>}>
      <PaymentClient />
    </Suspense>
  );
}
