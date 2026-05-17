'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './verify-email.module.css';

import { Suspense } from 'react';

function VerifyEmailContent() {
    const router = useRouter();
    const params = useSearchParams();
    const type = params.get('type') || 'register'; // 'register' | 'reset'
    const email = params.get('email') || '';

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const handleInput = (idx: number, val: string) => {
        if (!/^\d*$/.test(val)) return;
        const next = [...code];
        next[idx] = val.slice(-1);
        setCode(next);
        if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
        if (pasted.length === 6) {
            setCode(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join('');
        if (fullCode.length < 6) return setError('Please enter the 6-digit code.');
        setError('');
        setLoading(true);
        try {
            const endpoint = type === 'reset' ? '/api/auth/verify-reset-code' : '/api/auth/verify-email';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: fullCode }),
            });
            const data = await res.json();
            if (res.ok) {
                setSuccess(type === 'reset' ? 'Code verified! Redirecting…' : 'Email verified! Redirecting to login…');
                const dest = type === 'reset' ? `/create-password?email=${encodeURIComponent(email)}&token=${data.token || ''}` : '/login';
                setTimeout(() => router.push(dest), 2000);
            } else {
                setError(data.error || 'Invalid or expired code. Please try again.');
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');
        try {
            await fetch('/api/auth/resend-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, type }),
            });
            setCountdown(60);
            setSuccess('A new code has been sent to your email.');
        } catch {
            setError('Could not resend. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const isReset = type === 'reset';

    return (
        <div className={styles.authBg}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    <h1>Swift<span>Bus</span></h1>
                </div>

                <div className={styles.iconWrap}>
                    <i className="fas fa-envelope-open-text"></i>
                </div>

                <div className={styles.header}>
                    <h2>{isReset ? 'Verify Reset Code' : 'Verify Your Email'}</h2>
                    <p>
                        We sent a 6-digit code to<br />
                        <strong>{email || 'your email address'}</strong>
                    </p>
                </div>

                {error && <div className={`${styles.alert} ${styles.alertError}`}><i className="fas fa-exclamation-circle"></i> {error}</div>}
                {success && <div className={`${styles.alert} ${styles.alertSuccess}`}><i className="fas fa-check-circle"></i> {success}</div>}

                <form onSubmit={handleVerify}>
                    <div className={styles.codeRow} onPaste={handlePaste}>
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                ref={el => { inputRefs.current[i] = el; }}
                                className={styles.codeInput}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleInput(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                aria-label={`Digit ${i + 1}`}
                            />
                        ))}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading || code.join('').length < 6}>
                        {loading ? <><span className={styles.spinner}></span> Verifying…</> : <><i className="fas fa-check-circle"></i> Verify Code</>}
                    </button>
                </form>

                <div className={styles.resendRow}>
                    {countdown > 0 ? (
                        <span>Resend code in <strong>{countdown}s</strong></span>
                    ) : (
                        <button className={styles.resendBtn} onClick={handleResend} disabled={resending}>
                            {resending ? 'Sending…' : <><i className="fas fa-redo"></i> Resend Code</>}
                        </button>
                    )}
                </div>

                <div className={styles.backToLogin}>
                    <Link href="/login"><i className="fas fa-arrow-left"></i> Back to Login</Link>
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className={styles.authBg}>
                <div className={styles.card}>
                    <p style={{ color: '#666' }}>Loading verification page...</p>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
