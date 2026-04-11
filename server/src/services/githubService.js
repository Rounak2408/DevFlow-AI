import { Octokit } from '@octokit/rest';

export function octokitForUser(token) {
  if (!token) throw new Error('GitHub token required');
  return new Octokit({ auth: token });
}

export async function fetchRepoActivity(octokit, owner, repo, perPage = 20) {
  const [commits, contributors] = await Promise.all([
    octokit.repos.listCommits({ owner, repo, per_page: perPage }),
    octokit.repos.listContributors({ owner, repo, per_page: 30 }).catch(() => ({ data: [] })),
  ]);
  return {
    commits: commits.data.map((c) => ({
      sha: c.sha?.slice(0, 7),
      message: c.commit?.message?.split('\n')[0],
      author: c.commit?.author?.name,
      date: c.commit?.author?.date,
      url: c.html_url,
    })),
    contributors: contributors.data.map((c) => ({
      login: c.login,
      contributions: c.contributions,
      avatar: c.avatar_url,
    })),
  };
}

export function parseRepoFullName(full) {
  if (!full || typeof full !== 'string') return null;
  const parts = full.trim().split('/');
  if (parts.length !== 2) return null;
  return { owner: parts[0], repo: parts[1] };
}
