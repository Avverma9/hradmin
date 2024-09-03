export const searchQuery = [
  { name: 'Bookings', path: '/bookings' },
  { name: 'New Hotel Requests', path: '/request' },
  { name: 'Admin Profile', path: '/profile' },
  { name: 'Dashboard Users', path: '/dashboard-user' },
];

export const localUrl = 'https://hotel-backend-tge7.onrender.com';
// localUrl = 'https://hotel-backend-tge7.onrender.com';
// localUrl = 'http://localhost:5000';
export const hotelEmail = localStorage.getItem('user_email')