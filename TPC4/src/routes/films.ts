import { type Express } from "express";
import { API_CAST, API_FILMES, API_GENRES, FILTER, FILTER_MULTI, TARGET } from "../api.js";
import deleteRequest from "../request/delete.js";
import getRequest from "../request/get.js";
import postRequest from "../request/post.js";
import putRequest from "../request/put.js";
import Router from "../Router.js";
import { nanoid } from "../util/nanoid.js";

class FilmsRouter extends Router {
    constructor() {
        super("/filmes");
    }

    public async init(_app: Express): Promise<void> {
        console.log("  - Initializing films router...");

        this.router.get("/", async (_req, res) => {
            const prepareUrl = (base) => {
                let url = base;
                if ("ano" in _req.query) url = FILTER(url, { year: `${_req.query.ano}` });

                return url;
            };

            const filmes = await getRequest(prepareUrl(API_FILMES));
            const cast   = await getRequest(API_CAST);
            const genres = await getRequest(API_GENRES);
            // _req.log("API DATA:", data);
            res.render("filmes", { lfilmes: filmes, lcast: cast, lgenres: genres });
        });

        this.router.get("/edit/:id", async (_req, res) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const film = <Record<string, any>>await getRequest(TARGET(API_FILMES, _req.params.id));
            const cast   = <Record<string, unknown>[]>await getRequest(API_CAST);
            const genres = <Record<string, unknown>[]>await getRequest(API_GENRES);

            film.cast = film.cast.map(c => (cast.filter(_c => _c.id === c).map(c => c.name) || [c])[0]);
            film.genres = film.genres.map(g => (genres.filter(_g => _g.id === g).map(g => g.name) || [g])[0]);
            res.render("editFilm", { film: film });
        });

        this.router.post("/edit/:id", async (req, res) => {
            const formData = req.body;
            console.log("FORMDATA:", formData);

            if (!("id" in formData)) {
                res.status(400).json({ error: true, message: "Missing id." });
                return;
            }

            const filmEntry = <Record<string, unknown>[]>await getRequest(TARGET(API_FILMES, formData.id));
            if (Object.keys(filmEntry).length === 0) {
                res.status(400).json({ error: true, message: "Invalid id." });
                return;
            }

            const sendObj = <Record<string, unknown>>{
                // id: formData.id
                ...filmEntry
            };

            if ("title" in formData) sendObj.title = formData.title;
            
            const nCast = [];
            const tCastIds = [];
            castMainIf: if ("cast" in formData) {
                try {
                    const castNames = JSON.parse(formData.cast);
                    if (castNames.length === 0) break castMainIf;

                    const tCast = <Record<string, unknown>[]>await getRequest(FILTER_MULTI(API_CAST, "name", castNames));
                    const tCastNames = tCast.map(c => c.name);
                    tCastIds.push(...tCast.map(c => c.id));

                    for (const cast of castNames) {
                        if (!tCastNames.includes(cast)) {
                            const id = `C${nanoid(16)}`;
                            nCast.push({
                                id: id,
                                name: cast
                            });
                            tCastIds.push(id);
                        }
                    }
                } catch (e) {
                    res.status(400);
                    req.log(e);
                    res.json({ error: true, message: "Invalid cast." });
                    return;
                }
            }

            const nGenres = [];
            const tGenreIds = [];
            genreMainIf: if ("genres" in formData) {
                try {
                    const genreNames = JSON.parse(formData.genres);
                    if (genreNames.length === 0) break genreMainIf;

                    const tGenres = <Record<string, unknown>[]>await getRequest(FILTER_MULTI(API_GENRES, "name", genreNames));
                    const tGenreNames = tGenres.map(c => c.name);
                    tGenreIds.push(...tGenres.map(c => c.id));

                    for (const cast of genreNames) {
                        if (!tGenreNames.includes(cast)) {
                            const id = `G${nanoid(16)}`;
                            nGenres.push({
                                id: id,
                                name: cast
                            });
                            tGenreIds.push(id);
                        }
                    }
                } catch (e) {
                    res.status(400);
                    req.log(e);
                    res.json({ error: true, message: "Invalid genres." });
                    return;
                }
            }

            try {
                if (nCast.length > 0) {
                    for (const cast of nCast) {
                        await postRequest(API_CAST, cast, false);
                    }
                }

                if (nGenres.length > 0) {
                    for (const genre of nGenres) {
                        await postRequest(API_GENRES, genre, false);
                    }
                }

                sendObj.cast = tCastIds;
                sendObj.genres = tGenreIds;

                await putRequest(TARGET(API_FILMES, formData.id), sendObj);
                
                res.redirect("../");
                req.log(`Successfully edited film.`);
                return;
            } catch (e) {
                res.status(500);
                req.log(e);
                res.json({ error: true, message: "Internal Server Error." });
            }
        });

        this.router.get("/delete/:id", async (req, res) => {
            const yeet = await deleteRequest(TARGET(API_FILMES, req.params.id));
            if (!yeet.ok) {
                res.status(400).json({ error: true, message: "Invalid id" });
                return;
            }

            res.status(200).json({ error: false });
        });
        
        // this.router
    }
}

export default FilmsRouter;