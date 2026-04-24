import { createContext, useContext, useReducer, useCallback } from 'react';
import { initialQueueState, initialTokens, PRIORITY, PRIORITY_META, QUEUE_STATUS, TOKEN_STATUS } from '../data/mockData';

const QueueContext = createContext(null);

const sortTokens = (tokens) =>
  [...tokens]
    .filter(t => t.status === TOKEN_STATUS.WAITING)
    .sort((a, b) => a.priority - b.priority || new Date(a.issued_at) - new Date(b.issued_at));

function queueReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOKEN': {
      const newToken = {
        id: Date.now(),
        token_number: `A${String(state.tokens.filter(t => t.status !== TOKEN_STATUS.WAITING || true).length + 11).padStart(3, '0')}`,
        status: TOKEN_STATUS.WAITING,
        priority: action.payload.priority,
        priority_reason: action.payload.priority_reason,
        user_phone: action.payload.phone,
        issued_at: new Date().toISOString(),
        estimated_wait_seconds: 300 * (action.payload.priority + 1),
      };
      const newTokens = [...state.tokens, newToken];
      const p0Alert = action.payload.priority === PRIORITY.CRITICAL ? newToken : state.p0Alert;
      return { ...state, tokens: newTokens, p0Alert, myToken: newToken };
    }
    case 'CALL_NEXT': {
      const waiting = sortTokens(state.tokens);
      if (!waiting.length) return state;
      const next = waiting[0];
      const updated = state.tokens.map(t =>
        t.id === next.id
          ? { ...t, status: TOKEN_STATUS.CALLED, called_at: new Date().toISOString() }
          : t
      );
      return {
        ...state,
        tokens: updated,
        queue: { ...state.queue, currently_serving: next.token_number },
      };
    }
    case 'SKIP_TOKEN': {
      const updated = state.tokens.map(t =>
        t.id === action.payload ? { ...t, status: TOKEN_STATUS.SKIPPED } : t
      );
      return { ...state, tokens: updated };
    }
    case 'ESCALATE_TOKEN': {
      const updated = state.tokens.map(t =>
        t.id === action.payload.id
          ? { ...t, priority: action.payload.priority, priority_reason: action.payload.reason, priority_set_by: 'admin' }
          : t
      );
      const p0Alert = action.payload.priority === 0
        ? updated.find(t => t.id === action.payload.id)
        : state.p0Alert;
      return { ...state, tokens: updated, p0Alert };
    }
    case 'DISMISS_P0':
      return { ...state, p0Alert: null };
    case 'TOGGLE_QUEUE_STATUS':
      return {
        ...state,
        queue: {
          ...state.queue,
          status: state.queue.status === QUEUE_STATUS.OPEN
            ? QUEUE_STATUS.PAUSED
            : QUEUE_STATUS.OPEN,
        },
      };
    case 'CLOSE_QUEUE':
      return { ...state, queue: { ...state.queue, status: QUEUE_STATUS.CLOSED } };
    case 'CLEAR_MY_TOKEN':
      return { ...state, myToken: null };
    default:
      return state;
  }
}

const initialState = {
  queue: initialQueueState,
  tokens: initialTokens,
  p0Alert: null,
  myToken: null,
};

export function QueueProvider({ children }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);

  const addToken = useCallback((phone, priorityReason) => {
    let priority = PRIORITY.REGULAR;
    if (priorityReason === 'Emergency') priority = PRIORITY.CRITICAL;
    else if (['Senior Citizen (65+)', 'Pregnant', 'Disability'].includes(priorityReason)) priority = PRIORITY.URGENT;
    else if (priorityReason === 'Pre-booked Appointment') priority = PRIORITY.PRIORITY;
    dispatch({ type: 'ADD_TOKEN', payload: { phone, priority, priority_reason: priorityReason } });
  }, []);

  const callNext = useCallback(() => dispatch({ type: 'CALL_NEXT' }), []);
  const skipToken = useCallback((id) => dispatch({ type: 'SKIP_TOKEN', payload: id }), []);
  const escalateToken = useCallback((id, priority, reason) =>
    dispatch({ type: 'ESCALATE_TOKEN', payload: { id, priority, reason } }), []);
  const dismissP0 = useCallback(() => dispatch({ type: 'DISMISS_P0' }), []);
  const toggleQueueStatus = useCallback(() => dispatch({ type: 'TOGGLE_QUEUE_STATUS' }), []);
  const closeQueue = useCallback(() => dispatch({ type: 'CLOSE_QUEUE' }), []);
  const clearMyToken = useCallback(() => dispatch({ type: 'CLEAR_MY_TOKEN' }), []);

  const waitingTokens = sortTokens(state.tokens);

  const getEffectivePosition = useCallback((tokenId) => {
    const token = state.tokens.find(t => t.id === tokenId);
    if (!token) return null;
    return waitingTokens.findIndex(t => t.id === tokenId) + 1;
  }, [state.tokens, waitingTokens]);

  return (
    <QueueContext.Provider value={{
      queue: state.queue,
      tokens: state.tokens,
      waitingTokens,
      p0Alert: state.p0Alert,
      myToken: state.myToken,
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
