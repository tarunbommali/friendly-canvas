import React from 'react'
import { createBrowserRouter, Navigate, useLocation } from 'react-router-dom'

// App Shell Workspace Layout
import WorkspaceLayout from './workspace/WorkspaceLayout'

// Track Content Domain
import HomePage from './projects/track-content/pages/HomePage'
import TrackPage from './projects/track-content/pages/TrackPage'
import PostPage from './projects/track-content/pages/PostPage'
import SearchPage from './projects/track-content/pages/SearchPage'
import DesignSystemPage from './projects/track-content/pages/DesignSystemPage'
import ContentManagementPage from './projects/track-content/pages/ContentManagementPage'
import NotFoundPage from './projects/track-content/pages/NotFoundPage'
import TrackLayout from './projects/track-content/layouts/TrackLayout'
import PostLayout from './projects/track-content/layouts/PostLayout'

// Carousel Editor Domain
import CarouselBuilderPage from './projects/carousel-editor/CarouselBuilderPage'

// Layout Library Domain
import LayoutCollectionsPage from './projects/layout-library/pages/LayoutCollectionsPage'
import LayoutCollectionViewPage from './projects/layout-library/pages/LayoutCollectionViewPage'
import LayoutEditorPage from './projects/layout-library/pages/LayoutEditorPage'

// Shared Error Boundary
import ErrorBoundary from './shared/components/ErrorBoundary'

// Keyed wrapper to force clean component remount when navigating between param variations
function KeyedCreatePostBuilder() {
  const location = useLocation()
  return <CarouselBuilderPage key={location.pathname} />
}

function KeyedLayoutEditor() {
  const location = useLocation()
  return <LayoutEditorPage key={location.pathname} />
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <WorkspaceLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'design/new',
        element: <KeyedCreatePostBuilder />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'design/:postId',
        element: <KeyedCreatePostBuilder />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'design/track/:trackId',
        element: <KeyedCreatePostBuilder />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'design/track/:trackId/post/:postId',
        element: <KeyedCreatePostBuilder />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'post-builder',
        element: <Navigate to="/design" replace />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: 'swe-notebook/carousel-design',
        element: <DesignSystemPage />,
      },
      // Canonicalize aliases with explicit redirects
      {
        path: 'swe.notebook/carousel-design',
        element: <Navigate to="/swe-notebook/carousel-design" replace />,
      },
      {
        path: 'carousel-design',
        element: <Navigate to="/swe-notebook/carousel-design" replace />,
      },
      {
        path: 'system-design',
        element: <Navigate to="/swe-notebook/carousel-design" replace />,
      },
      {
        path: 'design-system',
        element: <Navigate to="/swe-notebook/carousel-design" replace />,
      },
      {
        path: 'builder',
        element: <Navigate to="/layout-builder" replace />,
      },
      {
        path: 'layout-builder',
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: <LayoutCollectionsPage />,
          },
          {
            path: 'collection/:collectionId',
            element: <LayoutCollectionViewPage />,
          },
          {
            path: 'collection/:collectionId/new',
            element: <KeyedLayoutEditor />,
          },
          {
            path: 'collection/:collectionId/edit/:layoutId',
            element: <KeyedLayoutEditor />,
          },
        ],
      },
      {
        path: ':projectSlug/design',
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: <KeyedCreatePostBuilder />,
          },
          {
            path: ':postId',
            element: <KeyedCreatePostBuilder />,
          },
          {
            path: 'track/:trackId',
            element: <KeyedCreatePostBuilder />,
          },
          {
            path: 'track/:trackId/post/:postId',
            element: <KeyedCreatePostBuilder />,
          },
        ],
      },
      {
        path: ':projectSlug/create-post',
        element: <Navigate to="/:projectSlug/design" replace />,
      },
      {
        path: 'create-post',
        element: <Navigate to="/design" replace />,
      },
      {
        path: ':projectSlug/content',
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: <ContentManagementPage />,
          },
          {
            path: 'track/:trackId',
            element: <ContentManagementPage />,
          },
          {
            path: 'track/:trackId/post/:postId',
            element: <ContentManagementPage />,
          },
        ],
      },
      {
        path: 'content',
        element: <Navigate to="/swe-notebook/content" replace />,
      },
      {
        path: 'track/:trackId',
        element: <TrackLayout />,
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: <TrackPage />,
          },
          {
            path: 'post/:postId',
            errorElement: <ErrorBoundary />,
            children: [
              {
                element: <PostLayout />,
                children: [
                  {
                    index: true,
                    element: <PostPage />,
                  },
                ],
              },
              {
                path: 'edit',
                element: <KeyedCreatePostBuilder />,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])

export default router
