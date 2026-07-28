import React from 'react';
import {Box, Container} from '@tryghost/shade/primitives';
import {ListPage} from '@tryghost/shade/page-templates';
import {PageHeader} from '@tryghost/shade/patterns';

export type PostListResource = 'posts' | 'pages';

const RESOURCE_CONFIG: Record<PostListResource, {title: string; testId: string}> = {
    posts: {title: 'Posts', testId: 'posts-page'},
    pages: {title: 'Pages', testId: 'pages-page'}
};

/**
 * Shared list screen for the posts (/posts) and pages (/pages) routes. Posts
 * and pages differ only in the resource they browse and a handful of
 * copy/option tweaks, so — mirroring the Ember `pages extends posts` design —
 * one component is parameterised by `resource` and the thin `posts.tsx` /
 * `pages.tsx` entries pick which.
 *
 * PR1 scope: read-only shell. Filters, sort, selection, context menu, bulk
 * actions, modals and analytics columns arrive in later slices.
 */
const PostList: React.FC<{resource: PostListResource}> = ({resource}) => {
    const {title, testId} = RESOURCE_CONFIG[resource];

    return (
        <Box className='size-full'>
            <Container className='relative flex h-full flex-col' size='page'>
                <ListPage data-testid={testId}>
                    <ListPage.Header>
                        <PageHeader blurredBackground={false} sticky={false}>
                            <PageHeader.Left>
                                <PageHeader.Title>{title}</PageHeader.Title>
                            </PageHeader.Left>
                        </PageHeader>
                    </ListPage.Header>
                    <ListPage.Body>
                        {/* Rows, infinite query and empty/loading/error states land in slice 3. */}
                    </ListPage.Body>
                </ListPage>
            </Container>
        </Box>
    );
};

export default PostList;
