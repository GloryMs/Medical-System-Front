// File: src/utils/toast.js
// Toast notification utility using react-toastify

import { toast as reactToastify } from 'react-toastify';

export const toast = {
  success: (message, options = {}) => {
    reactToastify.success(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  error: (message, options = {}) => {
    reactToastify.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  warning: (message, options = {}) => {
    reactToastify.warning(message, {
      position: 'top-center',
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  info: (message, options = {}) => {
    reactToastify.info(message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    });
  },

  // Custom toast for subscription-related errors with redirect option
  subscriptionError: (message, navigateCallback) => {
    reactToastify.error(
      <div>
        <div className="font-semibold mb-1">{message}</div>
        <button
          onClick={() => {
            navigateCallback('/app/patient/subscription');
            reactToastify.dismiss();
          }}
          className="text-sm underline hover:no-underline"
        >
          Go to Subscription →
        </button>
      </div>,
      {
        position: 'top-center',
        autoClose: 7000,
        closeOnClick: false,
      }
    );
  }
};

// Default export
export default toast;