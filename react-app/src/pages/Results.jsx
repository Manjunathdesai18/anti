/**
 * Results.jsx — Detailed result page with prediction, confidence chart,
 * Grad-CAM heatmap, frame analysis, explanation, and PDF download.
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, ArrowLeft, AlertTriangle, CheckCircle, Clock, Flame, FileText, Info } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import ResultChart from '../components/ResultChart';
import GradCamViewer from '../components/GradCamViewer';
import FrameGallery from '../components/FrameGallery';
import client from '../api/client';
import toast from 'react-hot-toast';

function formatDate(dt) {
  return new Date(dt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function VerdictBanner({ prediction, confidence }) {
  const isFake = prediction === 'FAKE';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: 'spring' }}
      style={{
        padding: '32px 40px', borderRadius: 20, textAlign: 'center', marginBottom: 28,
        background: isFake
          ? 'linear-gradient(135deg, rgba(255,69,96,0.15), rgba(255,107,157,0.05))'
          : 'linear-gradient(135deg, rgba(0,227,150,0.15), rgba(0,212,255,0.05))',
        border: `2px solid ${isFake ? 'rgba(255,69,96,0.4)' : 'rgba(0,227,150,0.4)'}`,
      }}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
        style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
          background: isFake ? 'rgba(255,69,96,0.15)' : 'rgba(0,227,150,0.15)',
          border: `2px solid ${isFake ? '#ff4560' : '#00e396'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        className="pulse-glow"
      >
        {isFake
          ? <AlertTriangle size={32} color="#ff4560" />
          : <CheckCircle size={32} color="#00e396" />
        }
      </motion.div>

      <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 800, margin: '0 0 8px', color: isFake ? '#ff4560' : '#00e396' }}>
        {isFake ? '⚠ AI GENERATED (FAKE)' : '✓ AUTHENTIC (REAL)'}
      </h2>
      <p style={{ margin: '0 0 16px', color: '#8888aa', fontSize: '0.9rem' }}>
        Model confidence: <strong style={{ color: isFake ? '#ff4560' : '#00e396' }}>{(confidence * 100).toFixed(1)}%</strong>
      </p>

      {/* Confidence bar */}
      <div className="progress-bar" style={{ maxWidth: 360, margin: '0 auto' }}>
        <motion.div
          className="progress-fill"
          initial={{ width: 0 }}
          animate={{ width: `${confidence * 100}%` }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          style={{
            background: isFake
              ? 'linear-gradient(90deg, #ff4560, #ff6b9d)'
              : 'linear-gradient(90deg, #00e396, #00d4ff)',
          }}
        />
      </div>
    </motion.div>
  );
}

export default function Results() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    client.get(`/upload/${id}`)
      .then((r) => setData(r.data))
      .catch(() => toast.error('Failed to load result'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await client.get(`/report/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `deepfake_report_${id.slice(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch {
      toast.error('Failed to generate PDF report');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return (
    <AppLayout>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12 }}>
        <Clock size={24} color="#6c63ff" className="spin" />
        <span style={{ color: '#8888aa' }}>Loading result...</span>
      </div>
    </AppLayout>
  );

  if (!data || data.status === 'failed') return (
    <AppLayout>
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <AlertTriangle size={40} color="#ff4560" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'Space Grotesk', fontWeight: 700, color: '#e8e8f0', marginBottom: 8 }}>Result Not Found</h2>
        <p style={{ color: '#8888aa', marginBottom: 24 }}>This analysis may have failed or doesn't exist.</p>
        <Link to="/history" className="btn-primary">View History</Link>
      </div>
    </AppLayout>
  );

  const result = data.result;

  return (
    <AppLayout>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link to="/history" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: '#8888aa', textDecoration: 'none', marginBottom: 8 }}>
            <ArrowLeft size={14} /> Back to History
          </Link>
          <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.6rem', fontWeight: 700, margin: '0 0 4px' }}>Analysis Result</h1>
          <p style={{ margin: 0, color: '#8888aa', fontSize: '0.85rem' }}>
            <strong style={{ color: '#e8e8f0' }}>{data.filename}</strong> · {formatDate(data.created_at)}
          </p>
        </div>
        <button onClick={handleDownloadPDF} disabled={downloading} className="btn-secondary" style={{ gap: 8 }}>
          {downloading ? <Clock size={15} className="spin" /> : <Download size={15} />}
          Download PDF Report
        </button>
      </motion.div>

      {/* Verdict Banner */}
      {result && <VerdictBanner prediction={result.prediction} confidence={result.confidence} />}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Confidence Chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card">
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 Confidence Breakdown
          </h2>
          {result && <ResultChart prediction={result.prediction} confidence={result.confidence} />}
          {result?.inference_time_ms && (
            <p style={{ margin: '16px 0 0', textAlign: 'center', fontSize: '0.78rem', color: '#8888aa' }}>
              ⚡ Analyzed in {result.inference_time_ms.toFixed(0)}ms
            </p>
          )}
        </motion.div>

        {/* Grad-CAM Heatmap */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Flame size={16} color="#ff6b9d" /> Grad-CAM Heatmap
          </h2>
          <GradCamViewer heatmapBase64={result?.heatmap_base64} />
        </motion.div>
      </div>

      {/* Explanation */}
      {result?.explanation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card" style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={16} color="#6c63ff" /> Why This Classification?
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0a0c0', lineHeight: 1.7 }}>{result.explanation}</p>
        </motion.div>
      )}

      {/* Frame Analysis (video only) */}
      {result?.frame_results?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px' }}>
            🎬 Frame-by-Frame Video Analysis
          </h2>
          <FrameGallery frameResults={result.frame_results} />
        </motion.div>
      )}
    </AppLayout>
  );
}
