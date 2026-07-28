import {LoadMoreButton, useInfiniteVirtualScroll, useVirtualListWindow} from '@/shared/virtual-list';
import {LucideIcon} from '@tryghost/shade/utils';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@tryghost/shade/components';
import {forwardRef, useRef} from 'react';
import type {PostListResource} from '@/posts/list/post-list';

/** The subset of a post/page the read-only list row renders. */
export interface PostListItem {
    id: string;
    title: string;
    status?: string;
    feature_image?: string | null;
}

const STATUS_LABELS: Record<string, string> = {
    draft: 'Draft',
    published: 'Published',
    scheduled: 'Scheduled',
    sent: 'Sent'
};

const statusLabel = (status?: string): string => (status ? STATUS_LABELS[status] ?? status : '');

/** Ember editor hash for a given resource, e.g. `#/editor/post/:id`. */
const editorHref = (resource: PostListResource, id: string): string =>
    `#/editor/${resource === 'posts' ? 'post' : 'page'}/${id}`;

const SpacerRow = ({height}: {height: number}) => (
    <tr aria-hidden="true" className="flex lg:table-row">
        <td className="flex lg:table-cell" style={{height}} />
    </tr>
);

// TODO: Remove forwardRef once we have upgraded to React 19
const PlaceholderRow = forwardRef<HTMLTableRowElement>(function PlaceholderRow(props, ref) {
    return (
        <TableRow
            ref={ref}
            {...props}
            aria-hidden="true"
            className="relative flex flex-col lg:table-row"
        >
            <TableCell className="relative z-10 h-16 animate-pulse">
                <div className="h-full rounded-md bg-muted" data-testid="loading-placeholder" />
            </TableCell>
        </TableRow>
    );
});

interface PostListTableProps {
    resource: PostListResource;
    listTestId: string;
    rowTestId: string;
    items: PostListItem[];
    totalItems: number;
    hasNextPage?: boolean;
    isFetchingNextPage?: boolean;
    fetchNextPage: () => void;
}

function PostListTable({
    resource,
    listTestId,
    rowTestId,
    items,
    totalItems,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage
}: PostListTableProps) {
    const parentRef = useRef<HTMLDivElement>(null);
    const {visibleItemCount, canLoadMore, loadMore} = useVirtualListWindow(totalItems);
    const {visibleItems, spaceBefore, spaceAfter} = useInfiniteVirtualScroll({
        items,
        totalItems: visibleItemCount,
        hasNextPage,
        isFetchingNextPage,
        fetchNextPage,
        parentRef
    });

    return (
        <div ref={parentRef} className="overflow-hidden">
            <Table className="flex table-fixed flex-col lg:table" data-testid={listTestId}>
                <TableHeader className="hidden lg:visible! lg:table-header-group!">
                    <TableRow>
                        <TableHead className="w-auto px-4">Title</TableHead>
                        <TableHead className="w-40 px-4">Status</TableHead>
                        <TableHead className="w-20 px-4"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="flex flex-col lg:table-row-group">
                    <SpacerRow height={spaceBefore} />
                    {visibleItems.map(({key, virtualItem, item, props}) => {
                        if (virtualItem.index > items.length - 1) {
                            return <PlaceholderRow key={key} {...props} />;
                        }

                        return (
                            <TableRow
                                key={key}
                                {...props}
                                className="group grid w-full grid-cols-[1fr_5rem] items-center gap-x-4 p-2 md:grid-cols-[1fr_10rem_5rem] lg:table-row lg:p-0"
                                data-testid={rowTestId}
                            >
                                <TableCell className="static col-start-1 col-end-1 row-start-1 row-end-1 flex min-w-0 items-center gap-3 p-0 md:relative lg:table-cell lg:w-1/2 lg:p-4 xl:w-3/5">
                                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted lg:hidden xl:flex">
                                        {item.feature_image ? (
                                            <span
                                                className="size-full bg-cover bg-center"
                                                style={{backgroundImage: `url(${item.feature_image})`}}
                                            />
                                        ) : (
                                            <LucideIcon.Image className="size-4 text-muted-foreground" />
                                        )}
                                    </span>
                                    <a
                                        className="min-w-0 before:absolute before:top-0 before:left-0 before:z-10 before:h-full before:w-[100vw]"
                                        href={editorHref(resource, item.id)}
                                    >
                                        <span className="block truncate text-md font-semibold">
                                            {item.title}
                                        </span>
                                    </a>
                                </TableCell>
                                <TableCell className="col-start-1 col-end-1 row-start-2 row-end-2 flex p-0 md:col-start-2 md:col-end-2 md:row-start-1 md:row-end-1 lg:table-cell lg:p-4">
                                    <span className="block truncate text-muted-foreground">
                                        {statusLabel(item.status)}
                                    </span>
                                </TableCell>
                                <TableCell className="col-start-2 col-end-2 row-start-1 row-end-3 p-0 md:col-start-3 md:col-end-3 lg:table-cell lg:p-4">
                                    <a
                                        aria-hidden="true"
                                        className="relative z-10 inline-flex size-8 items-center justify-center rounded-md border border-input opacity-0 transition-all group-hover:opacity-100"
                                        href={editorHref(resource, item.id)}
                                        tabIndex={-1}
                                    >
                                        <LucideIcon.Pencil className="size-4" />
                                    </a>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    <SpacerRow height={spaceAfter} />
                </TableBody>
            </Table>

            {canLoadMore && <LoadMoreButton isLoading={isFetchingNextPage} onClick={loadMore} />}
        </div>
    );
}

export default PostListTable;
