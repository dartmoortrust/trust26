import * as v from 'valibot';
import { form, prerender, query } from '$app/server';
import { db } from '$lib/server/db';
import { ts } from '$lib/server/search';

export const getRecord = query(v.string(), async (id) => {
	const file = await db.query(
		`
        SELECT 
			f.id, f.title, f.date_year, f.date_month, f.date_day, f.date_estimated, f.detail, f.public, f.caption_front, f.caption_back,
			ST_X(f.location_geom) as location_x, ST_Y(f.location_geom) as location_y, f.location_name, f.ai_markdown, f.notes,
			f.location_estimated, f.transform,
			c.title as coltitle, c.id as colid
        FROM files f
		JOIN fonds c
		ON f.collection_id = c.id
        WHERE f.id = $1    
    `,
		[id]
	);
	return file.rows[0];
});

export const getRecords = query(async () => {
	const records = await db.query(
		`
        SELECT title, id
        FROM files
		WHERE title is not null
        LIMIT 10
    `
	);
	return records.rows;
});

export const updateRecord = form(
	v.object({
		title: v.pipe(v.string(), v.nonEmpty('A title is required')),
		id: v.pipe(v.string(), v.nonEmpty()),
		caption_front: v.pipe(v.string()),
		caption_back: v.pipe(v.string()),
		detail: v.pipe(v.string(), v.minWords('en', 5, 'Please write at least 5 words.')),
		date_year: v.optional(
			v.pipe(
				v.number(),
				v.transform((input) => String(input)),
				v.length(4, 'The year must be 4 digits long.'),
				v.transform((input) => Number(input)),
				v.maxValue(new Date().getFullYear(), 'The year cannot be in the future')
			)
		),
		date_month: v.optional(
			v.pipe(
				v.number(),
				v.maxValue(12, 'The month cannot be more than 12'),
				v.minValue(1, 'The month cannot be less than 1')
			)
		),
		date_day: v.optional(
			v.pipe(
				v.number(),
				v.maxValue(12, 'The day cannot be more than 31'),
				v.minValue(1, 'The day cannot be less than 1')
			)
		),
		date_estimated: v.optional(v.boolean(), false),
		location_estimated: v.optional(v.boolean(), false),

		location_x: v.optional(v.pipe(v.number())),
		location_y: v.optional(v.pipe(v.number())),
		notes: v.string()
	}),
	async ({
		id,
		title,
		caption_front,
		caption_back,
		detail,
		date_year,
		date_month,
		date_day,
		date_estimated,
		location_estimated,
		location_x,
		location_y,
		notes
	}) => {
		// Insert into the database
		console.log('saving');
		let geom = location_x && location_y ? `POINT(${location_x} ${location_y})` : null;
		try {
			let res = await db.query(
				`
			UPDATE files
			SET
				title = $2,
				caption_front = $3,
				caption_back = $4,
				detail = $5,
				date_year = $6,
				date_month = $7,
				date_day = $8,
				date_estimated = $9,
				location_geom =
					CASE
						WHEN $10 = null THEN null
						ELSE ST_GeomFromText($10, 4326)
					END,
				location_estimated = $11,
				notes= $12
			WHERE
				id = $1
		`,
				[
					id, //1
					title,
					caption_front,
					caption_back,
					detail, //5
					date_year,
					date_month,
					date_day,
					date_estimated,
					geom, //10
					location_estimated,
					notes
				]
			);
			console.log(res);
			return { success: true };
		} catch (e) {
			console.error(e);
			return {
				error: 'An error has occured.'
			};
		}
	}
);

export const getCollections = query(async () => {
	const collections = await db.query(`SELECT id, title from fonds order by title`);
	return collections.rows;
});

export const getCollectionRecords = query(
	v.object({
		id: v.string(),
		page: v.number(),
		per_page: v.number()
	}),
	async (searchParams) => {
		const res = await ts
			.collections('records')
			.documents()
			.search({
				q: '*',
				query_by: '*',
				filter_by: `collection_id:${searchParams.id}`,
				page: searchParams.page,
				per_page: searchParams.per_page
			});

		const collection = await db.query(`SELECT * from fonds where id = $1`, [searchParams.id]);
		return {
			records: res,
			collection: collection.rows[0]
		};
	}
);

export const searchPlaces = query(v.string(), async (q) => {
	const searchPattern = `%${q}%`;
	const places = await db.query(
		`SELECT name1, ST_X(geom) as x, ST_Y(geom) as y from devonplaces where name1 ilike $1`,
		[searchPattern]
	);
	return places.rows;
});

export const getTrustees = prerender(async () => {
	// Ordering by ID puts those with the highest priority first on the page.
	const trustees = await db.query(`SELECT * FROM trustees where retired = false order by id asc`);
	return trustees.rows;
});

export const getTrustee = prerender(v.string(), async (id) => {
	// Ordering by ID puts those with the highest priority first on the page.
	const trustees = await db.query(`SELECT * FROM trustees where retired = false and slug = $1`, [
		id
	]);
	return trustees.rows[0];
});

export const searchRecords = query(
	v.object({
		q: v.string(),
		query_by: v.string(),
		per_page: v.number(),
		filter_by: v.optional(v.string()),
		page: v.number()
	}),
	async (searchParams) => {
		let res = await ts.collections('records').documents().search(searchParams);
		return res;
	}
);
