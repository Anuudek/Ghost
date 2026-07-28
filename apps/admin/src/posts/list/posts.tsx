import PostList from './post-list';
import React from 'react';

/** Route entry for `/posts` — the shared list bound to the posts resource. */
const Posts: React.FC = () => <PostList resource="posts" />;

export default Posts;
