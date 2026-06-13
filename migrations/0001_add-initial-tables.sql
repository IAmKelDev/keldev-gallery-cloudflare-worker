-- Migration number: 0001 	 2026-06-03T21:04:58.463Z
CREATE TABLE images (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    taken_at TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    thumbhash TEXT NOT NULL,
    description TEXT
);

CREATE TABLE tags (
    name TEXT PRIMARY KEY,
    description TEXT
);

CREATE TABLE image_tags (
    image_id TEXT REFERENCES images(id) ON DELETE CASCADE,
    tag TEXT REFERENCES tags(name) ON DELETE CASCADE,
    PRIMARY KEY (image_id, tag)
);

CREATE TABLE derivatives (
    image_id TEXT REFERENCES images(id) ON DELETE CASCADE,
    width INTEGER,
    filename TEXT,
    PRIMARY KEY (image_id, width)
);