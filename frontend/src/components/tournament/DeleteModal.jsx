export default function DeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '20px', padding: '32px',
        maxWidth: '400px', width: '100%',
      }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', marginBottom: '16px', color: '#f87171',
        }}>!</div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
          Delete tournament
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', marginBottom: '28px' }}>
          Are you sure you want to delete{' '}
          <strong style={{ color: '#fff' }}>{name}</strong>?
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '12px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent', color: 'rgba(255,255,255,0.7)',
            fontSize: '14px', fontWeight: '500', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: '12px', borderRadius: '10px',
            border: 'none', background: '#dc2626',
            color: '#fff', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
          }}>Yes, delete</button>
        </div>
      </div>
    </div>
  );
}
 
