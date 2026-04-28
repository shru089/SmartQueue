import { Zap, X } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

export default function EmergencyAlert() {
  const { p0Alert, dismissP0, callNext } = useQueue();

  if (!p0Alert) return null;

  return (
    <div className="emergency-banner mx-4 mt-3 animate-slide-down" role="alert" aria-live="assertive">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center animate-pulse-slow">
          <Zap size={20} className="text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm">🔴 EMERGENCY TOKEN RECEIVED</p>
        <p className="text-red-100 text-xs mt-0.5 font-medium">
          Token <span className="font-bold text-white">{p0Alert.token_number}</span>
          {p0Alert.priority_reason && ` · ${p0Alert.priority_reason}`}
        </p>
        <button
          id="emergency-call-now-btn"
          onClick={callNext}
          className="mt-2 px-3 py-1.5 rounded-lg bg-white text-red-700 text-xs font-bold transition-all duration-150 hover:bg-red-50 active:scale-95"
        >
          Call Emergency Now
        </button>
      </div>
      <button
        id="dismiss-emergency-btn"
        onClick={dismissP0}
        className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
        aria-label="Dismiss emergency alert"
      >
        <X size={14} className="text-white" />
      </button>
    </div>
  );
}
