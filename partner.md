# Partner Management

`Partner Management` page ka main UI [src/components/user/view/user-view.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/user-view.jsx#L204) me hai. Yahin se list load, search, add, edit, status toggle, aur delete actions trigger hote hain.

## Base config

- Base API URL: `https://hotelroomsstay.com/api`
  Reference: [utils/util.js](/home/avverma/Desktop/hradmin/utils/util.js#L7)
- Auth token: `sessionStorage.getItem('rs_token')`
  Reference: [utils/util.js](/home/avverma/Desktop/hradmin/utils/util.js#L12)
- Partner reducer sab requests me `Authorization` header bhejta hai. Agar token me `Bearer` missing ho to reducer khud prefix add kar deta hai.
  Reference: [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L6)

## Page load

Page open ya refresh state change par `dispatch(getAll())` call hota hai.
Reference: [src/components/user/view/user-view.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/user-view.jsx#L233)

### 1. Get all partners/users

- Method: `GET`
- Endpoint: `/login/dashboard/get/all/user`
- Full URL: `https://hotelroomsstay.com/api/login/dashboard/get/all/user`
- Trigger: page load
- Code:
  - [src/components/user/view/user-view.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/user-view.jsx#L233)
  - [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L107)

Request payload nahi hai.

Expected response list ko `state.partner.allData` me store kiya jaata hai.
Reference: [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L328)

## Search

Toolbar ke search action par `findPartnerByQuery(filterName.trim())` hit hota hai.
Reference: [src/components/user/view/user-view.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/user-view.jsx#L345)

### 2. Search partner/user

- Method: `GET`
- Endpoint: `/api/users-get-user/by/query?search=<query>`
- Example:

```http
GET /api/users-get-user/by/query?search=rahul
Authorization: Bearer <rs_token>
```

- Code: [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L298)

Request body nahi hai. Query param `search` use hota hai.

## Add Partner

`Add Partner` button se modal open hota hai. Modal form fields:
`name, email, mobile, address, city, state, pinCode, password, role, status, images`
Reference: [src/components/user/view/add-partner-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/add-partner-modal.jsx#L44)

Submit par modal `FormData` banata hai aur parent page `dispatch(addPartner(u)).unwrap()` call karta hai.
References:
- [src/components/user/view/add-partner-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/add-partner-modal.jsx#L116)
- [src/components/user/view/user-view.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/user-view.jsx#L520)

### 3. Create partner

- Method: `POST`
- Endpoint: `/create/dashboard/user`
- Content-Type: `multipart/form-data`
- Code: [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L59)

Payload fields:

```txt
name
email
mobile
address
city
state
pinCode
password
role
status
images   // optional file
```

Example payload:

```js
FormData {
  name: "Rahul Sharma",
  email: "rahul@example.com",
  mobile: "9876543210",
  address: "Sector 18",
  city: "Noida",
  state: "Uttar Pradesh",
  pinCode: "201301",
  password: "secret123",
  role: "Partner",
  status: true,
  images: <File>
}
```

Notes:

- Validation frontend par required fields: `name, email, mobile, role, password`
  Reference: [src/components/user/view/add-partner-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/add-partner-modal.jsx#L121)
- Empty/null fields append nahi hote.
  Reference: [src/components/user/view/add-partner-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/add-partner-modal.jsx#L126)

## Update Partner

Edit modal existing user data preload karta hai aur save par `_id` ke saath updated payload bhejta hai.
References:
- [src/components/user/view/edit-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/edit-modal.jsx#L103)
- [src/components/user/view/user-view.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/user-view.jsx#L530)

### 4. Update partner

- Method: `PATCH`
- Endpoint: `/update/dashboard/updated/partner/:userId`
- Content-Type: `multipart/form-data`
- Example: `/update/dashboard/updated/partner/65f123abc456`
- Code: [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L127)

Payload fields:

```txt
_id
name
email
mobile
address
city
state
pinCode
password   // optional, empty ho to remove kar diya jaata hai
role
status
images     // optional file
```

Example payload:

```js
{
  _id: "65f123abc456",
  name: "Rahul Sharma",
  email: "rahul@example.com",
  mobile: "9876543210",
  address: "Sector 18",
  city: "Noida",
  state: "Uttar Pradesh",
  pinCode: "201301",
  password: "newpass123",
  role: "Partner",
  status: true,
  images: <File | null>
}
```

Notes:

- Edit modal `password` blank ho to payload se delete kar deta hai.
  Reference: [src/components/user/view/edit-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/edit-modal.jsx#L240)
- Reducer helper `buildPartnerFormData` empty/null values skip karta hai aur `images` ko file hone par hi append karta hai.
  Reference: [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L21)

## Status Toggle

List row ke switch se status change hota hai.
Reference: [src/components/user/view/user-view.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/user-view.jsx#L280)

### 5. Update partner status

- Method: `PUT`
- Endpoint: `/update/dashboard/user-status/:userId`
- Code: [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L153)

Payload:

```json
{
  "status": true
}
```

Ya inactive ke liye:

```json
{
  "status": false
}
```

## Delete Partner

Single aur bulk delete dono same API ko use karte hain.
Reference: [src/components/user/view/user-view.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/user-view.jsx#L289)

### 6. Delete partner

- Method: `DELETE`
- Endpoint: `/delete/dashboard/delete/partner/:userId`
- Code: [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L176)

Request body nahi hai.

## Supporting APIs used inside Add/Edit flow

Ye APIs directly partner CRUD nahi hain, lekin `Partner Management` screen ko chalane ke liye use hoti hain.

### 7. Get role list for role dropdown

- Method: `GET`
- Endpoint: `/additional/roles`
- Used in:
  - Add modal role dropdown
  - Edit modal role dropdown
- Code:
  - [utils/additional/role.js](/home/avverma/Desktop/hradmin/utils/additional/role.js#L4)
  - [src/components/redux/reducers/additional-fields/additional.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/additional-fields/additional.js#L724)

Request body nahi hai.

### 8. Get sidebar menu items for permission assignment

- Method: `GET`
- Endpoint: `/additional/sidebar-links`
- Used in edit modal menu permission section
- Code:
  - [utils/additional/menuItems.js](/home/avverma/Desktop/hradmin/utils/additional/menuItems.js#L4)
  - [src/components/redux/reducers/additional-fields/additional.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/additional-fields/additional.js#L332)
  - [src/components/user/view/edit-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/edit-modal.jsx#L99)

Request body nahi hai.

### 9. Allow sidebar permissions to partner

- Method: `PATCH`
- Endpoint: `/additional/sidebar-permissions/:userId/allow`
- Code:
  - [src/components/user/view/edit-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/edit-modal.jsx#L178)
  - [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L219)

Payload:

```json
{
  "linkIds": ["linkId1", "linkId2", "linkId3"]
}
```

Frontend `matchedMenuItems` se sirf `_id` ya `id` extract karke `linkIds` bhejta hai.

### 10. Block one sidebar permission

- Method: `PATCH`
- Endpoint: `/additional/sidebar-permissions/:userId/block`
- Code:
  - [src/components/user/view/edit-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/edit-modal.jsx#L204)
  - [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L248)

Payload:

```json
{
  "linkIds": ["menuId"]
}
```

### 11. Reset all sidebar permissions

- Method: `PUT`
- Endpoint: `/additional/sidebar-permissions/:userId`
- Code:
  - [src/components/user/view/edit-modal.jsx](/home/avverma/Desktop/hradmin/src/components/user/view/edit-modal.jsx#L223)
  - [src/components/redux/reducers/partner.js](/home/avverma/Desktop/hradmin/src/components/redux/reducers/partner.js#L274)

Payload:

```json
{
  "mode": "role_based",
  "allowedLinkIds": [],
  "blockedLinkIds": []
}
```

## Flow summary

1. Page load par `GET /login/dashboard/get/all/user`
2. Search par `GET /api/users-get-user/by/query?search=...`
3. Add partner par `POST /create/dashboard/user`
4. Edit save par `PATCH /update/dashboard/updated/partner/:id`
5. Status switch par `PUT /update/dashboard/user-status/:id`
6. Delete par `DELETE /delete/dashboard/delete/partner/:id`
7. Edit modal open hone par supporting dropdown APIs:
   `GET /additional/roles` and `GET /additional/sidebar-links`
8. Permission add/remove/reset ke liye sidebar permission APIs

## Important implementation note

`Partner Management` page naam se feature hai, lekin backend endpoints generic `user` naming use kar rahe hain. Isliye frontend me partner page hone ke bawajood APIs jaise `/create/dashboard/user` aur `/login/dashboard/get/all/user` hit ho rahi hain.
