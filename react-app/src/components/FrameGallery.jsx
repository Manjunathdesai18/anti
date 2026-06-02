/**
 * FrameGallery.jsx — Shows per-frame prediction results for video analysis.
 * Renders a bar chart and a summary table.
 */
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FrameGallery({ frameResults }) {
  if (!frameResults || frameResults.length === 0) return null;

  const labels = frameResults.map((f) => `Frame ${f.frame_idx}`);
  const fakeConf = frameResults.map((f) => (f.prediction === 'FAKE' ? f.confidence * 100 : 0).toFixed(1));
  const realConf = frameResults.map((f) => (f.prediction === 'REAL' ? f.confidence * 100 : 0).toFixed(1));

  const data = {
    labels,
    datasets: [
      {
        label: 'AI Generated Confidence (%)',
        data: fakeConf,
        backgroundColor: 'rgba(255,69,96,0.7)',
        borderColor: 'rgba(255,69,96,1)',
        borderWidth: 1, borderRadius: 6,
      },
      {
        label: 'Authentic Confidence (%)',
        data: realConf,
        backgroundColor: 'rgba(0,227,150,0.7)',
        borderColor: 'rgba(0,227,150,1)',
        borderWidth: 1, borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: { ticks: { color: '#8888aa', font: { size: 11 } }, grid: { color: 'rgba(108,99,255,0.05)' } },
      y: { ticks: { color: '#8888aa' }, grid: { color: 'rgba(108,99,255,0.05)' }, max: 100 },
    },
    plugins: {
      legend: { labels: { color: '#8888aa', usePointStyle: true } },
      tooltip: {
        backgroundColor: 'rgba(18,18,31,0.95)', borderColor: 'rgba(108,99,255,0.3)',
        borderWidth: 1, titleColor: '#e8e8f0', bodyColor: '#8888aa',
        callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` },
      },
    },
    animation: { duration: 800 },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div style={{ marginBottom: 24 }}>
        <Bar data={data} options={options} />
      </div>

      {/* Summary Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Frame</th>
              <th>Prediction</th>
              <th>Confidence</th>
            </tr>
          </thead>
          <tbody>
            {frameResults.map((fr) => (
              <tr key={fr.frame_idx}>
                <td style={{ color: '#8888aa' }}>#{fr.frame_idx}</td>
                <td>
                  <span className={fr.prediction === 'FAKE' ? 'badge-fake' : 'badge-real'}>
                    {fr.prediction === 'FAKE' ? '⚠ AI Generated' : '✓ Authentic'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="progress-bar" style={{ width: 100 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: `${fr.confidence * 100}%`,
                          background: fr.prediction === 'FAKE'
                            ? 'linear-gradient(90deg,#ff4560,#ff6b9d)'
                            : 'linear-gradient(90deg,#00e396,#00d4ff)',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#e8e8f0', minWidth: 42 }}>
                      {(fr.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
