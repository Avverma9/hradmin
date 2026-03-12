# Create Booking AI Guide

Ye file `Create Booking` flow ka end-to-end guide hai. Isme current codebase ke hisaab se:

- user mobile se search kaise hota hai
- user nahi mile to create kaise hota hai
- hotel select kaise hota hai
- room/food/coupon/GST pricing kaise calculate hoti hai
- final booking kaunsi API se create hoti hai
- current implementation me monthly price kahan available hai aur kahan use nahi ho rahi

Base API URL:

```txt
https://hotelroomsstay.com/api
```

---

## 1. Entry Point

Create booking screen:

- `src/components/settings/booking/create_booking.jsx`
- route page wrapper: `src/components/pages/admin/booking_createForm.jsx`

Main flow:

1. user mobile number enter karta hai
2. mobile se existing user fetch hota hai
3. user mil gaya to usi user ke liye booking continue hoti hai
4. user nahi mila to new user create hota hai
5. uske baad hotel list aati hai
6. hotel select hota hai
7. room/food/date/guests select hote hain
8. GST fetch hota hai
9. coupon apply hota hai
10. final booking create hoti hai

---

## 2. User Search by Mobile

Frontend component:

- `src/components/settings/booking/create_booking.jsx`
- Redux thunk: `src/components/redux/reducers/user.js`

### API

- Method: `GET`
- Endpoint:

```txt
/get/user/by/query?mobile=9876543210
```

### Frontend trigger

`handleFindUser()` mobile number se ye thunk dispatch karta hai:

```js
dispatch(findUser({ mobile }));
```

### Request example

```http
GET /get/user/by/query?mobile=9876543210
Authorization: <rs_token>
```

### Expected response shape

Reducer `response.data.data` use karta hai, isliye practical response array/object inside `data` expected hai.

Possible example:

```json
{
  "data": [
    {
      "_id": "66751804def0b0b1d2f0d672",
      "userId": "66751804def0b0b1d2f0d672",
      "userName": "Aman",
      "email": "aman@example.com",
      "mobile": "9876543210"
    }
  ]
}
```

### UI behavior

- agar user milta hai to card list me show hota hai
- button: `Make Booking For This User`
- click par session values set hoti hain:

```txt
subn = user.mobile
subid = user.userId || user._id
```

Uske baad hotel selection screen open hoti hai.

---

## 3. User Not Found -> Create User

Frontend:

- same file: `src/components/settings/booking/create_booking.jsx`
- embedded form: `AddUserForm`
- standalone helper file bhi hai: `src/components/settings/booking/add-user.jsx`

### API

- Method: `POST`
- Endpoint:

```txt
/Signup
```

### Request type

- `multipart/form-data`

### Request fields

```txt
userName
mobile
email
password
address
images
```

### Request example

```txt
POST /Signup
Content-Type: multipart/form-data
```

Form fields:

```json
{
  "userName": "Aman",
  "mobile": "9876543210",
  "email": "aman@example.com",
  "password": "password123",
  "address": "Delhi",
  "images": "<file>"
}
```

### Response expectation

Current code ye check karta hai:

```js
if (response.data && response.data.user) {
  onUserCreated(response.data.user);
}
```

Isliye expected response:

```json
{
  "message": "User created successfully",
  "user": {
    "_id": "66751804def0b0b1d2f0d672",
    "userId": "66751804def0b0b1d2f0d672",
    "userName": "Aman",
    "mobile": "9876543210",
    "email": "aman@example.com"
  }
}
```

### Important flow note

User create hone ke baad code direct returned `user` object se booking continue karta hai. Re-fetch immediately nahi hota.

Lekin agar tum robust AI flow banana chahte ho to recommended sequence ye hai:

1. `GET /get/user/by/query?mobile=...`
2. not found -> `POST /Signup`
3. success ke baad fir se `GET /get/user/by/query?mobile=...`
4. fetched user ke `_id` se booking continue karo

Ye safer hai because backend final normalized user object de sakta hai.

---

## 4. Hotel List and Hotel Selection

Frontend:

- `src/components/settings/booking/hotel.jsx`
- Redux thunk: `getAllHotels`

### API

- Method: `GET`
- Endpoint:

```txt
/get/all/hotels
```

### Response shape

Reducer `response.data` se array extract karta hai. Typical hotel object fields:

```json
{
  "_id": "hotelDocId",
  "hotelId": "hotelBusinessId",
  "hotelName": "Hotel Sunrise",
  "city": "Delhi",
  "state": "Delhi",
  "hotelEmail": "hotel@example.com",
  "hotelOwnerName": "Owner Name",
  "destination": "Some Address",
  "rooms": [],
  "foods": [],
  "images": []
}
```

### UI behavior

- search by hotel name/city/state/landmark
- city filter
- hotel card `Book Now`

On click:

```js
sessionStorage.setItem("subhotelId", hotelId);
navigate(`/book-now-page/${hotelId}`);
```

---

## 5. Selected Hotel Details Fetch

Frontend:

- `src/components/settings/booking/book-now.jsx`
- Redux thunk: `getHotelById`

### API

- Method: `GET`
- Endpoint:

```txt
/hotels/get-by-id/:hotelId
```

Example:

```txt
/hotels/get-by-id/HTL12345
```

### Use

Is API se selected hotel ka full detail aata hai:

- images
- rooms
- foods
- amenities
- hotelEmail
- hotelOwnerName
- destination
- city

Ye data booking summary component ko pass hota hai.

---

## 6. Booking Builder Screen

Frontend:

- `src/components/settings/booking/bookingDetails.jsx`

Yahan user ye values select karta hai:

- check-in date
- check-out date
- number of rooms
- guests
- room
- optional food
- coupon code

Session values used:

```txt
subid      -> selected user id
subhotelId -> selected hotel id
```

---

## 7. Pricing Calculation Logic

Current implementation me pricing logic frontend me hai.

### 7.1 Room Price

Formula:

```txt
room price = room.price * numRooms * totalNights
```

Example:

```txt
room.price = 2000
numRooms = 2
nights = 3
room total = 2000 * 2 * 3 = 12000
```

### 7.2 Food Price

Current logic:

```txt
food price = selected food.price * totalNights
```

Note:

- food quantity per guest/per room handle nahi ho rahi
- sirf selected food item ka per-day style cost add ho raha hai

### 7.3 GST Calculation

GST room price threshold ke hisaab se fetch hota hai.

API:

- Method: `GET`
- Endpoint:

```txt
/gst/get-single-gst?type=Hotel&gstThreshold=<roomPriceBeforeDiscount>
```

Example:

```txt
/gst/get-single-gst?type=Hotel&gstThreshold=12000
```

Response example:

```json
{
  "_id": "gstId",
  "type": "Hotel",
  "gstPrice": 18,
  "gstMinThreshold": 1000,
  "gstMaxThreshold": 50000
}
```

Frontend formula:

```txt
gst amount = roomPriceBeforeDiscount * gstPercent / 100
```

Important:

- GST room price pe calculate ho rahi hai
- discount ke baad nahi, discount se pehle room amount par
- food par GST current code me separately compute nahi ho raha

### 7.4 Coupon Discount

API:

- Method: `PATCH`
- Endpoint:

```txt
/apply/a/coupon-to-room
```

Request payload:

```json
{
  "couponCode": "SAVE500",
  "hotelIds": ["HTL12345"],
  "roomIds": ["ROOM001"],
  "userIds": ["66751804def0b0b1d2f0d672"],
  "type": "hotel"
}
```

Possible response example:

```json
[
  {
    "couponCode": "SAVE500",
    "discountPrice": 500,
    "originalPrice": 12000,
    "type": "hotel"
  }
]
```

Frontend current usage:

- `discountPrice` state set hota hai
- optional `discountPercentage` derive hota hai

### 7.5 Final Total

Current final formula:

```txt
final price = roomPriceBeforeDiscount + foodPrice + gstAmount - discountPrice
```

Example:

```txt
room total = 12000
food total = 1500
gst = 2160
coupon discount = 500

final = 12000 + 1500 + 2160 - 500 = 15160
```

---

## 8. Monthly Price

Monthly price ke liye separate APIs available hain:

- `GET /monthly-set-room-price/get/by/:hotelId`
- `POST /monthly-set-room-price/:hotelId/:roomId`
- `DELETE /monthly-set-room-price/delete/price/by/:id`

Configuration screen:

- `src/components/settings/monthly/monthly-price.jsx`
- `src/components/settings/monthly/pms-monthly.jsx`

### Important current implementation note

Current `Create Booking` flow me monthly price API call nahi ho rahi.

Iska matlab:

- booking creation ke waqt code direct `room.price` use kar raha hai
- koi monthly override lookup nahi ho raha
- agar date range me monthly price set hai, wo existing booking flow me automatically apply nahi hoti

### Agar monthly price integrate karni hai to recommended logic

Booking create se pehle:

1. selected hotel ke liye `GET /monthly-set-room-price/get/by/:hotelId`
2. selected room ka active price slab find karo
3. check karo `inDate` and `outDate` slab range me aate hain ya nahi
4. agar slab match kare to `room.price` ki jagah `monthPrice` use karo
5. fir GST threshold aur coupon calculation updated base price par karo

Recommended response assumption:

```json
[
  {
    "_id": "monthlyRuleId",
    "hotelId": "HTL12345",
    "roomId": "ROOM001",
    "startDate": "2026-03-01",
    "endDate": "2026-03-31",
    "monthPrice": 45000
  }
]
```

Recommended derived logic:

- agar monthly package price full period ke liye hai:
  `roomBasePrice = monthPrice`
- agar monthly price ko per-night equivalent banana ho:
  `roomBasePrice = monthPrice / slabDays * bookedDays`

Ye business rule backend se confirm karna chahiye, kyunki current code me ye rule defined nahi hai.

---

## 9. Final Booking Create

Frontend:

- component: `src/components/settings/booking/bookingDetails.jsx`
- thunk: `src/components/redux/reducers/booking.js`

### API

- Method: `POST`
- Endpoint:

```txt
/booking/:userId/:hotelId
```

Example:

```txt
/booking/66751804def0b0b1d2f0d672/HTL12345
```

### Current request payload

```json
{
  "checkInDate": "2026-03-12",
  "checkOutDate": "2026-03-15",
  "guests": 2,
  "numRooms": 1,
  "foodDetails": [
    {
      "foodId": "FOOD1",
      "name": "Breakfast",
      "price": 250
    }
  ],
  "roomDetails": [
    {
      "roomId": "ROOM001",
      "type": "Deluxe",
      "price": 2000
    }
  ],
  "discountPrice": 500,
  "hotelName": "Hotel Sunrise",
  "couponCode": "SAVE500",
  "hotelEmail": "hotel@example.com",
  "hotelOwnerName": "Owner Name",
  "gstPrice": 18,
  "createdBy": {
    "user": "Admin User",
    "email": "admin@example.com"
  },
  "destination": "Some Address",
  "hotelCity": "Delhi",
  "bookingSource": "Panel"
}
```

### Response expectation

Current UI success modal me `response.data` read hota hai:

```json
{
  "message": "Booking created successfully",
  "data": {
    "bookingId": "BK123456",
    "bookingStatus": "Confirmed"
  }
}
```

Success ke baad modal me show hota hai:

- booking id
- booking status

---

## 10. AI Flow You Should Build

Agar kisi AI assistant ya Copilot ko create-booking workflow banana ho, to recommended exact sequence ye hai:

### Step 1. User mobile lo

Input:

```txt
mobile number
```

Validation:

- required
- 10 digits

### Step 2. Existing user search karo

Call:

```txt
GET /get/user/by/query?mobile=<mobile>
```

Decision:

- user mil gaya -> step 4
- user nahi mila -> step 3

### Step 3. User create karo

Call:

```txt
POST /Signup
```

Then immediately:

```txt
GET /get/user/by/query?mobile=<mobile>
```

Reason:

- canonical user object chahiye
- `_id` / `userId` reliably capture karna hoga

### Step 4. Hotel list lao

Call:

```txt
GET /get/all/hotels
```

User actions:

- search hotel
- filter city
- select hotel

### Step 5. Selected hotel detail lao

Call:

```txt
GET /hotels/get-by-id/:hotelId
```

Use:

- room list
- food list
- hotel metadata

### Step 6. Room/date/guest select karvao

Required fields:

- roomId
- checkInDate
- checkOutDate
- numRooms
- guests

Optional:

- foodId

### Step 7. Monthly price check karo

Current code me missing hai, but AI flow me add karna chahiye:

```txt
GET /monthly-set-room-price/get/by/:hotelId
```

Then selected room/date range ke hisaab se active monthly override detect karo.

### Step 8. Base amount calculate karo

Recommended order:

1. resolve room base price
2. add food amount
3. GST threshold call karo on room amount
4. coupon apply karo
5. final amount nikalo

### Step 9. GST fetch karo

```txt
GET /gst/get-single-gst?type=Hotel&gstThreshold=<roomBaseAmount>
```

### Step 10. Coupon apply karo

```txt
PATCH /apply/a/coupon-to-room
```

Payload:

```json
{
  "couponCode": "SAVE500",
  "hotelIds": ["HTL12345"],
  "roomIds": ["ROOM001"],
  "userIds": ["66751804def0b0b1d2f0d672"],
  "type": "hotel"
}
```

### Step 11. Booking create karo

```txt
POST /booking/:userId/:hotelId
```

---

## 11. Recommended UI/Component Breakdown

AI-generated screen ko in components me todna best rahega:

1. `CreateBookingPage`
- holds current step
- user/mobile/hotel/booking state manage karta hai

2. `UserLookupSection`
- mobile input
- find button
- existing user list

3. `CreateUserForm`
- fallback when user not found

4. `HotelSelectionSection`
- hotel search
- city filter
- card list

5. `BookingBuilder`
- room select
- food select
- date range
- room/guest controls
- coupon input
- price summary

6. `BookingSuccessDialog`
- booking id
- status

---

## 12. Recommended State Shape

```js
const [mobile, setMobile] = useState("");
const [selectedUser, setSelectedUser] = useState(null);
const [selectedHotel, setSelectedHotel] = useState(null);
const [selectedRoom, setSelectedRoom] = useState(null);
const [selectedFood, setSelectedFood] = useState(null);
const [checkInDate, setCheckInDate] = useState(null);
const [checkOutDate, setCheckOutDate] = useState(null);
const [numRooms, setNumRooms] = useState(1);
const [guests, setGuests] = useState(1);
const [couponCode, setCouponCode] = useState("");
const [discountPrice, setDiscountPrice] = useState(0);
const [gstData, setGstData] = useState(null);
const [monthlyPriceRule, setMonthlyPriceRule] = useState(null);
const [bookingResult, setBookingResult] = useState(null);
```

---

## 13. Recommended AI Prompt / Copilot Prompt

```txt
Build a React create-booking workflow for this codebase using the same API and Redux patterns already used in:
- src/components/settings/booking/create_booking.jsx
- src/components/settings/booking/hotel.jsx
- src/components/settings/booking/book-now.jsx
- src/components/settings/booking/bookingDetails.jsx

Requirements:
- First ask for mobile number.
- Search existing user using GET /get/user/by/query?mobile=<mobile>.
- If user is not found, show a create user form and submit multipart/form-data to POST /Signup.
- After user creation, fetch the user again by mobile and continue with the fetched user object.
- Then fetch hotel list using GET /get/all/hotels.
- Allow hotel search and city filter.
- On hotel select, fetch hotel details using GET /hotels/get-by-id/:hotelId.
- Let the user choose room, optional food, dates, guests, and number of rooms.
- Before final pricing, check monthly room price using GET /monthly-set-room-price/get/by/:hotelId and apply the matching rule if a room/date range match exists.
- Fetch GST using GET /gst/get-single-gst?type=Hotel&gstThreshold=<roomAmount>.
- Apply coupon using PATCH /apply/a/coupon-to-room with couponCode, hotelIds, roomIds, userIds, and type=hotel.
- Create final booking using POST /booking/:userId/:hotelId.
- Show final booking summary and success modal with bookingId and bookingStatus.
- Use MUI components and match existing repo style.
- Keep logic split into small components and reusable helper functions.
- Handle loading, empty states, and API failures.
- Do not invent new APIs; only use the existing ones above.
```

---

## 14. Important Current Gaps

Ye points current codebase me dhyan dene layak hain:

1. User create ke baad re-fetch nahi hota
- current implementation direct `response.data.user` se proceed karta hai

2. Monthly price booking flow me integrated nahi hai
- APIs available hain, lekin booking total me use nahi ho rahi

3. GST room amount par lag raha hai
- food GST alag calculate nahi ho rahi

4. Coupon application backend dependent hai
- frontend `discountPrice` and `originalPrice` expect karta hai

5. Final booking payload me `finalPrice` explicitly send nahi ho raha
- backend probably room/discount/tax fields se derive karta hoga, ya payload me room details store karta hoga

---

## 15. Best Practice Recommendation

Production-ready booking flow ke liye recommended order:

1. user search/create
2. canonical user fetch
3. hotel detail fetch
4. room/date selection
5. monthly price resolution
6. GST fetch
7. coupon apply
8. final amount preview
9. create booking
10. success modal + details page link

