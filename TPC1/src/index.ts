import path from "path";
import express from "express";
import getRequest from "./request/get.js";
import { 
    API_INTERVENCOES, API_REPARACOES, API_VIATURAS, 
    FILTER, FILTER_MULTI, INCLUDE, INCLUDE_REVERSE, 
    LIMIT, SORT, TARGET 
} from "./api.js";

const __dirname = path.dirname(import.meta.url.replace("file://", ""));

//#region ============== Setup Express App ==============
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../public/routes"));
app.use("/assets", express.static(path.join(__dirname, "../public/assets")));
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

    next();
});

app.get("/", (req, res) => {
    req.log(``);
    res.render("home", { });
});

app.get("/reparacoes", async (req, res) => {
    req.log(``);

    let apiReqURL = INCLUDE(API_REPARACOES, "viaturas");
    if (req.query.limit && typeof req.query.limit === "string") {
        apiReqURL = LIMIT(apiReqURL, parseInt(req.query.limit, 10) ?? 10);
    }
    req.log(`Requesting API: ${apiReqURL}`);
    
    const reparacoes = await getRequest(apiReqURL);
    res.render("reparacoes/reparacoes", { reparacoes: reparacoes });
});

app.get("/reparacao/:id", async (req, res) => {
    req.log(``);

    const apiReqURL = TARGET(API_REPARACOES, req.params.id);
    req.log(`Requesting API: ${apiReqURL}`);
    
    const reparacao = await getRequest(apiReqURL);
    // req.log(`Reparacao:`, reparacao, Object.fromEntries(reparacao.intervencoes.map(r => ["id", r])));

    const intervencoesApiReqURL = FILTER_MULTI(API_INTERVENCOES, "id", reparacao.intervencoes);
    req.log(`Requesting API: ${intervencoesApiReqURL}`);
    const intervencoes = await getRequest(intervencoesApiReqURL);

    res.render("reparacoes/reparacao", { reparacao: reparacao, intervencoes: intervencoes });
});

app.get("/intervencoes", async (req, res) => {
    req.log(``);

    // let apiReqURL = INCLUDE(API_INTERVENCOES, "viaturas");
    let apiReqURL = API_INTERVENCOES;
    if (req.query.limit && typeof req.query.limit === "string") {
        apiReqURL = SORT(LIMIT(apiReqURL, parseInt(req.query.limit, 10) ?? 10), "codigo", "asc");
    }
    req.log(`Requesting API: ${apiReqURL}`);
    
    const intervencoes = await getRequest(apiReqURL);
    res.render("intervencoes/intervencoes", { intervencoes: intervencoes });
});

app.get("/intervencao/:id", async (req, res) => {
    req.log(``);

    const apiReqURL = TARGET(API_INTERVENCOES, req.params.id);
    req.log(`Requesting API: ${apiReqURL}`);
    
    const intervencao = await getRequest(apiReqURL);

    const reparacoesApiReqURL = INCLUDE(
        FILTER(API_REPARACOES, { intervencoes: intervencao.codigo }),
        "viaturas"
    );
    req.log(`Requesting API: ${reparacoesApiReqURL}`);
    const reparacoes = await getRequest(reparacoesApiReqURL);

    res.render("intervencoes/intervencao", { intervencao: intervencao, reparacoes: reparacoes });
});

app.get("/viaturas", async (req, res) => {
    req.log(``);

    let apiReqURL = API_VIATURAS;
    if (req.query.limit && typeof req.query.limit === "string") {
        apiReqURL = SORT(LIMIT(apiReqURL, parseInt(req.query.limit, 10) ?? 10), "codigo", "asc");
    }
    req.log(`Requesting API: ${apiReqURL}`);
    
    const viaturas = await getRequest(apiReqURL);
    const viaturaCache = {};
    for (const viatura of viaturas) {
        viaturaCache[viatura.marca] ??= {};
        viaturaCache[viatura.marca][viatura.modelo] ??= 0;
        viaturaCache[viatura.marca][viatura.modelo]++;
    }

    const processedViaturas = Object.fromEntries(Object.keys(viaturaCache)
        .sort((a,b) => a.localeCompare(b))
        .map(k => [k, undefined])
    );

    for (const marca in processedViaturas) {
        processedViaturas[marca] = Object.fromEntries(Object.entries(viaturaCache[marca])
            .sort(([ka,_va], [kb,_vb]) => ka.localeCompare(kb))
        );
    }

    res.render("viaturas/viaturas", { viaturas: processedViaturas });
});

app.get("/viatura/:marca/:modelo", async (req, res) => {
    req.log(``);
    
    let apiReqURL = FILTER(API_VIATURAS, { marca: req.params.marca, modelo: req.params.modelo });
    apiReqURL = INCLUDE_REVERSE(apiReqURL, "reparacoe");
    req.log(`Requesting API: ${apiReqURL}`);
    
    const viaturas = await getRequest(apiReqURL);

    res.render("viaturas/viatura", { viatura: { marca: req.params.marca, modelo: req.params.modelo }, viaturas: viaturas });
});

app.listen(1234, () => {
    console.log("Listening on http://localhost:1234");
});
//#endregion ============== Setup Express App ==============
