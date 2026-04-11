/** Sample board — local-only until user creates real tasks or switches to live data. */

const now = Date.now();
const day = (n) => new Date(now + n * 86400000).toISOString();

export const DEMO_TASKS = [
  {
    id: 'demo-1',
    title: 'Build login API',
    description: 'JWT refresh flow, rate limits, and OAuth callback hardening for production.',
    status: 'in_progress',
    priority: 'high',
    assignee: { name: 'Alex Chen', avatarEmoji: '⚡', email: 'alex@acme.dev' },
    dueDate: day(2),
    createdAt: day(-5),
    updatedAt: day(-1),
  },
  {
    id: 'demo-2',
    title: 'Redesign onboarding flow',
    description: 'Empty states, progress stepper, and analytics events for funnel drop-off.',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'Jordan Lee', avatarEmoji: '🎨', email: 'jordan@acme.dev' },
    dueDate: day(7),
    createdAt: day(-3),
    updatedAt: day(-2),
  },
  {
    id: 'demo-3',
    title: 'Fix socket sync issue',
    description: 'Race on reconnect — board state diverges after laptop sleep. Repro on staging.',
    status: 'review',
    priority: 'urgent',
    assignee: { name: 'Sam Rivera', avatarEmoji: '🔧', email: 'sam@acme.dev' },
    dueDate: day(0),
    createdAt: day(-2),
    updatedAt: day(0),
  },
  {
    id: 'demo-4',
    title: 'Deploy Redis queue worker',
    description: 'Bull worker in k8s with health checks and graceful shutdown.',
    status: 'in_progress',
    priority: 'high',
    assignee: { name: 'Alex Chen', avatarEmoji: '⚡', email: 'alex@acme.dev' },
    dueDate: day(3),
    createdAt: day(-8),
    updatedAt: day(-1),
  },
  {
    id: 'demo-5',
    title: 'Optimize dashboard charts',
    description: 'Memoize Recharts data, lazy-load analytics route, reduce bundle for Reports.',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'Morgan Wu', avatarEmoji: '📊', email: 'morgan@acme.dev' },
    dueDate: day(10),
    createdAt: day(-1),
    updatedAt: day(-1),
  },
  {
    id: 'demo-6',
    title: 'Stripe billing webhooks',
    description: 'Idempotency keys, invoice.paid handling, and customer portal deep links.',
    status: 'review',
    priority: 'high',
    assignee: { name: 'Riley Park', avatarEmoji: '💳', email: 'riley@acme.dev' },
    dueDate: day(1),
    createdAt: day(-6),
    updatedAt: day(0),
  },
  {
    id: 'demo-7',
    title: 'Mobile responsive nav',
    description: 'Collapsible sidebar, focus traps, and safe-area padding for iOS.',
    status: 'done',
    priority: 'low',
    assignee: { name: 'Jordan Lee', avatarEmoji: '🎨', email: 'jordan@acme.dev' },
    dueDate: day(-2),
    createdAt: day(-14),
    updatedAt: day(-2),
  },
  {
    id: 'demo-8',
    title: 'Audit log export',
    description: 'CSV + JSON export for enterprise compliance pack.',
    status: 'done',
    priority: 'medium',
    assignee: { name: 'Sam Rivera', avatarEmoji: '🔧', email: 'sam@acme.dev' },
    dueDate: day(-4),
    createdAt: day(-12),
    updatedAt: day(-3),
  },
  {
    id: 'demo-9',
    title: 'E2E tests for checkout',
    description: 'Playwright flows for happy path + card decline scenarios.',
    status: 'todo',
    priority: 'medium',
    assignee: null,
    dueDate: day(14),
    createdAt: day(-2),
    updatedAt: day(-2),
  },
  {
    id: 'demo-10',
    title: 'Design system tokens',
    description: 'Dark mode parity, semantic color roles, and Figma → Tailwind sync.',
    status: 'in_progress',
    priority: 'low',
    assignee: { name: 'Jordan Lee', avatarEmoji: '🎨', email: 'jordan@acme.dev' },
    dueDate: day(5),
    createdAt: day(-4),
    updatedAt: day(-1),
  },
  {
    id: 'demo-11',
    title: 'Incident runbook: API outage',
    description: 'PagerDuty playbook, status page copy, and comms template.',
    status: 'review',
    priority: 'low',
    assignee: { name: 'Morgan Wu', avatarEmoji: '📊', email: 'morgan@acme.dev' },
    dueDate: day(6),
    createdAt: day(-9),
    updatedAt: day(-2),
  },
  {
    id: 'demo-12',
    title: 'Search indexing lag',
    description: 'Meilisearch worker falling behind — batch size and backoff tuning.',
    status: 'todo',
    priority: 'urgent',
    assignee: { name: 'Alex Chen', avatarEmoji: '⚡', email: 'alex@acme.dev' },
    dueDate: day(1),
    createdAt: day(-1),
    updatedAt: day(-1),
  },
];

const TAG_POOL = [
  ['Frontend', 'Design'],
  ['Backend', 'API'],
  ['Backend', 'Infra'],
  ['Frontend', 'Performance'],
  ['Design', 'UX'],
  ['Backend', 'Security'],
  ['Frontend', 'Accessibility'],
  ['Platform', 'API'],
];

function hashId(id) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Rich display fields for API tasks (tags, counts) — deterministic from id. */
export function enrichTaskDisplay(task) {
  const h = hashId(task.id);
  const tags = TAG_POOL[h % TAG_POOL.length];
  return {
    ...task,
    displayTags: tags,
    commentCount: (h % 9) + 1,
    attachmentCount: h % 4,
    progress: Math.min(0.95, 0.15 + (h % 80) / 100),
  };
}

export function enrichDemoTask(task) {
  const h = hashId(task.id);
  return {
    ...task,
    displayTags: TAG_POOL[h % TAG_POOL.length],
    commentCount: (h % 6) + 2,
    attachmentCount: (h % 3) + 1,
    progress: Math.min(0.92, 0.2 + (h % 70) / 100),
  };
}

export function getDrawerExtras(task, isDemo) {
  const h = hashId(task.id);
  const checklist = [
    { id: 'c1', label: 'Scope signed off', done: true },
    { id: 'c2', label: 'Technical design reviewed', done: isDemo ? h % 2 === 0 : h % 3 !== 0 },
    { id: 'c3', label: 'QA on staging', done: task.status === 'done' },
    { id: 'c4', label: 'Release notes updated', done: task.status === 'done' },
  ];
  const comments = [
    { id: 'm1', author: 'Jordan Lee', text: 'Can we ship behind a feature flag first?', at: '2h ago' },
    { id: 'm2', author: 'Alex Chen', text: 'Yes — I’ll add `BETA_LOGIN_API` default off.', at: '1h ago' },
    { id: 'm3', author: 'Sam Rivera', text: 'Socket fix LGTM after the retry cap change.', at: '30m ago' },
  ];
  const activity = [
    { id: 'a1', text: 'Status changed to Review', at: 'Today · 9:14' },
    { id: 'a2', text: 'Priority set to High', at: 'Yesterday' },
    { id: 'a3', text: 'Task created', at: '3d ago' },
  ];
  const files = [
    { id: 'f1', name: 'spec-auth-v2.pdf', size: '1.2 MB' },
    { id: 'f2', name: 'figma-onboarding.fig', size: '4.8 MB' },
  ];
  const aiSuggestions = [
    'Split into two PRs: API + client wiring for faster review.',
    'Add a rollback note in the deploy checklist — Redis worker is critical path.',
    'Consider time-boxing design review to unblock engineering tomorrow.',
  ];
  return { checklist, comments, activity, files, aiSuggestions };
}
