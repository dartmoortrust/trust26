// src/routes/api/image/+server.js
import sharp from 'sharp';
import { error } from '@sveltejs/kit';

export async function GET({ url }) {
	const imageUrl = url.searchParams.get('url');
	let size = Number(url.searchParams.get('s') || 500);
	const crop = url.searchParams.has('c');
	console.log(url);
	console.log(crop);
	if (!imageUrl) {
		throw error(400, 'Missing image URL');
	}

	try {
		const response = await fetch(imageUrl);
		if (!response.ok) throw new Error('Failed to fetch image');

		const buffer = await response.arrayBuffer();
		let pipeline = sharp(Buffer.from(buffer));

		// Resize with optional height
		if (crop) {
			console.log('cropping');
			pipeline = pipeline.resize(size, size, { fit: 'cover' });
		} else {
			console.log('Not');
			pipeline = pipeline.resize(size, size, { fit: 'inside' });
		}

		const resized = await pipeline.toBuffer();

		return new Response(resized, {
			headers: {
				'Content-Type': 'image/jpeg',
				'Cache-Control': 'public, max-age=86400'
			}
		});
	} catch (err) {
		throw error(500, `Image processing failed: ${err?.message}`);
	}
}
