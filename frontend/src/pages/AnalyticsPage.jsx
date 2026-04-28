import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Clock, Users, Zap } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { analyticsData } from '../data/mockData';

const CustomTooltipBar = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-card p-2 text-xs border border-gray-100">
        <p className="font-bold text-secondary">{label}</p>
        <p className="text-gray-600">{payload[0].value} tokens</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const { avg_service_time, tokens_today, peak_hour, hourly, priority_distribution, audit_log } = analyticsData;

  return (
    <div className="app-shell animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <button
          id="analytics-back-btn"
          onClick={() => navigate('/admin/dashboard')}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-sm font-bold text-secondary flex-1 text-center">Analytics</h1>
        <div className="w-8" />
      </header>

      <main className="flex-1 overflow-y-auto pb-6 px-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4 mb-5">
          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-50 flex items-center justify-center">
                <Users size={13} style={{ color: 'var(--secondary)' }} />
              </div>
              <span className="stat-label">Tokens Today</span>
            </div>
            <p className="stat-value">{tokens_today}</p>
            <p className="text-xs text-green-600 font-medium mt-0.5">+12% vs yesterday</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-50 flex items-center justify-center">
                <Clock size={13} style={{ color: 'var(--secondary)' }} />
              </div>
              <span className="stat-label">Avg Service</span>
            </div>
            <p className="stat-value">{avg_service_time}m</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">per patient</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-50 flex items-center justify-center">
                <TrendingUp size={13} style={{ color: 'var(--secondary)' }} />
              </div>
              <span className="stat-label">Peak Hour</span>
            </div>
            <p className="text-xl font-bold text-secondary">{peak_hour}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">busiest time</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-6 h-6 rounded-lg" style={{ background: '#FDECEA' }}>
                <div className="w-full h-full flex items-center justify-center">
                  <Zap size={13} style={{ color: '#D32F2F' }} />
                </div>
              </div>
              <span className="stat-label">P0 Today</span>
            </div>
            <p className="text-xl font-bold" style={{ color: '#D32F2F' }}>
              {priority_distribution.find(p => p.name === 'Critical')?.value ?? 0}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">emergencies</p>
          </div>
        </div>

        {/* Hourly Chart */}
        <div className="card mb-4">
          <h2 className="section-title text-sm mb-4">Tokens Per Hour</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={hourly} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} />
              <Tooltip content={<CustomTooltipBar />} />
              <Bar dataKey="count" fill="var(--secondary)" radius={[4, 4, 0, 0]}>
                {hourly.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.count === Math.max(...hourly.map(h => h.count)) ? '#D32F2F' : 'var(--secondary)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-400 text-center mt-1">Peak hour shown in red</p>
        </div>

        {/* Priority Distribution */}
        <div className="card mb-4">
          <h2 className="section-title text-sm mb-4">Priority Distribution</h2>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width="50%" height={150}>
              <PieChart>
                <Pie
                  data={priority_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {priority_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1">
              {priority_distribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-secondary">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Audit Log */}
        <div className="card mb-4">
          <h2 className="section-title text-sm mb-3">Priority Audit Log</h2>
          <div className="space-y-2">
            {audit_log.map((entry) => (
              <div
                key={entry.id}
                className="p-3 rounded-xl"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-secondary font-mono">{entry.token}</span>
                  <span className="text-xs text-gray-400">{entry.time}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">{entry.from}</span>
                  <span className="text-xs">→</span>
                  <span className="text-xs font-semibold" style={{ color: '#D32F2F' }}>{entry.to}</span>
                </div>
                <p className="text-xs text-gray-500 italic">"{entry.reason}"</p>
                <p className="text-xs text-gray-400 mt-0.5">by {entry.admin}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
