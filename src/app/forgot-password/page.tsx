'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(`Reset instructions sent to ${email}. Check your inbox.`);
                setTimeout(() => {
                    router.push(`/verify-email?type=reset&email=${encodeURIComponent(email)}`);
                }, 2500);
            } else {
                setError(data.error || 'No account found with that email address.');
            }
        } catch {
            setError('Unable to send reset email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.authBg}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <h1>Swift<span>Bus</span></h1>
                    <p>Reset Your Password</p>
                </div>

                <div className={styles.header}>
                    <h2>Forgot Password?</h2>
                    <p>Enter your registered email and we'll send you reset instructions.</p>
                </div>

                {error && (
                    <div className={`${styles.alert} ${styles.alertError}`}>
                        <i className="fas fa-exclamation-circle"></i> {error}
                    </div>
                )}
                {success && (
                    <div className={`${styles.alert} ${styles.alertSuccess}`}>
                        <i className="fas fa-check-circle"></i> {success}
                    </div>
                )}

                <div className={styles.instructions}>
                    <h4><i className="fas fa-info-circle"></i> Password Reset Process</h4>
                    <ul>
                        <li>Enter your registered email address</li>
                        <li>Check your email for reset instructions</li>
                        <li>Click the verification link in the email</li>
                        <li>Create a new secure password</li>
                    </ul>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="fp-email">Email Address</label>
                        <div className={styles.inputWrapper}>
                            <input
                                id="fp-email"
                                type="email"
                                placeholder="Enter your registered email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                required
                                autoComplete="email"
                            />
                            <i className={`fas fa-envelope ${styles.inputIcon}`}></i>
                        </div>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? <><span className={styles.spinner}></span> Sending…</> : <><i className="fas fa-paper-plane"></i> Send Reset Instructions</>}
                    </button>
                </form>

                <div className={styles.backToLogin}>
                    Remember your password? <Link href="/login">Back to Login</Link>
                </div>
                <div className={styles.backHome}>
                    <Link href="/"><i className="fas fa-arrow-left"></i> Back to Home</Link>
                </div>
            </div>
        </div>
    );
}
