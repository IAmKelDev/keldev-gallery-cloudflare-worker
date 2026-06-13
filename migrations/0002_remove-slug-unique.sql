-- Migration number: 0002 	 2026-06-08
-- SQLite cannot drop constraints directly; recreate the table without the UNIQUE on slug.
-- Child tables (image_tags, derivatives) are recreated alongside images so they can be
-- dropped before the parent, avoiding ON DELETE CASCADE from firing on DROP TABLE images.

CREATE TABLE images_new (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    taken_at TEXT NOT NULL,
    slug TEXT NOT NULL,
    thumbhash TEXT NOT NULL,
    description TEXT
);

CREATE TABLE image_tags_new (
    image_id TEXT REFERENCES images_new(id) ON DELETE CASCADE,
    tag TEXT REFERENCES tags(name) ON DELETE CASCADE,
    PRIMARY KEY (image_id, tag)
);

CREATE TABLE derivatives_new (
    image_id TEXT REFERENCES images_new(id) ON DELETE CASCADE,
    width INTEGER,
    filename TEXT,
    PRIMARY KEY (image_id, width)
);

INSERT INTO images_new SELECT * FROM images;
INSERT INTO image_tags_new SELECT * FROM image_tags;
INSERT INTO derivatives_new SELECT * FROM derivatives;

-- Drop children before parent so there is nothing left to cascade.
DROP TABLE derivatives;
DROP TABLE image_tags;
DROP TABLE images;

ALTER TABLE images_new RENAME TO images;
ALTER TABLE image_tags_new RENAME TO image_tags;
ALTER TABLE derivatives_new RENAME TO derivatives;
