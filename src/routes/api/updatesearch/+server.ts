import { dev } from '$app/environment';
import { db } from '$lib/server/db.js';
import { createRecordsSchema, updateRecords } from '$lib/server/search.js';

export async function POST({ request }) {
	try {
		if (!dev) {
			return new Response(JSON.stringify({ error: 'We are in the dev environment' }), {
				status: 400
			});
		}
		// const formData = await request.formData();
		//await createRecordsSchema();
		await updateRecords();
		return new Response(
			JSON.stringify({
				success: true
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: error }), { status: 400 });
	}
}
