import { describe, expect, it } from "vitest";

import { currentRoute, fakePages, fakePosts, post, renderAdminApp } from "@test-utils/acceptance";
import { postListScreen } from "./post-list.screen";

const withFlag = { labs: { postsListReact: true } };

describe("Posts list — read-only data", () => {
    it("lists posts with their title and status", async () => {
        fakePosts([post({ title: "Hello World", status: "published" })]);
        await renderAdminApp("/posts", withFlag);

        const row = postListScreen.rows("posts");
        await expect.element(row).toBeVisible();
        await expect.element(row).toHaveTextContent("Hello World");
        await expect.element(row).toHaveTextContent("Published");
    });

    it("shows the draft status for unpublished posts", async () => {
        fakePosts([post({ title: "A draft post", status: "draft" })]);
        await renderAdminApp("/posts", withFlag);

        await expect.element(postListScreen.rows("posts")).toHaveTextContent("Draft");
    });

    it("fetches from the pages endpoint on /pages and leaves the posts endpoint untouched", async () => {
        const pagesApi = fakePages([post({ title: "About page" })]);
        // A posts fake is registered too; the pages screen must not request it
        // (enabled-gating). Capturing it lets us assert the network was untouched.
        const postsApi = fakePosts([post({ title: "A blog post" })]);
        await renderAdminApp("/pages", withFlag);

        await expect.element(postListScreen.link("About page")).toBeVisible();
        await expect.poll(() => pagesApi.lastRequest?.url).toBeTruthy();
        // The gating is the feature under test: the inactive resource must not fetch.
        expect(postsApi.requests).toHaveLength(0);
    });

    it("shows an empty state with a call to action when there are no posts", async () => {
        fakePosts([]);
        await renderAdminApp("/posts", withFlag);

        await expect.element(postListScreen.emptyStateHeading("posts")).toBeVisible();
    });

    it("navigates to the editor when a post row is clicked", async () => {
        fakePosts([post({ id: "post-abc", title: "Edit me" })]);
        await renderAdminApp("/posts", withFlag);

        await postListScreen.link("Edit me").click();

        // /editor/* is Ember-owned; the shell records the route and defers.
        await expect.poll(currentRoute).toBe("/editor/post/post-abc");
    });

    it("navigates to the page editor when a page row is clicked", async () => {
        fakePages([post({ id: "page-xyz", title: "About" })]);
        await renderAdminApp("/pages", withFlag);

        await postListScreen.link("About").click();

        await expect.poll(currentRoute).toBe("/editor/page/page-xyz");
    });

    it("fetches the next page when scrolling to the end of the list", async () => {
        // 60 posts at a 30-per-page window means the tail needs a second fetch.
        const postsApi = fakePosts(post.many(60, (i) => ({ title: `Post ${i + 1}` })));
        await renderAdminApp("/posts", withFlag);

        await expect.element(postListScreen.link("Post 1")).toBeVisible();
        expect(postsApi.lastRequest?.page).toBe(1);

        postListScreen.scrollListToEnd("posts");

        await expect.poll(() => postsApi.lastRequest?.page).toBe(2);
        await expect.element(postListScreen.link("Post 60")).toBeVisible();
    });
});
