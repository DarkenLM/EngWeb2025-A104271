import { type Express } from "express";
import Router from "../Router.js";
import { createLivro, getLivros, getDistinctLivros, getSingleLivro, killLivro } from "../db/controllers/Livro.js";
// import mongoose from "mongoose";
// mongoose.set("debug", true);

class BooksRouter extends Router {
    constructor() {
        super("/books");
    }

    public async init(_app: Express): Promise<void> {
        console.log("  - Initializing api 'books' router...");

        this.router.get("/", async (req, res) => {
            const { charater, genre, author } = req.query;

            if (charater !== undefined) {
                const livros = await getLivros(<unknown>{ characters: { $regex: `${charater}`, $options: "i" } });
                const json = livros.map(c => c.toJSON());
                res.json(json);
            } else if (genre !== undefined) {
                const livros = await getLivros(<unknown>{ genres: { $in: [genre] } });
                const json = livros.map(c => c.toJSON());
                res.json(json);
            } else if (author !== undefined) {
                // console.log("AUTHOR:", Buffer.from(<string>author, "hex"));
                const livros = await getLivros(<unknown>{ author: { $regex: `${Buffer.from(<string>author, "hex")}` } });
                const json = livros.map(c => c.toJSON());
                res.json(json);
            } else {
                const livros = await getLivros();
                const json = livros.map(c => c.toJSON());
                res.json(json);
            }
        });

        this.router.post("/", async (req, res) => {
            const requiredKeys = [
                "bookId",
                "author",
                "awards",
                "bbeScore",
                "bbeVotes",
                "bookFormat",
                "characters",
                "coverImg",
                "description",
                "edition",
                "firstPublishDate",
                "genres",
                "isbn",
                "language",
                "likedPercent",
                "numRatings",
                "pages",
                "price",
                "publisher",
                "publishDate",
                "rating",
                "ratingsByStars",
                "series",
                "setting",
                "title"
            ];

            const bKeys = Object.keys(req.body);
            if (requiredKeys.some(k => !bKeys.includes(k))) {
                res.status(400).send("Missing keys.");
                req.log("Missing keys.");
                return;
            }

            const obj = Object.fromEntries(Object.entries(req.body).filter(([k,_]) => requiredKeys.includes(k)));
            await createLivro(<never>obj);

            req.log("Success");
            res.status(200).send();
            return;
        });

        this.router.get("/genres", async (_req, res) => {
            const livros = await getDistinctLivros("genres");
            res.json(livros);
        });

        this.router.get("/characters", async (_req, res) => {
            const livros = await getDistinctLivros("characters");
            res.json(livros);
        });

        this.router.get("/:id", async (_req, res) => {
            const livros = await getLivros({ bookId: _req.params.id });
            const json = livros.map(c => c.toJSON());
            res.json(json);
        });

        this.router.delete("/:id", async (_req, res) => {
            await killLivro({ bookId: _req.params.id });
            res.status(200).send();
        });

        this.router.put("/:id", async (req, res) => {
            const livro = await getSingleLivro({ bookId: req.params.id });
            if (!livro) {
                res.status(400).send("No existing livro.");
                return;
            }

            const requiredKeys = [
                "author",
                "awards",
                "bbeScore",
                "bbeVotes",
                "bookFormat",
                "characters",
                "coverImg",
                "description",
                "edition",
                "firstPublishDate",
                "genres",
                "isbn",
                "language",
                "likedPercent",
                "numRatings",
                "pages",
                "price",
                "publisher",
                "publishDate",
                "rating",
                "ratingsByStars",
                "series",
                "setting",
                "title"
            ];
            
            const obj = Object.fromEntries(Object.entries(req.body).filter(([k,_]) => requiredKeys.includes(k)));
            Object.assign(livro, obj);

            await livro.save();

            res.status(200).send();
            return;
        });
    }
}

export default BooksRouter;