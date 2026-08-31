import fs from 'fs';

function sortAndFormatData(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  // 1. Sort chapterCovers by trackId ("01", "02", ... "21")
  if (Array.isArray(data.chapterCovers)) {
    data.chapterCovers.sort((a, b) => parseInt(a.trackId, 10) - parseInt(b.trackId, 10));
  }

  // 2. Sort posts by track and post number
  if (Array.isArray(data.posts)) {
    data.posts.sort((a, b) => {
      const trackA = parseInt(a.trackId, 10) || 0;
      const trackB = parseInt(b.trackId, 10) || 0;
      if (trackA !== trackB) return trackA - trackB;

      const postNoA = typeof a.postNo === 'number' ? a.postNo : parseInt((a.id || '').match(/\d+$/)?.[0] || '0', 10);
      const postNoB = typeof b.postNo === 'number' ? b.postNo : parseInt((b.id || '').match(/\d+$/)?.[0] || '0', 10);
      if (postNoA !== postNoB) return postNoA - postNoB;

      return (a.id || '').localeCompare(b.id || '');
    });

    // 3. Sort slides inside each post
    for (const post of data.posts) {
      if (Array.isArray(post.slides)) {
        post.slides.sort((a, b) => {
          const slideNoA = typeof a.slideNo === 'number' ? a.slideNo : parseInt((a.id || '').match(/\d+$/)?.[0] || '0', 10);
          const slideNoB = typeof b.slideNo === 'number' ? b.slideNo : parseInt((b.id || '').match(/\d+$/)?.[0] || '0', 10);
          return slideNoA - slideNoB;
        });
      }
    }
  }

  // Generate sorted trackPalettes keys "01" -> "21"
  const paletteKeys = Object.keys(data.trackPalettes || {}).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  const trackPalettesLines = [];
  if (data.trackPalettes) {
    trackPalettesLines.push('  "trackPalettes": {');
    paletteKeys.forEach((key, idx) => {
      const isLast = idx === paletteKeys.length - 1;
      const formattedObj = JSON.stringify(data.trackPalettes[key], null, 4)
        .split('\n')
        .map((l, i) => (i === 0 ? `    "${key}": ${l}` : `    ${l}`))
        .join('\n');
      trackPalettesLines.push(formattedObj + (isLast ? '' : ','));
    });
    trackPalettesLines.push('  },');
  }

  // Build root object fields in clean order
  const rootFields = ['{'];
  if (data.slug !== undefined) rootFields.push(`  "slug": ${JSON.stringify(data.slug)},`);
  if (data.name !== undefined) rootFields.push(`  "name": ${JSON.stringify(data.name)},`);
  if (data.canvas !== undefined) {
    rootFields.push(`  "canvas": ${JSON.stringify(data.canvas, null, 2).split('\n').map((l, i) => i === 0 ? l : `  ${l}`).join('\n')},`);
  }
  if (trackPalettesLines.length > 0) {
    rootFields.push(...trackPalettesLines);
  }
  if (data.chapterCovers !== undefined) {
    rootFields.push(`  "chapterCovers": ${JSON.stringify(data.chapterCovers, null, 2).split('\n').map((l, i) => i === 0 ? l : `  ${l}`).join('\n')},`);
  }
  if (data.posts !== undefined) {
    rootFields.push(`  "posts": ${JSON.stringify(data.posts, null, 2).split('\n').map((l, i) => i === 0 ? l : `  ${l}`).join('\n')}`);
  }
  rootFields.push('}\n');

  fs.writeFileSync(filePath, rootFields.join('\n'), 'utf8');
  console.log(`Successfully written sorted ascending JSON to ${filePath}`);
}

sortAndFormatData('./data.json');
if (fs.existsSync('./src/shared/data/data.json')) {
  sortAndFormatData('./src/shared/data/data.json');
}
if (fs.existsSync('./src/projects/track-content/data.json')) {
  sortAndFormatData('./src/projects/track-content/data.json');
}
