import Typesense from 'typesense';
import { SearchClient as TypesenseSearchClient } from 'typesense';

import { db } from './db';

const tsurl = 'https://cloud.uksouth.cloudapp.azure.com/search';

export const ts = new Typesense.Client({
	nodes: [
		{
			url: tsurl
		}
	],
	apiKey: 'Q61DTY8itfuij50zXXL7O1K0zCzcXznS',
	numRetries: 3,
	connectionTimeoutSeconds: 120,
	logLevel: 'debug'
});

export const createRecordsSchema = async () => {
	let schema = {
		name: 'records',
		fields: [{ name: '.*', type: 'auto' }]
	};

	await ts.collections().create(schema);
};

export const updateRecords = async () => {
	const records = await db.query(`SELECT * from files order by id`);
	await ts.collections('records').documents().import(records.rows, { action: 'upsert' });
	return;
};
