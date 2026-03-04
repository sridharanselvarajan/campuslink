import { motion } from 'framer-motion';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './LandingPage.css';

const features = [
  { icon: '🛠️', title: 'Skill Marketplace',      desc: 'Share what you know and learn what you need — peer-to-peer skill exchange.' },
  { icon: '📅', title: 'Smart Scheduling',         desc: 'Conflict-aware session booking with auto-suggested free time slots.' },
  { icon: '🏆', title: 'Leaderboard & Badges',    desc: 'Earn points for teaching and learning. Unlock Top Tutor and Skill Master badges.' },
  { icon: '🤖', title: 'AI Assistant',             desc: 'Get instant study help, code debugging, and career advice — powered by Gemini.' },
  { icon: '📊', title: 'Analytics Dashboard',     desc: 'Admins track engagement, sessions, polls, and platform health in real time.' },
  { icon: '📢', title: 'Campus Hub',               desc: 'Announcements, lost & found, complaints, polls — your campus in one place.' },
];

const stats = [
  { value: '500+', label: 'Students' },
  { value: '120+', label: 'Skills Listed' },
  { value: '2.4k', label: 'Sessions Booked' },
  { value: '98%', label: 'Satisfaction Rate' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } },
};

const FloatingIcons = () => {
  const icons = ['🎓', '📚', '💻', '💡', '🚀', '⭐', '🔥', '🧠', '🧪', '📱'];
  return (
    <div className="bg-floating-icons">
      {icons.map((icon, i) => (
        <motion.div
          key={i}
          className={`floating-icon icon-${i}`}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%',
            opacity: 0 
          }}
          animate={{ 
            y: [null, '-20px', '20px', null],
            rotate: [0, 15, -15, 0],
            opacity: [0, 0.15, 0.15, 0]
          }}
          transition={{ 
            duration: 10 + Math.random() * 10, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: i * 2
          }}
        >
          {icon}
        </motion.div>
      ))}
    </div>
  );
};

const LandingPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCTA = () => navigate(user ? '/dashboard' : '/register');
  const handleLogin = () => navigate('/login');

  return (
    <div className="landing-root">

      {/* ── Navbar ───────────────────────────── */}
      <motion.nav
        className="landing-nav"
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="nav-logo">
          <span className="nav-logo-icon">🏫</span>
          <span className="nav-logo-text">CampusLink</span>
        </div>
        <div className="nav-actions">
          <button className="nav-login-btn" onClick={handleLogin}>Log In</button>
          <button className="nav-cta-btn" onClick={handleCTA}>
            {user ? 'Go to Dashboard' : 'Get Started Free'}
          </button>
        </div>
      </motion.nav>

      {/* ── Hero Section ─────────────────────── */}
      <section className="hero-section">
        <FloatingIcons />
        {/* Animated background blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
        <div className="hero-grid-pattern" />

        <div className="hero-content">
          <motion.div
            className="hero-badge-pill"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            ✨ The Smart Campus Companion
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
          >
            Your Campus.<br />
            <span className="hero-title-gradient">Smarter. Together.</span>
          </motion.h1>

          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            CampusLink connects students to share skills, book sessions, earn badges,
            and stay in sync with campus life — all in one beautiful platform.
          </motion.p>

          <motion.div
            className="hero-buttons"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
          >
            <button className="btn-primary" onClick={handleCTA}>
              🚀 {user ? 'Go to Dashboard' : 'Join CampusLink Free'}
            </button>
            <button className="btn-ghost" onClick={handleLogin}>
              Sign In →
            </button>
          </motion.div>
        </div>

        {/* Floating cards */}
        <motion.div
          className="hero-float-cards"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          {[
            { icon: '📚', title: 'Session Booked!',    sub: 'Python with Arun', color: '#6366f1' },
            { icon: '🏆', title: 'Badge Earned!',       sub: 'Top Tutor 🥇',    color: '#f59e0b' },
            { icon: '📅', title: 'Free Slot Found',     sub: 'Today 3:00 PM',    color: '#10b981' },
            { icon: '🤖', title: 'AI answered',         sub: '"What is recursion?"', color: '#8b5cf6' },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className="float-card"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
              style={{ '--card-color': card.color }}
            >
              <span className="float-card-icon">{card.icon}</span>
              <div>
                <div className="float-card-title">{card.title}</div>
                <div className="float-card-sub">{card.sub}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats Bar ────────────────────────── */}
      <section className="stats-bar">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="stat-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="stat-val">{s.value}</div>
            <div className="stat-lab">{s.label}</div>
          </motion.div>
        ))}
      </section>

      {/* ── Features Grid ────────────────────── */}
      <section className="features-section">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-eyebrow">Everything You Need</div>
          <h2 className="section-title">Built for modern campus life</h2>
          <p className="section-sub">One platform. Everything your campus needs. No more app hopping.</p>
        </motion.div>

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map(f => (
            <motion.div key={f.title} className="feature-card" variants={fadeUp} whileHover={{ y: -6, scale: 1.02 }}>
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CTA Banner ───────────────────────── */}
      <section className="cta-section">
        <div className="cta-blob-1" />
        <div className="cta-blob-2" />
        <motion.div
          className="cta-content"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Ready to level up your campus life?</h2>
          <p>Join thousands of students learning, sharing, and growing together.</p>
          <button className="btn-primary btn-large" onClick={handleCTA}>
            🎓 Start for Free — It's Instant
          </button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────── */}
      <footer className="landing-footer">
        <div className="footer-logo">
          <span>🏫</span> CampusLink
        </div>
        <p className="footer-copy">© 2026 CampusLink. Built with ❤️ for students, by students.</p>
      </footer>

    </div>
  );
};

export default LandingPage;
