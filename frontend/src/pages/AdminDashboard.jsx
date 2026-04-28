import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, Play, Pause, X,
  Users, Clock, CheckCircle2, LogOut, BarChart2
} from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { PRIORITY_META, QUEUE_STATUS } from '../data/mockData';
import EmergencyAlert from '../components/EmergencyAlert';
import PriorityBadge from '../components/PriorityBadge';
import PriorityModal from '../components/PriorityModal';

function timeAgo(isoStr) {
  const diff = Math.floor((Date.now() - new Date(isoStr)) / 60000);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

function TokenRow({ token, onSkip, onEscalate, onCallNext }) {
  const meta = PRIORITY_META[token.priority];

  return (
    <div
      className="card mb-3 transition-all duration-200 hover:shadow-card-hover"
      style={{ borderLeft: `4px solid ${meta.textColor}` }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-secondary font-mono">{token.token_number}</span>
          <PriorityBadge priority={token.priority} />
        </div>
        <span className="text-xs text-gray-400">{timeAgo(token.issued_at)}</span>
      </div>

      {token.priority_reason && (
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <span>{meta.dot}</span> {token.priority_reason}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock size={12} />
          <span>~{Math.round(token.estimated_wait_seconds / 60)}m wait</span>
        </div>

        <div className="flex gap-2">
          <button
            id={`escalate-${token.id}-btn`}
            onClick={() => onEscalate(token)}
            className="admin-btn-escalate"
          >
            ↑ Escalate
          </button>
          <button
            id={`skip-${token.id}-btn`}
            onClick={() => onSkip(token.id)}
            className="admin-btn-skip"
          >
            Skip
          </button>
          <button
            id={`call-${token.id}-btn`}
            onClick={onCallNext}
            className="admin-btn-next"
          >
            Call
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    queue, waitingTokens,
    callNext, skipToken, escalateToken,
    toggleQueueStatus, closeQueue
  } = useQueue();

  const [escalateTarget, setEscalateTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCallNext = () => {
    callNext();
    showToast('Next token called!');
  };

  const handleSkip = (id) => {
    skipToken(id);
    showToast('Token skipped', 'warning');
  };

  const handleEscalate = (token) => {
    setEscalateTarget(token);
  };

  const handleEscalateConfirm = (id, priority, reason) => {
    escalateToken(id, priority, reason);
    showToast(`Token escalated to ${PRIORITY_META[priority].label}`, priority === 0 ? 'error' : 'success');
  };

  const statusColor = {
    [QUEUE_STATUS.OPEN]: '#388E3C',
    [QUEUE_STATUS.PAUSED]: '#F57C00',
    [QUEUE_STATUS.CLOSED]: '#D32F2F',
  };

  const criticalCount = waitingTokens.filter(t => t.priority === 0).length;

  return (
    <div className="app-shell animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className="toast"
          style={{
            background: toast.type === 'error' ? '#D32F2F' : toast.type === 'warning' ? '#F57C00' : 'var(--secondary)',
            color: 'white',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="page-header">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--secondary)' }}
        >
          <span className="text-white text-xs font-bold">A</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-secondary truncate">Admin Dashboard</h1>
          <div className="flex items-center gap-1.5">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: statusColor[queue.status] }}
            />
            <span className="text-xs text-gray-500">{queue.name}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            id="admin-analytics-btn"
            onClick={() => navigate('/admin/analytics')}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Analytics"
          >
            <BarChart2 size={16} className="text-gray-600" />
          </button>
          <button
            id="admin-logout-btn"
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Logout"
          >
            <LogOut size={16} className="text-gray-600" />
          </button>
        </div>
      </header>

      {/* Emergency Alert */}
      <EmergencyAlert />

      <main className="flex-1 overflow-y-auto pb-6 px-4">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
          <div className="stat-card">
            <div className="flex items-center gap-1 mb-1">
              <Users size={14} className="text-gray-400" />
              <span className="stat-label">Waiting</span>
            </div>
            <p className="stat-value text-xl">{waitingTokens.length}</p>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-1 mb-1">
              <span className="text-xs">🔴</span>
              <span className="stat-label">Critical</span>
            </div>
            <p className="stat-value text-xl" style={{ color: criticalCount > 0 ? '#D32F2F' : 'var(--secondary)' }}>
              {criticalCount}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label mb-1">Status</p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: queue.status === 'OPEN' ? '#E8F5E9' : '#FDECEA',
                color: statusColor[queue.status],
              }}
            >
              {queue.status}
            </span>
          </div>
        </div>

        {/* Currently Serving */}
        <div
          className="rounded-2xl p-4 mb-4 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dk) 100%)' }}
        >
          <div>
            <p className="text-neutral text-xs font-semibold uppercase tracking-wide mb-1">Now Serving</p>
            <p className="text-white text-4xl font-black">{queue.currently_serving}</p>
          </div>
          <div className="text-right">
            <p className="text-neutral text-xs mb-2">{queue.active_counters} counters active</p>
            <button
              id="call-next-btn"
              onClick={handleCallNext}
              disabled={waitingTokens.length === 0}
              className="px-4 py-2 rounded-xl font-bold text-secondary text-sm bg-white transition-all duration-150 hover:bg-neutral-50 active:scale-95 disabled:opacity-50"
            >
              <span className="flex items-center gap-1">
                <ChevronRight size={16} /> Next
              </span>
            </button>
          </div>
        </div>

        {/* Queue Controls */}
        <div className="flex gap-3 mb-5">
          <button
            id="toggle-queue-btn"
            onClick={() => { toggleQueueStatus(); showToast(`Queue ${queue.status === 'OPEN' ? 'paused' : 'resumed'}`); }}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-150"
            style={{
              background: queue.status === 'OPEN' ? '#FFF3E0' : '#E8F5E9',
              color: queue.status === 'OPEN' ? '#F57C00' : '#388E3C',
              border: `1px solid ${queue.status === 'OPEN' ? 'rgba(245,124,0,0.3)' : 'rgba(56,142,60,0.3)'}`,
            }}
          >
            {queue.status === 'OPEN'
              ? <><Pause size={15} /> Pause</>
              : <><Play size={15} /> Resume</>
            }
          </button>
          <button
            id="close-queue-btn"
            onClick={() => { closeQueue(); showToast('Queue closed', 'error'); }}
            disabled={queue.status === 'CLOSED'}
            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-150 disabled:opacity-40"
            style={{ background: '#FDECEA', color: '#D32F2F', border: '1px solid rgba(211,47,47,0.3)' }}
          >
            <X size={15} /> Close Queue
          </button>
        </div>

        {/* Waiting Tokens */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Waiting Tokens</h2>
          <span className="text-xs font-medium text-gray-400">{waitingTokens.length} total</span>
        </div>

        {waitingTokens.length === 0 ? (
          <div className="card text-center py-10">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-medium text-gray-400">Queue is clear!</p>
            <p className="text-xs text-gray-300 mt-1">No tokens waiting</p>
          </div>
        ) : (
          waitingTokens.map(token => (
            <TokenRow
              key={token.id}
              token={token}
              onSkip={handleSkip}
              onEscalate={handleEscalate}
              onCallNext={handleCallNext}
            />
          ))
        )}
      </main>

      {/* Escalate Modal */}
      {escalateTarget && (
        <PriorityModal
          token={escalateTarget}
          onConfirm={handleEscalateConfirm}
          onClose={() => setEscalateTarget(null)}
        />
      )}
    </div>
  );
}
