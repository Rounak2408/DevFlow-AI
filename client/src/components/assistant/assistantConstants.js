export const SUGGESTION_PROMPTS = [
  { id: 'p1', label: 'Summarize sprint report', text: 'Summarize my current sprint using my real DevFlow tasks and status breakdown.' },
  { id: 'p2', label: 'Prioritize my tasks', text: 'Prioritize my open tasks by impact and deadlines using DevFlow data.' },
  { id: 'p3', label: 'Build weekly roadmap', text: 'Propose a weekly roadmap based on my workspaces and open tasks.' },
  { id: 'p4', label: 'Write client email', text: 'Draft a concise client update email based on progress in my DevFlow workspaces.' },
  { id: 'p5', label: 'Analyze blockers', text: 'Identify likely blockers from my open tasks and suggest next steps.' },
  { id: 'p6', label: 'Explain bug from logs', text: 'I will paste logs below — explain likely root cause and a fix plan.' },
  { id: 'p7', label: 'Generate standup notes', text: 'Generate standup notes from my tasks: yesterday, today, blockers.' },
  { id: 'p8', label: 'Improve productivity', text: 'Give 3 concrete productivity improvements based on my current workload in DevFlow.' },
];

export const AI_TOOLS = [
  { id: 't1', name: 'Sprint Planner', prompt: 'Act as a sprint planner. Using my DevFlow tasks, propose a 2-week sprint goal, capacity notes, and a prioritized backlog slice.' },
  { id: 't2', name: 'Task Prioritizer', prompt: 'Prioritize my open tasks using urgency, due dates, and dependencies implied by titles/descriptions.' },
  { id: 't3', name: 'Report Summarizer', prompt: 'Summarize execution health: completion rate, risk areas, and what to report to leadership.' },
  { id: 't4', name: 'Bug Explainer', prompt: 'I will share a bug description or logs — explain hypotheses, repro ideas, and a fix path.' },
  { id: 't5', name: 'Meeting Notes', prompt: 'Turn my rough notes into structured meeting minutes with decisions and action items.' },
  { id: 't6', name: 'Email Writer', prompt: 'Draft a professional email for the scenario I describe next.' },
  { id: 't7', name: 'Roadmap Generator', prompt: 'Generate a Now–Next–Later roadmap informed by my current DevFlow work.' },
  { id: 't8', name: 'Code Review', prompt: 'Review the code I paste: risks, style, edge cases, and tests to add.' },
  { id: 't9', name: 'Resume Improver', prompt: 'Improve this resume bullet for impact metrics and clarity. Text: ' },
  { id: 't10', name: 'Daily Coach', prompt: 'Coach me for today: 3 priorities, time blocks, and one anti-procrastination tactic.' },
];

export const SAVED_PROMPTS = [
  { id: 'sv1', label: 'Weekly review', text: 'Run a weekly review: wins, misses, carry-over, and top 3 goals for next week based on my tasks.' },
  { id: 'sv2', label: 'Stakeholder update', text: 'Write a short stakeholder update with status, risks, and asks.' },
  { id: 'sv3', label: 'Deep work plan', text: 'Suggest a deep work plan for today given my deadlines and open tasks.' },
];

export const TEMPLATE_PROMPTS = [
  { id: 'tm1', label: 'Retro format', text: 'Facilitate a team retro: what went well, what to improve, action items — tailored to my current tasks.' },
  { id: 'tm2', label: '1:1 agenda', text: 'Draft a 1:1 agenda from my blockers and upcoming deadlines in DevFlow.' },
];
