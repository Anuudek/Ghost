import PostListTable from './components/post-list-table';
import React from 'react';
import {Box, Container} from '@tryghost/shade/primitives';
import {Button, EmptyIndicator, LoadingIndicator} from '@tryghost/shade/components';
import {ListPage} from '@tryghost/shade/page-templates';
import {LucideIcon} from '@tryghost/shade/utils';
import {PageHeader} from '@tryghost/shade/patterns';
import {usePostList} from './hooks/use-post-list';

export type PostListResource = 'posts' | 'pages';

interface ResourceConfig {
    title: string;
    testId: string;
    listTestId: string;
    rowTestId: string;
    newHref: string;
    emptyTitle: string;
    emptyActionLabel: string;
}

const RESOURCE_CONFIG: Record<PostListResource, ResourceConfig> = {
    posts: {
        title: 'Posts',
        testId: 'posts-page',
        listTestId: 'posts-list',
        rowTestId: 'posts-list-item',
        newHref: '#/editor/post',
        emptyTitle: 'Start creating content',
        emptyActionLabel: 'Write a new post'
    },
    pages: {
        title: 'Pages',
        testId: 'pages-page',
        listTestId: 'pages-list',
        rowTestId: 'pages-list-item',
        newHref: '#/editor/page',
        emptyTitle: 'Start creating pages',
        emptyActionLabel: 'Create a new page'
    }
};

/**
 * Shared list screen for the posts (/posts) and pages (/pages) routes. Posts
 * and pages differ only in the resource they browse and a handful of
 * copy/option tweaks, so — mirroring the Ember `pages extends posts` design —
 * one component is parameterised by `resource` and the thin `posts.tsx` /
 * `pages.tsx` entries pick which.
 *
 * PR1 scope: read-only list. Filters, sort, selection, context menu, bulk
 * actions, modals and analytics columns arrive in later slices.
 */
const PostList: React.FC<{resource: PostListResource}> = ({resource}) => {
    const config = RESOURCE_CONFIG[resource];
    const {items, totalItems, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage} = usePostList(resource);

    return (
        <Box className='size-full'>
            <Container className='relative flex h-full flex-col' size='page'>
                <ListPage data-testid={config.testId}>
                    <ListPage.Header>
                        <PageHeader blurredBackground={false} sticky={false}>
                            <PageHeader.Left>
                                <PageHeader.Title>{config.title}</PageHeader.Title>
                            </PageHeader.Left>
                            <PageHeader.Actions>
                                <PageHeader.ActionGroup>
                                    <Button asChild>
                                        <a className='font-bold' href={config.newHref}>
                                            <LucideIcon.Plus className='size-4' />
                                            <span className='hidden sm:inline'>{config.emptyActionLabel}</span>
                                        </a>
                                    </Button>
                                </PageHeader.ActionGroup>
                            </PageHeader.Actions>
                        </PageHeader>
                    </ListPage.Header>
                    <ListPage.Body>
                        {isLoading ? (
                            <div className='flex flex-1 items-center justify-center'>
                                <LoadingIndicator size='lg' />
                            </div>
                        ) : isError ? (
                            <div className='flex flex-1 flex-col items-center justify-center'>
                                <h2 className='mb-2 text-xl font-medium'>Error loading {config.title.toLowerCase()}</h2>
                                <p className='mb-4 text-muted-foreground'>Please reload the page to try again</p>
                                <Button onClick={() => window.location.reload()}>Reload page</Button>
                            </div>
                        ) : items.length === 0 ? (
                            <div className='flex flex-1 items-center justify-center'>
                                <EmptyIndicator
                                    actions={
                                        <Button asChild>
                                            <a href={config.newHref}>{config.emptyActionLabel}</a>
                                        </Button>
                                    }
                                    title={config.emptyTitle}
                                >
                                    <LucideIcon.FileText />
                                </EmptyIndicator>
                            </div>
                        ) : (
                            <PostListTable
                                fetchNextPage={fetchNextPage}
                                hasNextPage={hasNextPage}
                                isFetchingNextPage={isFetchingNextPage}
                                items={items}
                                listTestId={config.listTestId}
                                resource={resource}
                                rowTestId={config.rowTestId}
                                totalItems={totalItems}
                            />
                        )}
                    </ListPage.Body>
                </ListPage>
            </Container>
        </Box>
    );
};

export default PostList;
