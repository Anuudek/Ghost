import { page } from "vitest/browser";
import { pagesPage, postsPage } from "@tryghost/test-data/selectors/posts";

type Resource = "posts" | "pages";

/** Posts & Pages list screen locators and gestures for acceptance specs; no assertions. */
export const postListScreen = {
    page: (resource: Resource) => page.getByTestId(resource === "posts" ? postsPage : pagesPage),
};
