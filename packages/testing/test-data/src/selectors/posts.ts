/**
 * Posts & Pages list screen selector strings, consumed by the admin screen
 * helpers and the e2e page objects. Source of truth: apps/admin/src/posts/list.
 */

// testids — page containers (the shared list renders one per resource)
export const postsPage = "posts-page";
export const pagesPage = "pages-page";

// testids — list body + rows (preserve the hooks the e2e PostsPage already queries)
export const postsList = "posts-list";
export const postsListItem = "posts-list-item";
export const pagesList = "pages-list";
export const pagesListItem = "pages-list-item";

// text fragments — empty states
export const postsEmptyStateText = "Start creating content";
export const pagesEmptyStateText = "Start creating pages";
