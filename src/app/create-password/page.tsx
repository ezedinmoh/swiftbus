'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './create-password.module.css';

function CreatePasswordContent() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token') || '';
    const emailParam = params.get('email') || '';

    const [form, setForm] = useState({ password: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [showCf, setShowCf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const strength = (pw: string) => {
        let s = 0;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };

    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColor = ['', '#dc3545', '#fd7e14', '#ffc107', '#28a745'];
    const pwStrength = strength(form.password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (form.password.length < 8) return setError('Password must be at least 8 characters.');
        if (form.password !== form.confirm) return setError('Passwords do not match.');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, email: emailParam, password: form.password }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess('Password updated! Redirecting to login…');
                setTimeout(() => router.push('/login'), 2500);
            } else {
                setError(data.error || 'Reset link is invalid or expired. Please request a new one.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authBg}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <h1>Swift<span>Bus</span></h1>
                    <p>Create New Password</p>
                </div>

                <div className={styles.header}>
                    <h2>Create New Password</h2>
                    <p>Your new password must be at least 8 characters long and include a mix of letters and numbers.</p>
                </div>

                {error && <div className={`${styles.alert} ${styles.alertError}`}><i className="fas fa-exclamation-circle"></i> {error}</div>}
                {success && <div className={`${styles.alert} ${styles.alertSuccess}`}><i className="fas fa-check-circle"></i> {success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="cp-password">New Password</label>
                        <div className={styles.inputWrapper}>
                            <input id="cp-password" type={showPw ? 'text' : 'password'}
                                placeholder="Enter new password" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })} required />
                            <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'} ${styles.inputIcon}`}
                                onClick={() => setShowPw(!showPw)} style={{ cursor: 'pointer', pointerEvents: 'auto' }}></i>
                        </div>
                        {form.password && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                    {[1,2,3,4].map(i => (
                                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= pwStrength ? strengthColor[pwStrength] : '#e0e0e0', transition: 'background 0.3s' }}></div>
                                    ))}
                                </div>
                                <span style={{ fontSize: 12, color: strengthColor[pwStrength] }}>{strengthLabel[pwStrength]}</span>
                            </div>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="cp-confirm">Confirm Password</label>
                        <div className={styles.inputWrapper}>
                            <input id="cp-confirm" type={showCf ? 'text' : 'password'}
                                placeholder="Confirm your new password" value={form.confirm}
                                onChange={e => setForm({ ...form, confirm: e.target.value })} required
                                className={form.confirm && form.confirm !== form.password ? styles.inputError : ''} />
                            <i className={`fas ${showCf ? 'fa-eye-slash' : 'fa-eye'} ${styles.inputIcon}`}
                                onClick={() => setShowCf(!showCf)} style={{ cursor: 'pointer', pointerEvents: 'auto' }}></i>
                        </div>
                        {form.confirm && form.confirm !== form.password && (
                            <span className={styles.fieldError}>Passwords do not match</span>
                        )}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? <><span className={styles.spinner}></span> Updating…</> : <><i className="fas fa-lock"></i> Update Password</>}
                    </button>
                </form>

                <div className={styles.backToLogin}>
                    Remembered it? <Link href="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default function CreatePasswordPage() {
    return (
        <Suspense fallback={
            <div className={styles.authBg}>
                <div className={styles.card}>
                    <p style={{ color: '#666' }}>Loading password reset page...</p>
                </div>
            </div>
        }>
            <CreatePasswordContent />
        </Suspense>
    );
}
