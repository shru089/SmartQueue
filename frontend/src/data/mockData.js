// ─── Mock Data for SmartQueue Frontend Demo ────────────────────────────────

export const PRIORITY = {
  CRITICAL: 0,
  URGENT: 1,
  PRIORITY: 2,
  REGULAR: 3,
};

export const PRIORITY_META = {
  0: { label: 'Critical', color: 'critical', dot: '🔴', textColor: '#D32F2F', bg: '#FDECEA' },
  1: { label: 'Urgent', color: 'urgent', dot: '🟠', textColor: '#F57C00', bg: '#FFF3E0' },
  2: { label: 'Priority', color: 'priority', dot: '🟡', textColor: '#F9A825', bg: '#FFF9C4' },
  3: { label: 'Regular', color: 'regular', dot: '🟢', textColor: '#388E3C', bg: '#E8F5E9' },
};

export const PRIORITY_REASONS = [
  { value: '', label: 'None (Regular)' },
  { value: 'Emergency', label: '🚨 Emergency (Critical)' },
  { value: 'Senior Citizen (65+)', label: '👴 Senior Citizen (65+) — Urgent' },
  { value: 'Pregnant', label: '🤰 Pregnant — Urgent' },
  { value: 'Disability', label: '♿ Disability — Urgent' },
  { value: 'Pre-booked Appointment', label: '📅 Pre-booked Appointment — Priority' },
];

export const QUEUE_STATUS = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  PAUSED: 'PAUSED',
};

export const TOKEN_STATUS = {
  WAITING: 'WAITING',
  CALLED: 'CALLED',
  SERVING: 'SERVING',
  DONE: 'DONE',
  MISSED: 'MISSED',
  SKIPPED: 'SKIPPED',
};

// Initial queue state
export const initialQueueState = {
  id: 'Q-CSMU-001',
  name: 'City Medical Center — OPD',
  location: 'Room 101–110, Ground Floor',
  status: QUEUE_STATUS.OPEN,
  avg_service_time_seconds: 300,
  active_counters: 2,
  no_show_window_seconds: 120,
  currently_serving: 'A004',
  tokens_served_today: 12,
};

export const initialTokens = [
  {
    id: 1, token_number: 'A005', status: TOKEN_STATUS.WAITING,
    priority: PRIORITY.CRITICAL, priority_reason: 'Emergency',
    user_phone: '98765*****0', issued_at: new Date(Date.now() - 5 * 60000).toISOString(),
    estimated_wait_seconds: 120,
  },
  {
    id: 2, token_number: 'A006', status: TOKEN_STATUS.WAITING,
    priority: PRIORITY.URGENT, priority_reason: 'Senior Citizen (65+)',
    user_phone: '91234*****1', issued_at: new Date(Date.now() - 12 * 60000).toISOString(),
    estimated_wait_seconds: 420,
  },
  {
    id: 3, token_number: 'A007', status: TOKEN_STATUS.WAITING,
    priority: PRIORITY.PRIORITY, priority_reason: 'Pre-booked Appointment',
    user_phone: '87654*****2', issued_at: new Date(Date.now() - 18 * 60000).toISOString(),
    estimated_wait_seconds: 720,
  },
  {
    id: 4, token_number: 'A008', status: TOKEN_STATUS.WAITING,
    priority: PRIORITY.REGULAR, priority_reason: '',
    user_phone: '76543*****3', issued_at: new Date(Date.now() - 22 * 60000).toISOString(),
    estimated_wait_seconds: 1020,
  },
  {
    id: 5, token_number: 'A009', status: TOKEN_STATUS.WAITING,
    priority: PRIORITY.REGULAR, priority_reason: '',
    user_phone: '65432*****4', issued_at: new Date(Date.now() - 25 * 60000).toISOString(),
    estimated_wait_seconds: 1320,
  },
  {
    id: 6, token_number: 'A010', status: TOKEN_STATUS.WAITING,
    priority: PRIORITY.URGENT, priority_reason: 'Pregnant',
    user_phone: '54321*****5', issued_at: new Date(Date.now() - 30 * 60000).toISOString(),
    estimated_wait_seconds: 600,
  },
];

export const analyticsData = {
  avg_service_time: 4.8,
  tokens_today: 28,
  peak_hour: '10:00 AM',
  hourly: [
    { hour: '8AM', count: 2 },
    { hour: '9AM', count: 5 },
    { hour: '10AM', count: 9 },
    { hour: '11AM', count: 7 },
    { hour: '12PM', count: 3 },
    { hour: '1PM', count: 1 },
    { hour: '2PM', count: 4 },
    { hour: '3PM', count: 6 },
    { hour: '4PM', count: 3 },
  ],
  priority_distribution: [
    { name: 'Critical', value: 2, color: '#D32F2F' },
    { name: 'Urgent', value: 6, color: '#F57C00' },
    { name: 'Priority', value: 5, color: '#FBC02D' },
    { name: 'Regular', value: 15, color: '#388E3C' },
  ],
  audit_log: [
    { id: 1, token: 'A005', from: 'Regular', to: 'Critical', reason: 'Chest pain reported', admin: 'Dr. Admin', time: '09:45 AM' },
    { id: 2, token: 'A002', from: 'Regular', to: 'Urgent', reason: 'Senior citizen, difficulty walking', admin: 'Staff 1', time: '09:15 AM' },
    { id: 3, token: 'A008', from: 'Regular', to: 'Priority', reason: 'Pre-booked appointment', admin: 'Staff 2', time: '08:55 AM' },
  ],
};
