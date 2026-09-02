require('dotenv').config();
const http = require('http');
const connectDB = require('./config/db');
const User = require('./models/User');
const Workspace = require('./models/Workspace');
const Project = require('./models/Project');
const Collection = require('./models/Collection');
const Post = require('./models/Post');
const app = require('./server');
const { seed } = require('./seed');

let server;
let baseUrl;
let authToken;

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (authToken && !headers.authorization && !headers.Authorization) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const req = http.request(
      url,
      {
        method: options.method || 'GET',
        headers,
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
  console.log('--- Starting Backend Multi-Tenant & Content API Verification Suite ---');

  // Step 1: Database & Seed Ingestion
  console.log('[Level 1] Running Database Connection & Hierarchy Seed Ingestion (TC-SED-01)...');
  await seed();

  const totalUsers = await User.countDocuments();
  const totalWorkspaces = await Workspace.countDocuments();
  const totalProjects = await Project.countDocuments();
  const totalCollections = await Collection.countDocuments();
  const totalPosts = await Post.countDocuments();

  assert(totalUsers >= 1, `Expected >= 1 user, found ${totalUsers}`);
  assert(totalWorkspaces >= 1, `Expected >= 1 workspace, found ${totalWorkspaces}`);
  assert(totalProjects >= 1, `Expected >= 1 project, found ${totalProjects}`);
  assert(totalCollections === 20, `Expected 20 Collections, found ${totalCollections}`);
  assert(totalPosts >= 100, `Expected >= 100 posts, found ${totalPosts}`);
  console.log(`✓ TC-SED-01 Passed: Verified ${totalWorkspaces} workspace, ${totalProjects} project, ${totalCollections} Collections, and ${totalPosts} posts.`);

  // Step 2: Start Server & Test Auth Endpoints
  console.log('[Level 2] Starting Server & Testing Auth & RBAC (TC-AUTH-01)...');
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;

  // Login
  const loginRes = await request('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin@friendlycanvas.dev', password: 'admin123' },
  });
  assert(loginRes.status === 200, `Login failed: ${loginRes.status}`);
  assert(loginRes.body.token, 'Missing JWT in login response');
  authToken = loginRes.body.token;
  console.log('✓ TC-AUTH-01 Passed: Authentication and JWT issuance verified.');

  // Session Profile
  const meRes = await request('/api/auth/me');
  assert(meRes.status === 200, `Profile check failed: ${meRes.status}`);
  assert(meRes.body.workspaces.length >= 1, 'User workspaces list empty');
  const defaultWorkspace = meRes.body.workspaces[0];
  console.log(`✓ TC-AUTH-02 Passed: Session verified for ${meRes.body.user.email} in workspace "${defaultWorkspace.name}".`);

  // Step 3: Projects API & Dynamic Metrics Aggregation (TC-PROJ-01)
  console.log('[Level 3] Testing Dynamic Project Metrics Aggregation (TC-PROJ-01)...');
  const projRes = await request(`/api/workspaces/${defaultWorkspace._id}/projects`);
  assert(projRes.status === 200, `Projects query failed: ${projRes.status}`);
  assert(projRes.body.length >= 1, 'Projects array empty');
  const project = projRes.body[0];
  assert(project.collectionCount === 20 || project.trackCount === 20, `Expected collectionCount 20, got ${project.collectionCount}`);
  assert(project.postCount >= 100, `Expected postCount >= 100, got ${project.postCount}`);
  assert(project.slideCount >= 500, `Expected slideCount >= 500, got ${project.slideCount}`);
  console.log(`✓ TC-PROJ-01 Passed: Aggregated metrics computed dynamically: ${project.collectionCount || project.trackCount} Collections, ${project.postCount} posts, ${project.slideCount} slides.`);

  // Step 4: Collection Aggregation & Sorting (TC-COL-01)
  console.log('[Level 4] Testing Collection Metrics Aggregation & Sorting (TC-COL-01)...');
  const collectionsRes = await request(`/api/collections?projectId=${project._id}`);
  assert(collectionsRes.status === 200, `Collections query failed: ${collectionsRes.status}`);
  assert(collectionsRes.body.length === 20, `Expected 20 Collections, got ${collectionsRes.body.length}`);
  const firstCollection = collectionsRes.body[0];
  assert(firstCollection.postCount > 0, `Collection postCount must be > 0, got ${firstCollection.postCount}`);
  assert(firstCollection.slideCount > 0, `Collection slideCount must be > 0, got ${firstCollection.slideCount}`);
  console.log(`✓ TC-COL-01 Passed: Collection 01 metrics verified: ${firstCollection.postCount} posts, ${firstCollection.slideCount} slides.`);

  // Step 5: Post & Isolated Canvas Mutation (TC-CVS-01)
  console.log('[Level 5] Testing Slide Content & Isolated Canvas Persistence (TC-CVS-01)...');
  const postsRes = await request(`/api/posts?collectionId=${firstCollection._id}`);
  assert(postsRes.status === 200, `Posts query failed: ${postsRes.status}`);
  const post = postsRes.body[0];
  assert(post.slides.length > 0, 'Post has no slides');
  const slide = post.slides[0];

  // Update slide headline
  const updateSlideRes = await request(`/api/posts/${post._id}/slides/${slide._id}`, {
    method: 'PATCH',
    body: { headline: 'Automated Test Slide Headline' },
  });
  assert(updateSlideRes.status === 200, `Slide update failed: ${updateSlideRes.status}`);
  assert(updateSlideRes.body.headline === 'Automated Test Slide Headline', 'Headline did not persist');

  // Update isolated canvas document
  const canvasPayload = {
    version: 1,
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    bgPattern: 'dots',
    textAlign: 'center',
    objects: [{ type: 'rect', left: 100, top: 100, width: 200, height: 200, fill: '#14b8a6' }],
    background: { type: 'color', value: '#0f172a' },
  };
  const canvasRes = await request(`/api/posts/${post._id}/slides/${slide._id}/canvas`, {
    method: 'PATCH',
    body: { canvas: canvasPayload },
  });
  assert(canvasRes.status === 200, `Canvas update failed: ${canvasRes.status}`);
  assert(canvasRes.body.canvas.bgPattern === 'dots', 'Canvas bgPattern did not persist');
  assert(canvasRes.body.canvas.objects.length === 1, 'Canvas objects array did not persist');
  console.log('✓ TC-CVS-01 Passed: Slide content and isolated canvas JSON document persisted to MongoDB.');

  console.log('--- ALL MULTI-TENANT & CONTENT API TESTS PASSED SUCCESSFULLY ---');
}

if (require.main === module) {
  runTests()
    .then(() => {
      if (server) server.close();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Test failed:', err);
      if (server) server.close();
      process.exit(1);
    });
}
