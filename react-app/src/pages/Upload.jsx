/**
 * Upload.jsx — Drag-and-drop file upload page with progress indicator.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import UploadZone from '../components/UploadZone';
import client from '../api/client';
import toast from 'react-hot-toast';

const STEPS = ['Select File', 'Uploading', 'Analyzing', 'Done'];

export default function Upload() {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please select a file first'); return; }
    setError(null);
    setStep(1);
    setProgress(20);

    const formData = new FormData();
    formData.append('file', file);

    try {
      setProgress(40);
      setStep(2);

      const { data } = await client.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded / e.total) * 60) + 20;
          setProgress(pct);
        },
      });

      setProgress(100);
      setStep(3);
      toast.success('Analysis complete! 🎉');
      setTimeout(() => navigate(`/results/${data.id}`), 800);
    } catch (err) {
      setStep(0);
      setProgress(0);
      const msg = err.response?.data?.detail || 'Upload failed. Please try again.';
      setError(msg);
      toast.error(msg);
    }
  };

  const isAnalyzing = step === 1 || step === 2;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 6px' }}>
          Upload & Analyze
        </h1>
        <p style={{ margin: 0, color: '#8888aa', fontSize: '0.9rem' }}>
          Upload an image or video to detect if it's AI-generated or authentic.
        </p>
      </motion.div>

      {/* Step Progress */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="card" style={{ marginBottom: 28, padding: '20px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STEPS.map((label, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step > i ? '#6c63ff' : step === i ? 'rgba(108,99,255,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${step >= i ? '#6c63ff' : 'rgba(255,255,255,0.1)'}`,
                  fontSize: '0.8rem', fontWeight: 700, color: step >= i ? 'white' : '#8888aa',
                  transition: 'all 0.3s',
                }}>
                  {step > i ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.72rem', color: step >= i ? '#8b83ff' : '#8888aa', whiteSpace: 'nowrap' }}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: '0 8px', marginBottom: 20, background: step > i ? '#6c63ff' : 'rgba(255,255,255,0.08)', transition: 'background 0.3s' }} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        {isAnalyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 20 }}>
            <div className="progress-bar">
              <motion.div className="progress-fill" animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '0.78rem', color: '#8888aa', textAlign: 'center' }}>
              {step === 1 ? 'Uploading file...' : 'Running AI analysis... This may take a moment for videos'}
            </p>
          </motion.div>
        )}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'start' }}>
        {/* Drop Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <UploadZone onFile={setFile} />

          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              marginTop: 16, padding: '14px 18px', borderRadius: 12,
              background: 'rgba(255,69,96,0.1)', border: '1px solid rgba(255,69,96,0.3)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <AlertTriangle size={16} color="#ff4560" />
              <span style={{ fontSize: '0.87rem', color: '#ff6b7a' }}>{error}</span>
            </motion.div>
          )}
        </motion.div>

        {/* Action Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
          className="card" style={{ width: 260, flexShrink: 0 }}>
          <h3 style={{ fontFamily: 'Space Grotesk', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 16px' }}>Analysis Options</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Face Detection', value: 'MTCNN (auto)' },
              { label: 'Model', value: 'EfficientNet-B4' },
              { label: 'Explainability', value: 'Grad-CAM' },
              { label: 'Max Frames (video)', value: '10 frames' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(108,99,255,0.08)' }}>
                <span style={{ fontSize: '0.78rem', color: '#8888aa' }}>{label}</span>
                <span style={{ fontSize: '0.78rem', color: '#8b83ff', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          <motion.button
            onClick={handleAnalyze}
            disabled={!file || isAnalyzing}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', opacity: (!file || isAnalyzing) ? 0.5 : 1 }}
            whileTap={{ scale: 0.97 }}
          >
            {isAnalyzing
              ? <><Loader size={16} className="spin" /> Analyzing...</>
              : <><Zap size={16} /> Analyze Now</>
            }
          </motion.button>

          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
              <CheckCircle size={15} color="#00e396" />
              <span style={{ fontSize: '0.8rem', color: '#00e396' }}>Redirecting to results...</span>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
