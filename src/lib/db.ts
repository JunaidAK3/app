import mysql, { Pool } from 'mysql2/promise';

const {
  MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT
} = process.env;

declare global {
  // Allow caching for dev mode
  // eslint-disable-next-line no-var
  var __mysqlPool: Pool | undefined;
}

const createPool = (): Pool => {
  return mysql.createPool({
    host: MYSQL_HOST || 'localhost',
    user: MYSQL_USER || 'root',
    password: MYSQL_PASSWORD || '',
    database: MYSQL_DATABASE || 'next_crud',
    port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });
};

const pool: Pool = global.__mysqlPool || createPool();

if (process.env.NODE_ENV !== 'production') {
  global.__mysqlPool = pool;
}

export default pool;
