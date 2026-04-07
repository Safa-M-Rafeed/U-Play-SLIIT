 
export default function HealthRing({ score }) {
  const radius        = 45;
  const circumference = 2 * Math.PI * radius;
  const offset        = circumference - (score / 100) * circumference;
  const color         = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: '112px', height: '112px' }}>
        <svg style={{ width: '112px', height: '112px', transform: 'rotate(-90deg)' }} viewBox='0 0 100 100'>
          <circle cx='50' cy='50' r={radius} fill='none'
            stroke='rgba(255,255,255,0.08)' strokeWidth='10' />
          <circle cx='50' cy='50' r={radius} fill='none'
            stroke={color} strokeWidth='10' strokeLinecap='round'
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontWeight: '700', fontSize: '26px', lineHeight: 1, color }}>{score}</span>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>Health score</span>
    </div>
  );
}
