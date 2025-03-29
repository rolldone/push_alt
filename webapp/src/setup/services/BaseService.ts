import request from 'superagent';

const BASE_API_URL = import.meta.env.VITE_PUBLIC_MASTER_DATA_API;
const superagent = request.agent();
superagent.set('Authorization', 'Bearer ' + window.localStorage.getItem("token") || "");

export default {
  superagent,
  URL: {
    'setup.submit': BASE_API_URL + '/api/setup/complete',
  }
}