6.1 Update patientService.js
File: src/services/api/patientService.js
javascriptconst getNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`, {
    params: { userType: 'PATIENT' }
  });
  return response.data.data;
};

const getUnreadNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}/unread`, {
    params: { userType: 'PATIENT' }
  });
  return response.data.data;
};

const markNotificationAsRead = async (notificationId, userId) => {
  const response = await api.put(`/notifications/${notificationId}/read`, null, {
    params: { 
      userId: userId,
      userType: 'PATIENT' 
    }
  });
  return response.data;
};

const markAllNotificationsAsRead = async (userId) => {
  const response = await api.put(`/notifications/user/${userId}/read-all`, null, {
    params: { userType: 'PATIENT' }
  });
  return response.data;
};
6.2 Update doctorService.js
javascriptconst getNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`, {
    params: { userType: 'DOCTOR' }
  });
  return response.data.data;
};

// ... similar pattern for other methods
6.3 Update adminService.js
javascriptconst getNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`, {
    params: { userType: 'ADMIN' }
  });
  return response.data.data;
};
6.4 Update supervisorService.js
javascriptconst getNotifications = async (userId) => {
  const response = await api.get(`/notifications/user/${userId}`, {
    params: { userType: 'MEDICAL_SUPERVISOR' }
  });
  return response.data.data;
};