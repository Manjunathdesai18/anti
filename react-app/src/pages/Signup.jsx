/**
 * Signup.jsx — Registration form.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, UserPlus, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', full_name: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) { toast.error('Username, email and password are required'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await signup({ username: form.username, email: form.email, full_name: form.full_name || undefined, password: form.password });
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'username', label: 'Username', type: 'text', placeholder: 'cool_username' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'you@example.com' },
    { name: 'full_name', label: 'Full Name (optional)', type: 'text', placeholder: 'John Doe' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="bg-mesh" />
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass"
        style={{ width: '100%', maxWidth: 440, padding: '48px 40px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #6c63ff, #ff6b9d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
          }}>
            <UserPlus size={26} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 6px' }}>Create Account</h1>
          <p style={{ margin: 0, fontSize: '0.87rem', color: '#8888aa' }}>Join Deepfake Detective for free</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {fields.map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#8888aa', marginBottom: 6 }}>{label}</label>
              <input name={name} type={type} value={form[name]} onChange={handleChange} className="input" placeholder={placeholder} />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#8888aa', marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={handleChange}
                className="input" placeholder="Min. 6 characters"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8888aa', display: 'flex' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#8888aa', marginBottom: 6 }}>Confirm Password</label>
            <input name="confirm" type="password" value={form.confirm} onChange={handleChange} className="input" placeholder="Repeat password" />
          </div>

          {/* Password strength indicator */}
          {form.password && (
            <div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${Math.min(100, form.password.length * 12)}%` }} />
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#8888aa' }}>
                {form.password.length < 6 ? 'Too short' : form.password.length < 10 ? 'Fair strength' : 'Strong password ✓'}
              </p>
            </div>
          )}

          <motion.button
            type="submit" disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, opacity: loading ? 0.7 : 1 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? <><Loader size={16} className="spin" /> Creating...</> : <><UserPlus size={16} /> Create Account</>}
          </motion.button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.87rem', color: '#8888aa' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#8b83ff', fontWeight: 500, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
