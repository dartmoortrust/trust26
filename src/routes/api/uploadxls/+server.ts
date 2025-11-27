import { db } from '$lib/server/db.js';
import XLSX from 'xlsx';

export async function POST({ request }) {
	const formData = await request.formData();
	const file = formData.get('file') as File; // Type assertion

	if (!file) {
		return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
	}

	try {
		console.log('processing file');
		const buffer = await file.arrayBuffer();
		const workbook = XLSX.read(buffer, { type: 'buffer' });
		// Parse the first sheet
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const data = XLSX.utils.sheet_to_json(worksheet);
		let successCounter = 0;
		let errorList = [];
		for (const row of data) {
			let rowId = row.id + '.tif';
			console.log(rowId);
			const dbRow = await db.query(
				`
                UPDATE files
                SET
                    title = $2,
                    detail = $3,
                    location_name = $4,
                    date_year = $5,
                    date_month = $6,
                    date_day = $7
			    WHERE split_part(file_path,'/',-1) = $1
			`,
				[
					rowId,
					row.title,
					row.detail,
					row.location_name,
					row.date_year,
					row.date_month,
					row.date_day
				]
			);
			console.log(dbRow);
			if (dbRow.rows.length) {
				successCounter += 1;
			} else {
				errorList.push(row);
			}
		}
		return new Response(
			JSON.stringify({
				success: true,
				count: successCounter,
				errorList: errorList
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (error) {
		console.error(error);
		return new Response(JSON.stringify({ error: 'Failed to parse file' }), { status: 400 });
	}
}
