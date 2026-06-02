/**
 * Navbar.jsx — Top navigation bar for public pages (Landing, Login, Signup).
 */
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(10,10,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(108,99,255,0.15)',
        padding: '0 5%',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield size={18} color="white" />
        </div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '1.1rem', color: '#e8e8f0' }}>
          Deepfake<span style={{ color: '#6c63ff' }}>Detective</span>
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="btn-ghost" style={{ gap: 6 }}>
              <LayoutDashboard size={15} /> Dashboard
            </Link>
            <button onClick={handleLogout} className="btn-ghost" style={{ color: '#ff6b9d', borderColor: 'rgba(255,107,157,0.2)' }}>
              <LogOut size={15} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost"><LogIn size={15} /> Login</Link>
            <Link to="/signup" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              <UserPlus size={15} /> Sign Up
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
