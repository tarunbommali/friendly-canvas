import { createBrowserRouter, Navigate } from 'react-router-dom';

// App Shell Workspace Layout
import WorkspaceLayout from './workspace/WorkspaceLayout';

// Workspace Hub Pages (Corporate Modern Stitch Integration)
import WorkspaceDashboardPage from './workspace/pages/WorkspaceDashboardPage';
import MemberManagementPage from './workspace/pages/MemberManagementPage';
import RoleMatrixPage from './workspace/pages/RoleMatrixPage';
import AuthLoginPage from './workspace/pages/AuthLoginPage';

// Track Content Domain
import ProjectOverviewPage from './projects/track-content/pages/ProjectOverviewPage';
import TrackDetailPage from './projects/track-content/pages/TrackDetailPage';
import ContentManagementPage from './projects/track-content/pages/ContentManagementPage';
import DesignSystemPage from './projects/track-content/pages/DesignSystemPage';
import NotFoundPage from './projects/track-content/pages/NotFoundPage';

// Carousel Canvas Editor Domain
import CarouselBuilderPage from './projects/carousel-editor/pages/CarouselBuilderPage';
import GlobalLayoutSettingsPage from './projects/carousel-editor/pages/GlobalLayoutSettingsPage';

// Shared Error Boundary
import ErrorBoundary from './shared/components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <AuthLoginPage />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/',
    element: <WorkspaceLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <WorkspaceDashboardPage />,
      },
      {
        path: 'members',
        element: <MemberManagementPage />,
      },
      {
        path: 'roles',
        element: <RoleMatrixPage />,
      },
      {
        path: 'canvas-editor',
        element: <CarouselBuilderPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'settings',
        element: <GlobalLayoutSettingsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/settings',
        element: <GlobalLayoutSettingsPage />,
        errorElement: <ErrorBoundary />,
      },
      // Canvas Studio Routes
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
        path: ':projectSlug/carousel-design',
        element: <DesignSystemPage />,
      },
      // Track Content Hierarchy Routes
      {
        path: ':projectSlug/content',
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: <ProjectOverviewPage />,
          },
          {
            path: 'track/:trackId',
            element: <TrackDetailPage />,
          },
          {
            path: 'track/:trackId/post/:postId',
            element: <ContentManagementPage />,
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
