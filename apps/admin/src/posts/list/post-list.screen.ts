import { page } from "vitest/browser";
import { getScrollParent } from "@tryghost/shade/utils";
import {
    pagesEmptyStateText,
    pagesList,
    pagesListItem,
    pagesPage,
    postsEmptyStateText,
    postsList,
    postsListItem,
    postsPage,
} from "@tryghost/test-data/selectors/posts";

type Resource = "posts" | "pages";

const byResource = <T,>(resource: Resource, posts: T, pages: T): T => (resource === "posts" ? posts : pages);

/** Posts & Pages list screen locators and gestures for acceptance specs; no assertions. */
export const postListScreen = {
    page: (resource: Resource) => page.getByTestId(byResource(resource, postsPage, pagesPage)),
    list: (resource: Resource) => page.getByTestId(byResource(resource, postsList, pagesList)),
    rows: (resource: Resource) => page.getByTestId(byResource(resource, postsListItem, pagesListItem)),
    link: (name: string) => page.getByRole("link", { name, exact: true }),
    emptyStateHeading: (resource: Resource) =>
        page.getByRole("heading", { name: byResource(resource, postsEmptyStateText, pagesEmptyStateText) }),

    /** Scroll the list's scroll container to its end — same resolution the virtualizer uses. */
    scrollListToEnd(resource: Resource): void {
        const scroller = getScrollParent(postListScreen.list(resource).element());
        scroller?.scrollTo({ top: scroller.scrollHeight });
    },
};
