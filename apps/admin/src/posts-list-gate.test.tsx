import React from 'react';
import {PagesListGate, PostsListGate} from './posts-list-gate';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';

const {mockUseBrowseConfig} = vi.hoisted(() => ({
    mockUseBrowseConfig: vi.fn()
}));

vi.mock('@tryghost/admin-x-framework/api/config', () => ({
    useBrowseConfig: mockUseBrowseConfig
}));

vi.mock('./ember-bridge', () => ({
    EmberFallback: () => React.createElement('div', {'data-testid': 'ember-fallback'})
}));

vi.mock('./gift-link-modal-host', () => ({
    GiftLinkModalHost: () => React.createElement('div', {'data-testid': 'gift-link-modal-host'})
}));

vi.mock('./posts/list/posts', () => ({
    default: () => React.createElement('div', {'data-testid': 'react-posts-list'})
}));

vi.mock('./posts/list/pages', () => ({
    default: () => React.createElement('div', {'data-testid': 'react-pages-list'})
}));

const configResult = (overrides: Record<string, unknown>) => ({
    data: undefined,
    isError: false,
    isLoading: false,
    ...overrides
});

const withLabs = (labs: Record<string, boolean>) => configResult({data: {config: {labs}}});

describe('PostsListGate', () => {
    beforeEach(() => {
        mockUseBrowseConfig.mockReset();
    });

    it('renders Ember while the flag is off', () => {
        mockUseBrowseConfig.mockReturnValue(withLabs({postsListReact: false}));

        render(<PostsListGate />);

        expect(screen.getByTestId('ember-fallback')).toBeInTheDocument();
        expect(screen.queryByTestId('react-posts-list')).not.toBeInTheDocument();
        // The React-owned gift-link modal host stays mounted alongside Ember.
        expect(screen.getByTestId('gift-link-modal-host')).toBeInTheDocument();
    });

    it('renders the React posts list while the flag is on', async () => {
        mockUseBrowseConfig.mockReturnValue(withLabs({postsListReact: true}));

        render(<PostsListGate />);

        // The React screen is lazily imported, so it arrives a tick later.
        await waitFor(() => {
            expect(screen.getByTestId('react-posts-list')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('ember-fallback')).not.toBeInTheDocument();
        expect(screen.getByTestId('gift-link-modal-host')).toBeInTheDocument();
    });

    it('renders Ember when the flag is absent from config', () => {
        mockUseBrowseConfig.mockReturnValue(withLabs({}));

        render(<PostsListGate />);

        expect(screen.getByTestId('ember-fallback')).toBeInTheDocument();
    });

    it('renders Ember when the config query fails', () => {
        // A failed config read must not blank the screen — Ember owns this URL
        // by default and still serves it, so degrading to Ember keeps the list
        // working. Reporting is left to the framework's default error handler.
        mockUseBrowseConfig.mockReturnValue(configResult({isError: true, data: undefined}));

        render(<PostsListGate />);

        expect(screen.getByTestId('ember-fallback')).toBeInTheDocument();
    });

    it('renders Ember when the config query resolves with no data', () => {
        mockUseBrowseConfig.mockReturnValue(configResult({data: undefined}));

        render(<PostsListGate />);

        expect(screen.getByTestId('ember-fallback')).toBeInTheDocument();
    });

    it('renders nothing while config is loading', () => {
        // Deliberately not falling back to Ember here: doing so would un-hide
        // the Ember shell and flash the old screen on every cold load for
        // admins who have the flag on.
        mockUseBrowseConfig.mockReturnValue(configResult({isLoading: true}));

        const {container} = render(<PostsListGate />);

        expect(screen.queryByTestId('ember-fallback')).not.toBeInTheDocument();
        expect(screen.queryByTestId('react-posts-list')).not.toBeInTheDocument();
        expect(container).toBeEmptyDOMElement();
    });
});

describe('PagesListGate', () => {
    beforeEach(() => {
        mockUseBrowseConfig.mockReset();
    });

    it('renders the React pages list while the flag is on', async () => {
        mockUseBrowseConfig.mockReturnValue(withLabs({postsListReact: true}));

        render(<PagesListGate />);

        await waitFor(() => {
            expect(screen.getByTestId('react-pages-list')).toBeInTheDocument();
        });
    });

    it('renders Ember while the flag is off', () => {
        mockUseBrowseConfig.mockReturnValue(withLabs({postsListReact: false}));

        render(<PagesListGate />);

        expect(screen.getByTestId('ember-fallback')).toBeInTheDocument();
        expect(screen.queryByTestId('react-pages-list')).not.toBeInTheDocument();
    });
});
