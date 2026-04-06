 
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, addAnnouncement, cloneTournament, deleteTournament } from '../../lib/tournamentApi';
import HealthRing from '../../components/tournament/HealthRing';
import ConflictAlert from '../../components/tournament/ConflictAlert';
import DeleteModal from '../../components/tournament/DeleteModal';
import Toast from '../../components/tournament/Toast';
import Spinner from '../../components/tournament/Spinner';
import '../../styles/tournament.css';
 
export default function TournamentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament]   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showDelete, setShowDelete]   = useState(false);
  const [toast, setToast]             = useState(null);
  const [ann, setAnn]                 = useState({ title: '', message: '' });
  const [posting, setPosting]         = useState(false);
  const [annErrors, setAnnErrors]     = useState({});
 
  useEffect(() => {
    (async () => {
      try { const { data } = await getTournament(id); setTournament(data); }
      catch { setToast({ message: 'Failed to load tournament', type: 'error' }); }
      finally { setLoading(false); }
    })();
  }, [id]);
 
  const handleAnn = async e => {
    e.preventDefault();
    const errs = {};
    if (!ann.title   || ann.title.length   < 3)  errs.title   = 'Title must be at least 3 characters';
    if (!ann.message || ann.message.length < 10) errs.message = 'Message must be at least 10 characters';
    if (Object.keys(errs).length > 0) { setAnnErrors(errs); return; }
    setPosting(true);
    try {
      const { data } = await addAnnouncement(id, ann);
      setTournament(data);
      setAnn({ title: '', message: '' });
      setAnnErrors({});
      setToast({ message: 'Announcement posted!', type: 'success' });
    } catch { setToast({ message: 'Failed to post', type: 'error' }); }
    finally { setPosting(false); }
  };
 
  const handleClone = async () => {
    try { await cloneTournament(id); setToast({ message: 'Tournament cloned!', type: 'success' }); setTimeout(() => navigate('/admin/tournaments'), 1500); }
    catch { setToast({ message: 'Clone failed', type: 'error' }); }
  };
 
  const handleDelete = async () => {
    try { await deleteTournament(id); navigate('/admin/tournaments'); }
    catch { setToast({ message: 'Delete failed', type: 'error' }); }
  };
 
  const statusColor = t => t.status === 'Ongoing' ? '#10b981' : t.status === 'Upcoming' ? '#f59e0b' : '#6b7280';
  const ic = err => `glass-input${err ? ' error' : ''}`;
 
  if (loading) return <div className='glass-page'><Spinner /></div>;
  if (!tournament) return null;
 
  return (
    <div className='glass-page'>
      <div className='aurora-orb-1' /><div className='aurora-orb-2' />
      {toast      && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {showDelete && <DeleteModal name={tournament.name} onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />}
 
      <nav className='glass-nav'>
        <span style={{ fontWeight: '800', fontSize: '22px', color: '#10b981' }}>U-<span style={{ color: '#fff' }}>Play</span></span>
        <button onClick={() => navigate('/admin/tournaments')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px' }}>
          ← Back to tournaments
        </button>
      </nav>
 
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', margin: 0 }}>{tournament.name}</h1>
              <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                background: statusColor(tournament) + '22', color: statusColor(tournament), border: `1px solid ${statusColor(tournament)}44` }}>
                {tournament.status}
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', margin: 0 }}>
              {tournament.sport} · {tournament.format} · {tournament.venue}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className='glass-btn-ghost' style={{ color: '#10b981', borderColor: 'rgba(16,185,129,0.4)' }} onClick={() => navigate(`/admin/tournaments/${id}/edit`)}>Edit</button>
            <button className='glass-btn-ghost' onClick={handleClone}>Clone</button>
            <button className='glass-btn-ghost' style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.4)' }} onClick={() => setShowDelete(true)}>Delete</button>
          </div>
        </div>
 
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
 
            {/* Info grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              {[
                { label: 'Start date',        val: new Date(tournament.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'End date',          val: new Date(tournament.endDate).toLocaleDateString('en-GB',   { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'Reg. deadline',     val: new Date(tournament.registrationDeadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'Teams registered',  val: `${tournament.registeredTeams} / ${tournament.maxTeams}` },
                { label: 'Max teams',         val: tournament.maxTeams },
                { label: 'Format',            val: tournament.format },
              ].map(item => (
                <div key={item.label} className='glass-card' style={{ padding: '16px' }}>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', margin: '0 0 4px' }}>{item.label}</p>
                  <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: 0 }}>{item.val}</p>
                </div>
              ))}
            </div>
 
            {/* Rules */}
            {tournament.rules && (
              <div className='glass-card'>
                <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>Rules & description</h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>{tournament.rules}</p>
              </div>
            )}
 
            {/* Conflicts */}
            {tournament.conflicts?.length > 0 && (
              <div className='glass-card'>
                <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 12px' }}>Conflicts detected</h2>
                <ConflictAlert conflicts={tournament.conflicts} />
              </div>
            )}
 
            {/* Announcements */}
            <div className='glass-card'>
              <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 16px' }}>Announcements</h2>
              <form onSubmit={handleAnn} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <div>
                  <input value={ann.title} onChange={e => { setAnn({ ...ann, title: e.target.value }); setAnnErrors({ ...annErrors, title: null }); }}
                    placeholder='Announcement title' className={ic(annErrors.title)} />
                  {annErrors.title && <p className='glass-error'>{annErrors.title}</p>}
                </div>
                <div>
                  <textarea value={ann.message} onChange={e => { setAnn({ ...ann, message: e.target.value }); setAnnErrors({ ...annErrors, message: null }); }}
                    placeholder='Write your announcement...' rows={3}
                    className={ic(annErrors.message)} style={{ resize: 'none', fontFamily: 'inherit' }} />
                  {annErrors.message && <p className='glass-error'>{annErrors.message}</p>}
                </div>
                <button type='submit' disabled={posting} className='glass-btn-primary' style={{ alignSelf: 'flex-start', padding: '8px 20px' }}>
                  {posting ? 'Posting...' : 'Post announcement'}
                </button>
              </form>
              {tournament.announcements?.length === 0 && <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '14px' }}>No announcements yet.</p>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tournament.announcements?.map((a, i) => (
                  <div key={i} style={{ borderLeft: '2px solid rgba(16,185,129,0.4)', paddingLeft: '16px' }}>
                    <p style={{ color: '#fff', fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>{a.title}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: '0 0 4px' }}>{a.message}</p>
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 }}>
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
 
          {/* Right — health */}
          <div>
            <div className='glass-card' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: '0 0 16px', alignSelf: 'flex-start' }}>Tournament health</h2>
              <HealthRing score={tournament.healthScore} />
              <div style={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Registration rate', val: `${Math.round((tournament.registeredTeams / tournament.maxTeams) * 100)}%`, ok: tournament.registeredTeams / tournament.maxTeams >= 0.5 },
                  { label: 'Conflicts',         val: tournament.conflicts?.length || 0, ok: !tournament.conflicts?.length },
                  { label: 'Status',            val: tournament.status, ok: true },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: item.ok ? '#10b981' : '#f59e0b' }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
