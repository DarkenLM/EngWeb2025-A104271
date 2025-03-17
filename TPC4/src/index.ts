import path from "path";
import express from "express";
// import getRequest from "./request/get.js";
// import { 
//     API_ALUNOS, API_CURSOS, API_INSTRUMENTOS, 
//     FILTER, LIMIT, TARGET 
// } from "./api.js";
import { loadRouters } from "./Router.js";

const __dirname = path.dirname(import.meta.url.replace("file://", ""));

//#region ============== Setup Express App ==============
const app = express();
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "../views"));
app.use("/assets", express.static(path.join(__dirname, "../public/assets")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        export interface Request {
            log: (...args: unknown[]) => void
        }
    }
}

app.use(function loggingMiddleware(req, res, next) {
    req.log = function(...args: unknown[]) {
        console.log(`${req.method} ${req.path} ${res.statusCode ?? "000"}`, ...args);
    };
    req.log(``);

    next();
});

console.log("Initializing routers...");
const routers = await loadRouters(path.join(__dirname, "routes"));
for (const router of routers) {
    router.init(app);
    app.use(router.route, router.get());
}
console.log("Routers initialized.");

app.use((err, req, res, _next) => {
    console.error(`ERROR on ${req.path}:`, err);
    res.render("error", { error: err });
});

app.listen(1234, () => {
    console.log("Listening on http://localhost:1234");
});
//#endregion ============== Setup Express App ==============
