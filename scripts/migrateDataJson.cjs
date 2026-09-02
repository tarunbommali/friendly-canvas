const fs = require('fs');
const path = require('path');

const dataPath = path.resolve(__dirname, '../data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

function extractTrackNum(Collectionstr = '') {
  const m = Collectionstr.match(/collection\s*(\d+)/i);
  return m ? m[1].padStart(2, '0') : '01';
}

function compileBaseElements(layoutId, title, body, visualDirective, primaryColor, accentColor, trackName) {
  const elements = [
    {
      id: `el_head_${Math.random().toString(36).slice(2, 8)}`,
      type: 'headline',
      content: title || 'Slide Title',
      x: 60,
      y: 80,
      width: 960,
      height: 140,
      font: { family: 'Georgia', size: 48, weight: 'bold', color: '#0f172a' },
      align: 'left',
      zIndex: 1,
      style: { lineHeight: '1.2' }
    }
  ];

  if (body) {
    elements.push({
      id: `el_body_${Math.random().toString(36).slice(2, 8)}`,
      type: 'text',
      content: body,
      x: 60,
      y: 260,
      width: 960,
      height: 360,
      font: { family: 'Inter', size: 30, weight: '400', color: '#334155' },
      align: 'left',
      zIndex: 2,
      style: { lineHeight: '1.6' }
    });
  }

  if (visualDirective) {
    elements.push({
      id: `el_dir_${Math.random().toString(36).slice(2, 8)}`,
      type: 'badge',
      content: `💡 Directive: ${visualDirective}`,
      x: 60,
      y: 1100,
      width: 960,
      height: 100,
      font: { family: 'monospace', size: 20, weight: '500', color: primaryColor },
      backgroundColor: '#ffffff',
      borderColor: accentColor,
      zIndex: 3
    });
  }

  return elements;
}

let totalPostsMigrated = 0;
let totalSlidesMigrated = 0;

if (Array.isArray(data.Posts)) {
  data.Posts = data.Posts.map((post, postIdx) => {
    const trackNo = extractTrackNum(post.Track);
    const postNum = String(post.PostNo || postIdx + 1).padStart(2, '0');
    const postId = `post_t${trackNo}_p${postNum}`;
    const primary = post.TrackColorPalette?.primary || '#1E5FA8';
    const accent = post.TrackColorPalette?.accent || '#A9D0F5';
    const paletteName = post.TrackColorPalette?.palette || 'Default';

    const canonicalSlides = (post.Slides || []).map((slide, slideIdx) => {
      const slideNum = String(slide.SlideNo || slideIdx + 1).padStart(2, '0');
      const slideId = `slide_t${trackNo}_p${postNum}_s${slideNum}`;
      const layoutId = slide.Layout || 'concept-explain';
      const slideTitle = slide.SlideTitle || `Slide ${slide.SlideNo || slideIdx + 1}`;
      const slideContent = slide.Content || '';
      const visualDir = slide.VisualDirective || '';

      const elements = compileBaseElements(
        layoutId,
        slideTitle,
        slideContent,
        visualDir,
        primary,
        accent,
        post.Track
      );

      const assets = [];
      if (slide.ExternalAsset) {
        assets.push({
          source: 'custom',
          label: slide.ExternalAsset,
          url: slide.ExternalAsset
        });
      }

      totalSlidesMigrated++;

      // Canonical slide model
      const canonicalSlide = {
        id: slideId,
        slideNo: slide.SlideNo || slideIdx + 1,
        layout: {
          id: layoutId,
          version: '1.0.0'
        },
        content: {
          title: slideTitle,
          body: slideContent,
          visualDirective: visualDir,
          ...(slide.ExternalAsset ? { externalAsset: slide.ExternalAsset } : {})
        },
        config: {
          width: 1080,
          height: 1350,
          background: '#F8F7F4'
        },
        elements: elements,
        assets: assets
      };

      // Also attach legacy keys on each slide so existing components accessing slide.SlideTitle etc still work
      Object.assign(canonicalSlide, {
        SlideNo: slide.SlideNo || slideIdx + 1,
        SlideTitle: slideTitle,
        Layout: layoutId,
        Content: slideContent,
        VisualDirective: visualDir,
        ...(slide.ExternalAsset ? { ExternalAsset: slide.ExternalAsset } : {})
      });

      return canonicalSlide;
    });

    totalPostsMigrated++;

    const canonicalPost = {
      id: postId,
      schemaVersion: '1.0.0',
      title: post.PostTitle || `Post ${post.PostNo || postIdx + 1}`,
      track: {
        id: trackNo,
        name: post.Track || 'Track 1',
        palette: {
          name: paletteName,
          primary: primary,
          accent: accent
        }
      },
      slides: canonicalSlides,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: post.Description || '',
        hashtags: Array.isArray(post.Hashtags) ? post.Hashtags : [],
        suggestedAudio: post.SuggestedAudio || {
          Mood: 'Curious',
          SearchTerms: ['tech explainer'],
          Note: 'Pick trending sound.'
        },
        isFirstPostInTrack: Boolean(post.IsFirstPostInTrack),
        context: post.Context || ''
      },
      // Keep legacy keys on post root for full backward compatibility
      Track: post.Track,
      PostNo: post.PostNo || postIdx + 1,
      PostTitle: post.PostTitle,
      IsFirstPostInTrack: post.IsFirstPostInTrack,
      TrackColorPalette: post.TrackColorPalette,
      Context: post.Context,
      Slides: canonicalSlides,
      Description: post.Description,
      Hashtags: post.Hashtags,
      SuggestedAudio: post.SuggestedAudio
    };

    return canonicalPost;
  });
}

// Write back updated data.json
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log(`[Migration] Successfully migrated ${totalPostsMigrated} posts and ${totalSlidesMigrated} slides to canonical schema v1.0.0 in data.json!`);
