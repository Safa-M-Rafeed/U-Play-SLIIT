import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cloneTournament, deleteTournament } from '../../lib/tournamentApi';
import DeleteModal from './DeleteModal';
import Toast from './Toast';
 
export default function TournamentCard({ tournament, onRefresh }) {
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [toast, setToast]           = useState(null);
 
  const handleClone = async (e) => {
    e.stopPropagation();
    try {
      await cloneTournament(tournament._id);
      setToast({ message: 'Tournament cloned!', type: 'success' });
      onRefresh();
    } catch (err) { setToast({ message: 'Clone failed', type: 'error' }); }
  };
 
  const handleDelete = async () => {
    try {
      await deleteTournament(tournament._id);
      setShowDelete(false);
      onRefresh();
    } catch (err) { setToast({ message: 'Delete failed', type: 'error' }); }
  };
 
  const regPct = Math.round((tournament.registeredTeams / tournament.maxTeams) * 100);
  const statusColor = tournament.status === 'Ongoing' ? '#10b981'
    : tournament.status === 'Upcoming' ? '#f59e0b' : '#6b7280';
 
  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showDelete && <DeleteModal name={tournament.name} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
 
      <div
        onClick={() => navigate(`/admin/tournaments/${tournament._id}`)}
        style={{
          position: 'relative',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '20px',
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          e.currentTarget.style.borderColor = 'rgba(16,185,129,0.4)';
          e.currentTarget.querySelector('.actions').style.opacity = '1';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.querySelector('.actions').style.opacity = '0';
        }}
      >
        {/* Left accent bar */}
        <div style={{
          position: 'absolute', left: 0, top: '16px', bottom: '16px',
          width: '3px', borderRadius: '0 2px 2px 0', background: statusColor,
        }} />
 
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px', paddingLeft: '12px' }}>
          <div style={{ flex: 1, paddingRight: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>
              {tournament.name}
            </h3>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              {tournament.sport} · {tournament.format}
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '600',
            background: statusColor + '22', color: statusColor,
            border: `1px solid ${statusColor}44`,
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }} />
            {tournament.status}
          </span>
        </div>
 
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginBottom: '12px', paddingLeft: '12px' }}>
          <span>{new Date(tournament.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – {new Date(tournament.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
          <span>{tournament.venue}</span>
          <span>{tournament.registeredTeams}/{tournament.maxTeams} teams</span>
        </div>
 
        {/* Progress bar */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden', marginBottom: '12px', marginLeft: '12px' }}>
          <div style={{ height: '100%', width: `${regPct}%`, background: statusColor, borderRadius: '2px', transition: 'width 0.5s' }} />
        </div>
 
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Health</span>
            <span style={{ fontSize: '12px', fontWeight: '600', color:
              tournament.healthScore >= 80 ? '#10b981' : tournament.healthScore >= 60 ? '#f59e0b' : '#ef4444' }}>
              {tournament.healthScore}%
            </span>
            {tournament.conflicts?.length > 0 && (
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
                {tournament.conflicts.length} conflict{tournament.conflicts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className='actions' style={{ display: 'flex', gap: '8px', opacity: 0, transition: 'opacity 0.2s' }}>
            <button onClick={e => { e.stopPropagation(); navigate(`/admin/tournaments/${tournament._id}/edit`); }}
              style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.4)', color: '#10b981', background: 'transparent', cursor: 'pointer' }}>
              Edit
            </button>
            <button onClick={handleClone}
              style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)', background: 'transparent', cursor: 'pointer' }}>
              Clone
            </button>
            <button onClick={e => { e.stopPropagation(); setShowDelete(true); }}
              style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', background: 'transparent', cursor: 'pointer' }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
