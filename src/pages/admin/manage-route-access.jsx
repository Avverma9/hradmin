import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Check,
  ChevronDown,
  ChevronRight,
  Lock,
  LockOpen,
  Route,
  Save,
  Search,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react'
import Breadcrumb from '../../components/breadcrumb'
import {
  clearSidebarAdminFeedback,
  getDashboardUsers,
  getRoutePermissions,
  selectAdminSidebar,
  updateRoutePermissions,
} from '../../../redux/slices/admin/sidebar'
import { APP_ROUTES } from '../../routes/app-routes'

/* ─────────────────────────────────────────────────────────
   Route groups — derive from APP_ROUTES automatically
───────────────────────────────────────────────────────── */
const ROUTE_GROUPS = [
  {
    label: 'Dashboard',
    key: 'dashboard',
    color: 'bg-violet-100 text-violet-700',
    match: (p) => p === '/dashboard',
  },
  {
    label: 'User Management',
    key: 'users',
    color: 'bg-blue-100 text-blue-700',
    match: (p) => p.startsWith('/user'),
  },
  {
    label: 'Admin',
    key: 'admin',
    color: 'bg-rose-100 text-rose-700',
    match: (p) =>
      ['/manage-menu', '/additional-fields', '/gst-management', '/gst-page', '/hotel-bookings', '/manage-route-access'].includes(p) ||
      p.startsWith('/admin'),
  },
  {
    label: 'PMS Bookings',
    key: 'pms',
    color: 'bg-amber-100 text-amber-700',
    match: (p) => p.startsWith('/your-bookings') || p.startsWith('/panel-booking'),
  },
  {
    label: 'Booking Creation',
    key: 'booking',
    color: 'bg-teal-100 text-teal-700',
    match: (p) => p.startsWith('/booking-creation'),
  },
  {
    label: 'TMS — Cars',
    key: 'cars',
    color: 'bg-orange-100 text-orange-700',
    match: (p) =>
      ['/add-a-car', '/your-cars', '/cars-owner', '/travel-bookings', '/car-booking', '/admin-travel-bookings'].includes(p) ||
      p.startsWith('/your-cars/'),
  },
  {
    label: 'TMS — Tours',
    key: 'tours',
    color: 'bg-emerald-100 text-emerald-700',
    match: (p) => p.startsWith('/tours'),
  },
  {
    label: 'Messenger',
    key: 'messenger',
    color: 'bg-sky-100 text-sky-700',
    match: (p) => p === '/messenger',
  },
]

const groupRoutes = (routes) => {
  const grouped = {}
  const ungrouped = []

  for (const route of routes) {
    const group = ROUTE_GROUPS.find((g) => g.match(route.path))
    if (group) {
      grouped[group.key] = grouped[group.key] || []
      grouped[group.key].push(route)
    } else {
      ungrouped.push(route)
    }
  }

  const result = ROUTE_GROUPS.filter((g) => grouped[g.key]?.length).map((g) => ({
    ...g,
    routes: grouped[g.key],
  }))

  if (ungrouped.length) {
    result.push({
      label: 'Other',
      key: 'other',
      color: 'bg-slate-100 text-slate-600',
      routes: ungrouped,
    })
  }

  return result
}

const humanizeRoute = (path) => {
  if (path === '/') return 'Home'
  return path
    .replace(/\/:(\w+)/g, ' › :$1')
    .split('/')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' '))
    .join(' / ')
}

/* ─────────────────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────────────────── */
const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${
      checked ? 'bg-emerald-500' : 'bg-slate-200'
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-[18px]' : 'translate-x-[3px]'
      }`}
    />
  </button>
)

const RouteRow = ({ route, allowed, onToggle }) => {
  const isDynamic = route.path.includes(':')
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-white px-4 py-3 hover:border-slate-200 transition-colors">
      <div className="flex items-center gap-2.5 min-w-0">
        <Route size={14} className="shrink-0 text-slate-400" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {humanizeRoute(route.path)}
          </p>
          <p className="text-[11px] font-mono text-slate-400 truncate">{route.path}</p>
        </div>
        {isDynamic && (
          <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
            dynamic
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className={`text-[11px] font-semibold ${allowed ? 'text-emerald-600' : 'text-slate-400'}`}>
          {allowed ? 'Allowed' : 'Blocked'}
        </span>
        <ToggleSwitch checked={allowed} onChange={onToggle} />
      </div>
    </div>
  )
}

const RouteGroup = ({ group, allowedSet, onToggle, onToggleGroup }) => {
  const [open, setOpen] = useState(true)
  const allAllowed = group.routes.every((r) => allowedSet.has(r.path))
  const someAllowed = group.routes.some((r) => allowedSet.has(r.path))

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {/* Group Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          {open ? (
            <ChevronDown size={15} className="shrink-0 text-slate-400" />
          ) : (
            <ChevronRight size={15} className="shrink-0 text-slate-400" />
          )}
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-extrabold uppercase tracking-wider ${group.color}`}>
            {group.label}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            {group.routes.length} route{group.routes.length !== 1 ? 's' : ''}
          </span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-semibold text-slate-500">
            {allAllowed ? 'All allowed' : someAllowed ? 'Partial' : 'All blocked'}
          </span>
          <button
            type="button"
            onClick={() => onToggleGroup(group.routes.map((r) => r.path), !allAllowed)}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold transition-all ${
              allAllowed
                ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {allAllowed ? 'Block All' : 'Allow All'}
          </button>
        </div>
      </div>

      {/* Route rows */}
      {open && (
        <div className="border-t border-slate-200 bg-white p-3 space-y-2">
          {group.routes.map((route) => (
            <RouteRow
              key={route.path}
              route={route}
              allowed={allowedSet.has(route.path)}
              onToggle={() => onToggle(route.path)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function ManageRouteAccess() {
  const dispatch = useDispatch()
  const {
    users,
    routePermissions,
    loadingUsers,
    loadingRoutePermissions,
    savingRoutePermissions,
    successMessage,
    error,
  } = useSelector(selectAdminSidebar)

  const [selectedUserId, setSelectedUserId] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [routeSearch, setRouteSearch] = useState('')
  const [allowedSet, setAllowedSet] = useState(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const [feedback, setFeedback] = useState(null)

  // All app routes
  const allRoutes = useMemo(() => APP_ROUTES, [])
  const groupedRoutes = useMemo(() => groupRoutes(allRoutes), [allRoutes])

  // Filtered groups based on search
  const filteredGroups = useMemo(() => {
    if (!routeSearch.trim()) return groupedRoutes
    const q = routeSearch.toLowerCase()
    return groupedRoutes
      .map((g) => ({
        ...g,
        routes: g.routes.filter(
          (r) =>
            r.path.toLowerCase().includes(q) ||
            humanizeRoute(r.path).toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.routes.length > 0)
  }, [groupedRoutes, routeSearch])

  // Filtered users by search
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return users
    const q = userSearch.toLowerCase()
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q),
    )
  }, [users, userSearch])

  useEffect(() => {
    dispatch(getDashboardUsers())
  }, [dispatch])

  // When user selected, load their route permissions
  useEffect(() => {
    if (!selectedUserId) {
      setAllowedSet(new Set(allRoutes.map((r) => r.path))) // default: all allowed
      setHasChanges(false)
      return
    }
    dispatch(getRoutePermissions(selectedUserId))
  }, [selectedUserId, dispatch, allRoutes])

  // Sync permissions from store
  useEffect(() => {
    if (!selectedUserId) return

    if (routePermissions) {
      const allowed = routePermissions.allowedRoutes
      if (Array.isArray(allowed) && allowed.length > 0) {
        setAllowedSet(new Set(allowed))
      } else if (Array.isArray(routePermissions.blockedRoutes) && routePermissions.blockedRoutes.length > 0) {
        // If only blocked are set, derive allowed
        const blocked = new Set(routePermissions.blockedRoutes)
        setAllowedSet(new Set(allRoutes.map((r) => r.path).filter((p) => !blocked.has(p))))
      } else {
        // No config yet — all allowed by default
        setAllowedSet(new Set(allRoutes.map((r) => r.path)))
      }
    } else {
      setAllowedSet(new Set(allRoutes.map((r) => r.path)))
    }
    setHasChanges(false)
  }, [routePermissions, selectedUserId, allRoutes])

  // Feedback
  useEffect(() => {
    if (successMessage) {
      setFeedback({ type: 'success', message: successMessage })
      const t = setTimeout(() => {
        setFeedback(null)
        dispatch(clearSidebarAdminFeedback())
      }, 3000)
      return () => clearTimeout(t)
    }
    if (error) {
      setFeedback({ type: 'error', message: error })
    }
  }, [successMessage, error, dispatch])

  const toggleRoute = (path) => {
    setAllowedSet((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
    setHasChanges(true)
  }

  const toggleGroup = (paths, allow) => {
    setAllowedSet((prev) => {
      const next = new Set(prev)
      paths.forEach((p) => (allow ? next.add(p) : next.delete(p)))
      return next
    })
    setHasChanges(true)
  }

  const allowAll = () => {
    setAllowedSet(new Set(allRoutes.map((r) => r.path)))
    setHasChanges(true)
  }

  const blockAll = () => {
    setAllowedSet(new Set())
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!selectedUserId) return
    const allowedRoutes = [...allowedSet]
    const blockedRoutes = allRoutes.map((r) => r.path).filter((p) => !allowedSet.has(p))
    dispatch(updateRoutePermissions({ userId: selectedUserId, allowedRoutes, blockedRoutes }))
    setHasChanges(false)
  }

  const selectedUser = users.find((u) => (u._id || u.id) === selectedUserId)
  const allowedCount = allowedSet.size
  const totalCount = allRoutes.length

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-900">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <Breadcrumb />

        {/* Page Header */}
        <div className="mt-4 mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={20} className="text-indigo-600" />
              <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-indigo-600">Admin</p>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Manage Route Access
            </h1>
            <p className="mt-1.5 text-sm font-medium text-slate-500">
              Grant or revoke access to specific routes for each user.
            </p>
          </div>

          {selectedUserId && hasChanges && (
            <button
              onClick={handleSave}
              disabled={savingRoutePermissions}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              <Save size={15} />
              {savingRoutePermissions ? 'Saving…' : 'Save Permissions'}
            </button>
          )}
        </div>

        {/* Feedback Banner */}
        {feedback && (
          <div
            className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
              feedback.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? <Check size={15} /> : <X size={15} />}
              {feedback.message}
            </div>
            <button onClick={() => setFeedback(null)} className="shrink-0 opacity-60 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
          {/* ── Left Panel: User Selector ── */}
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/50 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Users size={15} className="text-slate-500" />
                  <h2 className="text-sm font-extrabold text-slate-900">Select User</h2>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">Choose a user to manage their route access</p>
              </div>

              <div className="p-3">
                <div className="relative mb-3">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/10"
                  />
                </div>

                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8 text-slate-400">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  </div>
                ) : (
                  <div className="max-h-[420px] overflow-y-auto space-y-1 pr-1">
                    {filteredUsers.length === 0 ? (
                      <p className="py-4 text-center text-sm text-slate-400">No users found</p>
                    ) : (
                      filteredUsers.map((user) => {
                        const uid = user._id || user.id
                        const isSelected = selectedUserId === uid
                        return (
                          <button
                            key={uid}
                            type="button"
                            onClick={() => setSelectedUserId(uid)}
                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                              {(user.name || user.email || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`truncate text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {user.name || user.email || 'Unknown User'}
                              </p>
                              {user.name && (
                                <p className={`truncate text-[11px] ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                  {user.email}
                                </p>
                              )}
                            </div>
                            {user.role && (
                              <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {user.role}
                              </span>
                            )}
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Stats card */}
            {selectedUserId && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-indigo-500" />
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-600">Access Summary</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
                    <p className="text-2xl font-extrabold text-emerald-600">{allowedCount}</p>
                    <p className="text-[11px] font-bold text-emerald-600">Allowed</p>
                  </div>
                  <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-center">
                    <p className="text-2xl font-extrabold text-rose-500">{totalCount - allowedCount}</p>
                    <p className="text-[11px] font-bold text-rose-500">Blocked</p>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${totalCount > 0 ? (allowedCount / totalCount) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-center text-[11px] text-slate-500 font-medium">
                  {totalCount > 0 ? Math.round((allowedCount / totalCount) * 100) : 0}% access granted
                </p>
              </div>
            )}
          </aside>

          {/* ── Right Panel: Route List ── */}
          <main>
            {!selectedUserId ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center">
                <div>
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                    <Lock size={22} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">Select a user to manage their route access</p>
                </div>
              </div>
            ) : loadingRoutePermissions ? (
              <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                  <span className="text-sm font-medium">Loading permissions…</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="relative min-w-0 flex-1 max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search routes…"
                      value={routeSearch}
                      onChange={(e) => setRouteSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-400/10"
                    />
                    {routeSearch && (
                      <button onClick={() => setRouteSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={allowAll}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <LockOpen size={13} /> Allow All
                    </button>
                    <button
                      onClick={blockAll}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Lock size={13} /> Block All
                    </button>
                    {hasChanges && (
                      <button
                        onClick={handleSave}
                        disabled={savingRoutePermissions}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-60 transition-colors"
                      >
                        <Save size={13} />
                        {savingRoutePermissions ? 'Saving…' : 'Save'}
                      </button>
                    )}
                  </div>
                </div>

                {/* User context badge */}
                {selectedUser && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-extrabold text-indigo-700">
                      {(selectedUser.name || selectedUser.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      Managing access for{' '}
                      <span className="text-slate-900">{selectedUser.name || selectedUser.email}</span>
                      {selectedUser.role && (
                        <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                          {selectedUser.role}
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* Route Groups */}
                {filteredGroups.length === 0 ? (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-slate-400">
                    <p className="text-sm font-medium">No routes match your search</p>
                  </div>
                ) : (
                  filteredGroups.map((group) => (
                    <RouteGroup
                      key={group.key}
                      group={group}
                      allowedSet={allowedSet}
                      onToggle={toggleRoute}
                      onToggleGroup={toggleGroup}
                    />
                  ))
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
