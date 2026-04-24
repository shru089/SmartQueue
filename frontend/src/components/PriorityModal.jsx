import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { PRIORITY_META } from '../data/mockData';
import PriorityBadge from './PriorityBadge';

const TIERS = [
  { value: 0, label: 'P0 — Critical / Emergency' },
  { value: 1, label: 'P1 — Urgent' },
  { value: 2, label: 'P2 — Priority' },
  { value: 3, label: 'P3 — Regular' },
];

export default function PriorityModal({ token, onConfirm, onClose }) {
  const [selectedTier, setSelectedTier] = useState(token.priority);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Reason is required for priority changes.');
      return;
    }
    onConfirm(token.id, selectedTier, reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-slide-down">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-secondary">Escalate Token</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Token <span className="font-semibold">{token.token_number}</span>
              {' '}· Current: <PriorityBadge priority={token.priority} showDot={false} />
            </p>
          </div>
          <button
            id="close-priority-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tier Select */}
        <div className="mb-4">
          <label htmlFor="priority-tier-select" className="input-label">New Priority Tier</label>
          <div className="relative">
            <select
              id="priority-tier-select"
              value={selectedTier}
              onChange={(e) => setSelectedTier(Number(e.target.value))}
              className="input-field appearance-none pr-8"
            >
              {TIERS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Preview */}
        <div
          className="px-3 py-2 rounded-xl mb-4 flex items-center gap-2"
          style={{ background: PRIORITY_META[selectedTier].bg }}
        >
          <span className="text-sm">{PRIORITY_META[selectedTier].dot}</span>
          <span className="text-xs font-semibold" style={{ color: PRIORITY_META[selectedTier].textColor }}>
            Will be set to {PRIORITY_META[selectedTier].label}
          </span>
        </div>

        {/* Reason */}
        <div className="mb-5">
          <label htmlFor="priority-reason-input" className="input-label">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="priority-reason-input"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            placeholder="Enter mandatory reason for priority change..."
            rows={3}
            className="input-field resize-none"
          />
          {error && (
            <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button id="cancel-escalate-btn" onClick={onClose} className="flex-1 btn-ghost">
            Cancel
          </button>
          <button
            id="confirm-escalate-btn"
            onClick={handleConfirm}
            className="flex-1 py-3 px-6 rounded-2xl font-semibold text-white text-sm transition-all duration-200"
            style={{ background: PRIORITY_META[selectedTier].textColor }}
          >
            Confirm Escalation
          </button>
        </div>
      </div>
    </div>
  );
}
