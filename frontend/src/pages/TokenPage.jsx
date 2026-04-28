import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellOff, Clock, Users, CheckCircle2, XCircle, RefreshCcw } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { PRIORITY_META } from '../data/mockData';
import PriorityBadge from '../components/PriorityBadge';
import BottomNav from '../components/BottomNav';

function formatWait(seconds) {
  if (seconds < 60) return `~${seconds}s`;
  const m = Math.round(seconds / 60);
  return `~${m} min`;
}

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function TokenPage() {
  const navigate = useNavigate();
  const { queue, myToken, clearMyToken, getEffectivePosition, waitingTokens } = useQueue();
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [, setTick] = useState(0);

  // Simulate live updates
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  if (!myToken) {
    return (
      <div className="app-shell flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
          <XCircle size={36} className="text-gray-300" />
        </div>
        <h2 className="text-lg font-bold text-secondary mb-2">No Active Token</h2>
        <p className="text-sm text-gray-500 mb-6">You don't have an active queue token. Join the queue to get one.</p>
        <button
          id="go-join-queue-btn"
          onClick={() => navigate('/')}
          className="btn-primary max-w-xs"
        >
          Join Queue
        </button>
      </div>
    );
  }

  const position = getEffectivePosition(myToken.id) ?? 1;
  const meta = PRIORITY_META[myToken.priority];
  const waitSecs = (position - 1) * queue.avg_service_time_seconds;
  const isCalled = myToken.status === 'CALLED';

  return (
    <div className="app-shell animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <button
          id="back-btn"
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-sm font-bold text-secondary flex-1 text-center">My Token</h1>
        <div className="flex items-center gap-1">
          <span className="live-dot" />
          <span className="text-xs font-medium text-green-600">Live</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4">

        {/* Called Alert */}
        {isCalled && (
          <div
            className="rounded-2xl p-4 mt-4 flex items-center gap-3 animate-bounce-soft"
            style={{ background: '#E8F5E9', border: '2px solid #388E3C' }}
          >
            <CheckCircle2 size={24} style={{ color: '#388E3C' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#1B5E20' }}>It's Your Turn!</p>
              <p className="text-xs" style={{ color: '#388E3C' }}>Please proceed to Counter {queue.active_counters}</p>
            </div>
          </div>
        )}

        {/* Token Hero Card */}
        <div
          className="rounded-3xl p-6 mt-4 text-center relative overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '1px solid var(--border)' }}
        >
          <PriorityBadge priority={myToken.priority} />

          <div className="token-number mt-4 mb-2">
            {myToken.token_number}
          </div>

          <p className="text-xs text-gray-400 font-medium mb-4">
            {queue.name}
          </p>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div
              className="rounded-2xl p-3"
              style={{ background: 'var(--neutral-50)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Users size={14} style={{ color: 'var(--secondary)' }} />
                <span className="text-xs font-semibold text-gray-500">Position</span>
              </div>
              <p className="text-xl font-bold text-secondary">{ordinal(position)}</p>
              <p className="text-xs text-gray-400">in queue</p>
            </div>

            <div
              className="rounded-2xl p-3"
              style={{ background: 'var(--neutral-50)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Clock size={14} style={{ color: 'var(--secondary)' }} />
                <span className="text-xs font-semibold text-gray-500">Est. Wait</span>
              </div>
              <p className="text-xl font-bold text-secondary">{formatWait(waitSecs)}</p>
              <p className="text-xs text-gray-400">from now</p>
            </div>
          </div>

          {myToken.priority_reason && (
            <div
              className="mt-3 rounded-xl px-3 py-2 text-xs font-medium text-left"
              style={{ background: meta.bg, color: meta.textColor }}
            >
              {meta.dot} {myToken.priority_reason}
            </div>
          )}

          {/* Live indicator */}
          <div className="absolute top-3 right-3 flex items-center gap-1">
            <span className="live-dot" />
            <span className="text-xs font-medium text-green-600">Live</span>
          </div>
        </div>

        {/* Now Serving */}
        <div className="card mt-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Now Serving</p>
            <p className="text-3xl font-black text-secondary">{queue.currently_serving}</p>
          </div>
          <button
            id="refresh-btn"
            className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors active:scale-95"
            aria-label="Refresh status"
            onClick={() => setTick(t => t + 1)}
          >
            <RefreshCcw size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Queue Progress */}
        <div className="card mt-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Queue Progress</p>
            <span className="text-xs font-bold text-secondary">
              {waitingTokens.length} waiting
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.max(10, 100 - (position / (waitingTokens.length || 1)) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">You're {ordinal(position)}</span>
            <span className="text-xs text-gray-400">{waitingTokens.length} ahead</span>
          </div>
        </div>

        {/* Notifications Toggle */}
        <button
          id="toggle-notifications-btn"
          onClick={() => setNotifEnabled(!notifEnabled)}
          className="w-full mt-3 rounded-2xl p-4 flex items-center gap-3 transition-all duration-200"
          style={{
            background: notifEnabled ? 'var(--secondary)' : 'var(--card-bg)',
            border: `1.5px solid ${notifEnabled ? 'var(--secondary)' : 'var(--border)'}`,
          }}
          aria-pressed={notifEnabled}
        >
          {notifEnabled
            ? <Bell size={20} className="text-white flex-shrink-0" />
            : <BellOff size={20} className="text-gray-400 flex-shrink-0" />
          }
          <span
            className="text-sm font-semibold flex-1 text-left"
            style={{ color: notifEnabled ? 'white' : '#374151' }}
          >
            {notifEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
          </span>
          {/* Toggle Switch */}
          <div
            className="w-10 h-6 rounded-full flex items-center px-0.5 transition-all duration-300"
            style={{ background: notifEnabled ? 'rgba(255,255,255,0.3)' : '#E5E7EB' }}
          >
            <div
              className="w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300"
              style={{ transform: notifEnabled ? 'translateX(16px)' : 'translateX(0)' }}
            />
          </div>
        </button>

        {/* Cancel Button */}
        <button
          id="cancel-token-btn"
          onClick={() => { clearMyToken(); navigate('/'); }}
          className="btn-danger mt-3"
        >
          ✕ Cancel Token
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          Token is valid for this session only
        </p>
      </main>

      <BottomNav />
    </div>
  );
}
