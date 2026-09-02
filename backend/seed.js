require('dotenv').config();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Workspace = require('./models/Workspace');
const WorkspaceMember = require('./models/WorkspaceMember');
const Project = require('./models/Project');
const Collection = require('./models/Collection');
const Post = require('./models/Post');

function loadDataset() {
  const possiblePaths = [
    path.join(__dirname, 'swe-notebook.json'),
    path.join(__dirname, 'data.json'),
    path.join(__dirname, '..', 'data.json'),
    path.join(__dirname, '..', 'src', 'shared', 'data', 'data.json'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      console.log(`Loading dataset from: ${p}`);
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  }
  throw new Error('Curriculum dataset file (data.json / swe-notebook.json) could not be located.');
}

const orNull = (v) => (v && typeof v === 'string' && v.trim() !== '' ? v.trim() : null);

async function seed() {
  const data = loadDataset();
  await connectDB();

  console.log('Clearing existing collections...');
  await User.deleteMany({});
  await Workspace.deleteMany({});
  await WorkspaceMember.deleteMany({});
  await Project.deleteMany({});
  await Collection.deleteMany({});
  await Post.deleteMany({});

  console.log('Seeding default Admin User...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  const user = await User.create({
    name: 'Admin Engineer',
    email: 'admin@friendlycanvas.dev',
    passwordHash,
  });

  console.log('Seeding default Workspace...');
  const workspace = await Workspace.create({
    name: 'Friendly Workspace',
    slug: 'default-workspace',
    owner: user._id,
  });

  await WorkspaceMember.create({
    workspace: workspace._id,
    user: user._id,
    role: 'admin',
  });

  console.log('Seeding default Project...');
  const project = await Project.create({
    workspace: workspace._id,
    title: 'SWE Engineering Handbook',
    slug: 'swe-notebook',
    description: 'Comprehensive software engineering curriculum & carousel studio',
    sortOrder: 0,
    createdBy: user._id,
  });

  const collectionIdMap = {};
  let order = 0;

  console.log('Seeding Collections for project...');
  for (const [collectionKey, meta] of Object.entries(data.collectionPalettes || {})) {
    const cover = (data.chapterCovers || []).find((c) => c.collectionId === collectionKey);
    const coll = await Collection.create({
      project: project._id,
      collectionKey,
      name: meta.name,
      palette: {
        name: meta.palette,
        primary: meta.primary,
        accent: meta.accent,
      },
      cover: {
        headline: cover?.headline ?? meta.name,
        text: cover?.text ?? '',
        vibe: cover?.vibe ?? '',
      },
      sortOrder: order++,
    });
    collectionIdMap[collectionKey] = coll._id;
  }
  console.log(`Seeded ${Object.keys(collectionIdMap).length} Collections.`);

  console.log('Seeding posts & slides with canvas isolation...');
  let postCount = 0;
  let postOrder = 0;

  for (const post of data.posts || []) {
    const collectionObjectId = collectionIdMap[post.collectionId];
    if (!collectionObjectId) {
      console.warn(`Skipping post ${post.id}: collection ${post.collectionId} not found in map.`);
      continue;
    }

    await Post.create({
      project: project._id,
      collection: collectionObjectId,
      externalId: post.id,
      title: post.title,
      postNo: post.postNo,
      sortOrder: postOrder++,
      resources: (post.resources ?? []).map((r) => ({
        youtubeLink: orNull(r.youtubeLink),
        blogUrl: orNull(r.blog || r.blogUrl),
      })),
      assets: post.assets ?? [],
      slides: (post.slides || []).map((s) => ({
        externalId: s.id,
        slideNo: s.slideNo,
        layout: s.layout || 'concept-explain',
        headline: s.headline || '',
        text: s.text || '',
        visualDirective: s.visualDirective || {},
        canvas: {
          version: 1,
          width: 1080,
          height: 1350,
          aspectRatio: '4:5',
          bgPattern: 'solid',
          textAlign: 'left',
          objects: [],
          background: { type: 'color', value: '#121212' },
        },
      })),
    });
    postCount++;
  }

  console.log(`Seeded ${postCount} posts.`);
  console.log('Database seeding successfully completed.');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failure:', err);
      process.exit(1);
    });
}

module.exports = { seed, loadDataset };
