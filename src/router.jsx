import { createBrowserRouter, Navigate } from 'react-router-dom'

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
import TrackRoute from './projects/track-content/routes/TrackRoute'
import PostRoute from './projects/track-content/routes/PostRoute'

// Carousel Editor Domain
import CarouselBuilderPage from './projects/carousel-editor/pages/CarouselBuilderPage'
import GlobalLayoutSettingsPage from './projects/carousel-editor/pages/GlobalLayoutSettingsPage'

// Shared Error Boundary
import ErrorBoundary from './shared/components/ErrorBoundary'

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
      // Carousel Canvas Editor Routes
      {
        path: 'design/track/:trackId/post/:postId',
        element: <CarouselBuilderPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'design/track/:trackId/post/:postId/settings',
        element: <GlobalLayoutSettingsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/design/track/:trackId/post/:postId',
        element: <CarouselBuilderPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/design/track/:trackId/post/:postId/settings',
        element: <GlobalLayoutSettingsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'post-builder',
        element: <Navigate to="/design/track/01/post/1" replace />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: ':projectSlug/carousel-design',
        element: <DesignSystemPage />,
      },
      {
        path: ':projectSlug/create-post',
        element: <Navigate to="/swe-notebook/content" replace />,
      },
      {
        path: 'create-post',
        element: <Navigate to="/swe-notebook/content" replace />,
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
      // Track Domain Routes (Slug-aware & Non-Slug)
      {
        path: ':projectSlug/track/:trackId',
        element: <TrackRoute />,
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
                element: <PostRoute />,
                children: [
                  {
                    index: true,
                    element: <PostPage />,
                  },
                ],
              },
              {
                path: 'edit',
                element: <CarouselBuilderPage />,
              },
            ],
          },
        ],
      },
      {
        path: 'track/:trackId',
        element: <TrackRoute />,
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
                element: <PostRoute />,
                children: [
                  {
                    index: true,
                    element: <PostPage />,
                  },
                ],
              },
              {
                path: 'edit',
                element: <CarouselBuilderPage />,
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
