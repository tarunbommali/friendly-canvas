const WorkspaceMember = require('../models/WorkspaceMember');
const Workspace = require('../models/Workspace');
const Project = require('../models/Project');

const ROLE_RANKS = {
  viewer: 1,
  editor: 2,
  admin: 3,
};

/**
 * Resolves workspaceId from route parameters, body, or project hierarchy
 */
async function resolveWorkspaceId(req) {
  if (req.params.workspaceId) return req.params.workspaceId;
  if (req.body && req.body.workspaceId) return req.body.workspaceId;

  const projectId = req.params.projectId || (req.body && req.body.projectId);
  if (projectId) {
    const project = await Project.findById(projectId).select('workspace');
    if (project) return project.workspace.toString();
  }

  return null;
}

/**
 * RBAC middleware factory
 * @param {'admin' | 'editor' | 'viewer'} minimumRole
 */
function requireRole(minimumRole = 'viewer') {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const workspaceId = await resolveWorkspaceId(req);
      if (!workspaceId) {
        // If route does not target a specific workspace, allow if user is authenticated
        return next();
      }

      // Check if user is the direct workspace owner or a member
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ error: 'Workspace not found' });
      }

      if (workspace.owner.toString() === req.user._id.toString()) {
        req.userRole = 'admin';
        req.workspaceId = workspaceId;
        return next();
      }

      const membership = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: req.user._id,
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied: You are not a member of this workspace' });
      }

      const userRank = ROLE_RANKS[membership.role] || 0;
      const requiredRank = ROLE_RANKS[minimumRole] || 1;

      if (userRank < requiredRank) {
        return res.status(403).json({
          error: `Access denied: Requires ${minimumRole} role or higher (current: ${membership.role})`,
        });
      }

      req.userRole = membership.role;
      req.workspaceId = workspaceId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

module.exports = { requireRole, ROLE_RANKS };
