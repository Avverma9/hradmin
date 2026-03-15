import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SERVER_STATUS_EVENT, startHealthPolling } from './api'
import AccessDenied from './components/access-denied'
import AppShell from './components/app-shell'
import Auth from './components/auth'
import GlobalLoader from './components/global-loader'
import ServerError from './components/server-error'
import AdditionalData from './pages/admin/additional-data'
import GSTManagement from './pages/admin/gst-management'
import AdminHotelBookings from './pages/admin/hotel-bookings'
import BookHotel from './pages/booking-creation/book-hotel'
import ManageLinks from './pages/admin/manage-links'
import Dashboard from './pages/dashboard/dashboard'
import Messenger from './pages/messenger/messenger'
import Partner from './pages/partner/partner'
import BookingCreationHotels from './pages/booking-creation/hotel'
import PanelBooking from './pages/pms/panel-booking'
import PmsBooking from './pages/pms/pms-booking'
import FindUser from './pages/booking-creation/findUser'
import CreateUser from './pages/booking-creation/create-user'
import { refreshSidebarLinks, selectAuth } from '../redux/slices/authSlice'

const getAllowedRoutes = (sidebarLinks) =>
  Object.values(sidebarLinks ?? {}).flatMap((groupLinks) =>
    groupLinks
      .map((link) => link.route || link.childLink)
      .filter(Boolean),
  )

const STATIC_ALLOWED_ROUTES = ['/hotel-bookings', '/panel-booking', '/gst-management', '/gst-page']

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
    () => [...new Set([...getAllowedRoutes(sidebarLinks), ...STATIC_ALLOWED_ROUTES])],
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user" element={<Partner />} />
          <Route path="/manage-menu" element={<ManageLinks />} />
          <Route path="/additional-fields" element={<AdditionalData />} />
          <Route path="/gst-management" element={<GSTManagement />} />
          <Route path="/gst-page" element={<GSTManagement />} />
          <Route path="/hotel-bookings" element={<AdminHotelBookings />} />
          <Route path="/messenger" element={<Messenger />} />
          <Route path="/your-bookings" element={<PmsBooking />} />
          <Route path="/panel-booking" element={<PanelBooking />} />
          <Route path="/booking-creation" element={<FindUser />} />
          <Route path="/booking-creation/hotels" element={<BookingCreationHotels />} />
          <Route path="/booking-creation/create-user" element={<CreateUser />} />
          <Route path="/booking-creation/book-hotel" element={<BookHotel />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
