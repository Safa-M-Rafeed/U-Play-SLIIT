import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTournament, updateTournament } from '../../lib/tournamentApi';
import Toast from '../../components/tournament/Toast';
import Spinner from '../../components/tournament/Spinner';
import '../../styles/tournament.css';
 
const SPORTS  = ['Cricket','Football','Basketball','Badminton','Volleyball','Rugby'];
const FORMATS = ['Group Stage + Playoffs','Single Knockout','Round Robin League','Double Round Robin'];
 
export default function EditTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm]             = useState(null);
  const [errors, setErrors]         = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);
 
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getTournament(id);
        setForm({
          name:                 data.name,
          sport:                data.sport,
          format:               data.format,
          startDate:            data.startDate?.slice(0, 10),
          endDate:              data.endDate?.slice(0, 10),
          registrationDeadline: data.registrationDeadline?.slice(0, 10),
          venue:                data.venue,
          maxTeams:             data.maxTeams,
          rules:                data.rules || '',
        });
      } catch { setToast({ message: 'Failed to load tournament', type: 'error' }); }
    })();
  }, [id]);
 
  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3)  e.name = 'Tournament name must be at least 3 characters';
    if (!form.sport)                          e.sport = 'Please select a sport';
    if (!form.format)                         e.format = 'Please select a format';
    if (!form.startDate)                      e.startDate = 'Start date is required';
    if (!form.endDate)                        e.endDate = 'End date is required';
    else if (form.endDate <= form.startDate)  e.endDate = 'End date must be after start date';
    if (!form.registrationDeadline)           e.registrationDeadline = 'Deadline is required';
    else if (form.registrationDeadline >= form.startDate) e.registrationDeadline = 'Deadline must be before start date';
    if (!form.venue || form.venue.length < 3) e.venue = 'Venue is required';
    if (!form.maxTeams || form.maxTeams < 2 || form.maxTeams > 64) e.maxTeams = 'Must be between 2 and 64';
    return e;
  };
 
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: null });
  };
 
  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await updateTournament(id, form);
      setToast({ message: 'Tournament updated successfully!', type: 'success' });
      setTimeout(() => navigate(`/admin/tournaments/${id}`), 1500);
    } catch (err) {
      setToast({ message: 'Failed to update', type: 'error' });
    } finally { setSubmitting(false); }
  };
 
  const ic = name => `glass-input${errors[name] ? ' error' : ''}`;
 
  if (!form) return <div className='glass-page'><Spinner /></div>;
 
  return (
    <div className='glass-page'>
      <div className='aurora-orb-1' /><div className='aurora-orb-2' />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
 
      <nav className='glass-nav'>
        <span style={{ fontWeight: '800', fontSize: '22px', color: '#10b981' }}>U-<span style={{ color: '#fff' }}>Play</span></span>
        <button onClick={() => navigate(`/admin/tournaments/${id}`)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px' }}>
          ← Back
        </button>
      </nav>
 
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', margin: '0 0 6px' }}>
            Edit <span style={{ color: '#10b981' }}>tournament</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>Update the tournament details below</p>
        </div>
 
        <form onSubmit={handleSubmit}>
          <div className='glass-form-section'>
            <h2>Basic information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className='glass-label'>Tournament name</label>
                <input name='name' value={form.name} onChange={handleChange} className={ic('name')} />
                {errors.name && <p className='glass-error'>{errors.name}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className='glass-label'>Sport</label>
                  <select name='sport' value={form.sport} onChange={handleChange} className={ic('sport')}>
                    {SPORTS.map(s => <option key={s} style={{ background: '#0d1f0f' }}>{s}</option>)}
                  </select>
                  {errors.sport && <p className='glass-error'>{errors.sport}</p>}
                </div>
                <div>
                  <label className='glass-label'>Format</label>
                  <select name='format' value={form.format} onChange={handleChange} className={ic('format')}>
                    {FORMATS.map(f => <option key={f} style={{ background: '#0d1f0f' }}>{f}</option>)}
                  </select>
                  {errors.format && <p className='glass-error'>{errors.format}</p>}
                </div>
              </div>
              <div>
                <label className='glass-label'>Venue</label>
                <input name='venue' value={form.venue} onChange={handleChange} className={ic('venue')} />
                {errors.venue && <p className='glass-error'>{errors.venue}</p>}
              </div>
              <div>
                <label className='glass-label'>Maximum teams</label>
                <input name='maxTeams' type='number' value={form.maxTeams} onChange={handleChange} className={ic('maxTeams')} min='2' max='64' />
                {errors.maxTeams && <p className='glass-error'>{errors.maxTeams}</p>}
              </div>
            </div>
          </div>
 
          <div className='glass-form-section'>
            <h2>Schedule</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className='glass-label'>Start date</label>
                  <input name='startDate' type='date' value={form.startDate} onChange={handleChange} className={ic('startDate')} />
                  {errors.startDate && <p className='glass-error'>{errors.startDate}</p>}
                </div>
                <div>
                  <label className='glass-label'>End date</label>
                  <input name='endDate' type='date' value={form.endDate} onChange={handleChange} className={ic('endDate')} />
                  {errors.endDate && <p className='glass-error'>{errors.endDate}</p>}
                </div>
              </div>
              <div>
                <label className='glass-label'>Registration deadline</label>
                <input name='registrationDeadline' type='date' value={form.registrationDeadline} onChange={handleChange} className={ic('registrationDeadline')} />
                {errors.registrationDeadline && <p className='glass-error'>{errors.registrationDeadline}</p>}
              </div>
            </div>
          </div>
 
          <div className='glass-form-section'>
            <h2>Rules & description</h2>
            <textarea name='rules' value={form.rules} onChange={handleChange} rows={4} maxLength={1000}
              className='glass-input' style={{ resize: 'none', fontFamily: 'inherit' }} />
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'right', margin: '4px 0 0' }}>{form.rules.length} / 1000</p>
          </div>
 
          <button type='submit' disabled={submitting} className='glass-btn-primary' style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '14px' }}>
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
 
