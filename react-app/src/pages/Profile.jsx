/**
 * Profile.jsx — User settings: profile update, API key management.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Key, RefreshCw, Eye, EyeOff, Save, Loader, Copy, CheckCircle } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState(user?.api_key || '');
  const [showKey, setShowKey] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await client.patch('/auth/profile', form);
      updateUser(data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenKey = async () => {
    if (!window.confirm('Regenerate API key? Your existing key will stop working.')) return;
    setRegenerating(true);
    try {
      const { data } = await client.post('/auth/regenerate-key');
      setApiKey(data.api_key);
      updateUser({ ...user, api_key: data.api_key });
      toast.success('New API key generated!');
    } catch {
      toast.error('Failed to regenerate key');
    } finally {
      setRegenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast.success('API key copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 6px' }}>Profile & Settings</h1>
        <p style={{ margin: 0, color: '#8888aa', fontSize: '0.9rem' }}>Manage your account and API access</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
        {/* Avatar Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, gridColumn: '1 / -1' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6c63ff, #ff6b9d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', fontWeight: 800, color: 'white',
            boxShadow: '0 8px 32px rgba(108,99,255,0.3)',
          }}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 4px' }}>{user?.username}</h2>
            <p style={{ margin: '0 0 8px', fontSize: '0.87rem', color: '#8888aa' }}>{user?.email}</p>
            <span style={{ fontSize: '0.75rem', padding: '3px 12px', borderRadius: 99, background: 'rgba(0,227,150,0.1)', color: '#00e396', border: '1px solid rgba(0,227,150,0.2)' }}>
              ✓ Active Account
            </span>
          </div>
        </motion.div>

        {/* Profile Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={16} color="#6c63ff" /> Personal Info
          </h2>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#8888aa', marginBottom: 6 }}>Full Name</label>
              <input value={form.full_name} onChange={(e) => setForm(p => ({ ...p, full_name: e.target.value }))} className="input" placeholder="Your full name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#8888aa', marginBottom: 6 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} color="#8888aa" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className="input" style={{ paddingLeft: 40 }} placeholder="you@example.com" type="email" />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#8888aa', marginBottom: 6 }}>Username</label>
              <input value={user?.username || ''} className="input" disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: '#8888aa' }}>Username cannot be changed</p>
            </div>
            <motion.button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', opacity: saving ? 0.7 : 1 }} whileTap={{ scale: 0.97 }}>
              {saving ? <><Loader size={15} className="spin" /> Saving...</> : <><Save size={15} /> Save Changes</>}
            </motion.button>
          </form>
        </motion.div>

        {/* API Key */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={16} color="#6c63ff" /> API Key
          </h2>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem', color: '#8888aa', lineHeight: 1.6 }}>
            Use this key to access the API from external apps. Include it as{' '}
            <code style={{ background: 'rgba(108,99,255,0.1)', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem', color: '#8b83ff' }}>X-API-Key</code>{' '}
            header in your requests.
          </p>

          <div style={{ position: 'relative', marginBottom: 16 }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              readOnly
              className="input"
              style={{ fontFamily: 'monospace', fontSize: '0.78rem', paddingRight: 88 }}
            />
            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
              <button onClick={() => setShowKey(!showKey)} className="btn-ghost" style={{ padding: '4px 6px', border: 'none' }}>
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={handleCopy} className="btn-ghost" style={{ padding: '4px 6px', border: 'none', color: copied ? '#00e396' : undefined }}>
                {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          <button onClick={handleRegenKey} disabled={regenerating} className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
            {regenerating ? <><Loader size={15} className="spin" /> Regenerating...</> : <><RefreshCw size={15} /> Regenerate Key</>}
          </button>

          <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 10, background: 'rgba(108,99,255,0.05)', border: '1px solid rgba(108,99,255,0.1)' }}>
            <p style={{ margin: '0 0 8px', fontSize: '0.78rem', fontWeight: 600, color: '#8b83ff' }}>Example Usage</p>
            <code style={{ fontSize: '0.72rem', color: '#8888aa', lineHeight: 1.8, display: 'block' }}>
              curl -X POST http://localhost:8000/predict/image \<br />
              &nbsp;&nbsp;-H "X-API-Key: YOUR_KEY" \<br />
              &nbsp;&nbsp;-F "file=@image.jpg"
            </code>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
