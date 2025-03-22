import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { route, RouteParams, Router } from 'ziggy-js';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createServer((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => `${title} - ${appName}`,
        resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
        setup: ({ App, props }) => {
            // Configure Ziggy for SSR
            const ziggyConfig = {
                ...page.props.ziggy,
                location: new URL(page.props.ziggy.location),
            };

            // bind config to route function
            function appRoute(): Router;
            function appRoute(name: string, params?: RouteParams<typeof name>, absolute?: boolean): string;
            function appRoute(name?: string, params?: RouteParams<string>, absolute?: boolean): Router | string {
                if (name === undefined) {
                    return route();
                }

                return route(name, params, absolute, ziggyConfig);
            }

            // Make route function available globally for SSR...
            if (typeof window === 'undefined') {
                (global as any).route = appRoute;
            }

            return <App {...props} />;
        },
    }),
);
