# Dashboard

Dashboard ka main page [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L21) me hai. Is page par greeting header, admin-only charts, dashboard shortcuts, aur PMS role ke liye extra `Rooms` section render hota hai.

## High-level layout

Dashboard ka overall shell 3 major parts me bana hai:

1. Top header
2. Left sidebar navigation
3. Main content area

Relevant files:

- Header: [src/components/dashboard/header.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/header.jsx#L23)
- Sidebar/Nav: [src/components/dashboard/nav.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/nav.jsx#L32)
- Main content wrapper: [src/components/dashboard/main.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/main.jsx#L13)
- Dashboard page body: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L21)

## Current UI / design

### Header UI

Header me ye cheezein hoti hain:

- mobile par hamburger menu
- search bar
- notifications popover
- account popover
- blurred app bar style

Reference: [src/components/dashboard/header.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/header.jsx#L28)

### Sidebar UI

Sidebar me ye render hota hai:

- logo top par
- logged-in user avatar, name, role card
- dynamic menu items
- nested child menus collapse/expand ke saath
- active route highlight

References:

- Account block: [src/components/dashboard/nav.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/nav.jsx#L56)
- Menu render: [src/components/dashboard/nav.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/nav.jsx#L92)
- Active state / collapse logic: [src/components/dashboard/nav.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/nav.jsx#L167)

### Main dashboard body

Dashboard body me order ye hai:

1. Welcome text: `Hi, Welcome back {name}`
2. Current date + time
3. Admin/Developer ke liye 3 charts
4. `Dashboard Shortcuts` section
5. PMS role ke liye `Rooms` component

Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L183)

## What charts are shown

Charts sirf `Admin` aur `Developer` roles ko dikhte hain.
Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L194)

### 1. Hotel chart

- Component: [src/components/overview/view/hotel-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/hotel-chart.jsx#L71)
- Type: `BarChart` from `recharts`
- Purpose: har month me kitne new hotels create hue
- X-axis: month (`Jan` to `Dec`)
- Y-axis: hotel count
- Filter: year dropdown, current year default
- Visual detail:
  - purple gradient bars
  - highest month green highlight
  - card title `Hotel`
  - subheader `Total in {year}: {total}`

Reference:
- chart transform: [src/components/overview/view/hotel-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/hotel-chart.jsx#L36)
- render: [src/components/overview/view/hotel-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/hotel-chart.jsx#L97)

### 2. Partner chart

- Component: [src/components/overview/view/partners-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/partners-chart.jsx#L87)
- Type: `LineChart`
- Purpose: month-wise partner registrations by role
- X-axis: month
- Y-axis: count
- Each role ke liye separate line
- Filter: year dropdown
- Visual detail:
  - multiple colored lines by role
  - legend visible
  - subheader me role-wise totals

Reference:
- transform: [src/components/overview/view/partners-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/partners-chart.jsx#L37)
- render: [src/components/overview/view/partners-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/partners-chart.jsx#L122)

### 3. Booking chart

- Component: [src/components/overview/view/bookings-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/bookings-chart.jsx#L80)
- Type: combo card
  - left: stacked `BarChart`
  - right: `PieChart`
- Purpose:
  - month-wise booking status breakdown
  - overall booking status distribution
- Status examples:
  - `Confirmed`
  - `Cancelled`
  - `Pending`
  - `Checked-in`
  - `Checked-out`
- Filter: year dropdown
- Visual detail:
  - left side stacked colored monthly bars
  - right side donut pie with total count center me

Reference:
- transform: [src/components/overview/view/bookings-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/bookings-chart.jsx#L40)
- status colors: [src/components/overview/view/bookings-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/bookings-chart.jsx#L71)
- render: [src/components/overview/view/bookings-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/bookings-chart.jsx#L109)

## Dashboard shortcut cards

Shortcut cards `AppWidgetSummary` se bante hain.
Reference: [src/components/overview/app-widget-summary.jsx](/home/avverma/Desktop/hradmin/src/components/overview/app-widget-summary.jsx#L12)

Current shortcut cards list:

- Bookings
- Users
- Hotels
- Reports
- Notifications
- Partners
- Messenger
- Coupons
- Availability
- Monthly Price
- Travel locations
- Reviews

Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L96)

Card UI:

- icon left me
- total/count large text me
- title niche muted text me
- MUI Card + Stack based layout

Reference: [src/components/overview/app-widget-summary.jsx](/home/avverma/Desktop/hradmin/src/components/overview/app-widget-summary.jsx#L14)

## Shortcut links kaise kaam karte hain

Dashboard shortcuts do level par control hote hain:

1. Card definitions dashboard page ke andar
2. Sidebar authorization/session ke basis par filtering

### Shortcut click routing

Har card title ko `handleWidgetClick` route map se resolve kiya jaata hai.
Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L64)

Examples:

- `Bookings` -> `/all-bookings` ya PMS ke liye `/your-bookings`
- `Hotels` -> `/your-hotels`
- `Users` -> `/all-users`
- `Partners` -> `/partners`
- `Messenger` -> `/messenger`
- `Reviews` -> `/all-reviews`

### Shortcut filtering

Frontend `sessionStorage.auth_items` read karta hai aur uske `title` values ko widget titles me map karta hai.
Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L61)

Mapping object:

```js
{
  "PMS Bookings": "Bookings",
  "PMS Hotels": "Hotels",
  "PMS Complaints": "Reports",
  "Messenger": "Messenger",
  "PMS Coupons": "Coupons",
  "PMS Monthly Price": "Monthly Price",
  "Dashboard": null
}
```

Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L163)

Rule:

- `Admin` / `Developer`: sab widgets dikhte hain
- baaki roles: sirf mapped allowed widgets dikhte hain

Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L178)

## Shortcut links kaise banake lagana hai

Is project me shortcut enable karne ka practical flow ye hai:

### Option 1: Existing dashboard shortcut card add/update karna

1. `widgets` array me new card add karo
   Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L96)
2. `handleWidgetClick` routes object me us title ka route add karo
   Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L64)
3. Agar non-admin roles ko bhi dikhana hai to `menuToWidgetMap` me mapping add karo
   Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L163)
4. Ensure us feature ka sidebar/menu authorization bhi available ho

Example:

```js
// widgets array
{
  title: "Tour Requests",
  color: "info",
  icon: <AirplaneTicketIcon sx={{ width: 56, height: 56 }} />
}

// route map
"Tour Requests": "/tour-requests"

// menuToWidgetMap
"Tour Requests": "Tour Requests"
```

### Option 2: Sidebar shortcut/menu create karke use dashboard me surface karna

Sidebar route definitions seed file me maintained hain.
Reference: [src/components/dashboard/sidebar-links-seed.js](/home/avverma/Desktop/hradmin/src/components/dashboard/sidebar-links-seed.js#L23)

Steps:

1. [src/components/dashboard/sidebar-links-seed.js](/home/avverma/Desktop/hradmin/src/components/dashboard/sidebar-links-seed.js#L23) me new route object add karo
2. Required fields:
   - `parentLink`
   - `title`
   - `path`
   - `icon`
   - `roles`
   - `order`
3. Admin login par missing sidebar links auto-seed hote hain via `POST /additional/sidebar-links/bulk`
   Reference: [src/components/dashboard/config-navigation.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/config-navigation.jsx#L424)
4. Agar dashboard shortcut card bhi chahiye, to `widgets`, `handleWidgetClick`, aur `menuToWidgetMap` me corresponding entry add karo

Seed entry example:

```js
{
  parentLink: "Admin Features",
  title: "Tour Requests",
  path: "/tour-requests",
  icon: "AirplaneTicketIcon",
  roles: ADMIN_ROLES,
  order: 37
}
```

### Sidebar se nav config kaise banta hai

Nav config dynamic API data se build hota hai:

1. role normalize hota hai
2. sidebar links fetch hote hain
3. links normalize, dedupe, sort hote hain
4. grouped nav config me convert hote hain
5. `Nav` component render karta hai

References:

- normalize + dedupe: [src/components/dashboard/config-navigation.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/config-navigation.jsx#L165)
- map to nav config: [src/components/dashboard/config-navigation.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/config-navigation.jsx#L252)
- fetch and cache: [src/components/dashboard/config-navigation.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/config-navigation.jsx#L454)
- nav render: [src/components/dashboard/nav.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/nav.jsx#L83)

## APIs used by dashboard

Base URL:

- `https://hotelroomsstay.com/api`
  Reference: [utils/util.js](/home/avverma/Desktop/hradmin/utils/util.js#L7)

Auth:

- charts/statistics calls me `Authorization: token`
  Reference: [src/components/redux/reducers/statistics/statistics.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/statistics/statistics.js#L9)

## Dashboard count APIs

Ye 3 calls dashboard load par parallel hit hoti hain.
Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L30)

### 1. Booking count

- Method: `GET`
- Endpoint: `/get-all/bookings-count`
- Full URL: `https://hotelroomsstay.com/api/get-all/bookings-count`
- Request body: none

Response:

```json
1234
```

This is directly inferred from `setBookingCount(bookingResponse.data)`.
Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L41)

### 2. Hotel count

- Method: `GET`
- Endpoint: `/get-hotels/count`
- Request body: none

Response:

```json
456
```

This is directly inferred from `setHotelCount(hotelResponse.data)`.
Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L42)

### 3. User count

- Method: `GET`
- Endpoint: `/get-total/user-details`
- Request body: none

Response:

```json
789
```

This is directly inferred from `setUserCount(userResponse.data)`.
Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L43)

## Statistics chart APIs

Redux thunks:

- [src/components/redux/reducers/statistics/statistics.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/statistics/statistics.js#L5)

### 4. Hotel yearly statistics

- Method: `GET`
- Endpoint: `/statistics/hotel-data?year=<year>`
- Example:

```http
GET /statistics/hotel-data?year=2026
Authorization: <token>
```

Request body: none

Response shape:

```json
[
  { "month": "2026-01", "count": 12 },
  { "month": "2026-02", "count": 18 },
  { "month": "2026-03", "count": 9 }
]
```

This response shape is inferred from `formatChartData()` reading `item.month` and `item.count`.
Reference: [src/components/overview/view/hotel-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/hotel-chart.jsx#L36)

### 5. Partner yearly statistics

- Method: `GET`
- Endpoint: `/statistics/partners-data?year=<year>`
- Example:

```http
GET /statistics/partners-data?year=2026
Authorization: <token>
```

Request body: none

Response shape:

```json
[
  { "month": "2026-01", "role": "Partner", "count": 4 },
  { "month": "2026-01", "role": "CA", "count": 2 },
  { "month": "2026-02", "role": "Partner", "count": 7 }
]
```

This response shape is inferred from `formatPartnerChartData()` reading `month`, `role`, and `count`.
Reference: [src/components/overview/view/partners-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/partners-chart.jsx#L37)

### 6. Booking yearly statistics

- Method: `GET`
- Endpoint: `/statistics/bookings-data?year=<year>`
- Example:

```http
GET /statistics/bookings-data?year=2026
Authorization: <token>
```

Request body: none

Response shape:

```json
[
  { "month": "2026-01", "status": "Confirmed", "count": 40 },
  { "month": "2026-01", "status": "Cancelled", "count": 5 },
  { "month": "2026-02", "status": "Pending", "count": 11 }
]
```

This response shape is inferred from `processBookingData()` reading `month`, `status`, and `count`.
Reference: [src/components/overview/view/bookings-chart.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/bookings-chart.jsx#L40)

## Sidebar / shortcut related APIs

Dashboard ke shortcut visibility aur sidebar dono dynamic sidebar APIs par depend karte hain.

### 7. Get grouped sidebar links by role

- Method: `GET`
- Endpoint: `/additional/sidebar-links/grouped`
- Query params:
  - `role=<normalizedRole>`
- Used in nav config fetch

Reference: [src/components/dashboard/config-navigation.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/config-navigation.jsx#L384)

Example:

```http
GET /additional/sidebar-links/grouped?role=Admin
Authorization: <rs_token>
```

Possible response shape:

```json
{
  "data": {
    "General": [
      { "_id": "1", "parentLink": "General", "childLink": "/dashboard", "icon": "MdDashboard", "status": "active", "order": 1 }
    ],
    "Admin Features": [
      { "_id": "2", "parentLink": "Admin Features", "childLink": "/all-bookings", "icon": "LocalActivityIcon", "status": "active", "order": 21 }
    ]
  }
}
```

This grouped shape is inferred from `extractGroupedPayload()` and `flattenGroupedSidebarLinks()`.

### 8. Get flat sidebar links

- Method: `GET`
- Endpoint: `/additional/sidebar-links`
- Query params:
  - `status=active`
  - `role=<role>` optional

Reference: [src/components/dashboard/config-navigation.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/config-navigation.jsx#L372)

Example:

```http
GET /additional/sidebar-links?status=active&role=Admin
Authorization: <rs_token>
```

Possible response shape:

```json
[
  {
    "_id": "1",
    "parentLink": "General",
    "childLink": "/dashboard",
    "icon": "MdDashboard",
    "status": "active",
    "order": 1
  }
]
```

### 9. Get effective sidebar links for a user

- Method: `GET`
- Endpoint: `/additional/sidebar-links/for-user/:userId`
- Query params:
  - `grouped=true`

Reference: [src/components/dashboard/config-navigation.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/config-navigation.jsx#L405)

Example:

```http
GET /additional/sidebar-links/for-user/65f123abc456?grouped=true
Authorization: <rs_token>
```

### 10. Auto seed missing sidebar links

- Method: `POST`
- Endpoint: `/additional/sidebar-links/bulk`
- Used only for admin-like roles when seed links missing hote hain

Reference: [src/components/dashboard/config-navigation.jsx](/home/avverma/Desktop/hradmin/src/components/dashboard/config-navigation.jsx#L424)

Payload:

```json
[
  {
    "parentLink": "General",
    "childLink": "/dashboard",
    "isParentOnly": false,
    "icon": "MdDashboard",
    "status": "active",
    "role": ["Admin", "Developer", "PMS", "TMS", "CA", "Rider"],
    "order": 1
  }
]
```

Payload source:
[src/components/dashboard/sidebar-links-seed.js](/home/avverma/Desktop/hradmin/src/components/dashboard/sidebar-links-seed.js#L70)

## Dashboard data flow summary

1. Dashboard mount hota hai
2. Counts ke liye 3 parallel APIs fire hoti hain
3. Current date/time local interval se update hota hai
4. Agar role `Admin` ya `Developer` hai to charts render hote hain
5. Har chart apna yearly stats API call karta hai
6. Shortcut cards render hote hain
7. Non-admin roles ke liye shortcuts `auth_items` mapping se filter hote hain
8. Sidebar nav dynamic APIs se build hota hai, fallback seed config available hai

## Practical notes

- `Reports` widget ka count abhi hardcoded `234` hai, API-driven nahi.
  Reference: [src/components/overview/view/dashboard-view.jsx](/home/avverma/Desktop/hradmin/src/components/overview/view/dashboard-view.jsx#L115)
- `Users` shortcut route `/all-users` hai, lekin sidebar seed me admin item `Manage Users` title use karta hai. Dashboard widget aur sidebar title exact same hona zaroori nahi.
- `Partners` widget route `/partners` par jaata hai, jabki sidebar seed me partner route `/user` defined hai. Ye existing route naming mismatch hai jise future cleanup me normalize karna chahiye.
