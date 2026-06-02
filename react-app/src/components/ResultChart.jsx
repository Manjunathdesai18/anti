/**
 * ResultChart.jsx — Pie chart showing FAKE vs REAL confidence breakdown.
 * Uses Chart.js via react-chartjs-2.
 */
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ResultChart({ prediction, confidence }) {
  const isFake = prediction === 'FAKE';
  const fakeVal = isFake ? confidence * 100 : (1 - confidence) * 100;
  const realVal = 100 - fakeVal;

  const data = {
    labels: ['AI Generated', 'Authentic'],
    datasets: [{
      data: [fakeVal.toFixed(1), realVal.toFixed(1)],
      backgroundColor: ['rgba(255,69,96,0.85)', 'rgba(0,227,150,0.85)'],
      borderColor: ['rgba(255,69,96,1)', 'rgba(0,227,150,1)'],
      borderWidth: 2,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#8888aa', font: { size: 12 }, padding: 16,
          usePointStyle: true, pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label}: ${ctx.parsed.toFixed(1)}%`,
        },
        backgroundColor: 'rgba(18,18,31,0.95)',
        borderColor: 'rgba(108,99,255,0.3)',
        borderWidth: 1,
        titleColor: '#e8e8f0',
        bodyColor: '#8888aa',
      },
    },
    cutout: '55%',
    animation: { animateScale: true, animateRotate: true, duration: 800 },
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
      <div style={{ position: 'relative', maxWidth: 280, margin: '0 auto' }}>
        <Pie data={data} options={options} />
        {/* Center label */}
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          paddingBottom: 30,
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: isFake ? '#ff4560' : '#00e396', fontFamily: 'Space Grotesk' }}>
            {(confidence * 100).toFixed(1)}%
          </span>
          <span style={{ fontSize: '0.7rem', color: '#8888aa', fontWeight: 500 }}>confidence</span>
        </div>
      </div>
    </motion.div>
  );
}
