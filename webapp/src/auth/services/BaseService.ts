import request from 'superagent';

const BASE_API_URL = import.meta.env.VITE_PUBLIC_MASTER_DATA_API || "";
const superagent = request.agent();
superagent.set('Authorization', 'Bearer ' + window.localStorage.getItem("token") || "");

export default {
  superagent,
  URL: {
    'auth.login': BASE_API_URL + '/api/auth/login',
    'auth.logout': BASE_API_URL + '/api/auth/logout',
    // 'auth.register': BASE_API_URL + '/api/rollproject/at/auth/register',
    // 'auth.profile': BASE_API_URL + '/api/rollproject/at/auth/profile',

    // 'auth.profile.update': BASE_API_URL + '/api/rollproject/at/auth/profile/update',
    // 'auth.forgot_password': BASE_API_URL + '/api/rollproject/at/auth/forgot_password',
    // 'auth.logout': BASE_API_URL + "/api/rollproject/at/auth/logout"
  }
}