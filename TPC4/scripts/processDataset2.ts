import * as fsp from "fs/promises";
import { nanoid } from "nanoid";
import path from "path";

const __dirname = path.dirname(import.meta.url.replace("file://", ""));

const fileData = await fsp.readFile(path.resolve(__dirname, "../dataset/cinema.json"), { encoding: "utf8" });
const dataset = JSON.parse(fileData);

const newDataset = {
    filmes: [],
    cast: [],
    genres: []
};

const cast = new Set();
const genres = new Set();
for (const entry of dataset) {
    entry.cast.forEach(m => cast.add(m));
    entry.genres.map(m => genres.add(m));
}

newDataset.cast = Array.from(cast).map((m) => ({ id: `C${nanoid(16)}`, name: m }));
newDataset.genres = Array.from(genres).map((m) => ({ id: `G${nanoid(16)}`, name: m }));

for (const entry of dataset) {
    newDataset.filmes.push({
        id: `F${nanoid(16)}`,
        title: entry.title,
        year: entry.year,
        cast: entry.cast.map((m) => newDataset.cast.filter(nc => nc.name === m)[0].id),
        genres: entry.genres.map((m) => newDataset.genres.filter(ng => ng.name === m)[0].id)
    });
}

await fsp.writeFile(
    path.resolve(__dirname, "../dataset/cinema_normalized.json"), 
    JSON.stringify(newDataset, null, 2), 
    { encoding: "utf8" }
);
