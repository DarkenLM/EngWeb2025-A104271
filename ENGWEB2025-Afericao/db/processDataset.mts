import fsp from "fs/promises";

const dsfd = await fsp.readFile("./dataset/db.json", { encoding: "utf8" });
const ds = JSON.parse(dsfd);

for (const line of ds) {
    line.bookId = line.bookId.match(/^(\d)+/)[0];
    line.author = line.author.match(/([^\(\)\,]+)(?:(?=\s*\()|$)/g).map(a => a.trim());
    line.genres = eval(line.genres);
    line.characters = eval(line.characters);
    line.awards = eval(line.awards);
    line.ratingsByStars = eval(line.ratingsByStars);
    line.setting = eval(line.setting);
}

await fsp.writeFile("./dataset/db2.json", JSON.stringify(ds), { encoding: "utf8" });