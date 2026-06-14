# KelDev Gallery CloudFlare Worker

This project defines CloudFlare worker logic that provides an API for accessing KelDev Gallery data.  
Browse the gallery at [keldev.net/gallery](https://keldev.net/gallery), or view the raw API output at [api.keldev.net/gallery/images](https://api.keldev.net/gallery/images).

## Endpoints

### GET `api.keldev.net/gallery/images`

Returns metadata for all images in the gallery, including ID, title, description, tags, and derivative filenames.

Sample output:  
```json
{
    "images": [
        {
            "id": "20230512145425000-16fdc99af334-road-snaking-up",
            "title": "Road Snaking Up",
            "taken_at": "2023-05-12T14:54:25.000Z",
            "slug": "road-snaking-up",
            "thumbhash": "HugNFQIZin6I93t3iIZoaLdwQgeH",
            "description": "I've always liked this particular view from one of the windows in my sister's house. The road is nicely framed all the way up to the intersection at the top. Feels cozy.",
            "author": "S. Isaac Kellogg",
            "tags": [
                "city",
                "landscape",
                "nature",
                "pittsburgh",
                "pixel-7-pro",
                "transit"
            ],
            "derivatives": [
                {
                    "width": 320,
                    "filename": "20230512145425000-16fdc99af334-road-snaking-up-320w.webp"
                },
                {
                    "width": 1024,
                    "filename": "20230512145425000-16fdc99af334-road-snaking-up-1024w.webp"
                },
                {
                    "width": 2400,
                    "filename": "20230512145425000-16fdc99af334-road-snaking-up-2400w.webp"
                }
            ]
        }
    ]
}
```

Derivatives can be accessed at the URL `https://gallery.keldev.net/<derivative-filename>`. For example, https://gallery.keldev.net/20230512145425000-16fdc99af334-road-snaking-up-2400w.webp

#### Search Parameters

- `?tag=<tag-name>`: Filters results to only include images tagged with `<tag-name>`.
- `?id=<image-id>`: Only return metadata for the image with the given id. Stores the result as an object with key `image`.