/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { initialQueueState } from '../data/mockData';

const QueueContext = createContext(null);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export function QueueProvider({ children }) {
  const [queue, setQueue] = useState(initialQueueState);
  const [tokens, setTokens] = useState([]);
  const [waitingTokens, setWaitingTokens] = useState([]);
  const [p0Alert, setP0Alert] = useState(null);
  const [myToken, setMyToken] = useState(() => {
    const saved = localStorage.getItem('smartqueue_my_token');
    return saved ? JSON.parse(saved) : null;
  });

  const fetchState = useCallback(async () => {
    try {
      const qRes = await fetch(`${API_BASE_URL}/api/queue/state`);
      if (qRes.ok) setQueue(await qRes.json());

      const tRes = await fetch(`${API_BASE_URL}/api/queue/waiting`);
      if (tRes.ok) {
        const data = await tRes.json();
        setTokens(data);
        setWaitingTokens(data);

        const criticals = data.filter(t => t.priority === 0);
        if (criticals.length > 0) setP0Alert(criticals[0]);
        else setP0Alert(null);

        // Update myToken if it's waiting
        if (myToken) {
          const updatedMyToken = data.find(t => t.id === myToken.id);
          if (updatedMyToken) setMyToken(updatedMyToken);
        }
      }
    } catch (e) {
      console.error("Backend offline", e);
    }
  }, [myToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchState();
    const interval = setInterval(fetchState, 2000);
    return () => clearInterval(interval);
  }, [fetchState]);

  useEffect(() => {
    if (myToken) localStorage.setItem('smartqueue_my_token', JSON.stringify(myToken));
    else localStorage.removeItem('smartqueue_my_token');
  }, [myToken]);

  const addToken = useCallback(async (phone, priorityReason) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/queue/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, priority_reason: priorityReason })
      });
      if (res.ok) {
        const data = await res.json();
        setMyToken(data);
        fetchState();
      }
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const callNext = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/queue/next`, { method: 'POST' });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const escalateToken = useCallback(async (id, priority, reason) => {
    try {
      await fetch(`${API_BASE_URL}/api/admin/token/${id}/escalate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_priority: priority, reason })
      });
      fetchState();
    } catch (e) { console.error(e); }
  }, [fetchState]);

  const dismissP0 = useCallback(() => setP0Alert(null), []);
  const toggleQueueStatus = useCallback(() => {}, []);
  const closeQueue = useCallback(() => {}, []);
  const clearMyToken = useCallback(() => setMyToken(null), []);
  const skipToken = useCallback(() => {}, []);

  const getEffectivePosition = useCallback((tokenId) => {
    const token = tokens.find(t => t.id === tokenId);
    if (!token) return null;
    return waitingTokens.findIndex(t => t.id === tokenId) + 1;
  }, [tokens, waitingTokens]);

  return (
    <QueueContext.Provider value={{
      queue,
      tokens,
      waitingTokens,
      p0Alert,
      myToken,
      addToken,
      callNext,
      skipToken,
      escalateToken,
      dismissP0,
      toggleQueueStatus,
      closeQueue,
      clearMyToken,
      getEffectivePosition,
    }}>
      {children}
    </QueueContext.Provider>
  );
}

export const useQueue = () => {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used within QueueProvider');
  return ctx;
};
