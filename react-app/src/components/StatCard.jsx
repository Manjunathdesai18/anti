/**
 * StatCard.jsx — Animated metric card for the dashboard.
 */
import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, color = '#6c63ff', delay = 0, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card"
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Glow orb */}
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 100, height: 100, borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#8888aa', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          <motion.p
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
            style={{ margin: 0, fontSize: '2rem', fontWeight: 800, fontFamily: 'Space Grotesk', color: '#e8e8f0' }}
          >
            {value ?? '—'}
          </motion.p>
          {trend !== undefined && (
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: trend >= 0 ? '#00e396' : '#ff4560' }}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
            </p>
          )}
        </div>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `linear-gradient(135deg, ${color}33, ${color}11)`,
          border: `1px solid ${color}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {Icon && <Icon size={22} color={color} />}
        </div>
      </div>
    </motion.div>
  );
}
