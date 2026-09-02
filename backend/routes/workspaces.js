const express = require('express');
const mongoose = require('mongoose');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const Project = require('../models/Project');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');

const router = express.Router();

router.use(authMiddleware);

// GET /api/workspaces - list user's workspaces
router.get('/', async (req, res, next) => {
  try {
    const memberships = await WorkspaceMember.find({ user: req.user._id })
      .populate('workspace')
      .lean();

    const workspaces = memberships
      .filter((m) => m.workspace)
      .map((m) => ({
        _id: m.workspace._id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        role: m.role,
        isOwner: m.workspace.owner?.toString() === req.user._id.toString(),
        createdAt: m.workspace.createdAt,
      }));

    res.json(workspaces);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces - create new workspace
router.post('/', async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'Workspace name and slug are required' });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const existing = await Workspace.findOne({ slug: cleanSlug });
    if (existing) {
      return res.status(409).json({ error: 'Workspace slug already exists' });
    }

    const workspace = await Workspace.create({
      name: name.trim(),
      slug: cleanSlug,
      owner: req.user._id,
    });

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user._id,
      role: 'admin',
    });

    res.status(201).json(workspace);
  } catch (error) {
    next(error);
  }
});

// GET /api/workspaces/:workspaceId/projects - get projects in workspace with dynamic counts
router.get('/:workspaceId/projects', requireRole('viewer'), async (req, res, next) => {
  try {
    const workspaceId = new mongoose.Types.ObjectId(req.params.workspaceId);

    const projects = await Project.aggregate([
      { $match: { workspace: workspaceId } },
      { $sort: { sortOrder: 1 } },
      {
        $lookup: {
          from: 'tracks',
          localField: '_id',
          foreignField: 'project',
          as: 'tracks',
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'project',
          as: 'posts',
        },
      },
      {
        $project: {
          title: 1,
          slug: 1,
          description: 1,
          sortOrder: 1,
          workspace: 1,
          createdAt: 1,
          trackCount: { $size: '$tracks' },
          postCount: { $size: '$posts' },
          slideCount: {
            $sum: {
              $map: {
                input: '$posts',
                as: 'p',
                in: { $size: { $ifNull: ['$$p.slides', []] } },
              },
            },
          },
        },
      },
    ]);

    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// POST /api/workspaces/:workspaceId/projects - create project in workspace
router.post('/:workspaceId/projects', requireRole('admin'), async (req, res, next) => {
  try {
    const { title, slug, description } = req.body;
    if (!title || !slug) {
      return res.status(400).json({ error: 'Project title and slug are required' });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const existing = await Project.findOne({
      workspace: req.params.workspaceId,
      slug: cleanSlug,
    });
    if (existing) {
      return res.status(409).json({ error: 'Project slug already exists in this workspace' });
    }

    const maxOrderProj = await Project.findOne({ workspace: req.params.workspaceId }).sort('-sortOrder');
    const sortOrder = maxOrderProj ? maxOrderProj.sortOrder + 1 : 0;

    const project = await Project.create({
      workspace: req.params.workspaceId,
      title: title.trim(),
      slug: cleanSlug,
      description: description || '',
      sortOrder,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/workspaces/:workspaceId/projects/reorder - bulk reorder projects
router.patch('/:workspaceId/projects/reorder', requireRole('admin'), async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id, workspace: req.params.workspaceId },
        update: { $set: { sortOrder: index } },
      },
    }));

    if (bulkOps.length > 0) {
      await Project.bulkWrite(bulkOps);
    }

    res.json({ message: 'Projects reordered successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
