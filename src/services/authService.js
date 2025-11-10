import axios from 'axios';
const API_URL =
  'http://localhost:3002/api/v1/auth';
axios.interceptors.request.use(
  (
    config
  ) => {
    const token =
      localStorage.getItem(
        'token'
      );
    if (
      token
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (
    error
  ) => {
    return Promise.reject(
      error
    );
  }
);
export default {
  register(
    userData
  ) {
    return axios.post(
      `${API_URL}/sign-up`,
      {
        fullname:
          userData.fullname,
        email:
          userData.email,
        current_password:
          userData.current_password
      }
    );
  },
  verifyEmail(
    verificationData
  ) {
    return axios.post(
      `${API_URL}/verify-email`,
      {
        email:
          verificationData.email,
        verificationCode:
          verificationData.verificationCode
      }
    );
  },
  login(
    credentials
  ) {
    return axios.post(
      `${API_URL}/signin`,
      {
        email:
          credentials.email,
        password:
          credentials.password
      }
    );
  }
};
