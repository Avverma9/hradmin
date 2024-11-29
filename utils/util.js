import { toast } from 'react-toastify';

export const searchQuery = [
  { name: 'Bookings', path: '/bookings' },
  { name: 'New Hotel Requests', path: '/request' },
  { name: 'Admin Profile', path: '/profile' },
  { name: 'Dashboard Users', path: '/dashboard-user' },
];

// export const localUrl = 'https://hotel-backend-tge7.onrender.com';
export const localUrl = 'http://localhost:5000';
export const hotelEmail = localStorage.getItem('user_email');
export const role = localStorage.getItem('user_role');
export const userId = localStorage.getItem('user_id');
export const userName = localStorage.getItem('user_name');
export const token = localStorage.getItem('rs_token');

export const notify = (statusCode) => {
  if (statusCode === 200 || statusCode === 201) {
    toast.success('Done');
  } else if (statusCode === 404) {
    toast.info('Not Found !');
  } else if (statusCode === 400) {
    toast.info('Bad Request !');
  }
};


// Utility function to show a simple Snackbar with a message
export const showSnackbar = (message, type = 'default') => {
  // Default configuration for Toast
  const config = {
    position: 'bottom-right', // You can change position
    autoClose: 5000, // Auto-close after 5 seconds
    hideProgressBar: true, // Optionally hide progress bar
    closeOnClick: true, // Close on click
    pauseOnHover: true, // Pause when hovering
    draggable: true, // Allow dragging
    progress: undefined,
  };

  // Conditional styling based on the message type (optional)
  switch (type) {
    case 'success':
      toast.success(message, config);
      break;
    case 'error':
      toast.error(message, config);
      break;
    case 'info':
      toast.info(message, config);
      break;
    case 'warning':
      toast.warning(message, config);
      break;
    default:
      toast(message, config);
  }
};
