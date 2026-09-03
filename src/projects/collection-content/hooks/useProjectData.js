import { useState, useMemo, useCallback } from 'react';
import projectData from '../../../shared/data/project.json';
import { contentApi } from '../../../infrastructure/api/contentApi';
import { postResourcesRepo } from '../../../infrastructure/persistence/localStorageRepository';

export function useProjectData(projectSlug = 'swe-notebook') {
  const [overrides, setOverrides] = useState({});
  const [postResources, setPostResources] = useState(() => postResourcesRepo.get() || {});

  const project = useMemo(() => {
    const rawCollections = Array.isArray(projectData.collections) ? projectData.collections : [];
    const collectionPalettes = {};

    rawCollections.forEach((c) => {
      const idStr = String(c.collectionId).padStart(2, '0');
      const design = c.collectionDesign || {};
      const pObj = {
        name: c.collectionName,
        palette: design.palette || 'Default',
        primary: design.primary || '#2563eb',
        accent: design.accent || '#93c5fd',
      };
      collectionPalettes[idStr] = pObj;
      collectionPalettes[String(parseInt(idStr, 10))] = pObj;
      if (c.collectionName) collectionPalettes[c.collectionName] = pObj;
    });

    return {
      id: 'swe-notebook',
      slug: projectData.slug || 'swe-notebook',
      title: projectData.name || 'SWE Notebook',
      description: projectData.description || 'Complete Software Engineering Zero to Hero curriculum. Includes collection-wise content management, post inspectors, interactive live slide studio, prompt copiers, and slide override editors.',
      watermarkBadge: projectData.watermarkBadge || '@swe.notebook',
      slidesConfig: projectData.slides || {},
      stats: {
        collectionCount: rawCollections?.length,
        postCount: (projectData?.posts || []).length,
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
    const rawCollections = Array.isArray(projectData.collections) ? projectData.collections : [];
    const rawPosts = projectData.posts || [];

    const collectionEntries = rawCollections
      .map((c) => {
        const idStr = String(c.collectionId).padStart(2, '0');
        const collectionNo = parseInt(idStr, 10);
        const name = c.collectionName || `Collection ${idStr}`;
        const design = c.collectionDesign || {};
        const palette = {
          name,
          palette: design.palette || 'Default',
          primary: design.primary || '#2563eb',
          accent: design.accent || '#93c5fd',
        };
        return {
          collectionId: idStr,
          collectionNo,
          collectionName: name,
          title: name,
          collectionDescription: c.collectionDescription || '',
          collectionDesign: design,
          palette,
        };
      })
      .sort((a, b) => a.collectionNo - b.collectionNo);

    return collectionEntries.map((cEntry) => {
      const {
        collectionId,
        collectionNo,
        collectionName,
        collectionDescription,
        collectionDesign,
        palette,
      } = cEntry;
      const matchingPosts = rawPosts.filter((p) => {
        const pCollId = String(p.collectionId).padStart(2, '0');
        return pCollId === collectionId || String(p.collectionId) === String(collectionNo);
      });

      const posts = matchingPosts.map((p, pIdx) => {
        const postNo = p.postNo || pIdx + 1;
        const postId = String(postNo);
        const rawSlides = p.slides || [];

        const slides = rawSlides.map((s, sIdx) => {
          const slideNo = s.slideNo || sIdx + 1;
          const slideId =
            s.id || `slide_t${collectionId}_p${String(postNo).padStart(2, '0')}_s${String(slideNo).padStart(2, '0')}`;
          const slideOverride = overrides[slideId] || {};
          const layoutId =
            slideOverride.layout ||
            (typeof s.layout === 'string' ? s.layout : s.layout?.id) ||
            'concept-explain';
          const slideType = s.slideType || layoutId;
          const audio = p.metadata?.suggestedAudio || {};
          const audioTitle =
            typeof audio === 'string' ? audio : audio.mood || 'Lo-fi Tech Beats / Deep Focus Ambient';

          const finalHeading =
            slideOverride.heading ??
            s.heading ??
            `Slide ${slideNo}`;

          const finalBodyText =
            slideOverride.bodyText ??
            s.bodyText ??
            '';

          const visualDirective =
            slideOverride.visualDirective ??
            s.visualDirective ??
            '';

          return {
            id: slideId,
            postId,
            order: slideNo,
            slideNo,
            slideType,
            archetypeKey: slideType,
            layout: layoutId,
            heading: finalHeading,
            bodyText: finalBodyText,
            visualDirective,
            content: {
              heading: finalHeading,
              bodyText: finalBodyText,
              visualDirective,
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

        const savedResources = postResources[postId] || (p.id ? postResources[p.id] : undefined);
        const effectiveResources = savedResources !== undefined ? savedResources : (p.resources || []);

        return {
          id: postId,
          rawId: p.id,
          collectionId,
          order: postNo,
          postNo,
          code: `${collectionNo}.${postNo}`,
          title: p.title || `Post ${postNo}`,
          status: 'ready',
          slideCount: slides.length,
          palette,
          slides,
          resources: effectiveResources,
          assets: p.assets || [],
          watermarkBadge: projectData.watermarkBadge || '@swe.notebook',
          metadata: p.metadata || { description: '', hashtags: [], suggestedAudio: '' },
        };
      });

      return {
        id: collectionId,
        collectionId,
        projectId: 'swe-notebook',
        order: collectionNo,
        collectionNo,
        slug: `collection-${collectionId}`,
        title: collectionName,
        collectionName,
        collectionDescription,
        collectionDesign,
        postCount: posts.length,
        palette,
        posts,
      };
    });
  }, [overrides, postResources]);

  const updateSlideContent = useCallback(
    (postId, slideId, contentUpdates) => {
      setOverrides((prev) => {
        const existingSlideId = prev[slideId] || {};
        const updatedObj = { ...existingSlideId, ...contentUpdates };
        return { ...prev, [slideId]: updatedObj };
      });

      // Background API sync
      if (postId && slideId) {
        contentApi
          .updateSlide(postId, slideId, {
            heading: contentUpdates.heading,
            bodyText: contentUpdates.bodyText,
            visualDirective: contentUpdates.visualDirective,
          })
          .catch((err) => {
            console.debug('Background slide sync not available or offline:', err.message);
          });
      }
    },
    []
  );

  const updatePostResources = useCallback((postId, newResources) => {
    setPostResources((prev) => {
      const updated = { ...prev, [postId]: newResources };
      postResourcesRepo.set(updated);
      return updated;
    });

    contentApi.updatePost(postId, { resources: newResources }).catch((err) => {
      console.debug('Background post resources sync not available or offline:', err.message);
    });
  }, []);

  return { project, collections, updateSlideContent, updatePostResources };
}
