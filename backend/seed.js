require('dotenv').config();
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const Track = require('./models/Track');
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
  await Track.deleteMany({});
  await Post.deleteMany({});

  const trackIdMap = {};
  let order = 0;

  console.log('Seeding tracks...');
  for (const [trackKey, meta] of Object.entries(data.trackPalettes || {})) {
    const cover = (data.chapterCovers || []).find((c) => c.trackId === trackKey);
    const track = await Track.create({
      trackKey,
      name: meta.name,
      palette: {
        name: meta.palette,
        primary: meta.primary,
        accent: meta.accent,
      },
      cover: {
        headline: cover?.headline ?? meta.name,
        text: cover?.text ?? '',
        vibe: cover?.vibe,
      },
      sortOrder: order++,
    });
    trackIdMap[trackKey] = track._id;
  }
  console.log(`Seeded ${Object.keys(trackIdMap).length} tracks.`);

  console.log('Seeding posts...');
  let postCount = 0;
  for (const post of data.posts || []) {
    const trackObjectId = trackIdMap[post.trackId];
    if (!trackObjectId) {
      console.warn(`Skipping post ${post.id}: track ${post.trackId} not found in map.`);
      continue;
    }

    await Post.create({
      externalId: post.id,
      title: post.title,
      postNo: post.postNo,
      track: trackObjectId,
      resources: (post.resources ?? []).map((r) => ({
        youtubeLink: orNull(r.youtubeLink),
        blogUrl: orNull(r.blog || r.blogUrl),
      })),
      assets: post.assets ?? [],
      slides: (post.slides || []).map((s) => ({
        externalId: s.id,
        slideNo: s.slideNo,
        layout: s.layout,
        headline: s.headline,
        text: s.text,
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
