import axios from 'axios';
import BASE_URL from './endpoints';
// import NetworkLogger from 'react-native-network-logger';

// NetworkLogger.startLogging();

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30s — configure-games API can be slow
  headers: {
    'Content-Type': 'application/json',
  },
});

import './interceptor';

export default client;