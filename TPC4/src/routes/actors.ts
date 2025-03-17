import { type Express } from "express";
import { API_CAST, API_FILMES, FILTER_ARRAY, TARGET } from "../api.js";
import getRequest from "../request/get.js";
import Router from "../Router.js";

class ActorsRouter extends Router {
    constructor() {
        super("/actors");
    }

    public async init(_app: Express): Promise<void> {
        console.log("  - Initializing actors router...");

        this.router.get("/", async (_req, res) => {
            const cast  = await getRequest(API_CAST);
            
            res.render("actors", { lcast: cast });
        });

        this.router.get("/:id", async (req, res) => {
            const cast = <{ id: string, name: string }>await getRequest(TARGET(API_CAST, req.params.id));
            const films = await getRequest(FILTER_ARRAY(API_FILMES, "cast", [cast.id]));
            
            res.render("actor", { cast: cast, lfilmes: films });
        });
    }
}

export default ActorsRouter;