'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  joined_date: string;
  is_verified: boolean;
  profile_image: string | null;
}

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Password fields
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setProfile(json.data);
          setFirstName(json.data.first_name);
          setLastName(json.data.last_name);
          setPhone(json.data.phone ?? '');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', firstName, lastName, phone }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
        setProfile(p => p ? { ...p, first_name: firstName, last_name: lastName, phone } : p);
        await refresh();
      } else {
        setMsg({ type: 'error', text: json.message ?? 'Update failed' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setChangingPwd(true);
    setMsg(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'change_password', currentPassword: currentPwd, newPassword: newPwd }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      } else {
        setMsg({ type: 'error', text: json.message ?? 'Password change failed' });
      }
    } catch {
      setMsg({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setChangingPwd(false);
    }
  }

  const inputStyle = (editable: boolean): React.CSSProperties => ({
    width: '100%', padding: '12px 15px', borderRadius: '8px',
    border: '1px solid #ddd', background: editable ? 'white' : '#f8f9fa',
    fontSize: '14px', outline: 'none', transition: 'border 0.2s',
  });

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500,
  };

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '30px' }}>Profile Settings</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          {[1, 2].map(i => <div key={i} style={{ background: '#eee', borderRadius: '15px', height: '300px', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      </div>
    );
  }

  const joinedYear = profile?.joined_date
    ? new Date(profile.joined_date).getFullYear()
    : new Date().getFullYear();

  const initials = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div>
      <h1 style={{ fontSize: '24px', color: 'var(--primary)', marginBottom: '30px' }}>Profile Settings</h1>

      {msg && (
        <div style={{
          padding: '12px 18px', borderRadius: '10px', marginBottom: '20px',
          background: msg.type === 'success' ? 'rgba(40,167,69,0.1)' : 'rgba(220,53,69,0.1)',
          color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(40,167,69,0.3)' : 'rgba(220,53,69,0.3)'}`,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <i className={`fas ${msg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          {msg.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px', alignItems: 'start' }}>

        {/* Profile Card */}
        <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'var(--primary)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: 700, margin: '0 auto 15px',
          }}>
            {profile?.profile_image
              ? <img src={profile.profile_image} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials || <i className="fas fa-user"></i>}
          </div>
          <h2 style={{ fontSize: '18px', marginBottom: '4px' }}>{firstName} {lastName}</h2>
          <p style={{ color: 'var(--gray)', fontSize: '13px', marginBottom: '6px' }}>{profile?.email}</p>
          <p style={{ color: 'var(--gray)', fontSize: '12px', marginBottom: '20px' }}>Member since {joinedYear}</p>

          {profile?.role === 'admin' && (
            <span style={{ fontSize: '12px', background: 'var(--secondary)', color: 'white', padding: '3px 12px', borderRadius: '10px', display: 'inline-block', marginBottom: '15px' }}>
              Admin
            </span>
          )}

          <button
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
            style={{ width: '100%', padding: '10px' }}
            onClick={() => { setIsEditing(!isEditing); setMsg(null); }}
          >
            <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'}`}></i>
            {isEditing ? ' Cancel' : ' Edit Profile'}
          </button>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

          {/* Personal Info */}
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '17px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <i className="fas fa-user" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
              Personal Information
            </h3>

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>First Name</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    disabled={!isEditing} required style={inputStyle(isEditing)} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    disabled={!isEditing} required style={inputStyle(isEditing)} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" value={profile?.email ?? ''} disabled
                    style={{ ...inputStyle(false), color: 'var(--gray)' }} />
                  <p style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '4px' }}>Email cannot be changed</p>
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    disabled={!isEditing} placeholder="+251 9XX XXX XXX" style={inputStyle(isEditing)} />
                </div>
              </div>

              {isEditing && (
                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <i className="fas fa-save"></i> {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password */}
          <div style={{ background: 'white', borderRadius: '15px', padding: '30px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '17px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
              <i className="fas fa-lock" style={{ color: 'var(--primary)', marginRight: '10px' }}></i>
              Change Password
            </h3>

            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Current Password</label>
                <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                  placeholder="Enter current password" required style={inputStyle(true)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                    placeholder="Min 8 chars, A-Z, 0-9" required style={inputStyle(true)} />
                </div>
                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                    placeholder="Repeat new password" required style={inputStyle(true)} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button type="submit" className="btn btn-primary" disabled={changingPwd}>
                  <i className="fas fa-key"></i> {changingPwd ? 'Changing…' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
