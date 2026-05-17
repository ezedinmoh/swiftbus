'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const next = useMemo(() => searchParams.get('next') ?? '/dashboard', [searchParams]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.message ?? 'Login failed');
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.loginContainerWrapper}>
      <div className={styles.loginContainer}>
        <div className={styles.logo}>
          <h1>Swift<span>Bus</span></h1>
          <p>Your Journey Starts Here</p>
        </div>

        <div className={styles.loginHeader}>
          <h2>Welcome Back</h2>
          <p>Access your bookings and manage your travel plans</p>
        </div>

        <form className={styles.loginForm} onSubmit={onSubmit}>
          {error && (
            <div className={styles.formError} role="alert">
              {error}
            </div>
          )}
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="email">Email Address</label>
            <div className={styles.inputWithIcon}>
              <input
                type="email"
                className={styles.formControl}
                id="email"
                placeholder="Enter your registered email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                autoComplete="email"
              />
              <i className={`fas fa-envelope ${styles.inputIcon}`}></i>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="password">Password</label>
            <div className={styles.inputWithIcon}>
              <input
                type="password"
                className={styles.formControl}
                id="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                autoComplete="current-password"
              />
              <i className={`fas fa-lock ${styles.inputIcon}`}></i>
            </div>
          </div>

          <div className={styles.formOptions}>
            <div className={styles.rememberMe}>
              <span style={{ fontSize: '14px', color: 'var(--gray)' }}>Secure login with JWT</span>
            </div>
            <Link href="/forgot-password" className={styles.forgotPassword}>Forgot Password?</Link>
          </div>

          <button type="submit" className={styles.loginBtn} disabled={submitting}>
            <span>{submitting ? 'Signing in…' : 'Sign In to Your Account'}</span>
          </button>

          <div className={styles.socialDivider}>
            <span>Connect with us</span>
          </div>

          <div className={styles.socialMedia}>
            <a href="#" className={`${styles.socialIcon} ${styles.facebook}`}><i className="fab fa-facebook-f"></i></a>
            <a href="#" className={`${styles.socialIcon} ${styles.twitter}`}><i className="fab fa-twitter"></i></a>
            <a href="#" className={`${styles.socialIcon} ${styles.instagram}`}><i className="fab fa-instagram"></i></a>
            <a href="#" className={`${styles.socialIcon} ${styles.linkedin}`}><i className="fab fa-linkedin-in"></i></a>
          </div>

          <div className={styles.signupLink}>
            New to SwiftBus? <Link href="/signup">Create an Account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: '100px', textAlign: 'center' }}>Loading…</div>}>
      <LoginClient />
    </Suspense>
  );
}
