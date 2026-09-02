const express = require('express');
const Project = require('../models/Project');
const Collection = require('../models/Collection');
const Post = require('../models/Post');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbacMiddleware');

const router = express.Router();

router.use(authMiddleware);

// GET /api/projects/:projectId
router.get('/:projectId', requireRole('viewer'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/projects/:projectId
router.patch('/:projectId', requireRole('editor'), async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    if (title) project.title = title.trim();
    if (description !== undefined) project.description = description;

    await project.save();
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:projectId
router.delete('/:projectId', requireRole('admin'), async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Cascade delete associated collections and posts
    await Post.deleteMany({ project: project._id });
    await Collection.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    res.json({ message: 'Project and associated curriculum data deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
