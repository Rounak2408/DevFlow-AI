export const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'account', label: 'Account' },
  { id: 'workspace', label: 'Role & workspace' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'security', label: 'Security' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Billing' },
];

export const ROLE_PERMISSIONS = {
  Owner: [
    'Full workspace control',
    'Billing & seat management',
    'Delete workspace',
    'Manage roles and invites',
    'Create and manage tasks',
    'View analytics and reports',
  ],
  Admin: [
    'Manage members and invites',
    'Workspace configuration',
    'Create and manage tasks',
    'View analytics and reports',
    'Comment and collaborate',
  ],
  Manager: [
    'Plan milestones and roadmap',
    'Assign and prioritize work',
    'View analytics and reports',
  ],
  Developer: [
    'Create and edit tasks',
    'Update boards and issues',
    'Comment and collaborate',
    'Push to linked repositories (when connected)',
  ],
  Viewer: ['View boards and reports', 'Read workspace chat (when enabled)'],
};
