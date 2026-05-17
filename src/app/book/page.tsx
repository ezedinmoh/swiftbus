'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './book.module.css';

interface ScheduleInfo {
  id: string;
  company: { name: string; rating: number };
  bus: { type: string; total_seats: number; amenities: string[] };
  route: { origin: { name: string }; destination: { name: string }; duration_hours: number };
  schedule: { departure_time: string; arrival_time: string; travel_date: string };
  pricing: { base_price: number; total_price: number };
  availability: { available_seats: number };
}

interface Passenger {
  seat: number;
  name: string;
  gender: string;
}

function BookTicketClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const scheduleId = searchParams.get('scheduleId') ?? '';
  const date = searchParams.get('date') ?? '';
  const passengersCount = Math.max(1, Number(searchParams.get('passengers') ?? '1'));

  const [schedule, setSchedule] = useState<ScheduleInfo | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);

  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [contactEmail, setContactEmail] = useState(user?.email ?? '');
  const [contactPhone, setContactPhone] = useState(user?.phone ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch schedule details
  useEffect(() => {
    if (!scheduleId || !date) { setLoadingSchedule(false); return; }

    const from = searchParams.get('from') ?? '';
    const to = searchParams.get('to') ?? '';

    fetch(`/api/search?action=search_buses&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&passengers=${passengersCount}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          const found = json.data.buses.find((b: ScheduleInfo) => b.id === scheduleId);
          if (found) setSchedule(found);
        }
      })
      .finally(() => setLoadingSchedule(false));
  }, [scheduleId, date, passengersCount, searchParams]);

  // Fetch occupied seats for this schedule+date
  useEffect(() => {
    if (!scheduleId || !date) return;
    fetch(`/api/seats?scheduleId=${encodeURIComponent(scheduleId)}&date=${encodeURIComponent(date)}`)
      .then(r => r.json())
      .then(json => { if (json.success) setOccupiedSeats(json.data.occupied ?? []); })
      .catch(() => {});
  }, [scheduleId, date]);

  // Pre-fill contact from auth user
  useEffect(() => {
    if (user) {
      setContactEmail(user.email);
      if (user.phone && user.phone !== 'Not provided') setContactPhone(user.phone);
    }
  }, [user]);

  const totalSeats = schedule?.bus.total_seats ?? 45;
  const pricePerSeat = schedule?.pricing.base_price ?? 0;
  const tax = pricePerSeat * selectedSeats.length * 0.10;
  const serviceFee = 25;
  const totalAmount = Math.round((pricePerSeat * selectedSeats.length + tax + serviceFee) * 100) / 100;

  function handleSeatClick(seatNum: number) {
    if (occupiedSeats.includes(seatNum)) return;
    if (selectedSeats.includes(seatNum)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNum));
    } else {
      if (selectedSeats.length >= passengersCount) {
        setError(`You can only select ${passengersCount} seat${passengersCount > 1 ? 's' : ''} for this booking.`);
        return;
      }
      setSelectedSeats(prev => [...prev, seatNum].sort((a, b) => a - b));
      setError(null);
    }
  }

  function handleNextStep() {
    setError(null);
    if (step === 1) {
      if (selectedSeats.length === 0) { setError('Please select at least one seat.'); return; }
      setPassengers(selectedSeats.map(seat => ({ seat, name: '', gender: 'Male' })));
      setStep(2);
    } else if (step === 2) {
      if (passengers.some(p => !p.name.trim())) { setError('Please fill in all passenger names.'); return; }
      if (!contactPhone.trim()) { setError('Contact phone number is required.'); return; }
      setStep(3);
    }
  }

  async function handleConfirmBooking() {
    if (!user) { router.push('/login?next=/book?' + searchParams.toString()); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          scheduleId,
          travelDate: date,
          selectedSeats,
          passengers,
          contactEmail,
          contactPhone,
          totalAmount,
        }),
      });
      const json = await res.json();
      if (!json.success) { setError(json.message ?? 'Booking failed'); return; }

      // Pass booking data to payment page via URL params
      const params = new URLSearchParams({
        bookingId: json.data.bookingId,
        from: json.data.from,
        to: json.data.to,
        date: json.data.date,
        time: json.data.departureTime,
        company: json.data.busCompany,
        seats: json.data.seats.join(','),
        passengers: String(json.data.passengers),
        amount: String(json.data.totalAmount),
      });
      router.push(`/payment?${params.toString()}`);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingSchedule) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i>
        <p style={{ marginTop: '15px', color: 'var(--gray)' }}>Loading schedule…</p>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div style={{ paddingTop: '120px', textAlign: 'center', minHeight: '60vh' }}>
        <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', color: 'var(--danger)', marginBottom: '15px', display: 'block' }}></i>
        <h2>Schedule not found</h2>
        <p style={{ color: 'var(--gray)', margin: '10px 0 20px' }}>The selected bus schedule could not be loaded.</p>
        <button className="btn btn-primary" onClick={() => router.back()}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '60px', backgroundColor: '#f8f9fa', minHeight: 'calc(100vh - 70px)' }}>
      <div className="container">

        <div className={styles.bookingHeader}>
          <h1>Complete Your Booking</h1>
          <p>Follow the steps below to reserve your seats</p>
        </div>

        {/* Bus Info Banner */}
        <div className={styles.busSelectionBanner}>
          <div className={styles.busInfo}>
            <i className="fas fa-bus"></i>
            <div>
              <h3>{schedule.company.name}</h3>
              <p>
                {schedule.route.origin.name} → {schedule.route.destination.name} &bull;{' '}
                {new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} &bull;{' '}
                {schedule.schedule.departure_time}
              </p>
            </div>
          </div>
          <button className={styles.changeBusBtn} onClick={() => router.back()}>Change Bus</button>
        </div>

        {/* Progress Steps */}
        <div className={styles.bookingProgress}>
          {[
            { n: 1, label: 'Select Seats' },
            { n: 2, label: 'Passenger Details' },
            { n: 3, label: 'Review & Pay' },
          ].map(({ n, label }, i) => (
            <div key={n} style={{ display: 'contents' }}>
              <div className={`${styles.progressStep} ${step >= n ? styles.active : ''} ${step > n ? styles.completed : ''}`}>
                <div className={styles.stepNumber}>
                  {step > n ? <i className="fas fa-check"></i> : n}
                </div>
                <div className={styles.stepLabel}>{label}</div>
              </div>
              {i < 2 && (
                <>
                  <div className={styles.progressLine} style={{ left: `${10 + i * 40}%`, width: '40%' }}></div>
                  <div className={styles.progressFill} style={{ left: `${10 + i * 40}%`, width: step > n ? '40%' : '0%' }}></div>
                </>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', background: 'rgba(220,53,69,0.1)', color: 'var(--danger)', border: '1px solid rgba(220,53,69,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <div className={styles.bookingForm}>

          {/* STEP 1: Seat Selection */}
          {step === 1 && (
            <div className={styles.formSection}>
              <h2><i className="fas fa-chair"></i> Choose Your Seats</h2>
              <p style={{ color: 'var(--gray)', fontSize: '14px', marginBottom: '20px' }}>
                Select {passengersCount} seat{passengersCount > 1 ? 's' : ''} &bull; ETB {pricePerSeat.toLocaleString()} per seat
              </p>

              <div className={styles.seatLegend}>
                <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.available}`}></div> Available</div>
                <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.selected}`}></div> Selected</div>
                <div className={styles.legendItem}><div className={`${styles.legendColor} ${styles.occupied}`}></div> Occupied</div>
              </div>

              {/* Bus front indicator */}
              <div style={{ textAlign: 'center', marginBottom: '15px', padding: '8px', background: '#f0f4ff', borderRadius: '8px', fontSize: '13px', color: 'var(--primary)', fontWeight: 500 }}>
                <i className="fas fa-steering-wheel"></i> Driver / Front of Bus
              </div>

              <div className={styles.seatMapContainer}>
                <div className={styles.seatMap}>
                  {Array.from({ length: totalSeats }).map((_, i) => {
                    const seatNum = i + 1;
                    const isOccupied = occupiedSeats.includes(seatNum);
                    const isSelected = selectedSeats.includes(seatNum);
                    let seatClass = styles.seat;
                    if (isOccupied) seatClass += ` ${styles.occupied}`;
                    else if (isSelected) seatClass += ` ${styles.selected}`;
                    else seatClass += ` ${styles.available}`;
                    return (
                      <div key={seatNum} className={seatClass} onClick={() => handleSeatClick(seatNum)} title={`Seat ${seatNum}`}>
                        {seatNum}
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedSeats.length > 0 && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#f0f4ff', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px' }}>Selected: <strong>{selectedSeats.join(', ')}</strong></span>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>ETB {(pricePerSeat * selectedSeats.length).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: Passenger Details */}
          {step === 2 && (
            <div className={styles.formSection}>
              <h2><i className="fas fa-users"></i> Passenger Details</h2>

              {passengers.map((p, index) => (
                <div key={p.seat} style={{ marginBottom: '20px', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                  <h4 style={{ marginBottom: '15px', color: 'var(--primary)' }}>
                    <i className="fas fa-user-circle" style={{ marginRight: '8px' }}></i>
                    Passenger {index + 1} — Seat {p.seat}
                  </h4>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name *</label>
                      <input
                        type="text"
                        className={styles.formControl}
                        value={p.name}
                        onChange={e => {
                          const updated = [...passengers];
                          updated[index] = { ...updated[index], name: e.target.value };
                          setPassengers(updated);
                        }}
                        placeholder="e.g. Abebe Kebede"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Gender *</label>
                      <select
                        className={styles.formControl}
                        value={p.gender}
                        onChange={e => {
                          const updated = [...passengers];
                          updated[index] = { ...updated[index], gender: e.target.value };
                          setPassengers(updated);
                        }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: '25px', padding: '20px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #eee' }}>
                <h4 style={{ marginBottom: '15px' }}>Contact Information</h4>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input type="email" className={styles.formControl} value={contactEmail}
                      onChange={e => setContactEmail(e.target.value)} placeholder="For e-ticket" />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Phone Number *</label>
                    <input type="tel" className={styles.formControl} value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)} placeholder="+251 9XX XXX XXX" required />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className={styles.formSection}>
              <h2><i className="fas fa-clipboard-check"></i> Review Booking</h2>

              <div className={styles.bookingSummary}>
                <SummaryRow label="Journey" value={`${schedule.route.origin.name} → ${schedule.route.destination.name}`} />
                <SummaryRow label="Date & Time" value={`${new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, ${schedule.schedule.departure_time}`} />
                <SummaryRow label="Bus Company" value={schedule.company.name} />
                <SummaryRow label="Bus Type" value={schedule.bus.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} />
                <SummaryRow label="Selected Seats" value={selectedSeats.join(', ')} />
                <SummaryRow label="Passengers" value={`${selectedSeats.length} Adult${selectedSeats.length > 1 ? 's' : ''}`} />
                <SummaryRow label={`Base Fare (${selectedSeats.length} × ETB ${pricePerSeat})`} value={`ETB ${(pricePerSeat * selectedSeats.length).toLocaleString()}`} />
                <SummaryRow label="Tax (10%)" value={`ETB ${tax.toFixed(2)}`} />
                <SummaryRow label="Service Fee" value="ETB 25.00" />
                <div className={`${styles.summaryItem} ${styles.total}`}>
                  <span>Total Amount</span>
                  <span>ETB {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', background: '#fff3cd', color: '#856404', borderRadius: '8px', borderLeft: '4px solid #ffc107', fontSize: '14px' }}>
                <i className="fas fa-info-circle" style={{ marginRight: '8px' }}></i>
                By clicking "Proceed to Payment", you agree to our Terms and Conditions regarding cancellation and refunds.
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className={styles.formNavigation}>
            {step > 1 ? (
              <button className={`btn btn-secondary ${styles.btnOutline}`} onClick={() => { setStep(step - 1); setError(null); }}>
                <i className="fas fa-arrow-left"></i> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button className="btn btn-primary" onClick={handleNextStep}>
                Next Step <i className="fas fa-arrow-right"></i>
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleConfirmBooking} disabled={submitting}>
                {submitting ? <><i className="fas fa-spinner fa-spin"></i> Processing…</> : <><i className="fas fa-credit-card"></i> Proceed to Payment</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee', fontSize: '14px' }}>
      <span style={{ color: 'var(--gray)' }}>{label}</span>
      <span style={{ fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function BookTicketPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '120px', textAlign: 'center' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: 'var(--primary)' }}></i></div>}>
      <BookTicketClient />
    </Suspense>
  );
}
