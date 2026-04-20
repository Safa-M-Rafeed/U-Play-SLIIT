import { useEffect } from 'react';
 
export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
 
  const bg = type === 'success' ? '#059669' : type === 'error' ? '#dc2626' : '#d97706';
 
  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 18px', borderRadius: '12px',
      fontSize: '13px', fontWeight: '500', color: '#fff',
      background: bg, boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      animation: 'slideIn 0.2s ease',
    }}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {message}
      <button onClick={onClose} style={{
        background: 'none', border: 'none', color: '#fff',
        cursor: 'pointer', fontSize: '16px', marginLeft: '8px', opacity: 0.7,
      }}>×</button>
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );
}
