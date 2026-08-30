# Routes — Friendly Canvas

## Framework
- **React Router DOM v7** (config-based, createBrowserRouter)
- **Router file**: `src/router.jsx`
- **App shell**: `WorkspaceLayout` wraps all routes (provides Navbar, Sidebar, Toast)

## Route Map

| URL Path | Component | Layout | Description |
|---|---|---|---|
| `/` | `HomePage` | WorkspaceLayout + Navbar | Home: track listing, featured posts |
| `/search` | `SearchPage` | WorkspaceLayout + Navbar | Search results page |
| `/design/track/:trackId/post/:postId` | `CarouselBuilderPage` | WorkspaceLayout (NO Navbar) | Full-screen carousel slide editor |
| `/design/track/:trackId/post/:postId/settings` | `GlobalLayoutSettingsPage` | WorkspaceLayout (NO Navbar) | Global layout settings panel |
| `/:projectSlug/content` | `ContentManagementPage` | WorkspaceLayout (NO Navbar) | Content management dashboard |
| `/:projectSlug/content/track/:trackId` | `ContentManagementPage` | WorkspaceLayout | Content management with track filter |
| `/:projectSlug/carousel-design` | `DesignSystemPage` | WorkspaceLayout + Navbar | Design system / theme reference page |
| `/track/:trackId` | `TrackPage` via `TrackRoute` | WorkspaceLayout + Navbar + Sidebar | Track detail view |
| `/track/:trackId/post/:postId` | `PostPage` via `TrackRoute > PostRoute` | WorkspaceLayout + Navbar + Sidebar | Post detail/reading view |
| `/track/:trackId/post/:postId/edit` | `CarouselBuilderPage` | WorkspaceLayout (NO Navbar) | Edit carousel in full-screen editor |
| `*` | `NotFoundPage` | WorkspaceLayout | 404 page |

## Key Routing Notes
- The `WorkspaceLayout` **hides the Navbar** on `/design/*`, `/post-builder`, and `*/edit` paths (full-screen editor mode)
- The `TrackSidebar` is shown only on `/track/*` and `*/carousel-design` paths
- `/:projectSlug` prefix mirrors all major routes (multi-project support)
- Default redirect: `/content` → `/swe-notebook/content`

## Router Config Source
```jsx
// src/router.jsx
export const router = createBrowserRouter([
  {
    path: '/',
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'design/track/:trackId/post/:postId', element: <CarouselBuilderPage /> },
      { path: 'design/track/:trackId/post/:postId/settings', element: <GlobalLayoutSettingsPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: ':projectSlug/carousel-design', element: <DesignSystemPage /> },
      { path: ':projectSlug/content', children: [
        { index: true, element: <ContentManagementPage /> },
        { path: 'track/:trackId', element: <ContentManagementPage /> },
        { path: 'track/:trackId/post/:postId', element: <ContentManagementPage /> },
      ]},
      { path: 'track/:trackId', element: <TrackRoute />, children: [
        { index: true, element: <TrackPage /> },
        { path: 'post/:postId', children: [
          { element: <PostRoute />, children: [{ index: true, element: <PostPage /> }] },
          { path: 'edit', element: <CarouselBuilderPage /> },
        ]},
      ]},
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
```
