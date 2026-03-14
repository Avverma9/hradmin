import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SERVER_STATUS_EVENT, startHealthPolling } from './api'
import AccessDenied from './components/access-denied'
import Auth from './components/auth'
import GlobalLoader from './components/global-loader'
import ServerError from './components/server-error'
import AdditionalData from './pages/admin/additional-data'
import AdminHotelBookings from './pages/admin/hotel-bookings'
import ManageLinks from './pages/admin/manage-links'
import Dashboard from './pages/dashboard/dashboard'
import Messenger from './pages/messenger/messenger'
import Partner from './pages/partner/partner'
import PanelBooking from './pages/pms/panel-booking'
import PmsBooking from './pages/pms/pms-booking'
import { refreshSidebarLinks, selectAuth } from '../redux/slices/authSlice'

const getAllowedRoutes = (sidebarLinks) =>
  Object.values(sidebarLinks ?? {}).flatMap((groupLinks) =>
    groupLinks
      .map((link) => link.route || link.childLink)
      .filter(Boolean),
  )

const STATIC_ALLOWED_ROUTES = ['/hotel-bookings', '/panel-booking']

const matchesAllowedRoute = (pathname, allowedRoutes) =>
  allowedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated, sidebarLinks, user } = useSelector(selectAuth)
  const [hasServerError, setHasServerError] = useState(false)

  const allowedRoutes = useMemo(
    () => [...new Set([...getAllowedRoutes(sidebarLinks), ...STATIC_ALLOWED_ROUTES])],
    [sidebarLinks],
  )
  const isCurrentRouteAllowed = useMemo(
    () => matchesAllowedRoute(location.pathname, allowedRoutes),
    [allowedRoutes, location.pathname],
  )

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
          path="/access-denied"
          element={isAuthenticated ? <AccessDenied /> : <Navigate to="/" replace />}
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <Dashboard /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/user"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <Partner /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/add-menu-item"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <ManageLinks /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/additional-fields"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <AdditionalData /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/hotel-admin-bookings"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <AdminHotelBookings /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/messenger"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <Messenger /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/your-bookings"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <PmsBooking /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/panel-booking"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <PanelBooking /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="*"
          element={
            isAuthenticated ? (
              isCurrentRouteAllowed ? <Dashboard /> : <Navigate to="/access-denied" replace />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  )
}

export default App
