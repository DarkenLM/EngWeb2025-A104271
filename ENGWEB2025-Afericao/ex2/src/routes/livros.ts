import { type Express } from "express";
import Router from "../Router.js";
import { FILTER, TARGET } from "../api.js";
import getRequest from "../request/get.js";

const API_BASE = process.env.API_URI ?? "http://localhost:17000/books";

async function getLivros(filter?: Record<string, string>): Promise<Record<string, unknown>[] | undefined> {
    try {
        const request_url = filter ? FILTER(API_BASE, filter) : API_BASE;
        const data = await getRequest(request_url);

        return <Record<string, unknown>[]>data;
    } catch(e) {
        console.error(e);
        return undefined;
    }
}

class LivrosRouter extends Router {
    constructor() {
        super("/");
    }

    public async init(_app: Express): Promise<void> {
        console.log("  - Initializing api 'livros' router...");

        this.router.get("/livros", async (_req, res) => {
            const livros = await getLivros();

            res.render("livros", { llivros: livros });
        });

        this.router.get("/entidades/:idAutor", async (_req, res) => {
            // const authorId = Buffer.from(_req.params.idAutor, "utf8").toString("hex");
            const authorId = _req.params.idAutor;
            const livros = await getLivros({ author: authorId });
            if (livros === undefined || livros.length === 0) throw new Error(`Entidade não existente.`);

            const entity = {
                name: Buffer.from(<string>_req.params.idAutor, "hex"),
                idAutor: authorId,
                lbooks: livros
            };

            res.render("entidade", { entity: entity, llivros: livros });
        });

        this.router.get("/:id", async (_req, res, next) => {
            if (_req.params.id === "favicon.ico") return next();

            _req.log("REQ:", TARGET(API_BASE, _req.params.id));
            const book = await getRequest(TARGET(API_BASE, _req.params.id));

            res.render("livro", { livro: (book ?? [])[0] });
        });
    }
}

export default LivrosRouter;