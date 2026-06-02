/**
 * GradCamViewer.jsx — Displays the Grad-CAM heatmap overlay from base64.
 */
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

export default function GradCamViewer({ heatmapBase64 }) {
  if (!heatmapBase64) {
    return (
      <div style={{
        padding: '40px 20px', textAlign: 'center',
        background: 'rgba(108,99,255,0.05)',
        borderRadius: 16, border: '1px dashed rgba(108,99,255,0.2)',
      }}>
        <Flame size={32} color="#6c63ff" style={{ opacity: 0.4 }} />
        <p style={{ margin: '12px 0 0', fontSize: '0.85rem', color: '#8888aa' }}>
          Grad-CAM not available for this result
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
      <img
        src={`data:image/jpeg;base64,${heatmapBase64}`}
        alt="Grad-CAM heatmap"
        style={{
          width: '100%', borderRadius: 16,
          border: '1px solid rgba(108,99,255,0.2)',
          boxShadow: '0 4px 24px rgba(108,99,255,0.15)',
        }}
      />
      <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: '#8888aa', textAlign: 'center' }}>
        🔥 Red regions = areas most suspicious of manipulation
      </p>
    </motion.div>
  );
}
