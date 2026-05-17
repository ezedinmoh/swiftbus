'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './signup.module.css';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!terms) {
      setError('Please agree to the Terms & Conditions.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await register({ firstName, lastName, email, phone, password });
      if (!result.success) {
        setError(result.message ?? 'Signup failed');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.signupContainerWrapper}>
      <div className={styles.signupContainer}>
        <div className={styles.logo}>
          <h1>Swift<span>Bus</span></h1>
          <p>Join Our Community</p>
        </div>

        <div className={styles.signupHeader}>
          <h2>Create Account</h2>
          <p>Sign up to book tickets and manage your journeys</p>
        </div>

        <form className={styles.signupForm} onSubmit={onSubmit}>
          {error && (
            <div className={styles.formError} role="alert">
              {error}
            </div>
          )}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="firstName">First Name</label>
              <div className={styles.inputWithIcon}>
                <input
                  type="text"
                  className={styles.formControl}
                  id="firstName"
                  placeholder="First Name"
                  required
                  value={firstName}
                  onChange={(ev) => setFirstName(ev.target.value)}
                  autoComplete="given-name"
                />
                <i className={`fas fa-user ${styles.inputIcon}`}></i>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="lastName">Last Name</label>
              <div className={styles.inputWithIcon}>
                <input
                  type="text"
                  className={styles.formControl}
                  id="lastName"
                  placeholder="Last Name"
                  required
                  value={lastName}
                  onChange={(ev) => setLastName(ev.target.value)}
                  autoComplete="family-name"
                />
                <i className={`fas fa-user ${styles.inputIcon}`}></i>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="email">Email Address</label>
            <div className={styles.inputWithIcon}>
              <input
                type="email"
                className={styles.formControl}
                id="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                autoComplete="email"
              />
              <i className={`fas fa-envelope ${styles.inputIcon}`}></i>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="phone">Phone Number</label>
            <div className={styles.inputWithIcon}>
              <input
                type="tel"
                className={styles.formControl}
                id="phone"
                placeholder="Enter your phone number"
                required
                value={phone}
                onChange={(ev) => setPhone(ev.target.value)}
                autoComplete="tel"
              />
              <i className={`fas fa-phone ${styles.inputIcon}`}></i>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="password">Password</label>
            <div className={styles.inputWithIcon}>
              <input
                type="password"
                className={styles.formControl}
                id="password"
                placeholder="Create a password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                autoComplete="new-password"
              />
              <i className={`fas fa-lock ${styles.inputIcon}`}></i>
            </div>
          </div>

          <div className={styles.formOptions}>
            <div className={styles.terms}>
              <input
                type="checkbox"
                id="terms"
                required
                checked={terms}
                onChange={(ev) => setTerms(ev.target.checked)}
              />
              <label htmlFor="terms">I agree to the <Link href="/terms" className={styles.link}>Terms & Conditions</Link></label>
            </div>
          </div>

          <button type="submit" className={styles.signupBtn} disabled={submitting}>
            <span>{submitting ? 'Creating account…' : 'Create Account'}</span>
          </button>

          <div className={styles.loginLink}>
            Already have an account? <Link href="/login">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
