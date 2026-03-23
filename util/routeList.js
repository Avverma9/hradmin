/**
 * ROUTE LIST — Single source of truth for all application routes.
 * Used by manage-route-access.jsx for per-user route permissions.
 *
 * Fields per route:
 *   path        — exact React Router path string
 *   label       — human-readable display name
 *   description — short one-liner describing the page
 *   groupKey    — key that matches a ROUTE_GROUP entry
 *   isDynamic   — true when the path contains :param segments
 *   isAdmin     — true when the route is admin-only by nature
 */

export const ROUTE_LIST = [
  /* ── General ───────────────────────────────────────────── */
  {
    path: '/dashboard',
    label: 'Dashboard',
    description: 'Main overview & stats',
    groupKey: 'general',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/messenger',
    label: 'Messenger',
    description: 'Real-time chat between users',
    groupKey: 'general',
    isDynamic: false,
    isAdmin: false,
  },

  /* ── User Management ────────────────────────────────────── */
  {
    path: '/user',
    label: 'All Partners / Users',
    description: 'List of all dashboard users & partners',
    groupKey: 'users',
    isDynamic: false,
    isAdmin: false,
  },

  /* ── Admin ──────────────────────────────────────────────── */
  {
    path: '/manage-menu',
    label: 'Manage Sidebar Links',
    description: 'Add / edit / remove sidebar navigation links',
    groupKey: 'admin',
    isDynamic: false,
    isAdmin: true,
  },
  {
    path: '/admin/coupon',
    label: 'Coupon Management',
    description: 'Create and manage discount coupons',
    groupKey: 'admin',
    isDynamic: false,
    isAdmin: true,
  },
  {
    path: '/additional-fields',
    label: 'Additional Data Fields',
    description: 'Configure extra metadata fields',
    groupKey: 'admin',
    isDynamic: false,
    isAdmin: true,
  },
  {
    path: '/gst-management',
    label: 'GST Management',
    description: 'Configure GST slabs and settings',
    groupKey: 'admin',
    isDynamic: false,
    isAdmin: true,
  },
  {
    path: '/gst-page',
    label: 'GST Page (View)',
    description: 'Read-only GST overview page',
    groupKey: 'admin',
    isDynamic: false,
    isAdmin: true,
  },
  {
    path: '/hotel-bookings',
    label: 'Hotel Bookings (Admin)',
    description: 'Admin view of all hotel bookings',
    groupKey: 'admin',
    isDynamic: false,
    isAdmin: true,
  },
  {
    path: '/hotels/',
    label: 'All Hotels',
    description: 'Admin view of all hotels',
    groupKey: 'admin',
    isDynamic: false,
    isAdmin: true,
  },
  {
    path: '/hotels/:id',
    label: 'Hotel Details',
    description: 'Detailed view of a specific hotel by hotelId',
    groupKey: 'admin',
    isDynamic: true,
    isAdmin: true,
  },
  {
    path: '/manage-route-access',
    label: 'Manage Route Access',
    description: 'Grant / revoke route-level access per user',
    groupKey: 'admin',
    isDynamic: false,
    isAdmin: true,
  },

  /* ── PMS — Bookings ─────────────────────────────────────── */
  {
    path: '/your-bookings',
    label: 'Your Bookings',
    description: 'PMS: personal hotel booking list',
    groupKey: 'pms',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/panel-booking',
    label: 'Panel Booking',
    description: 'PMS: panel-level booking management',
    groupKey: 'pms',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/your-hotels',
    label: 'Your Hotels',
    description: 'PMS: hotels owned by the logged-in user',
    groupKey: 'pms',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/your-hotels/:id',
    label: 'Your Hotel Details',
    description: 'PMS: detail view of a hotel owned by the logged-in user',
    groupKey: 'pms',
    isDynamic: true,
    isAdmin: false,
  },

  /* ── Booking Creation ───────────────────────────────────── */
  {
    path: '/booking-creation',
    label: 'Find User',
    description: 'Step 1: search / identify a guest',
    groupKey: 'booking',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/booking-creation/hotels',
    label: 'Select Hotel',
    description: 'Step 2: pick a hotel for the booking',
    groupKey: 'booking',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/booking-creation/create-user',
    label: 'Create New Guest',
    description: 'Step 2b: register a new guest profile',
    groupKey: 'booking',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/booking-creation/book-hotel',
    label: 'Book Hotel',
    description: 'Step 3: confirm & submit the booking',
    groupKey: 'booking',
    isDynamic: false,
    isAdmin: false,
  },

  /* ── TMS — Cars ─────────────────────────────────────────── */
  {
    path: '/add-a-car',
    label: 'Add a Car',
    description: 'Register a new vehicle in TMS',
    groupKey: 'cars',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/your-cars',
    label: 'Your Cars',
    description: 'List of vehicles you own/manage',
    groupKey: 'cars',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/your-cars/:id',
    label: 'View Car',
    description: 'Detail view of a specific vehicle',
    groupKey: 'cars',
    isDynamic: true,
    isAdmin: false,
  },
  {
    path: '/your-cars/:id/edit',
    label: 'Edit Car',
    description: 'Edit vehicle details',
    groupKey: 'cars',
    isDynamic: true,
    isAdmin: false,
  },
  {
    path: '/cars-owner',
    label: 'Cars Owner',
    description: 'Manage vehicle ownership records',
    groupKey: 'cars',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/travel-bookings',
    label: 'Travel Bookings',
    description: 'Car/travel booking list for your vehicles',
    groupKey: 'cars',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/car-booking',
    label: 'All Cars (Browse)',
    description: 'Browse all available cars for booking',
    groupKey: 'cars',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/admin-travel-bookings',
    label: 'Admin: All Travel Bookings',
    description: 'Admin view of all travel/car bookings',
    groupKey: 'cars',
    isDynamic: false,
    isAdmin: true,
  },

  /* ── TMS — Tours ────────────────────────────────────────── */
  {
    path: '/tours-book',
    label: 'Browse & Book Tours',
    description: 'Explore tour packages and book seats with GST pricing',
    groupKey: 'tours',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/tours/:id',
    label: 'Browse & Book Tours',
    description: 'Explore tour packages and book seats with GST pricing',
    groupKey: 'tours',
    isDynamic: true,
    isAdmin: false,
  },
  {
    path: '/add-tour-data',
    label: 'Add Tour Package',
    description: 'Create a new tour package listing',
    groupKey: 'tours',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/my-tour',
    label: 'My Tours',
    description: 'Tour packages linked to your agency',
    groupKey: 'tours',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/my-tour/:id',
    label: 'View Tour',
    description: 'Detail page for a specific tour package',
    groupKey: 'tours',
    isDynamic: true,
    isAdmin: false,
  },
  
  {
    path: '/my-tour/:id/edit',
    label: 'Edit Tour',
    description: 'Edit a tour package',
    groupKey: 'tours',
    isDynamic: true,
    isAdmin: false,
  },
  {
    path: '/tour-booking/:id',
    label: 'Book Tour',
    description: 'Multi-step tour booking: seat selection, passenger details and GST pricing',
    groupKey: 'tours',
    isDynamic: true,
    isAdmin: false,
  },
  {
    path: '/admin/tour-bookings',
    label: 'All Tour Bookings',
    description: 'Admin view of all tour bookings across all agencies',
    groupKey: 'tours',
    isDynamic: false,
    isAdmin: true,
  },

  /* ── Complaints ─────────────────────────────────────────── */
  {
    path: '/complaints',
    label: 'All Complaints',
    description: 'Admin view of all hotel complaints',
    groupKey: 'complaints',
    isDynamic: false,
    isAdmin: true,
  },
  {
    path: '/complaint/create',
    label: 'File a Complaint',
    description: 'Submit a new complaint about a hotel',
    groupKey: 'complaints',
    isDynamic: false,
    isAdmin: false,
  },
  {
    path: '/complaint/chat/:id',
    label: 'Complaint Chat',
    description: 'Chat support for a specific complaint',
    groupKey: 'complaints',
    isDynamic: true,
    isAdmin: false,
  },
  {
    path: '/my-complaints',
    label: 'My Complaints',
    description: 'View and track complaints filed by the logged-in user',
    groupKey: 'complaints',
    isDynamic: false,
    isAdmin: false,
  },
]

/* ── Group Metadata ──────────────────────────────────────── */
export const ROUTE_GROUPS = [
  {
    key: 'general',
    label: 'General',
    color: 'bg-violet-100 text-violet-700',
    borderColor: 'border-violet-200',
  },
  {
    key: 'users',
    label: 'User Management',
    color: 'bg-blue-100 text-blue-700',
    borderColor: 'border-blue-200',
  },
  {
    key: 'admin',
    label: 'Admin',
    color: 'bg-rose-100 text-rose-700',
    borderColor: 'border-rose-200',
  },
  {
    key: 'pms',
    label: 'PMS — Bookings',
    color: 'bg-amber-100 text-amber-700',
    borderColor: 'border-amber-200',
  },
  {
    key: 'booking',
    label: 'Booking Creation',
    color: 'bg-teal-100 text-teal-700',
    borderColor: 'border-teal-200',
  },
  {
    key: 'cars',
    label: 'TMS — Cars',
    color: 'bg-orange-100 text-orange-700',
    borderColor: 'border-orange-200',
  },
  {
    key: 'tours',
    label: 'TMS — Tours',
    color: 'bg-emerald-100 text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  {
    key: 'complaints',
    label: 'Complaints',
    color: 'bg-rose-100 text-rose-700',
    borderColor: 'border-rose-200',
  },
]

/**
 * Returns ROUTE_LIST grouped by ROUTE_GROUPS order.
 * Each entry: { key, label, color, borderColor, routes: [...] }
 */
export const getGroupedRoutes = () => {
  const byKey = {}
  for (const route of ROUTE_LIST) {
    if (!byKey[route.groupKey]) byKey[route.groupKey] = []
    byKey[route.groupKey].push(route)
  }

  const result = []
  for (const group of ROUTE_GROUPS) {
    if (byKey[group.key]?.length) {
      result.push({ ...group, routes: byKey[group.key] })
    }
  }

  // Catch any routes whose groupKey doesn't match a ROUTE_GROUPS entry
  const knownKeys = new Set(ROUTE_GROUPS.map((g) => g.key))
  const ungrouped = ROUTE_LIST.filter((r) => !knownKeys.has(r.groupKey))
  if (ungrouped.length) {
    result.push({
      key: 'other',
      label: 'Other',
      color: 'bg-slate-100 text-slate-600',
      borderColor: 'border-slate-200',
      routes: ungrouped,
    })
  }

  return result
}

/** Flat list of all paths — useful for "all paths" sets */
export const ALL_ROUTE_PATHS = ROUTE_LIST.map((r) => r.path)
