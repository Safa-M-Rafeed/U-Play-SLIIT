export default function ConflictAlert({ conflicts }) {
  if (!conflicts || conflicts.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {conflicts.map((c, i) => (
        <div key={i} style={{
          display: 'flex', gap: '12px', padding: '12px',
          borderRadius: '12px',
          background: c.severity === 'error'
            ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
          border: c.severity === 'error'
            ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.3)',
        }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700',
            background: c.severity === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
            color: c.severity === 'error' ? '#f87171' : '#fbbf24',
          }}>
            {c.severity === 'error' ? '!' : '~'}
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0, textTransform: 'capitalize' }}>
              {c.type} conflict
            </p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0' }}>
              {c.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
