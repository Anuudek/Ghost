import {useBrowsePagesInfinite} from '@tryghost/admin-x-framework/api/pages';
import {useBrowsePostsInfinite} from '@tryghost/admin-x-framework/api/posts';
import type {PostListItem} from '@/posts/list/components/post-list-table';
import type {PostListResource} from '@/posts/list/post-list';

/** Ember's posts list used 30 per page; keep parity for the React browse window. */
const PAGE_SIZE = 30;

export interface PostListData {
    items: PostListItem[];
    totalItems: number;
    isLoading: boolean;
    isError: boolean;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
    fetchNextPage: () => void;
}

/**
 * Read-only browse for the posts/pages list. Posts and pages have separate
 * infinite hooks (and different response envelope keys), so both are called
 * with `enabled` gating on the active resource — only the current one fetches —
 * and the result is normalised to a common {@link PostListItem} shape.
 *
 * PR1 scope: a single browse with a default sort. Filters and the sort dropdown
 * arrive in PR2; until then the query carries no filter.
 */
export function usePostList(resource: PostListResource): PostListData {
    const isPosts = resource === 'posts';
    // `updated_at desc` (Ember's draft ordering) is the single-sort default:
    // drafts have a null `published_at`, so ordering the mixed list by that
    // would sink every draft to the bottom. The per-status ordering + the sort
    // dropdown arrive in PR2.
    const searchParams = {limit: String(PAGE_SIZE), order: 'updated_at desc'};

    const postsQuery = useBrowsePostsInfinite({searchParams, enabled: isPosts});
    const pagesQuery = useBrowsePagesInfinite({searchParams, enabled: !isPosts});

    const query = isPosts ? postsQuery : pagesQuery;
    const rawItems = isPosts ? (postsQuery.data?.posts ?? []) : (pagesQuery.data?.pages ?? []);

    const items: PostListItem[] = rawItems.map(item => ({
        id: item.id,
        title: item.title,
        status: item.status,
        feature_image: item.feature_image ?? null
    }));

    return {
        items,
        totalItems: query.data?.meta?.pagination?.total ?? 0,
        isLoading: query.isLoading,
        isError: query.isError,
        hasNextPage: query.hasNextPage ?? false,
        isFetchingNextPage: query.isFetchingNextPage,
        fetchNextPage: () => void query.fetchNextPage()
    };
}
