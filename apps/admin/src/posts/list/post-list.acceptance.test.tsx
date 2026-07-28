import { describe, expect, it } from "vitest";

import { renderAdminApp } from "@test-utils/acceptance";
import { postListScreen } from "./post-list.screen";

describe("Posts & Pages list (React)", () => {
    it("renders the React posts list when the postsListReact flag is on", async () => {
        await renderAdminApp("/posts", { labs: { postsListReact: true } });

        await expect.element(postListScreen.page("posts")).toBeVisible();
        await expect.element(postListScreen.page("posts")).toHaveTextContent("Posts");
    });

    it("renders the React pages list when the flag is on", async () => {
        await renderAdminApp("/pages", { labs: { postsListReact: true } });

        await expect.element(postListScreen.page("pages")).toBeVisible();
        await expect.element(postListScreen.page("pages")).toHaveTextContent("Pages");
    });

    it("does not render the React list when the flag is off — Ember owns the route", async () => {
        // Flag off → the gate defers to Ember. There is no Ember app in this
        // tier, so the React page must never mount.
        await renderAdminApp("/posts");

        await expect(postListScreen.page("posts")).toHaveCount(0);
    });
});
