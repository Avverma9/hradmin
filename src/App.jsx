import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SERVER_STATUS_EVENT, startHealthPolling } from './api'
import AccessDenied from './components/access-denied'
import AppShell from './components/app-shell'
import Auth from './components/auth'
import GlobalLoader from './components/global-loader'
import RouteInProgress from './components/route-in-progress'
import ServerError from './components/server-error'
import { refreshSidebarLinks, selectAuth } from '../redux/slices/authSlice'
import { APP_ROUTES, APP_ROUTE_PATHS } from './routes/app-routes'
import { getSidebarLinkPath } from './utils/sidebar-links'

const getAllowedRoutes = (sidebarLinks) =>
  Object.values(sidebarLinks ?? {}).flatMap((groupLinks) =>
    groupLinks
      .map((link) => getSidebarLinkPath(link))
      .filter(Boolean),
  )

const matchesAllowedRoute = (pathname, allowedRoutes) =>
  allowedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

function ProtectedLayout({ isAuthenticated, isAccessAllowed, isAccessDeniedRoute }) {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (!isAccessAllowed && !isAccessDeniedRoute) {
    return <Navigate to="/access-denied" replace />
  }

  return <AppShell />
}

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, sidebarLinks, user } = useSelector(selectAuth)
  const [hasServerError, setHasServerError] = useState(false)

  const allowedRoutes = useMemo(
    () => [...new Set([...getAllowedRoutes(sidebarLinks), ...APP_ROUTE_PATHS])],
    [sidebarLinks],
  )
  const isCurrentRouteAllowed = useMemo(
    () => matchesAllowedRoute(location.pathname, allowedRoutes),
    [allowedRoutes, location.pathname],
  )
  const isAccessDeniedRoute = location.pathname === '/access-denied'

  useEffect(() => {
    const stopHealthPolling = startHealthPolling(setHasServerError)

    const handleServerStatus = (event) => {
      setHasServerError(event.detail?.hasServerError ?? false)
    }

    const handleOffline = () => {
      setHasServerError(true)
    }

    const handleOnline = () => {
      setHasServerError(false)
    }

    window.addEventListener(SERVER_STATUS_EVENT, handleServerStatus)
    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      stopHealthPolling()
      window.removeEventListener(SERVER_STATUS_EVENT, handleServerStatus)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(refreshSidebarLinks(user.id))
    }
  }, [dispatch, isAuthenticated, user?.id])

  if (hasServerError) {
    return <ServerError />
  }

  return (
    <>
      <GlobalLoader />
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Auth />}
        />
        <Route
          element={
            <ProtectedLayout
              isAuthenticated={isAuthenticated}
              isAccessAllowed={isCurrentRouteAllowed}
              isAccessDeniedRoute={isAccessDeniedRoute}
            />
          }
        >
          <Route path="/access-denied" element={<AccessDenied />} />
          {APP_ROUTES.map(({ path, Component }) => (
            <Route key={path} path={path} element={<Component />} />
          ))}
          <Route path="*" element={<RouteInProgress />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
