import { useState, useMemo, useCallback } from 'react';
import data from '../../../shared/data/data.json';
import { contentApi } from '../../../infrastructure/api/contentApi';

export function useProjectData(projectSlug = 'swe-notebook') {
  const [overrides, setOverrides] = useState({});

  const project = useMemo(() => {
    const rawcollectionPalettes = data.collectionPalettes || {};
    const collectionPalettes = {};

    Object.entries(rawcollectionPalettes).forEach(([collectionId, val]) => {
      collectionPalettes[collectionId] = val;
      collectionPalettes[String(parseInt(collectionId, 10))] = val;
      if (val.name) collectionPalettes[val.name] = val;
    });

    return {
      id: 'swe-notebook',
      slug: data.slug || 'swe-notebook',
      title: data.name || 'SWE Notebook',
      description:
        'Complete Software Engineering Zero to Hero curriculum. Includes collection-wise content management, post inspectors, interactive live slide studio, prompt copiers, and slide override editors.',
      stats: {
        collectionCount: Object.keys(rawcollectionPalettes).length,
        postCount: (data.posts || []).length,
      },
      config: {
        collectionPalettes,
        background: { type: 'dots', color: '#F8F7F4' },
        canvasSpec: { width: 1080, height: 1350, padding: 48 },
        typography: {
          headline: {
            family: 'Instrument Serif, Playfair Display, Georgia, serif',
            weight: 'bold',
            defaultSize: 48,
          },
          body: {
            family: 'Inter, -apple-system, sans-serif',
            weight: '400',
            defaultSize: 22,
          },
          badge: {
            family: 'JetBrains Mono, monospace',
            weight: '700',
            defaultSize: 13,
          },
        },
      },
    };
  }, []);

  const collections = useMemo(() => {
    const rawPalettes = data.collectionPalettes || {};
    const rawPosts = data.posts || [];

    const collectionEntries = Object.entries(rawPalettes)
      .map(([collectionId, p]) => {
        const match = p.name?.match(/\d+/);
        const collectionNo = match ? parseInt(match[0], 10) : parseInt(collectionId, 10);
        return { collectionId: String(collectionNo).padStart(2, '0'), collectionNo, title: p.name, palette: p };
      })
      .sort((a, b) => a.collectionNo - b.collectionNo);

    return collectionEntries.map(({ collectionId, collectionNo, title: collectionName, palette }) => {
      const matchingPosts = rawPosts.filter((p) => p.collectionId === collectionId);

      const posts = matchingPosts.map((p, pIdx) => {
        const postNo = p.postNo || pIdx + 1;
        const postId = String(postNo);
        const rawSlides = p.slides || [];

        const slides = rawSlides.map((s, sIdx) => {
          const slideNo = s.slideNo || sIdx + 1;
          const slideId =
            s.id || `slide_t${collectionId}_p${String(postNo).padStart(2, '0')}_s${String(slideNo).padStart(2, '0')}`;
          const legacyKey = `${collectionName}|${postNo}|${slideNo}`;
          const slideOverride = overrides[slideId] || overrides[legacyKey] || {};
          const layoutId =
            slideOverride.Layout ||
            slideOverride.layout ||
            (typeof s.layout === 'string' ? s.layout : s.layout?.id) ||
            'concept-explain';
          const slideType = s.slideType || layoutId;
          const audio = p.metadata?.suggestedAudio || {};
          const audioTitle =
            typeof audio === 'string' ? audio : audio.mood || 'Lo-fi Tech Beats / Deep Focus Ambient';

          return {
            id: slideId,
            postId,
            order: slideNo,
            slideNo,
            slideType,
            archetypeKey: slideType,
            layout: layoutId,
            headline: slideOverride.title ?? slideOverride.SlideTitle ?? s.headline ?? s.title ?? `Slide ${slideNo}`,
            text: slideOverride.body ?? slideOverride.Content ?? s.text ?? s.body ?? '',
            visualDirective:
              slideOverride.visualDirective ??
              slideOverride.VisualDirective ??
              s.visualDirective ??
              s.descriptionVisual ??
              '',
            content: {
              title:
                slideOverride.title ??
                slideOverride.SlideTitle ??
                s.headline ??
                s.title ??
                s.content?.title ??
                `Slide ${slideNo}`,
              body:
                slideOverride.body ??
                slideOverride.Content ??
                s.text ??
                s.body ??
                s.content?.body ??
                '',
              visualDirective:
                slideOverride.visualDirective ??
                slideOverride.VisualDirective ??
                s.visualDirective ??
                s.descriptionVisual ??
                s.content?.visualDirective ??
                '',
            },
            elements: s.elements || [],
            slideConfig: s.config || { width: 1080, height: 1350, background: '#F8F7F4' },
            assets: {
              matched: (s.assets || []).map((a) => (typeof a === 'string' ? a : a.title || a.name)),
              uploaded: [],
            },
            musicReference: {
              id: `music_${collectionId}_${postNo}`,
              title: audioTitle,
              mood: audio.mood,
              searchTerms: audio.searchTerms || [],
              notes: audio.note,
            },
          };
        });

        return {
          id: postId,
          collectionId,
          order: postNo,
          postNo,
          code: `${collectionNo}.${postNo}`,
          title: p.title || `Post ${postNo}`,
          status: 'ready',
          slideCount: slides.length,
          palette,
          slides,
          metadata: p.metadata || { description: '', hashtags: [], suggestedAudio: '' },
        };
      });

      return {
        id: collectionId,
        projectId: 'swe-notebook',
        order: collectionNo,
        collectionNo,
        slug: `collection-${collectionId}`,
        title: collectionName,
        postCount: posts.length,
        palette,
        posts,
      };
    });
  }, [overrides]);

  const updateSlideContent = useCallback(
    (postId, slideId, contentUpdates, collectionName, postNo, slideNo) => {
      setOverrides((prev) => {
        const existingSlideId = prev[slideId] || {};
        const pascalUpdates = {};
        if (contentUpdates.title !== undefined) pascalUpdates.SlideTitle = contentUpdates.title;
        if (contentUpdates.body !== undefined) pascalUpdates.Content = contentUpdates.body;
        if (contentUpdates.visualDirective !== undefined)
          pascalUpdates.VisualDirective = contentUpdates.visualDirective;

        const updatedObj = { ...existingSlideId, ...contentUpdates, ...pascalUpdates };
        const nextOverrides = { ...prev, [slideId]: updatedObj };

        if (collectionName && postNo && slideNo) {
          const legacyKey = `${collectionName}|${postNo}|${slideNo}`;
          const existingLegacy = prev[legacyKey] || {};
          nextOverrides[legacyKey] = { ...existingLegacy, ...updatedObj };
        }

        return nextOverrides;
      });

      // Background API sync
      if (postId && slideId) {
        contentApi
          .updateSlide(postId, slideId, {
            headline: contentUpdates.title,
            text: contentUpdates.body,
            visualDirective: contentUpdates.visualDirective,
          })
          .catch((err) => {
            console.debug('Background slide sync not available or offline:', err.message);
          });
      }
    },
    []
  );

  return { project, collections, updateSlideContent };
}
