// Configuration object for the application
export const config = {
  mysql: {
    host: '4.236.188.48',
    user: 'suitecrm_user',
    password: 'Jamfinnarc1776!',
    database: 'suitecrm',
    port: 3306
  },
  server: {
    port: parseInt(process.env.PORT || '5000', 10)
  }
};

// Validate required environment variables
export function validateConfig() {
  const { host, user, password, database } = config.mysql;
  if (!host || !user || !password || !database) {
    throw new Error('Missing required MySQL configuration');
  }
  return true;
}