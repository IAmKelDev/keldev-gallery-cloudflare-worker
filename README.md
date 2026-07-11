# KelDev Gallery CloudFlare Worker

This project defines CloudFlare worker logic that provides an API for accessing KelDev Gallery data.  
Browse the gallery at [keldev.net/gallery](https://keldev.net/gallery), or view the raw API output at [api.keldev.net/gallery/images](https://api.keldev.net/gallery/images).

## Endpoints

### GET `api.keldev.net/gallery/images`

Returns metadata for images in the gallery, including ID, title, description, tags, and derivative filenames.

Results are sorted in reverse chronological order using `taken_at`. Results include info for pagination, though the default endpoint with no search params will return all images in the database on one "page" with `pageNum=null` and `hasMore=false`.

Sample output given a request of the form `GET api.keldev.net/gallery/images?page=1&pagesize=2`:  
```json
{
    "images": [
        {
            "id": "20221210010902000-6f354058abf1-roast-sandwich-delicious",
            "title": "Roast Sandwich Delicious",
            "taken_at": "2022-12-10T01:09:02.000Z",
            "slug": "roast-sandwich-delicious",
            "thumbhash": "EBgODQRXd3CIeYiYd4Z3iA9Ii2An",
            "description": "This Arby's sign is almost never completely illuminated.",
            "tags": [
                "blurry",
                "city",
                "danville",
                "night",
                "pixel-7-pro",
                "reflection",
                "transit"
            ],
            "derivatives": [
                {
                    "width": 320,
                    "filename": "20221210010902000-6f354058abf1-roast-sandwich-delicious-320w.webp"
                },
                {
                    "width": 1024,
                    "filename": "20221210010902000-6f354058abf1-roast-sandwich-delicious-1024w.webp"
                },
                {
                    "width": 2400,
                    "filename": "20221210010902000-6f354058abf1-roast-sandwich-delicious-2400w.webp"
                }
            ]
        },
        {
            "id": "20221208005438000-37fca295e1c4-christmas-rave-smear-dog",
            "title": "Christmas Rave Smear Dog",
            "taken_at": "2022-12-08T00:54:38.000Z",
            "slug": "christmas-rave-smear-dog",
            "thumbhash": "FSgKJQJgiLyFSKimlol3Z3ZwUwhG",
            "description": "Sometimes blurry pictures are just funny idk.",
            "tags": [
                "animal",
                "blurry",
                "christmas",
                "closeup",
                "dog",
                "inside",
                "olive",
                "pet",
                "pixel-7-pro"
            ],
            "derivatives": [
                {
                    "width": 320,
                    "filename": "20221208005438000-37fca295e1c4-christmas-rave-smear-dog-320w.webp"
                },
                {
                    "width": 1024,
                    "filename": "20221208005438000-37fca295e1c4-christmas-rave-smear-dog-1024w.webp"
                },
                {
                    "width": 2400,
                    "filename": "20221208005438000-37fca295e1c4-christmas-rave-smear-dog-2400w.webp"
                }
            ]
        }
    ],
    "pageNum": 1,
    "hasMore": true
}
```
> (actual metadata given from the live API will likely be different for this request)

Derivatives can be accessed at the URL `https://gallery.keldev.net/<derivative-filename>`. For example, https://gallery.keldev.net/20230512145425000-16fdc99af334-road-snaking-up-2400w.webp

#### Search Parameters

- `?tag=<tag-name>`: Filter results to only include images tagged with `<tag-name>`.
- `?id=<image-id>`: Only return metadata for the image with the given id. Result takes the same overall shape, so `images[]` will have one element if the image exists. `pageNum=-1` and `hasMore=false` for all results with this parameter.
- `?page=<page-num>&pagesize=<images-per-page>` (`pagesize` optional, default=100): Paginate results based on the given page size. The first page of results is page 1, not 0. Use `hasMore` to determine if more pages exist.
- `?pageof=<image-id>&pagesize=<images-per-page>` (`pagesize` optional, default=100): Return the page containing the iamge with the given id. Use the response's `pageNum` and `hasMore` to find neighboring pages.