require('dotenv').config();
const http = require('http');
const connectDB = require('./config/db');
const Track = require('./models/Track');
const Post = require('./models/Post');
const app = require('./server');
const { seed } = require('./seed');

let server;
let baseUrl;

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers: options.headers || {},
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null,
            });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, rawBody: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTests() {
  console.log('--- Starting Backend Verification Suite ---');

  // Step 1: Database & Seed Verification
  console.log('[Level 1 & 2] Running Database Connection & Seed Ingestion (TC-SED-01)...');
  await seed();

  const totalTracks = await Track.countDocuments();
  const totalPosts = await Post.countDocuments();
  assert(totalTracks === 20, `Expected 20 tracks, found ${totalTracks}`);
  assert(totalPosts >= 100, `Expected >= 100 posts, found ${totalPosts}`);
  console.log(`✓ TC-SED-01 Passed: Verified ${totalTracks} tracks and ${totalPosts} posts in MongoDB.`);

  // Step 2: Schema Validation (TC-MOD-01, TC-MOD-02)
  console.log('[Level 1] Running Schema & Enum Validation (TC-MOD-01, TC-MOD-02)...');
  try {
    const invalidTrack = new Track({});
    await invalidTrack.validate();
    assert(false, 'Expected track validation to fail on missing fields');
  } catch (err) {
    assert(err.name === 'ValidationError', 'Track validation properly failed on missing fields');
  }
  console.log('✓ TC-MOD-01 Passed: Track required field validation verified.');

  try {
    const invalidPost = new Post({
      externalId: 'test_invalid',
      title: 'Invalid Layout Post',
      postNo: 999999,
      track: (await Track.findOne())._id,
      slides: [
        {
          externalId: 's1',
          slideNo: 1,
          layout: 'invalid-layout-name',
          headline: 'H',
          text: 'T',
        },
      ],
    });
    await invalidPost.validate();
    assert(false, 'Expected post validation to fail on unapproved layout enum');
  } catch (err) {
    assert(err.name === 'ValidationError', 'Post validation properly rejected invalid layout enum');
  }
  console.log('✓ TC-MOD-02 Passed: Slide layout enumeration enforcement verified.');

  // Step 3: Start Server & Test HTTP Endpoints
  console.log('[Level 3] Starting Server & Testing API Routes...');
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  // TC-TRK-01: GET /api/tracks
  const resTracks = await request('/api/tracks');
  assert(resTracks.status === 200, `GET /api/tracks returned ${resTracks.status}`);
  assert(Array.isArray(resTracks.body), 'GET /api/tracks returned array');
  assert(resTracks.body.length === 20, `Expected 20 tracks, got ${resTracks.body.length}`);
  assert(resTracks.body[0].sortOrder === 0, 'Tracks properly sorted by sortOrder');
  console.log('✓ TC-TRK-01 Passed: GET /api/tracks returned 20 sorted tracks.');

  // TC-TRK-02: GET /api/tracks/:trackKey
  const resTrack01 = await request('/api/tracks/01');
  assert(resTrack01.status === 200, `GET /api/tracks/01 returned ${resTrack01.status}`);
  assert(resTrack01.body.trackKey === '01', 'Retrieved track 01');

  const resTrack404 = await request('/api/tracks/999');
  assert(resTrack404.status === 404, `GET /api/tracks/999 returned ${resTrack404.status}`);
  assert(resTrack404.body.error === 'Track not found', '404 error message verified');
  console.log('✓ TC-TRK-02 Passed: GET /api/tracks/:trackKey and 404 handler verified.');

  // TC-PST-01: GET /api/posts (Projection & List View)
  const resPosts = await request('/api/posts');
  assert(resPosts.status === 200, `GET /api/posts returned ${resPosts.status}`);
  assert(Array.isArray(resPosts.body), 'GET /api/posts returned array');
  assert(resPosts.body[0].slides === undefined, 'Projection correctly excluded slides array');
  assert(resPosts.body[0].resources === undefined, 'Projection correctly excluded resources array');
  assert(resPosts.body[0].assets === undefined, 'Projection correctly excluded assets array');
  assert(resPosts.body[0].track && resPosts.body[0].track.trackKey, 'Track populated with trackKey');
  console.log('✓ TC-PST-01 Passed: GET /api/posts projection exclusion & populated track verified.');

  // TC-PST-02: GET /api/posts?trackKey=01
  const resFilteredPosts = await request('/api/posts?trackKey=01');
  assert(resFilteredPosts.status === 200, `GET /api/posts?trackKey=01 returned ${resFilteredPosts.status}`);
  assert(resFilteredPosts.body.length > 0, 'Found posts for track 01');
  resFilteredPosts.body.forEach((p) => {
    assert(p.track.trackKey === '01', `Post ${p.externalId} belongs to track ${p.track.trackKey}`);
  });
  console.log(`✓ TC-PST-02 Passed: GET /api/posts?trackKey=01 returned ${resFilteredPosts.body.length} scoped posts.`);

  // TC-PST-03: GET /api/posts/:externalId (Full Fetch)
  const sampleExternalId = resFilteredPosts.body[0].externalId;
  const resPostDetail = await request(`/api/posts/${sampleExternalId}`);
  assert(resPostDetail.status === 200, `GET /api/posts/${sampleExternalId} returned ${resPostDetail.status}`);
  assert(Array.isArray(resPostDetail.body.slides), 'Full post response contains slides array');
  assert(resPostDetail.body.slides.length > 0, 'Post contains at least 1 slide');
  assert(resPostDetail.body.track.palette && resPostDetail.body.track.palette.primary, 'Populated track palette');
  console.log(`✓ TC-PST-03 Passed: GET /api/posts/:externalId returned full document with ${resPostDetail.body.slides.length} slides.`);

  // TC-PST-04: GET /api/posts/invalid_id
  const resPost404 = await request('/api/posts/non_existent_post_id');
  assert(resPost404.status === 404, `GET /api/posts/non_existent_post_id returned ${resPost404.status}`);
  assert(resPost404.body.error === 'Post not found', '404 post error message verified');
  console.log('✓ TC-PST-04 Passed: 404 on invalid post externalId verified.');

  // TC-SRV-01: Health check & Error handler
  const resHealth = await request('/api/health');
  assert(resHealth.status === 200 && resHealth.body.status === 'ok', 'Health check passed');
  console.log('✓ TC-SRV-01 Passed: Health check & server routing verified.');

  console.log('\n===========================================');
  console.log('   ALL 10 VERIFICATION TEST CASES PASSED   ');
  console.log('===========================================\n');
}

runTests()
  .catch((err) => {
    console.error('\n❌ Test Suite Failed:', err);
    process.exitCode = 1;
  })
  .finally(() => {
    if (server) server.close();
    process.exit(process.exitCode || 0);
  });
