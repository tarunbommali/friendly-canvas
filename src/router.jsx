import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// App Shell Workspace Layout
import WorkspaceLayout from './workspace/WorkspaceLayout';

// Shared Error Boundary
import ErrorBoundary from './shared/components/ErrorBoundary';

// Loading Fallback Component
function PageLoader() {
  return (
    <div className="flex-1 w-full min-h-[400px] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-gray-500 dark:text-slate-400">Loading view...</span>
      </div>
    </div>
  );
}

// Helper to wrap lazy-loaded components with Suspense
const withSuspense = (Component) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// Lazy-Loaded Workspace Hub Pages
const WorkspaceDashboardPage = lazy(() => import('./workspace/pages/WorkspaceDashboardPage'));
const MemberManagementPage = lazy(() => import('./workspace/pages/MemberManagementPage'));
const RoleMatrixPage = lazy(() => import('./workspace/pages/RoleMatrixPage'));
const AuthLoginPage = lazy(() => import('./workspace/pages/AuthLoginPage'));

// Lazy-Loaded Collection Content Pages
const ProjectOverviewPage = lazy(() => import('./projects/collection-content/pages/ProjectOverviewPage'));
const CollectionDetailPage = lazy(() => import('./projects/collection-content/pages/CollectionDetailPage'));
const ContentManagementPage = lazy(() => import('./projects/collection-content/pages/ContentManagementPage'));
const DesignSystemPage = lazy(() => import('./projects/collection-content/pages/DesignSystemPage'));
const NotFoundPage = lazy(() => import('./projects/collection-content/pages/NotFoundPage'));

// Lazy-Loaded Carousel Canvas Editor Pages
const CarouselBuilderPage = lazy(() => import('./projects/carousel-editor/pages/CarouselBuilderPage'));
const GlobalLayoutSettingsPage = lazy(() => import('./projects/carousel-editor/pages/GlobalLayoutSettingsPage'));

export const router = createBrowserRouter([
  {
    path: '/login',
    element: withSuspense(AuthLoginPage),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/',
    element: <WorkspaceLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: withSuspense(WorkspaceDashboardPage),
      },
      {
        path: 'members',
        element: withSuspense(MemberManagementPage),
      },
      {
        path: 'roles',
        element: withSuspense(RoleMatrixPage),
      },
      {
        path: 'canvas-editor',
        element: withSuspense(CarouselBuilderPage),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'settings',
        element: withSuspense(GlobalLayoutSettingsPage),
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/settings',
        element: withSuspense(GlobalLayoutSettingsPage),
        errorElement: <ErrorBoundary />,
      },
      // Canvas Studio Routes
      {
        path: 'design/collection/:collectionId/post/:postId',
        element: withSuspense(CarouselBuilderPage),
        errorElement: <ErrorBoundary />,
      },
      {
        path: 'design/collection/:collectionId/post/:postId/settings',
        element: withSuspense(GlobalLayoutSettingsPage),
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/design/collection/:collectionId/post/:postId',
        element: withSuspense(CarouselBuilderPage),
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/design/collection/:collectionId/post/:postId/settings',
        element: withSuspense(GlobalLayoutSettingsPage),
        errorElement: <ErrorBoundary />,
      },
      {
        path: ':projectSlug/carousel-design',
        element: withSuspense(DesignSystemPage),
      },
      // Collection Content Hierarchy Routes
      {
        path: ':projectSlug/content',
        errorElement: <ErrorBoundary />,
        children: [
          {
            index: true,
            element: withSuspense(ProjectOverviewPage),
          },
          {
            path: 'collection/:collectionId',
            element: withSuspense(CollectionDetailPage),
          },
          {
            path: 'collection/:collectionId/post/:postId',
            element: withSuspense(ContentManagementPage),
          },
        ],
      },
      {
        path: '*',
        element: withSuspense(NotFoundPage),
      },
    ],
  },
]);

export default router;
