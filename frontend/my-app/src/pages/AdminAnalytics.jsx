import { motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
    Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './AdminAnalytics.css';

// ── Animation Variants ─────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 12 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

// ── Theme / Colors ─────────────────────────────────────────────────
const GRADIENTS = [
  'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', // Indigo -> Purple
  'linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)', // Blue -> Teal
  'linear-gradient(135deg, #eb4899 0%, #f43f5e 100%)', // Pink -> Rose
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)', // Amber -> Red
];

const METRIC_COLORS = ['#6366f1', '#2dd4bf', '#f43f5e', '#f59e0b', '#8b5cf6', '#10b981', '#3b82f6', '#d946ef'];

const SESSION_MAP = {
  Pending: '#f59e0b',
  Confirmed: '#3b82f6',
  Completed: '#10b981',
  Cancelled: '#ef4444'
};

// ── Custom Tooltip for Charts ──────────────────────────────────────
const PremiumTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="premium-chart-tooltip"
    >
      <div className="tooltip-header">{label}</div>
      <div className="tooltip-body">
        {payload.map((p, i) => (
          <div key={i} className="tooltip-row">
            <span className="tooltip-dot" style={{ background: p.color || p.fill || '#fff' }}></span>
            <span className="tooltip-name">{p.name}</span>
            <span className="tooltip-val" style={{ color: p.color || p.fill || '#fff' }}>{p.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ── Super Premium Stat Card Component ──────────────────────────────
const PremiumStatCard = ({ title, value, subtext, icon, gradient, index }) => (
  <motion.div 
    variants={itemVariants} 
    className="premium-stat-card"
    whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
  >
    <div className="psc-bg-blur" style={{ background: gradient }}></div>
    <div className="psc-content">
      <div className="psc-top">
        <div className="psc-icon-wrap" style={{ background: gradient }}>{icon}</div>
        <div className="psc-sparkle">✨</div>
      </div>
      <div className="psc-bottom">
        <h4 className="psc-title">{title}</h4>
        <div className="psc-value">
          {value}
        </div>
        {subtext && <p className="psc-subtext">{subtext}</p>}
      </div>
    </div>
  </motion.div>
);

// ── Glassmorphic Chart Container ───────────────────────────────────
const GlassChartBox = ({ title, children, icon, span = false }) => (
  <motion.div 
    variants={slideUp}
    className={`glass-chart-box ${span ? 'span-full' : ''}`}
  >
    <div className="gcb-header">
      <span className="gcb-icon">{icon}</span>
      <h3 className="gcb-title">{title}</h3>
    </div>
    <div className="gcb-body">
      {children}
    </div>
  </motion.div>
);

// ── Main Page Component ────────────────────────────────────────────
const AdminAnalytics = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/summary');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="premium-loader-wrap">
        <div className="premium-spinner"></div>
        <p>Crunching the numbers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="premium-error-wrap">
        <div className="error-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  // ── Transform Data for Recharts ────────────────────────────────
  const { 
    overview, registrationsLast7Days, sessionsByStatus, skillsByCategory, 
    complaintsByStatus, complaintsByCategory, pollEngagement, techPostsByCategory, lostFoundByType 
  } = data;

  // Enhance Registration Data
  const today = new Date();
  const regChartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const key = `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const found = (registrationsLast7Days || []).find(r => r._id?.slice(5) === key);
    return { date: key, users: found ? found.count : 0 };
  });

  const sessionChart = sessionsByStatus.map(s => ({ name: s._id, count: s.count, fill: SESSION_MAP[s._id] || '#cbd5e1' }));
  const compStatusChart = complaintsByStatus.map(c => ({ name: c._id, value: c.count }));
  const compCatChart = complaintsByCategory.map(c => ({ name: c._id, count: c.count }));
  const skillsChart = skillsByCategory.map((s,i) => ({ name: s._id, count: s.count, val: Math.random() })); // Extra value for visuals
  const techChart = techPostsByCategory.map(t => ({ name: t._id, value: t.count }));
  const pollChart = pollEngagement.map(p => ({
    name: p.question.length > 25 ? p.question.slice(0, 25) + '...' : p.question,
    votes: p.totalVotes
  }));

  const findLF = (type) => lostFoundByType.find(l => l._id === type)?.count || 0;

  return (
    <div className="premium-analytics-page">
      
      {/* ── Page Header ─────────────────────────────────────────── */}
      <motion.div 
        className="pa-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="pa-header-text">
          <h1>Control <span>Room</span></h1>
          <p>Platform Analytics & Interaction Intelligence</p>
        </div>
        <div className="pa-header-actions">
          <div className="pa-live-badge">
            <span className="pulse-dot"></span> Live Data
          </div>
          <div className="pa-date-pill">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        
        {/* ── Top Level KPI Cards ───────────────────────────────── */}
        <div className="pa-stats-grid">
          <PremiumStatCard icon="👥" title="Total Users" value={overview.totalUsers} subtext={`${overview.totalStudents} Students`} gradient={GRADIENTS[0]} index={0} />
          <PremiumStatCard icon="📈" title="Avg Session Rating" value={`${overview.avgRating} / 5`} subtext={`${overview.totalReviews} Reviews`} gradient={GRADIENTS[1]} index={1} />
          <PremiumStatCard icon="⏱️" title="Session Completion" value={`${overview.sessionCompletionRate}%`} subtext={`${overview.totalSessions} Total Sessions`} gradient={GRADIENTS[2]} index={2} />
          <PremiumStatCard icon="⚡" title="Support Speed" value={`${overview.avgResolutionHours}h`} subtext="Avg complaint resolution" gradient={GRADIENTS[3]} index={3} />
        </div>

        {/* ── Secondary Stats Row (Pills) ───────────────────────── */}
        <div className="pa-secondary-stats">
          <div className="pa-sec-stat"><span className="pss-icon">🛠️</span> <strong>{overview.totalSkills}</strong> Skills</div>
          <div className="pa-sec-stat"><span className="pss-icon">📝</span> <strong>{overview.totalComplaints}</strong> Complaints</div>
          <div className="pa-sec-stat"><span className="pss-icon">📊</span> <strong>{overview.totalPolls}</strong> Polls</div>
          <div className="pa-sec-stat"><span className="pss-icon">📰</span> <strong>{overview.totalTechPosts}</strong> Tech Posts</div>
          <div className="pa-sec-stat"><span className="pss-icon">🎒</span> <strong>{findLF('Lost')}</strong> Lost / <strong>{findLF('Found')}</strong> Found</div>
        </div>

        {/* ── Charts Grid ───────────────────────────────────────── */}
        <div className="pa-charts-grid">
          
          {/* Main Chart: User Growth Area Chart */}
          <GlassChartBox title="User Growth (Last 7 Days)" icon="🚀" span={true}>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={regChartData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.6)'}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.6)'}} axisLine={false} tickLine={false} />
                <Tooltip content={<PremiumTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                <Area type="monotone" dataKey="users" name="New Users" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" activeDot={{ r: 8, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassChartBox>

          {/* Sessions Breakdown */}
          <GlassChartBox title="Session Status" icon="🗓️">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sessionChart} maxBarSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.6)'}} axisLine={false} tickLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.6)'}} axisLine={false} tickLine={false} />
                <Tooltip content={<PremiumTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" name="Sessions" radius={[6, 6, 0, 0]}>
                  {sessionChart.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassChartBox>

          {/* Complaints Overview (Double charts combined in a grid) */}
          <GlassChartBox title="Complaints Overview" icon="⚠️">
            <div className="double-chart">
              <ResponsiveContainer width="48%" height={240}>
                <PieChart>
                  <Pie data={compStatusChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" nameKey="name">
                    {compStatusChart.map((_, i) => <Cell key={i} fill={METRIC_COLORS[i % METRIC_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<PremiumTooltip />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="48%" height={240}>
                 <BarChart data={compCatChart} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="none" tick={{fill: 'rgba(255,255,255,0.8)', fontSize: 11}} width={80} />
                  <Tooltip content={<PremiumTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar dataKey="count" name="Complaints" radius={[0, 4, 4, 0]} maxBarSize={15}>
                    {compCatChart.map((_, i) => <Cell key={i} fill={GRADIENTS[i % GRADIENTS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassChartBox>

          {/* Skill Market Demand */}
          <GlassChartBox title="Skill Market Demand" icon="🔥">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={skillsChart} margin={{ top: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="none" tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 11}} angle={-25} textAnchor="end" height={60} />
                <YAxis hide />
                <Tooltip content={<PremiumTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" name="Skills" radius={[8, 8, 8, 8]} maxBarSize={24}>
                  {skillsChart.map((_, i) => <Cell key={i} fill={METRIC_COLORS[i % METRIC_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassChartBox>

          {/* Poll Engagement */}
          <GlassChartBox title="Poll Engagement" icon="🗳️">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={pollChart} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="none" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 10}} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="none" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 11}} />
                <Tooltip content={<PremiumTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)' }} />
                <Line type="monotone" dataKey="votes" name="Votes" stroke="#06b6d4" strokeWidth={4} 
                      dot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 8, fill: '#fff', stroke: '#06b6d4' }} />
              </LineChart>
            </ResponsiveContainer>
          </GlassChartBox>

        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
