import pkg from 'pg';
import { env } from '$env/dynamic/private';
const { Pool } = pkg;

export const db = new Pool({
	connectionString: env.DB_URL,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
	ssl: {
		rejectUnauthorized: true
	}
});
