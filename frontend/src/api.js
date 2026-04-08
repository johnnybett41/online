import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalizedApiUrl = rawApiUrl.replace(/^htpps:\/\//i, 'https://');

if (normalizedApiUrl !== rawApiUrl) {
  console.warn(`Fixed malformed API URL: ${rawApiUrl} -> ${normalizedApiUrl}`);
}

axios.defaults.baseURL = normalizedApiUrl;
axios.defaults.timeout = 10_000; // quicker failover for snappier UI feedback
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

export default axios;
