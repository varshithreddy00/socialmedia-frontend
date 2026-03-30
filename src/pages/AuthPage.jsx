import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin]   = useState(true);
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm]         = useState({ username: '', email: '', password: '' });
  const [errors, setErrors]     = useState({});
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim())                    e.username = 'This field is required';
    if (!isLogin && form.username.length < 3)     e.username = 'Min 3 characters';
    if (!isLogin && !form.email.trim())            e.email    = 'Email is required';
    if (!isLogin && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password)                            e.password = 'Password is required';
    if (!isLogin && form.password.length < 6)      e.password = 'Min 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await authAPI.login({ usernameOrEmail: form.username, password: form.password });
      } else {
        res = await authAPI.register({ username: form.username, email: form.email, password: form.password });
      }
      const { accessToken, ...userData } = res.data.data;
      login(accessToken, userData);
      toast.success(isLogin ? `Welcome back, @${userData.username}!` : 'Account created! 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || (isLogin ? 'Invalid credentials' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(p => !p);
    setForm({ username: '', email: '', password: '' });
    setErrors({});
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container">

        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-icon">S</div>
            <span className="auth-brand-name gradient-text">SocialApp</span>
          </div>
          <h1 className="auth-headline">Connect.<br />Share.<br />Inspire.</h1>
          <p className="auth-sub">Join thousands of people sharing moments and building connections.</p>
          <div className="auth-features">
            {['📸 Share photos & thoughts','❤️ Like & comment on posts','👥 Follow your people','🌐 Build your community'].map(f => (
              <div key={f} className="auth-feature">{f}</div>
            ))}
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button className={`auth-tab ${isLogin ? 'auth-tab--active' : ''}`} onClick={() => !isLogin && switchMode()}>Log In</button>
            <button className={`auth-tab ${!isLogin ? 'auth-tab--active' : ''}`} onClick={() => isLogin && switchMode()}>Sign Up</button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            <div className="form-group">
              <label className="form-label">{isLogin ? 'Username or Email' : 'Username'}</label>
              <div className="input-wrap">
                <HiUser className="input-icon" size={16} />
                <input
                  className={`form-input input-padded ${errors.username ? 'error' : ''}`}
                  type="text" name="username"
                  placeholder={isLogin ? 'Enter username or email' : 'Pick a username'}
                  value={form.username} onChange={handleChange}
                />
              </div>
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="input-wrap">
                  <HiMail className="input-icon" size={16} />
                  <input
                    className={`form-input input-padded ${errors.email ? 'error' : ''}`}
                    type="email" name="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                  />
                </div>
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <HiLockClosed className="input-icon" size={16} />
                <input
                  className={`form-input input-padded input-padded-right ${errors.password ? 'error' : ''}`}
                  type={showPass ? 'text' : 'password'} name="password"
                  placeholder={isLogin ? 'Enter password' : 'Min 6 characters'}
                  value={form.password} onChange={handleChange}
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <HiEyeOff size={16} /> : <HiEye size={16} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full auth-submit-btn" disabled={loading}>
              {loading
                ? <span className="btn-loading"><span className="btn-spinner" />{isLogin ? 'Logging in...' : 'Creating account...'}</span>
                : isLogin ? 'Log In' : 'Create Account'
              }
            </button>
          </form>

          <p className="auth-switch-text">
            {isLogin ? "New here? " : 'Already a member? '}
            <button className="auth-switch-btn" onClick={switchMode}>
              {isLogin ? 'Create an account' : 'Log in instead'}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}