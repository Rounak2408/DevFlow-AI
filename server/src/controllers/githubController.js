import { User } from '../models/User.js';
import { getProjectForUser } from '../utils/projectAccess.js';
import { octokitForUser, fetchRepoActivity, parseRepoFullName } from '../services/githubService.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export async function connectGithub(req, res, next) {
  try {
    const { accessToken } = req.body;
    if (!accessToken || typeof accessToken !== 'string') {
      res.status(400);
      return next(new Error('accessToken required (GitHub personal access token)'));
    }
    const octokit = octokitForUser(accessToken);
    const { data } = await octokit.users.getAuthenticated();
    const user = await User.findById(req.userId);
    user.githubAccessToken = accessToken;
    user.githubUsername = data.login;
    await user.save();
    res.json({ githubUsername: data.login, message: 'GitHub connected' });
  } catch (e) {
    res.status(400);
    next(new Error('Invalid GitHub token or API error'));
  }
}

export async function disconnectGithub(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    user.githubAccessToken = '';
    user.githubUsername = '';
    await user.save();
    res.json({ message: 'Disconnected' });
  } catch (e) {
    next(e);
  }
}

export async function projectGithubActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { error, status, project } = await getProjectForUser(id, req.userId);
    if (error) {
      res.status(status);
      return next(new Error(error));
    }
    const parsed = parseRepoFullName(project.githubRepo);
    if (!parsed) {
      res.status(400);
      return next(new Error('Set githubRepo on project as owner/repo'));
    }
    const user = await User.findById(req.userId).select('+githubAccessToken');
    if (!user.githubAccessToken) {
      res.status(400);
      return next(new Error('Connect GitHub in settings first'));
    }
    const cacheKey = `gh:${id}:${parsed.owner}/${parsed.repo}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ ...cached, cached: true });

    const octokit = octokitForUser(user.githubAccessToken);
    const activity = await fetchRepoActivity(octokit, parsed.owner, parsed.repo);
    const payload = { ...activity, cached: false };
    await cacheSet(cacheKey, { commits: activity.commits, contributors: activity.contributors }, 300);
    res.json(payload);
  } catch (e) {
    next(e);
  }
}
