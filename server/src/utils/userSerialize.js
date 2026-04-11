/** Client-safe user shape (no secrets). */

function toPlain(doc) {
  if (!doc) return null;
  return typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
}

export function serializeUserClient(doc) {
  const u = toPlain(doc);
  if (!u || u._id == null) return null;
  return {
    id: u._id,
    email: u.email,
    name: u.name,
    username: u.username || '',
    phone: u.phone || '',
    bio: u.bio || '',
    avatar: u.avatar || '',
    avatarEmoji: u.avatarEmoji || '',
    jobTitle: u.jobTitle || '',
    company: u.company || '',
    location: u.location || '',
    website: u.website || '',
    skills: Array.isArray(u.skills) ? u.skills : [],
    globalRole: u.globalRole,
    githubUsername: u.githubUsername || '',
    preferences: {
      theme: u.preferences?.theme || 'dark',
      language: u.preferences?.language || 'en',
      timezone: u.preferences?.timezone || 'auto',
      dateFormat: u.preferences?.dateFormat || 'mdy',
      compactMode: Boolean(u.preferences?.compactMode),
      sidebarCollapsedDefault: Boolean(u.preferences?.sidebarCollapsedDefault),
      dashboardLayout: u.preferences?.dashboardLayout || 'comfortable',
    },
    notifications: {
      email: u.notifications?.email !== false,
      mentions: u.notifications?.mentions !== false,
      weekly: u.notifications?.weekly !== false,
      tasks: u.notifications?.tasks !== false,
      product: Boolean(u.notifications?.product),
    },
    integrations: {
      github: Boolean(u.githubUsername),
      google: Boolean(u.integrations?.google),
      slack: Boolean(u.integrations?.slack),
    },
    openaiConnected: false,
    twoFactorEnabled: Boolean(u.twoFactorEnabled),
    billing:
      u.billing && typeof u.billing === 'object'
        ? { plan: u.billing.plan || 'free', periodEnd: u.billing.periodEnd || null }
        : { plan: 'free', periodEnd: null },
    lastLoginAt: u.lastLoginAt || null,
    createdAt: u.createdAt,
  };
}

/** After loading +openaiKey for /user/me only */
export function serializeUserPrivate(doc) {
  const u = toPlain(doc);
  if (!u || u._id == null) return null;
  const openaiConnected = Boolean(u.openaiKey);
  const copy = { ...u };
  delete copy.openaiKey;
  delete copy.password;
  delete copy.githubAccessToken;
  const client = serializeUserClient(copy);
  if (client) client.openaiConnected = openaiConnected;
  return client;
}
