import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

console.log('Keys in data.json:', Object.keys(data));
console.log('trackPalettes keys:', Object.keys(data.trackPalettes || {}));

if (Array.isArray(data.tracks)) {
  console.log('Tracks count:', data.tracks.length);
  console.log('Track numbers:', data.tracks.map(t => t.trackNo || t.id));
}

if (Array.isArray(data.posts)) {
  console.log('Posts count:', data.posts.length);
  console.log('First 5 post IDs:', data.posts.slice(0, 5).map(p => p.id || p.postNo));
  console.log('Last 5 post IDs:', data.posts.slice(-5).map(p => p.id || p.postNo));
}
