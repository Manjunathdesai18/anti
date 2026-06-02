/**
 * History.jsx — Paginated history of all user uploads with search & filter.
 */
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, FileImage, FileVideo, ChevronLeft, ChevronRight, ExternalLink, Upload, Clock } from 'lucide-react';
import AppLayout from '../components/AppLayout';
import client from '../api/client';
import toast from 'react-hot-toast';

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function History() {
  const [uploads, setUploads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const perPage = 10;

  const fetchHistory = useCallback(() => {
    setLoading(true);
    client.get('/history', { params: { page, per_page: perPage } })
      .then((r) => { setUploads(r.data.items); setTotal(r.data.total); })
      .catch(() => toast.error('Failed to load history'))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const totalPages = Math.ceil(total / perPage);

  const filtered = search.trim()
    ? uploads.filter((u) => u.filename.toLowerCase().includes(search.toLowerCase()))
    : uploads;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 6px' }}>Upload History</h1>
        <p style={{ margin: 0, color: '#8888aa', fontSize: '0.9rem' }}>All your past analyses in one place</p>
      </motion.div>

      {/* Search + Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
          <Search size={16} color="#8888aa" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            placeholder="Search filenames..."
            style={{ paddingLeft: 40 }}
          />
        </div>
        <span style={{ fontSize: '0.82rem', color: '#8888aa', whiteSpace: 'nowrap' }}>
          {total} total upload{total !== 1 ? 's' : ''}
        </span>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', gap: 12 }}>
            <Clock size={20} color="#6c63ff" className="spin" />
            <span style={{ color: '#8888aa' }}>Loading...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Upload size={40} color="#6c63ff" style={{ opacity: 0.3, marginBottom: 16 }} />
            <p style={{ color: '#8888aa', marginBottom: 20 }}>
              {search ? 'No matching files found' : 'No uploads yet'}
            </p>
            <Link to="/upload" className="btn-primary">Upload Your First File</Link>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>File</th>
                <th>Type</th>
                <th>Size</th>
                <th>Date</th>
                <th>Result</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {u.file_type === 'video'
                          ? <FileVideo size={15} color="#6c63ff" />
                          : <FileImage size={15} color="#6c63ff" />
                        }
                      </div>
                      <span style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {u.filename}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 99, background: 'rgba(108,99,255,0.1)', color: '#8b83ff', fontWeight: 500 }}>
                      {u.file_type}
                    </span>
                  </td>
                  <td style={{ color: '#8888aa' }}>{formatSize(u.file_size)}</td>
                  <td style={{ color: '#8888aa' }}>{formatDate(u.created_at)}</td>
                  <td>
                    {u.result ? (
                      <span className={u.result.prediction === 'FAKE' ? 'badge-fake' : 'badge-real'}>
                        {u.result.prediction === 'FAKE' ? '⚠ AI Fake' : '✓ Real'}
                      </span>
                    ) : u.status === 'processing' ? (
                      <span className="badge-processing">⏳ Processing</span>
                    ) : (
                      <span style={{ color: '#8888aa', fontSize: '0.78rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {u.result ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ width: 60 }}>
                          <div
                            className="progress-fill"
                            style={{
                              width: `${u.result.confidence * 100}%`,
                              background: u.result.prediction === 'FAKE'
                                ? 'linear-gradient(90deg,#ff4560,#ff6b9d)'
                                : 'linear-gradient(90deg,#00e396,#00d4ff)',
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#e8e8f0' }}>{(u.result.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    {u.result && (
                      <Link to={`/results/${u.id}`} className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                        <ExternalLink size={13} /> View
                      </Link>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 20 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost" style={{ padding: '8px' }}>
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: '0.85rem', color: '#8888aa' }}>Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost" style={{ padding: '8px' }}>
            <ChevronRight size={16} />
          </button>
        </motion.div>
      )}
    </AppLayout>
  );
}
