import { useEffect, useState } from 'react';
import { QrCode, Monitor } from 'lucide-react';
import { useQueue } from '../context/QueueContext';

export default function DisplayPage() {
  const { queue, waitingTokens } = useQueue();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock
  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Get the next 5 tokens
  const nextTokens = waitingTokens.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans" style={{ background: 'var(--surface)' }}>
      {/* Header */}
      <header className="px-10 py-6 flex items-center justify-between" style={{ background: 'var(--secondary)' }}>
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-2xl object-cover bg-white" />
          <div>
            <h1 className="text-3xl font-black text-white">{queue.name}</h1>
            <p className="text-lg text-white/80">{queue.location}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-white">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-white/80">{currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
      </header>

      <main className="flex-1 flex gap-8 p-10">
        {/* Left Column: Now Serving */}
        <div className="flex-[2] flex flex-col gap-8">
          <div className="flex-1 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden" style={{ background: 'var(--card-bg)', border: '2px solid var(--border)' }}>
            <div className="absolute top-0 left-0 w-full h-4" style={{ background: 'var(--secondary)' }} />
            <h2 className="text-3xl font-bold text-gray-500 uppercase tracking-widest mb-4">Now Serving</h2>
            <div className="text-[12rem] font-black leading-none mb-8" style={{ color: 'var(--secondary)' }}>
              {queue.currently_serving || '---'}
            </div>
            {queue.currently_serving && (
              <div className="inline-block px-8 py-4 rounded-full text-3xl font-bold animate-pulse-slow" style={{ background: 'var(--neutral)', color: 'var(--secondary)' }}>
                Please proceed to Counter {queue.active_counters}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Up Next & Join */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Up Next List */}
          <div className="flex-[2] rounded-3xl p-8 shadow-xl" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Monitor className="text-gray-400" />
              Up Next
            </h3>
            
            {nextTokens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <p className="text-xl">Queue is empty</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {nextTokens.map((token, idx) => (
                  <div key={token.id} className="flex items-center justify-between p-5 rounded-2xl" style={{ background: 'var(--neutral-50)' }}>
                    <div className="flex items-center gap-4">
                      <span className="text-xl font-bold text-gray-400 w-6">{idx + 1}.</span>
                      <span className="text-4xl font-black" style={{ color: 'var(--secondary)' }}>{token.token_number}</span>
                    </div>
                    {token.priority === 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-lg animate-pulse-slow">Critical</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QR Code / Join Instruction */}
          <div className="rounded-3xl p-8 shadow-xl flex items-center gap-6" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--secondary-dk) 100%)' }}>
            <div className="w-32 h-32 bg-white rounded-2xl p-2 flex flex-col items-center justify-center flex-shrink-0">
              <QrCode size={80} style={{ color: 'var(--secondary)' }} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Scan to join the queue</h3>
              <p className="text-white/80 text-lg">Use your phone camera to get a digital token and track your position live.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
