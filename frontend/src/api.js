import axios from 'axios';


const API = axios.create({
  baseURL: 'import.meta.env.VITE_API_URL',
});


let isRefreshing = false;
let pendingRequests = [];


const resolvePendingRequests = (
  error,
  token = null
) => {
  pendingRequests.forEach(
    ({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    }
  );

  pendingRequests = [];
};


const clearAuth = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  window.dispatchEvent(
    new Event('auth-expired')
  );
};


/* =========================================================
   REQUEST INTERCEPTOR
   ========================================================= */

API.interceptors.request.use(
  (config) => {
    const accessToken =
      localStorage.getItem('access_token');

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


/* =========================================================
   RESPONSE INTERCEPTOR
   ========================================================= */

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    const status =
      error.response?.status;


    if (
      status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(error);
    }


    const requestUrl =
      originalRequest.url || '';


    /*
     * Never attempt token refresh for:
     * - login
     * - refresh endpoint itself
     */
    if (
      requestUrl.includes('auth/login/') ||
      requestUrl.includes('auth/refresh/')
    ) {
      return Promise.reject(error);
    }


    if (originalRequest._retry) {
      clearAuth();

      return Promise.reject(error);
    }


    const refreshToken =
      localStorage.getItem(
        'refresh_token'
      );


    if (!refreshToken) {
      clearAuth();

      return Promise.reject(error);
    }


    /*
     * Another request is already refreshing.
     * Wait for that refresh instead of
     * sending another refresh request.
     */
    if (isRefreshing) {
      return new Promise(
        (resolve, reject) => {
          pendingRequests.push({
            resolve: (token) => {
              originalRequest.headers.Authorization =
                `Bearer ${token}`;

              resolve(
                API(originalRequest)
              );
            },

            reject,
          });
        }
      );
    }


    originalRequest._retry = true;

    isRefreshing = true;


    try {
      const response =
        await axios.post(
          'http://127.0.0.1:8000/api/auth/refresh/',
          {
            refresh: refreshToken,
          }
        );


      const newAccessToken =
        response.data.access;


      if (!newAccessToken) {
        throw new Error(
          'Refresh endpoint did not return an access token.'
        );
      }


      localStorage.setItem(
        'access_token',
        newAccessToken
      );


      /*
       * You enabled ROTATE_REFRESH_TOKENS.
       * If Django returns a new refresh token,
       * save it too.
       */
      if (response.data.refresh) {
        localStorage.setItem(
          'refresh_token',
          response.data.refresh
        );
      }


      resolvePendingRequests(
        null,
        newAccessToken
      );


      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;


      return API(
        originalRequest
      );

    } catch (refreshError) {
      resolvePendingRequests(
        refreshError,
        null
      );

      clearAuth();

      return Promise.reject(
        refreshError
      );

    } finally {
      isRefreshing = false;
    }
  }
);


export default API;