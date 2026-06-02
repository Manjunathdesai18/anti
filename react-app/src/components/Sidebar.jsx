/**
 * Sidebar.jsx — Collapsible sidebar navigation for authenticated pages.
 */
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, LayoutDashboard, Upload, History,
  Settings, LogOut, Zap, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload',    icon: Upload,          label: 'Upload' },
  { to: '/history',   icon: History,         label: 'History' },
  { to: '/profile',   icon: Settings,        label: 'Profile' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      style={{
        height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
        background: 'rgba(12, 12, 22, 0.95)',
        borderRight: '1px solid rgba(108,99,255,0.15)',
        backdropFilter: 'blur(20px)',
        display: 'flex', flexDirection: 'column',
        padding: '0 12px',
        overflow: 'hidden',
      }}
    >
      {/* Logo Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', padding: '20px 4px', marginBottom: 8 }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6c63ff,#00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={16} color="white" />
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.95rem', color: '#e8e8f0', whiteSpace: 'nowrap' }}>
              Deepfake<span style={{ color: '#6c63ff' }}>AI</span>
            </span>
          </div>
        )}
        <button onClick={onToggle} className="btn-ghost" style={{ padding: '6px', minWidth: 32, justifyContent: 'center', border: 'none', background: 'rgba(108,99,255,0.1)' }}>
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
            <ChevronLeft size={16} />
          </motion.div>
        </button>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '12px 0 20px', borderTop: '1px solid rgba(108,99,255,0.1)' }}>
        {!collapsed && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', marginBottom: 6 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg,#6c63ff,#ff6b9d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: '0.83rem', fontWeight: 600, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.username}</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#8888aa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', justifyContent: collapsed ? 'center' : 'flex-start', color: '#ff6b9d' }} title={collapsed ? 'Logout' : undefined}>
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
}
