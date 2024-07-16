import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLoading from '@/components/loading/AppLoading';
import SolidrWrapper from '@/content/solidr/components/SolidrWrapper';

export class RoutePaths {
    public static ROOT = `/`;

    public static SESSION_LIST = `/sessions`;
    public static SESSION_DETAIL = `${RoutePaths.SESSION_LIST}/:sessionId`;
}

const fallback = {
    from: '*',
    to: RoutePaths.ROOT,
};

const pages = [
    {
        component: lazy(() => import('@/pages/IndexPage')),
        path: RoutePaths.ROOT,
    },
    {
        component: lazy(
            () => import('@/content/solidr/components/list/SessionListContainer'),
        ),
        path: RoutePaths.SESSION_LIST,
    },
    {
        component: lazy(
            () => import('@/content/solidr/components/detail/SessionContainer'),
        ),
        path: RoutePaths.SESSION_DETAIL,
    },
];

export default function DefaultRoute() {
    return (
        <Routes>
            {pages.map((page) => (
                <Route
                    key={page.path}
                    path={page.path}
                    element={
                        <Suspense fallback={<AppLoading />}>
                            <SolidrWrapper>
                                <page.component />
                            </SolidrWrapper>
                        </Suspense>
                    }
                />
            ))}
            <Route
                path={fallback.from}
                element={<Navigate to={{ pathname: fallback.to }} replace />}
            />
        </Routes>
    );
}
