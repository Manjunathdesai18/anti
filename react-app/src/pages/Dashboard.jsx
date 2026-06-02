/**
 * Dashboard.jsx — Main dashboard with stats cards and recent activity.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, AlertTriangle, CheckCircle, Clock, Upload as UploadIcon, ArrowRight } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import AppLayout from '../components/AppLayout';
import StatCard from '../components/StatCard';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    client.get('/dashboard/stats')
      .then((r) => setStats(r.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const chartData = stats ? {
    labels: ['Total', 'AI Detected', 'Real', 'Processing'],
    datasets: [{
      label: 'Uploads',
      data: [stats.total_uploads, stats.fake_detected, stats.real_detected, stats.processing],
      backgroundColor: ['rgba(108,99,255,0.7)', 'rgba(255,69,96,0.7)', 'rgba(0,227,150,0.7)', 'rgba(255,165,0,0.7)'],
      borderColor: ['#6c63ff', '#ff4560', '#00e396', '#ffa500'],
      borderWidth: 1, borderRadius: 8,
    }],
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { backgroundColor: 'rgba(18,18,31,0.95)', borderColor: 'rgba(108,99,255,0.3)', borderWidth: 1, titleColor: '#e8e8f0', bodyColor: '#8888aa' },
    },
    scales: {
      x: { ticks: { color: '#8888aa' }, grid: { color: 'rgba(108,99,255,0.05)' } },
      y: { ticks: { color: '#8888aa' }, grid: { color: 'rgba(108,99,255,0.05)' }, beginAtZero: true },
    },
  };

  return (
    <AppLayout>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'Space Grotesk', fontSize: '1.8rem', fontWeight: 700, margin: '0 0 6px' }}>
          Dashboard
        </h1>
        <p style={{ margin: 0, color: '#8888aa', fontSize: '0.9rem' }}>
          Welcome back, <strong style={{ color: '#8b83ff' }}>{user?.username}</strong> 👋
        </p>
      </motion.div>

      {/* Quick Action */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ marginBottom: 28 }}>
        <Link to="/upload" className="btn-primary" style={{ display: 'inline-flex' }}>
          <UploadIcon size={16} /> Analyze New Media <ArrowRight size={16} />
        </Link>
      </motion.div>

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          {[0,1,2,3].map(i => (
            <div key={i} className="card" style={{ height: 120, background: 'rgba(255,255,255,0.02)', animation: 'pulse-glow 2s infinite' }} />
          ))}
        </div>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <StatCard icon={Upload} label="Total Uploads" value={stats.total_uploads} color="#6c63ff" delay={0} />
          <StatCard icon={AlertTriangle} label="AI Detected" value={stats.fake_detected} color="#ff4560" delay={0.1} />
          <StatCard icon={CheckCircle} label="Real Media" value={stats.real_detected} color="#00e396" delay={0.2} />
          <StatCard icon={Clock} label="Processing" value={stats.processing} color="#ffa500" delay={0.3} />
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Bar Chart */}
        {chartData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="card">
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px' }}>Overview</h2>
            <Bar data={chartData} options={chartOptions} />
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Space Grotesk', fontSize: '1rem', fontWeight: 600, margin: 0 }}>Recent Uploads</h2>
            <Link to="/history" style={{ fontSize: '0.8rem', color: '#8b83ff', textDecoration: 'none' }}>View all →</Link>
          </div>

          {!stats?.recent_uploads?.length ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <UploadIcon size={36} color="#6c63ff" style={{ opacity: 0.3, marginBottom: 12 }} />
              <p style={{ color: '#8888aa', fontSize: '0.87rem', margin: 0 }}>No uploads yet. <Link to="/upload" style={{ color: '#8b83ff' }}>Upload your first file</Link></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.recent_uploads.map((u) => (
                <Link key={u.id} to={`/results/${u.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(108,99,255,0.08)', transition: 'background 0.15s' }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,99,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Upload size={16} color="#6c63ff" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: '0.83rem', fontWeight: 500, color: '#e8e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.filename}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#8888aa' }}>{formatDate(u.created_at)}</p>
                  </div>
                  {u.result && (
                    <span className={u.result.prediction === 'FAKE' ? 'badge-fake' : 'badge-real'}>
                      {u.result.prediction}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
