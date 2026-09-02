import { createBrowserRouter, Navigate } from 'react-router-dom';

// App Shell Workspace Layout
import WorkspaceLayout from './workspace/WorkspaceLayout';

// Workspace Hub Pages (Corporate Modern Stitch Integration)
import WorkspaceDashboardPage from './workspace/pages/WorkspaceDashboardPage';
import MemberManagementPage from './workspace/pages/MemberManagementPage';
import RoleMatrixPage from './workspace/pages/RoleMatrixPage';
import AuthLoginPage from './workspace/pages/AuthLoginPage';

// Collection Content Domain
import ProjectOverviewPage from './projects/collection-content/pages/ProjectOverviewPage';
import CollectionDetailPage from './projects/collection-content/pages/CollectionDetailPage';
import ContentManagementPage from './projects/collection-content/pages/ContentManagementPage';
import DesignSystemPage from './projects/collection-content/pages/DesignSystemPage';
import NotFoundPage from './projects/collection-content/pages/NotFoundPage';

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
        path: 'design/collection/:collectionId/post/:postId',
        element: <CarouselBuilderPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'design/collection/:collectionId/post/:postId/settings',
        element: <GlobalLayoutSettingsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/design/collection/:collectionId/post/:postId',
        element: <CarouselBuilderPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/design/collection/:collectionId/post/:postId/settings',
        element: <GlobalLayoutSettingsPage />,
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/carousel-design',
        element: <DesignSystemPage />,
      },
      // Collection Content Hierarchy Routes
      {
        path: ':projectSlug/content',
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: <ProjectOverviewPage />,
          },
          {
            path: 'collection/:collectionId',
            element: <CollectionDetailPage />,
          },
          {
            path: 'collection/:collectionId/post/:postId',
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
