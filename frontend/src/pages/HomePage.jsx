import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import '../styles/tournament.css';

import cricket from '../assets/gallery/cricket.png';
import football from '../assets/gallery/football.png';
import basketball from '../assets/gallery/basketball.png';
import badminton from '../assets/gallery/badminton.png';
import volleyball from '../assets/gallery/volleyball.png';
import award from '../assets/gallery/award.png';

// ── Data ────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🏆', title: 'Tournament management', desc: 'Create and manage full tournament lifecycles — from registration to final results — all in one place.' },
  { icon: '⚡', title: 'Live match tracking', desc: 'Real-time score updates and live leaderboards so every student stays connected to the action.' },
  { icon: '👥', title: 'Team & roster management', desc: 'Captains can build rosters, invite players, and register teams in minutes — not days.' },
  { icon: '📊', title: 'Smart analytics', desc: 'Health scores, conflict detection, and performance insights help admins run better events every time.' },
  { icon: '📅', title: 'Auto fixture generation', desc: 'Our AI-powered format generator creates complete match schedules in seconds based on your constraints.' },
  { icon: '🔔', title: 'Announcements & alerts', desc: 'Important updates reach every participant instantly — no more missed messages in busy group chats.' }
];

const GALLERY = [
  { label: 'Cricket Championship', image: cricket, featured: true },
  { label: 'Football League', image: football },
  { label: 'Basketball Invitational', image: basketball },
  { label: 'Badminton Open', image: badminton },
  { label: 'Volleyball Cup', image: volleyball },
  { label: 'Award Ceremony', image: award },
];

const TESTIMONIALS = [
  { quote: 'U-Play completely changed how we manage cricket tournaments.', name: 'Kavinda Perera', role: 'Cricket team captain · CS Faculty', initials: 'KP', color: '#064E3B' },
  { quote: 'Following live scores from my phone during lectures is possible now.', name: 'Dilshan Silva', role: 'Student · IT Faculty', initials: 'DS', color: '#1E3A5F' },
  { quote: 'Analytics dashboard saves hours every tournament.', name: 'Nadeeka Fernando', role: 'Sports coordinator · SLIIT', initials: 'NF', color: '#3B1F5E' }
];

// ── Component ────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactErrors, setContactErrors] = useState({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleContact = e => {
    e.preventDefault();
    const errs = {};
    if (!contactForm.name.trim()) errs.name = 'Name is required';
    if (!contactForm.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(contactForm.email)) errs.email = 'Enter a valid email';
    if (!contactForm.subject.trim()) errs.subject = 'Subject is required';
    if (!contactForm.message.trim()) errs.message = 'Message is required';
    if (Object.keys(errs).length > 0) { setContactErrors(errs); return; }

    setContactSent(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
    setContactErrors({});
  };

  const lc = name => `glass-input${contactErrors[name] ? ' error' : ''}`;

  const scrollTo = id => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className='glass-page' style={{ minHeight: '100vh' }}>

      {/* NAVBAR */}
      <nav className={`lp-nav${scrolled ? ' scrolled' : ''}`}>
        <span className='lp-logo'>U-<span>Play</span></span>

        <div className='lp-links'>
          {['about','services','gallery','contact'].map(id => (
            <button key={id} className='lp-link' onClick={() => scrollTo(id)}>
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>

        <div className='lp-nav-actions'>
          <button
            className='glass-btn-ghost'
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>

          <button
            className='glass-btn-primary'
            onClick={() => navigate('/register')}
          >
            Join now
          </button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className='lp-hero'>
        <div className="hero-overlay"></div>
        <div className='lp-hero-eyebrow'>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
          SLIIT's official sports platform
        </div>
 
        <div className="goal-animation">
          <div className="ball"></div>
        </div>

        <div className="goal-text">GOAL ⚽</div>

        <div className="floating-icons">
          <span>⚽</span>
          <span>🏀</span>
          <span>🏏</span>
          <span>🏐</span>
        </div>

        <h1 className='lp-hero-title'>
          Your game.
          <br />
          Your <span className='green'>glory</span>.
        </h1>
 
        <p className='lp-hero-sub'>
          U-Play brings SLIIT sports into the digital age.
          Register your team, follow live matches, and celebrate
          your wins — all in one beautiful platform.
        </p>
 
        <div className='lp-hero-cta'>
          <button className='glass-btn-primary'
            onClick={() => navigate('/register')}
            style={{ padding: '16px 40px', fontSize: '16px', borderRadius: '14px' }}>
            Get started for free
          </button>
          <button className='glass-btn-ghost'
            onClick={() => scrollTo('about')}
            style={{ padding: '16px 40px', fontSize: '16px', borderRadius: '14px' }}>
            Learn more
          </button>
        </div>
 
        {/* Stats bar */}
        <div className='lp-stats'>
          {[
            { num: '12+',  label: 'Tournaments yearly' },
            { num: '800+', label: 'Student athletes'   },
            { num: '6',    label: 'Sports covered'     },
            { num: '100%', label: 'Free to join'       },
          ].map(s => (
            <div key={s.label} className='lp-stat'>
              <div className='lp-stat-num'>{s.num}</div>
              <div className='lp-stat-label'>{s.label}</div>
            </div>
          ))}
        </div>
 
        <div className='lp-hero-scroll'>
          <span>Scroll to explore</span>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M12 5v14M5 12l7 7 7-7'/>
          </svg>
        </div>
      </section>
 
      {/* ── ABOUT ───────────────────────────────────────────────────────── */}
      <section id='about' className='lp-section'>
        <div className='lp-about-grid'>
          <div className='lp-about-text'>
            <p className='lp-eyebrow'>About U-Play</p>
            <h2>Built for SLIIT.<br />Built for champions.</h2>
            <p>
              U-Play is the official sports tournament management platform
              for the Sri Lanka Institute of Information Technology.
              It was built from the ground up by SLIIT students who
              experienced first-hand how broken the old system was.
            </p>
            <p>
              From scattered WhatsApp groups and manual scoresheets to
              a single, beautiful platform U-Play is how SLIIT sports
              should always have been.
            </p>
            <button className='glass-btn-primary'
              onClick={() => navigate('/register')}
              style={{ padding: '12px 28px', fontSize: '14px', marginTop: '8px' }}>
              Join the platform
            </button>
          </div>
 
          <div className='lp-about-visual'>
            {[
              { icon: '🎯', title: 'Our mission',  desc: 'Eliminate manual coordination and make sports accessible to every SLIIT student.' },
              { icon: '👁', title: 'Our vision',   desc: 'Become the gold standard for university sports management across Sri Lanka.' },
              { icon: '❤️', title: 'Our values',   desc: 'Transparency, community, fair competition, and student empowerment.' },
            ].map(item => (
              <div key={item.title} className='lp-about-item'>
                <div className='lp-about-icon'>{item.icon}</div>
                <div>
                  <p style={{ color: '#fff', fontWeight: '700', fontSize: '14px', margin: '0 0 4px' }}>{item.title}</p>
                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
 
      {/* ── SERVICES ────────────────────────────────────────────────────── */}
      <section id='services' className='lp-section lp-section-center'
        style={{ paddingTop: 0 }}>
        <p className='lp-eyebrow'>What we offer</p>
        <h2 className='lp-section-title'>Everything sports needs</h2>
        <p className='lp-section-sub'>
          Six powerful tools built into one seamless platform.
        </p>
        <div className='lp-features-grid'>
          {FEATURES.map(f => (
            <div key={f.title} className='lp-feature-card'>
              <span className='lp-feature-icon'>{f.icon}</span>
              <h3 className='lp-feature-title'>{f.title}</h3>
              <p className='lp-feature-desc'>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── GALLERY (CAROUSEL) ─────────────────────────────────────── */}
<section id='gallery' className='lp-section' style={{ paddingTop: 0 }}>
  <div style={{ textAlign: 'center', marginBottom: '48px' }}>
    <p className='lp-eyebrow'>Gallery</p>
    <h2 className='lp-section-title'>Sports in action</h2>
    <p className='lp-section-sub' style={{ marginBottom: 0 }}>
      Moments from SLIIT tournaments across all six sports.
    </p>
  </div>

  {/* ✅ Slider Settings */}
  <Slider
    dots={true}
    infinite={true}
    speed={600}
    slidesToShow={3}
    centerMode={true}
    centerPadding="0px"
    autoplay={true}
    autoplaySpeed={2500}
    arrows={false}
    responsive={[
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          centerMode: false
        }
      }
    ]}
  >
    {GALLERY.map((item, i) => (
      <div key={i} className="gallery-slide">
        <div
          className='lp-gallery-item'
          style={{
            height: '260px',
            borderRadius: '18px',
            backgroundImage: `url(${item.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className='lp-gallery-overlay'>
            <span className='lp-gallery-label'>{item.label}</span>
          </div>
        </div>
      </div>
    ))}
  </Slider>
</section>
 
      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className='lp-section lp-section-center' style={{ paddingTop: 0 }}>
        <p className='lp-eyebrow'>Testimonials</p>
        <h2 className='lp-section-title'>What students say</h2>
        <p className='lp-section-sub'>
          Real feedback from the SLIIT sports community.
        </p>
        <div className='lp-testimonials-grid'>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className='lp-testimonial-card'>
              <p className='lp-quote'>{t.quote}</p>
              <div className='lp-author'>
                <div className='lp-avatar' style={{ background: t.color }}>
                  {t.initials}
                </div>
                <div>
                  <p className='lp-author-name'>{t.name}</p>
                  <p className='lp-author-role'>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
 
      {/* ── CONTACT ─────────────────────────────────────────────────────── */}
      <section id='contact' className='lp-section' style={{ paddingTop: 0 }}>
        <div className='lp-contact-grid'>
          <div className='lp-contact-info'>
            <p className='lp-eyebrow'>Get in touch</p>
            <h2>Have a question?<br />We'd love to help.</h2>
            <p>
              Whether you're a student wanting to join a team,
              a captain looking to register, or an admin needing support
              — reach out and we'll get back to you.
            </p>
            {[
              { icon: '📍', label: 'Location',  value: 'SLIIT Malabe Campus, New Kandy Road, Malabe.' },
              { icon: '📧', label: 'Email',     value: 'sports@sliit.lk'            },
              { icon: '📞', label: 'Phone',     value: '+94 11 754 4801'             },
              { icon: '🕐', label: 'Hours',     value: 'Mon – Fri, 8:30 AM – 5:00 PM' },
            ].map(item => (
              <div key={item.label} className='lp-contact-detail'>
                <div className='lp-contact-icon'>{item.icon}</div>
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em', textTransform: 'uppercase', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ color: '#fff', fontSize: '14px', margin: 0 }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
 
          <div className='lp-contact-form'>
            {contactSent ? (
              <div className='lp-form-sent'>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                <p>Message sent successfully!</p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginTop: '6px' }}>
                  We'll get back to you within 24 hours.
                </p>
                <button className='glass-btn-ghost'
                  onClick={() => setContactSent(false)}
                  style={{ marginTop: '20px', fontSize: '13px', padding: '8px 20px' }}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContact}>
                <h3>Send us a message</h3>
                <div className='lp-form-row'>
                  <div className='lp-form-group'>
                    <label className='lp-form-label'>Full name</label>
                    <input value={contactForm.name}
                      onChange={e => { setContactForm({ ...contactForm, name: e.target.value }); setContactErrors({ ...contactErrors, name: null }); }}
                      placeholder='Your name' className={lc('name')} />
                    {contactErrors.name && <span style={{ color: '#f87171', fontSize: '12px' }}>{contactErrors.name}</span>}
                  </div>
                  <div className='lp-form-group'>
                    <label className='lp-form-label'>Email address</label>
                    <input type='email' value={contactForm.email}
                      onChange={e => { setContactForm({ ...contactForm, email: e.target.value }); setContactErrors({ ...contactErrors, email: null }); }}
                      placeholder='you@sliit.lk' className={lc('email')} />
                    {contactErrors.email && <span style={{ color: '#f87171', fontSize: '12px' }}>{contactErrors.email}</span>}
                  </div>
                </div>
                <div className='lp-form-group'>
                  <label className='lp-form-label'>Subject</label>
                  <input value={contactForm.subject}
                    onChange={e => { setContactForm({ ...contactForm, subject: e.target.value }); setContactErrors({ ...contactErrors, subject: null }); }}
                    placeholder='How can we help?' className={lc('subject')} />
                  {contactErrors.subject && <span style={{ color: '#f87171', fontSize: '12px' }}>{contactErrors.subject}</span>}
                </div>
                <div className='lp-form-group'>
                  <label className='lp-form-label'>Message</label>
                  <textarea value={contactForm.message}
                    onChange={e => { setContactForm({ ...contactForm, message: e.target.value }); setContactErrors({ ...contactErrors, message: null }); }}
                    placeholder='Write your message here...' rows={5}
                    className={lc('message')} style={{ resize: 'none', fontFamily: 'inherit' }} />
                  {contactErrors.message && <span style={{ color: '#f87171', fontSize: '12px' }}>{contactErrors.message}</span>}
                </div>
                <button type='submit' className='glass-btn-primary'
                  style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '12px' }}>
                  Send message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
 
      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className='lp-footer'>
        <div className='lp-footer-inner'>
          <div className='lp-footer-brand'>
            <span className='lp-logo'>U-<span>Play</span></span>
            <p>
              The official sports tournament management platform
              for SLIIT — built by students, for students.
            </p>
          </div>
          <div className='lp-footer-col'>
            <h4>Platform</h4>
            {['Sign in', 'Register', 'Dashboard'].map(link => (
              <button key={link} className='lp-footer-link'
                onClick={() => {
                    if (link === 'Sign in') navigate('/login');
                    else if (link === 'Register') navigate('/register');
                    else navigate('/dashboard');
                  }}>
                {link}
              </button>
            ))}
          </div>
          <div className='lp-footer-col'>
            <h4>Sections</h4>
            {['About', 'Services', 'Gallery', 'Contact'].map(link => (
              <button key={link} className='lp-footer-link'
                onClick={() => scrollTo(link.toLowerCase())}>
                {link}
              </button>
            ))}
          </div>
          <div className='lp-footer-col'>
            <h4>Sports</h4>
            {['Cricket', 'Football', 'Basketball', 'Badminton', 'Volleyball'].map(s => (
              <span key={s} className='lp-footer-link' style={{ cursor: 'default' }}>{s}</span>
            ))}
          </div>
        </div>
        <div className='lp-footer-bottom'>
          <p>© 2026 U-Play SLIIT. All rights reserved. IT3040 – ITPM.</p>
          <p>Built with React · Node.js · MongoDB</p>
        </div>
      </footer>
    </div>
  );
}
 
