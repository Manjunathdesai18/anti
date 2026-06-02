/**
 * AppLayout.jsx — Shared layout wrapper for all authenticated pages.
 * Includes collapsible sidebar and main content area.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';

export default function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const sideW = collapsed ? 72 : 240;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div className="bg-mesh" style={{ opacity: 0.5 }} />
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      <motion.main
        animate={{ marginLeft: sideW }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{ flex: 1, minHeight: '100vh', padding: '36px 36px 60px', maxWidth: `calc(100vw - ${sideW}px)` }}
      >
        {children}
      </motion.main>
    </div>
  );
}
