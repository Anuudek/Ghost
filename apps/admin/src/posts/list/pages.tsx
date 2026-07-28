import PostList from './post-list';
import React from 'react';

/** Route entry for `/pages` — the shared list bound to the pages resource. */
const Pages: React.FC = () => <PostList resource="pages" />;

export default Pages;
