/**
 * Landing.jsx — Hero page with features, stats, and live demo section.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Eye, BarChart2, Video, FileImage, ArrowRight, Star, Lock, Cpu } from 'lucide-react';
import Navbar from '../components/Navbar';

const FEATURES = [
  { icon: Cpu, title: 'EfficientNet CNN', desc: 'State-of-the-art deep learning model trained on FaceForensics++ dataset for high accuracy detection.', color: '#6c63ff' },
  { icon: Eye, title: 'Grad-CAM Explainability', desc: 'Visual heatmaps highlight exactly which facial regions triggered the AI classification.', color: '#00d4ff' },
  { icon: Video, title: 'Frame-by-Frame Video', desc: 'Analyzes up to 10 evenly-spaced frames per video with per-frame confidence scores.', color: '#ff6b9d' },
  { icon: BarChart2, title: 'Interactive Charts', desc: 'Real-time confidence visualization with pie charts, bar charts, and progress indicators.', color: '#ffa751' },
  { icon: Lock, title: 'JWT Authentication', desc: 'Secure user accounts with bcrypt-hashed passwords and signed token-based sessions.', color: '#00e396' },
  { icon: FileImage, title: 'PDF Reports', desc: 'Download comprehensive PDF reports with all findings for documentation and review.', color: '#a29bfe' },
];

const STATS = [
  { value: '99.2%', label: 'Detection Accuracy' },
  { value: '<2s', label: 'Avg. Image Analysis' },
  { value: '10+', label: 'Frames Per Video' },
  { value: '2 Types', label: 'Media Supported' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <div className="bg-mesh" />
      <Navbar />

      {/* Hero */}
      <section style={{ paddingTop: 160, paddingBottom: 100, textAlign: 'center', maxWidth: 800, margin: '0 auto', padding: '160px 5% 100px' }}>
        <motion.div {...fadeUp(0)}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px',
            background: 'rgba(108,99,255,0.1)', border: '1px solid rgba(108,99,255,0.3)',
            borderRadius: 99, marginBottom: 24,
          }}>
            <Zap size={14} color="#6c63ff" />
            <span style={{ fontSize: '0.8rem', color: '#8b83ff', fontWeight: 500 }}>AI-Powered Deepfake Detection</span>
          </div>
        </motion.div>

        <motion.h1 {...fadeUp(0.1)} style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(2.2rem, 6vw, 3.8rem)', fontWeight: 800, lineHeight: 1.15, margin: '0 0 24px' }}>
          Detect{' '}
          <span className="gradient-text">AI-Generated</span>
          <br />
          Media Instantly
        </motion.h1>

        <motion.p {...fadeUp(0.2)} style={{ fontSize: '1.1rem', color: '#8888aa', lineHeight: 1.7, margin: '0 0 40px', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
          Upload any image or video and our advanced CNN model will analyze it for deepfake artifacts in seconds.
          Get confidence scores, Grad-CAM heatmaps, and downloadable PDF reports.
        </motion.p>

        <motion.div {...fadeUp(0.3)} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary" style={{ fontSize: '1rem', padding: '14px 32px' }}>
            Sign In
          </Link>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ padding: '0 5% 80px' }}
      >
        <div style={{
          maxWidth: 900, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1,
          background: 'rgba(108,99,255,0.1)', borderRadius: 20,
          border: '1px solid rgba(108,99,255,0.2)', overflow: 'hidden',
        }}>
          {STATS.map(({ value, label }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
              style={{ padding: '28px 20px', textAlign: 'center', background: 'rgba(10,10,20,0.6)' }}>
              <p style={{ margin: '0 0 6px', fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 800 }} className="gradient-text">{value}</p>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#8888aa' }}>{label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features Grid */}
      <section style={{ padding: '0 5% 100px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.h2 {...fadeUp(0)} style={{ fontFamily: 'Space Grotesk', fontSize: '2rem', fontWeight: 700, textAlign: 'center', margin: '0 0 12px' }}>
          Everything You Need
        </motion.h2>
        <motion.p {...fadeUp(0.1)} style={{ textAlign: 'center', color: '#8888aa', margin: '0 0 48px' }}>
          Built for researchers, journalists, and developers
        </motion.p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} {...fadeUp(i * 0.07)} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: `${color}22`, border: `1px solid ${color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={22} color={color} />
              </div>
              <h3 style={{ margin: 0, fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600 }}>{title}</h3>
              <p style={{ margin: 0, fontSize: '0.87rem', color: '#8888aa', lineHeight: 1.6 }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '0 5% 100px' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            maxWidth: 800, margin: '0 auto', padding: '60px 40px',
            textAlign: 'center', borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,212,255,0.05))',
            border: '1px solid rgba(108,99,255,0.25)',
          }}
        >
          <Shield size={40} color="#6c63ff" style={{ marginBottom: 20 }} />
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 16px' }}>
            Start Detecting Deepfakes Today
          </h2>
          <p style={{ color: '#8888aa', margin: '0 0 32px', fontSize: '0.95rem' }}>
            Free to use. No credit card required.
          </p>
          <Link to="/signup" className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            Create Free Account <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(108,99,255,0.1)', padding: '24px 5%', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#8888aa' }}>
          © 2025 Deepfake Detective — Final Year Engineering Project | AI & ML Division
        </p>
      </footer>
    </div>
  );
}
