import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournaments } from '../../hooks/useTournaments';
import TournamentCard from '../../components/tournament/TournamentCard';
import Spinner from '../../components/tournament/Spinner';
import { generateFormat } from '../../lib/tournamentApi';
import '../../styles/tournament.css';
 
export default function TournamentList() {
  const navigate = useNavigate();
  const { tournaments, loading, error, refetch } = useTournaments();
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');
  const [fgTeams, setFgTeams] = useState('');
  const [fgDays, setFgDays]   = useState('');
  const [fgSport, setFgSport] = useState('');
  const [fgResult, setFgResult] = useState(null);
 
  const filters  = ['All', 'Ongoing', 'Upcoming', 'Completed'];
  const filtered = tournaments
    .filter(t => filter === 'All' || t.status === filter)
    .filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
 
  const stats = {
    active:    tournaments.filter(t => t.status === 'Ongoing').length,
    upcoming:  tournaments.filter(t => t.status === 'Upcoming').length,
    completed: tournaments.filter(t => t.status === 'Completed').length,
    conflicts: tournaments.reduce((a, t) => a + (t.conflicts?.length || 0), 0),
  };
 
  const handleGenerate = async () => {
    if (!fgTeams || !fgDays || !fgSport) return;
    try {
      const { data } = await generateFormat({ teams: +fgTeams, days: +fgDays, sport: fgSport });
      setFgResult(data);
    } catch { alert('Generation failed'); }
  };
 
  return (
    <div className='glass-page'>
      <div className='aurora-orb-1' /><div className='aurora-orb-2' />
 
      {/* Navbar */}
      <nav className='glass-nav'>
        <span style={{ fontWeight: '800', fontSize: '22px', color: '#10b981' }}>
          U-<span style={{ color: '#fff' }}>Play</span>
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['dashboard', 'tournaments', 'schedule', 'templates'].map(t => (
            <button key={t}
              onClick={() => t === 'dashboard' && navigate('/admin')}
              style={{
                padding: '6px 14px', borderRadius: '8px', fontSize: '13px',
                fontWeight: '500', cursor: 'pointer',
                background: t === 'tournaments' ? 'rgba(16,185,129,0.15)' : 'transparent',
                color: t === 'tournaments' ? '#10b981' : 'rgba(255,255,255,0.5)',
                border: t === 'tournaments' ? '1px solid rgba(16,185,129,0.3)' : 'none',
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <button className='glass-btn-primary' onClick={() => navigate('/admin/tournaments/create')}>
          + New tournament
        </button>
      </nav>
 
      <div style={{ padding: '24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 8px', lineHeight: 1 }}>
            Tournament <span style={{ color: '#10b981' }}>command</span> center
          </h1>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            SLIIT Inter-University Sports · Semester 1, 2026
          </p>
        </div>
 
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Active tournaments', val: stats.active,    cls: 'green' },
            { label: 'Upcoming',           val: stats.upcoming,  cls: 'amber' },
            { label: 'Conflicts detected', val: stats.conflicts, cls: 'red'   },
            { label: 'Completed',          val: stats.completed, cls: 'gray'  },
          ].map(s => (
            <div key={s.label} className={`glass-stat-card ${s.cls}`}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#fff', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
 
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          {/* Left — list */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{
                  padding: '6px 14px', borderRadius: '8px', fontSize: '12px',
                  fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
                  background: filter === f ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                  color: filter === f ? '#10b981' : 'rgba(255,255,255,0.5)',
                  border: filter === f ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
                }}>{f}</button>
              ))}
              <input placeholder='Search tournaments...' value={search}
                onChange={e => setSearch(e.target.value)}
                className='glass-input' style={{ width: '180px', marginLeft: 'auto' }} />
            </div>
 
            {loading && <Spinner />}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <p style={{ color: '#f87171', fontWeight: '600', margin: '0 0 4px' }}>Cannot connect to backend</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: 0 }}>Check VITE_API_URL in frontend .env and backend is running on port 8000</p>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px' }}>
                <p style={{ fontSize: '32px', margin: '0 0 12px' }}>🏆</p>
                <p style={{ color: '#fff', fontWeight: '600', margin: '0 0 6px' }}>No tournaments found</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', margin: '0 0 20px' }}>Create your first tournament to get started</p>
                <button className='glass-btn-primary' onClick={() => navigate('/admin/tournaments/create')}>Create tournament</button>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map(t => <TournamentCard key={t._id} tournament={t} onRefresh={refetch} />)}
            </div>
          </div>
 
          {/* Right sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Smart format generator */}
            <div className='glass-card' style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 }}>Smart format generator</h2>
                <span style={{ fontSize: '11px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 8px', borderRadius: '999px' }}>AI</span>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input type='number' placeholder='Number of teams' value={fgTeams} onChange={e => setFgTeams(e.target.value)} className='glass-input' min='2' max='64' />
                <select value={fgSport} onChange={e => setFgSport(e.target.value)} className='glass-input' style={{ appearance: 'none' }}>
                  <option value=''>Select sport</option>
                  {['Cricket','Football','Basketball','Badminton','Volleyball'].map(s => <option key={s} style={{ background: '#0d1f0f' }}>{s}</option>)}
                </select>
                <input type='number' placeholder='Days available' value={fgDays} onChange={e => setFgDays(e.target.value)} className='glass-input' min='1' max='60' />
                <button className='glass-btn-primary' onClick={handleGenerate} disabled={!fgTeams || !fgDays || !fgSport} style={{ width: '100%' }}>Generate format</button>
                {fgResult && (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', padding: '14px' }}>
                    <p style={{ color: '#10b981', fontSize: '12px', fontWeight: '600', margin: '0 0 4px' }}>Recommended: {fgResult.format}</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0, lineHeight: '1.5' }}>{fgResult.suggestion}</p>
                  </div>
                )}
              </div>
            </div>
 
            {/* Quick actions */}
            <div className='glass-card' style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600', color: '#fff', margin: 0 }}>Quick actions</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '12px' }}>
                {[
                  { icon: '+', label: 'New tournament', sub: 'Start from scratch', action: () => navigate('/admin/tournaments/create') },
                  { icon: '⧉', label: 'Clone existing',  sub: 'Copy last season',   action: () => {} },
                ].map(a => (
                  <button key={a.label} onClick={a.action} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '14px', textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.background = 'rgba(16,185,129,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                  >
                    <div style={{ fontSize: '18px', color: '#10b981', marginBottom: '6px' }}>{a.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff' }}>{a.label}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{a.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 
