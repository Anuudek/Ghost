import { Suspense, lazy } from "react";
import type { ComponentType } from "react";
import { EmberFallback } from "./ember-bridge";
import { GiftLinkModalHost } from "./gift-link-modal-host";
import { useBrowseConfig } from "@tryghost/admin-x-framework/api/config";

/**
 * Chooses which implementation serves `/posts` and `/pages`, based on the
 * `postsListReact` Labs flag. Read at render time so toggling the flag in
 * Developer Experiments swaps implementations without a rebuild — the routes
 * table is static and evaluated once at module load. Mirrors MemberDetailGate.
 *
 * Ember owns these URLs unless the flag says otherwise, which makes it the safe
 * default in every uncertain case: config failed, config came back empty, flag
 * absent. Only an explicit `true` renders React.
 *
 * Config still loading is the one case that is NOT safe to default to Ember:
 * falling back there would un-hide the Ember shell and flash the Ember screen
 * on every cold load for admins who have the flag on, so hold for a paint
 * instead — the config query is normally warm from the admin shell boot.
 *
 * The React-owned gift-link modal host stays mounted alongside whichever list
 * renders: the Ember list opens it over the state bridge, and the React list
 * opens it directly.
 */
const PostsListReact = lazy(() => import("./posts/list/posts"));
const PagesListReact = lazy(() => import("./posts/list/pages"));

function PostListGate({ ReactList }: { ReactList: ComponentType }) {
    const { data: config, isError, isLoading } = useBrowseConfig();

    if (isLoading) {
        return null;
    }

    const renderReact = !isError && config?.config.labs?.postsListReact === true;

    return (
        <>
            {renderReact ? (
                <Suspense fallback={null}>
                    <ReactList />
                </Suspense>
            ) : (
                <EmberFallback />
            )}
            <GiftLinkModalHost />
        </>
    );
}

export function PostsListGate() {
    return <PostListGate ReactList={PostsListReact} />;
}

export function PagesListGate() {
    return <PostListGate ReactList={PagesListReact} />;
}
