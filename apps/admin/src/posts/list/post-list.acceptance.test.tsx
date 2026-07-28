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

    // The flag-OFF path (gate defers to Ember) is covered deterministically by
    // the gate unit test (posts-list-gate.test.tsx). It can't be asserted here:
    // EmberFallback renders nothing in this tier, so a "React didn't mount"
    // check would pass trivially at t0 — before config even resolves — proving
    // nothing. See the adversarial review note in progress-posts-react.md.
});
