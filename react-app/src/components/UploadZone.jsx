/**
 * UploadZone.jsx — Drag-and-drop file upload component.
 */
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, FileVideo, X, CheckCircle } from 'lucide-react';

const MAX_SIZE = 50 * 1024 * 1024; // 50 MB

export default function UploadZone({ onFile, accept = { 'image/*': [], 'video/*': [] } }) {
  const [preview, setPreview] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) return;
    const file = accepted[0];
    setFileInfo(file);
    onFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreview({ type: 'image', url });
    } else {
      setPreview({ type: 'video', name: file.name });
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: MAX_SIZE,
    multiple: false,
  });

  const clear = (e) => {
    e.stopPropagation();
    setPreview(null);
    setFileInfo(null);
    onFile(null);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {!fileInfo ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            {...getRootProps()}
            className={`drop-zone ${isDragActive ? 'drag-over' : ''}`}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
            >
              <div style={{
                width: 72, height: 72, borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.1))',
                border: '1px solid rgba(108,99,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Upload size={30} color="#6c63ff" />
              </div>
              <div>
                <p style={{ margin: '0 0 6px', fontSize: '1.05rem', fontWeight: 600, color: '#e8e8f0' }}>
                  {isDragActive ? 'Drop it here!' : 'Drag & drop your file'}
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#8888aa' }}>
                  or <span style={{ color: '#6c63ff', cursor: 'pointer' }}>browse to upload</span>
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                {[
                  { icon: FileImage, label: 'JPEG / PNG / WebP' },
                  { icon: FileVideo, label: 'MP4 / AVI / MOV' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px',
                    background: 'rgba(108,99,255,0.08)',
                    border: '1px solid rgba(108,99,255,0.15)',
                    borderRadius: 99, fontSize: '0.78rem', color: '#8888aa',
                  }}>
                    <Icon size={13} color="#6c63ff" /> {label}
                  </div>
                ))}
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#666688' }}>Max 50 MB</p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="card"
            style={{ padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CheckCircle size={20} color="#00e396" />
                <div>
                  <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#e8e8f0' }}>{fileInfo.name}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#8888aa' }}>{formatSize(fileInfo.size)}</p>
                </div>
              </div>
              <button onClick={clear} className="btn-ghost" style={{ padding: '6px', border: 'none' }}>
                <X size={16} />
              </button>
            </div>

            {preview?.type === 'image' && (
              <img
                src={preview.url}
                alt="Preview"
                style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 12, background: 'rgba(0,0,0,0.3)' }}
              />
            )}
            {preview?.type === 'video' && (
              <div style={{ padding: '40px 20px', textAlign: 'center', background: 'rgba(108,99,255,0.05)', borderRadius: 12, border: '1px solid rgba(108,99,255,0.1)' }}>
                <FileVideo size={40} color="#6c63ff" />
                <p style={{ margin: '12px 0 0', fontSize: '0.9rem', color: '#8888aa' }}>Video file ready for analysis</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
