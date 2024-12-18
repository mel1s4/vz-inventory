import axios from 'axios';	

const restUrl = 'http://localhost/wp-json/vz-inventory/v1/';
const restNonce = 'vz-inventory-nonce';

const api = axios.create({
  baseURL: restUrl,
  headers: {
    'Content-Type': 'application/json',
    // 'X-WP-Nonce': restNonce
  },
});

export default api;