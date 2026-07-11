const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json', ...corsHeaders },
	});
}

function sendImages(images: Record<string, unknown>[], hasMore: boolean = false, pageNum: number = -1): Response {
	return json({
		images,
		pageNum,
		hasMore,
	});
}

async function pageOf(imageId: string, pageSize: number, env: Env) {
	const pageNum = await env.DB.prepare(
		`SELECT COUNT(*) c FROM images
		WHERE taken_at >= (SELECT taken_at FROM images WHERE id = ?)`
	)
		.bind(imageId)
		.first<Record<string, number>>().then((val) => {
			// console.log("Val ", val);
			return Math.ceil(((val ?? {c: 0}).c ?? 0) / pageSize);
		});
	// console.log("Page ", pageNum);
	return pageNum;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const DEFAULT_PAGE_SIZE = 100;
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		if (request.method !== 'GET') {
			return json({ error: 'Method not allowed' }, 405);
		}

		// Any of the following:
		// - GET /gallery/images
		// - GET /gallery/images?tag=<name>
		// - GET /gallery/images?id=<image-id>
		// - GET /gallery/images?page=<page-num>&pagesize=<images-per-page>
		// - GET /gallery/images?pageof=<image-id>&pagesize=<images-per-page>
		if (url.pathname === '/gallery/images') {
			const id = url.searchParams.get('id');
			const tag = url.searchParams.get('tag');
			const sizeParam = Number.parseInt(url.searchParams.get('pagesize') ?? "", 10);
			const pageOfId = url.searchParams.get('pageof');
			const pageSize = (sizeParam > 0)
				? sizeParam
				: (sizeParam < -1 || !Number.isInteger(sizeParam))
					? DEFAULT_PAGE_SIZE
					: -1;
			let pageNum: number = Number.parseInt(url.searchParams.get('page') ?? "", 10);
			if(pageOfId) pageNum = await pageOf(pageOfId, pageSize, env);
			const offset = Number.isInteger(pageNum) ? Math.max((pageNum - 1) * pageSize, 0) : 0;

			if (id) {
				const img = await env.DB.prepare(
					`SELECT * FROM images
					 WHERE id = ?`
				)
					.bind(id)
					.first<Record<string, unknown>>();
				if (!img) return json({ error: 'Not found' }, 404);

				const [tagsResult, derivsResult] = await Promise.all([
					env.DB.prepare(
						`SELECT tag FROM image_tags
						 WHERE image_id = ?`
					)
						.bind(id)
						.all(),
					env.DB.prepare(
						`SELECT width, filename FROM derivatives
						 WHERE image_id = ?
						 ORDER BY width ASC`
					)
						.bind(id)
						.all(),
				]);

				const image = {
					...img,
					tags: tagsResult.results.map((r) => r.tag as string),
					derivatives: derivsResult.results.map((r) => ({ width: r.width as number, filename: r.filename as string })),
				};
				return sendImages([image])
			}

			let images: Record<string, unknown>[];
			let hasAfter = false;
			if (tag) {
				const result = await env.DB.prepare(
					`SELECT i.* FROM images i
					 JOIN image_tags it ON it.image_id = i.id
					 WHERE it.tag = ?
					 ORDER BY i.taken_at DESC
					 LIMIT ?
					 OFFSET ?`
				)
					.bind(tag, pageSize + 1, offset)
					.all();
				images = result.results as Record<string, unknown>[];
			} else {
				const result = await env.DB.prepare(
					`SELECT * FROM images
					 ORDER BY taken_at DESC
					 LIMIT ?
					 OFFSET ?`
				)
					.bind(pageSize + 1, offset)
					.all();
				images = result.results as Record<string, unknown>[];
			}

			if (images.length === 0) return sendImages([]);
			hasAfter = images.length > pageSize;
			if (hasAfter) images.pop(); // Remove the extra image used to check for hasAfter

			// Fetch tags and derivatives for all returned images in two parallel queries.
			const ids = images.map((i) => i.id as string);
			const ph = ids.map(() => '?').join(', ');

			const [tagsResult, derivsResult] = await Promise.all([
				env.DB.prepare(
					`SELECT image_id, tag FROM image_tags
					 WHERE image_id IN (${ph})`
				)
					.bind(...ids)
					.all(),
				env.DB.prepare(
					`SELECT image_id, width, filename FROM derivatives
					 WHERE image_id IN (${ph})
					  ORDER BY width ASC`
				)
					.bind(...ids)
					.all(),
			]);

			const tagsByImage = new Map<string, string[]>();
			for (const row of tagsResult.results) {
				const id = row.image_id as string;
				const list = tagsByImage.get(id) ?? [];
				list.push(row.tag as string);
				tagsByImage.set(id, list);
			}

			const derivsByImage = new Map<string, { width: number; filename: string }[]>();
			for (const row of derivsResult.results) {
				const id = row.image_id as string;
				const list = derivsByImage.get(id) ?? [];
				list.push({ width: row.width as number, filename: row.filename as string });
				derivsByImage.set(id, list);
			}

			const imagesToSend = images.map((img) => ({
					...img,
					tags: tagsByImage.get(img.id as string) ?? [],
					derivatives: derivsByImage.get(img.id as string) ?? [],
				}));
			
				return sendImages(imagesToSend, hasAfter, pageNum);
		}

		// GET /tags
		if (url.pathname === '/gallery/tags') {
			const result = await env.DB.prepare(
				`SELECT name, description FROM tags
				 ORDER BY name`
			).all();
			return json({ tags: result.results });
		}

		return json({ error: 'Not found' }, 404);
	},
} satisfies ExportedHandler<Env>;
