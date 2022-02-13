BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "Users" (
	"id"	INTEGER,
	"name"	TEXT,
	"password"	TEXT,
	"api_key"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "GameSystems" (
	"id"	INTEGER,
	"name"	TEXT,
	"description"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "VideoGame" (
	"id"	INTEGER,
	"name"	TEXT,
	"developer"	TEXT,
	"gamesystem"	TEXT,
	"genre"	TEXT,
	"year"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
COMMIT;
