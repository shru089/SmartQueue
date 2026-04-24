import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ChevronDown, ChevronRight, AlertCircle, Clock, Users, Shield } from 'lucide-react';
import { useQueue } from '../context/QueueContext';
import { PRIORITY_REASONS } from '../data/mockData';

export default function LandingPage() {
  const navigate = useNavigate();
  const { queue, addToken, waitingTokens } = useQueue();

  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'
  const [phone, setPhone] = useState('');
  const [priorityReason, setPriorityReason] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhone = (val) => /^\d{10}$/.test(val);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setPhoneError('Enter a valid 10-digit mobile number');
      return;
    }
    setPhoneError('');
    setStep('otp');
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 4) return;
    setLoading(true);
    // Simulate OTP check
    await new Promise(r => setTimeout(r, 800));
    addToken(phone, priorityReason);
    setLoading(false);
    navigate('/token');
  };

  const avgWait = Math.round((waitingTokens.length * queue.avg_service_time_seconds) / 60);

  return (
    <div className="app-shell animate-fade-in">
      {/* Header */}
      <header className="page-header">
        <img src="/logo.png" alt="SmartQueue Logo" className="w-8 h-8 rounded-xl object-cover" />
        <div>
          <h1 className="text-sm font-bold text-secondary">SmartQueue</h1>
          <p className="text-xs text-gray-400">Smart Queue Management</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="live-dot" />
          <span className="text-xs font-medium text-green-600">Live</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-8 px-4">
        {/* Hero */}
        <div
          className="rounded-3xl p-6 mt-4 mb-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dk) 100%)' }}
        >
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
              <span className="live-dot" style={{ background: 'rgba(255,255,255,0.9)' }} />
              Queue Open
            </span>
            <h2 className="text-white text-2xl font-bold leading-tight">
              City Medical Center
            </h2>
            <p className="text-neutral text-sm mt-1">{queue.location}</p>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="absolute -right-4 top-8 w-20 h-20 rounded-full bg-white/5" />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="stat-card text-center">
            <div className="w-8 h-8 rounded-xl mx-auto mb-1 flex items-center justify-center" style={{ background: 'var(--neutral)' }}>
              <Users size={16} style={{ color: 'var(--secondary)' }} />
            </div>
            <p className="stat-value text-lg">{waitingTokens.length}</p>
            <p className="stat-label">In Queue</p>
          </div>
          <div className="stat-card text-center">
            <div className="w-8 h-8 rounded-xl mx-auto mb-1 flex items-center justify-center" style={{ background: 'var(--neutral)' }}>
              <Clock size={16} style={{ color: 'var(--secondary)' }} />
            </div>
            <p className="stat-value text-lg">~{avgWait}m</p>
            <p className="stat-label">Est. Wait</p>
          </div>
          <div className="stat-card text-center">
            <div className="w-8 h-8 rounded-xl mx-auto mb-1 flex items-center justify-center" style={{ background: 'var(--neutral)' }}>
              <Shield size={16} style={{ color: 'var(--secondary)' }} />
            </div>
            <p className="stat-value text-lg">{queue.active_counters}</p>
            <p className="stat-label">Counters</p>
          </div>
        </div>

        {/* Now Serving */}
        <div
          className="card mb-5 flex items-center justify-between"
          style={{ background: '#EBF0FA', border: '1px solid var(--border)' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Now Serving</p>
            <p className="text-2xl font-black text-secondary">{queue.currently_serving}</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center animate-pulse-slow">
            <span className="text-white text-xs font-bold">LIVE</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="card">
          {step === 'form' && (
            <>
              <h3 className="text-base font-bold text-secondary mb-1">Join the Queue</h3>
              <p className="text-xs text-gray-500 mb-4">Enter your details to get a digital token</p>

              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="phone-input" className="input-label">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">+91</span>
                    <input
                      id="phone-input"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '')); setPhoneError(''); }}
                      placeholder="XXXXXXXXXX"
                      className="input-field pl-12"
                      inputMode="numeric"
                      aria-describedby={phoneError ? 'phone-error' : undefined}
                    />
                  </div>
                  {phoneError && (
                    <p id="phone-error" className="text-red-500 text-xs mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} /> {phoneError}
                    </p>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="priority-reason-select" className="input-label">Priority Reason (Optional)</label>
                  <div className="relative">
                    <select
                      id="priority-reason-select"
                      value={priorityReason}
                      onChange={(e) => setPriorityReason(e.target.value)}
                      className="input-field appearance-none pr-8"
                    >
                      {PRIORITY_REASONS.map(r => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Selecting a reason may adjust your queue position</p>
                </div>

                <button
                  id="get-token-btn"
                  type="submit"
                  disabled={queue.status !== 'OPEN'}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {queue.status === 'OPEN' ? (
                    <>Get Token <ChevronRight size={16} /></>
                  ) : (
                    `Queue ${queue.status}`
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <button
                onClick={() => setStep('form')}
                className="flex items-center gap-1 text-xs text-gray-500 mb-4 hover:text-secondary transition-colors"
              >
                ← Back
              </button>
              <h3 className="text-base font-bold text-secondary mb-1">Verify OTP</h3>
              <p className="text-xs text-gray-500 mb-5">
                Enter the 4-digit code sent to +91 {phone.slice(0, 2)}****{phone.slice(-2)}
              </p>

              <div className="flex gap-3 justify-center mb-6">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-14 h-14 text-center text-2xl font-bold rounded-2xl border-2 border-gray-200 outline-none transition-all duration-200 focus:border-secondary"
                    style={{ fontFamily: 'monospace' }}
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              <button
                id="verify-otp-btn"
                onClick={handleVerify}
                disabled={otp.join('').length < 4 || loading}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : 'Verify & Get Token'}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">
                Demo mode: any 4-digit code works
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          {[
            { icon: '⚡', title: 'Real-time Updates', desc: 'Live position & wait time' },
            { icon: '🔔', title: 'Smart Alerts', desc: 'Get notified when near' },
            { icon: '🏥', title: 'Priority Queue', desc: 'Emergency first system' },
            { icon: '📱', title: 'No App Needed', desc: 'Works in your browser' },
          ].map((f) => (
            <div key={f.title} className="card">
              <span className="text-2xl">{f.icon}</span>
              <p className="text-xs font-bold text-secondary mt-2">{f.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
