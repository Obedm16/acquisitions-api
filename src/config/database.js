import 'dotenv/config.js';

import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

if (process.env.NODE_ENV === 'development') {
  neonConfig.fetchEndpoint = 'http//neon-local:5432/sql';
  neonConfig.useSecureWebSocket = false;
  neonConfig.poolQueryViaFetch = true;
}

// Mock database for test environment
let sql, db;

if (process.env.NODE_ENV === 'test') {
  // Create mock database objects for testing
  sql = () => Promise.resolve([]);
  db = {
    select: () => ({ from: () => ({ where: () => Promise.resolve([]) }) }),
    insert: () => ({ values: () => Promise.resolve({ insertId: 1 }) }),
    update: () => ({ set: () => ({ where: () => Promise.resolve({ affectedRows: 1 }) }) }),
    delete: () => ({ where: () => Promise.resolve({ affectedRows: 1 }) })
  };
} else {
  sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
}

export { db, sql };
