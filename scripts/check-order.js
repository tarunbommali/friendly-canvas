import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

console.log('Keys in data.json:', Object.keys(data));
console.log('collectionPalettes keys:', Object.keys(data.collectionPalettes || {}));

if (Array.isArray(data.Collections)) {
  console.log('Collections count:', data.Collections.length);
  console.log('Track numbers:', data.Collections.map(t => t.trackNo || t.id));
}

if (Array.isArray(data.posts)) {
  console.log('Posts count:', data.posts.length);
  console.log('First 5 post IDs:', data.posts.slice(0, 5).map(p => p.id || p.postNo));
  console.log('Last 5 post IDs:', data.posts.slice(-5).map(p => p.id || p.postNo));
}
