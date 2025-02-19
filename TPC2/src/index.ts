import path from "path";
import express from "express";
import getRequest from "./request/get.js";
import { 
    API_ALUNOS, API_CURSOS, API_INSTRUMENTOS, 
    FILTER, LIMIT, TARGET 
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

app.get("/alunos", async (req, res) => {
    req.log(``);

    let apiReqURL = API_ALUNOS;
    if (req.query.limit && typeof req.query.limit === "string") {
        apiReqURL = LIMIT(apiReqURL, parseInt(req.query.limit, 10) ?? 10);
    }
    req.log(`Requesting API: ${apiReqURL}`);
    
    const alunos = await getRequest(apiReqURL);
    res.render("alunos/alunos", { alunos: alunos });
});

app.get("/alunos/:id", async (req, res) => {
    req.log(``);

    // const apiReqURL = TARGET(API_ALUNOS, req.params.id);
    // req.log(`Requesting API: ${apiReqURL}`);
    // const aluno = await getRequest(apiReqURL);


    const alunosApiReqURL = API_ALUNOS;
    const alunos = await getRequest(alunosApiReqURL);
    const _aluno = alunos.filter(a => a.id === req.params.id);
    
    if (_aluno.length === 0) return res.render("alunos/aluno", { aluno: undefined, curso: undefined, alunos: alunos });
    const aluno = _aluno[0];

    const cursoApiReqURL = TARGET(API_CURSOS, aluno.curso);
    req.log(`Requesting API: ${cursoApiReqURL}`);
    const curso = await getRequest(cursoApiReqURL);

    res.render("alunos/aluno", { aluno: aluno, curso: curso, alunos: alunos });
});

app.get("/cursos", async (req, res) => {
    req.log(``);

    let apiReqURL = API_CURSOS;
    if (req.query.limit && typeof req.query.limit === "string") {
        apiReqURL = LIMIT(apiReqURL, parseInt(req.query.limit, 10) ?? 10);
    }
    req.log(`Requesting API: ${apiReqURL}`);
    
    const cursos = await getRequest(apiReqURL);
    res.render("cursos/cursos", { cursos: cursos });
});

app.get("/cursos/:id", async (req, res) => {
    req.log(``);

    // const apiReqURL = TARGET(API_CURSOS, req.params.id);
    // req.log(`Requesting API: ${apiReqURL}`);
    // const curso = await getRequest(apiReqURL);

    const cursosApiReqURL = API_CURSOS;
    req.log(`Requesting API: ${cursosApiReqURL}`);
    const cursos = await getRequest(cursosApiReqURL);
    const _curso = cursos.filter(a => a.id === req.params.id);
    
    // if (_curso.length === 0) return res.render("cursos/curso", { curso: undefined, cursos: cursos });
    const curso = _curso[0];
    
    const alunosApiReqURL = FILTER(API_ALUNOS, { curso: req.params.id });
    req.log(`Requesting API: ${alunosApiReqURL}`);
    const alunos = await getRequest(alunosApiReqURL);

    res.render("cursos/curso", { curso: curso, cursos: cursos, alunos: alunos, _id: req.params.id });
});

app.get("/instrumentos", async (req, res) => {
    req.log(``);

    let apiReqURL = API_INSTRUMENTOS;
    if (req.query.limit && typeof req.query.limit === "string") {
        apiReqURL = LIMIT(apiReqURL, parseInt(req.query.limit, 10) ?? 10);
    }
    req.log(`Requesting API: ${apiReqURL}`);
    
    const instrumentos = await getRequest(apiReqURL);
    res.render("instrumentos/instrumentos", { instrumentos: instrumentos });
});

app.get("/instrumentos/:id", async (req, res) => {
    req.log(``);

    // const apiReqURL = TARGET(API_INSTRUMENTOS, req.params.id);
    // req.log(`Requesting API: ${apiReqURL}`);
    // const instrumento = await getRequest(apiReqURL);

    const instrumentosApiReqURL = API_INSTRUMENTOS;
    req.log(`Requesting API: ${instrumentosApiReqURL}`);
    const instrumentos = await getRequest(instrumentosApiReqURL);
    const _instrumento = instrumentos.filter(a => a.id === req.params.id || a["#text"] === decodeURIComponent(req.params.id));
    
    if (_instrumento.length === 0) return res.render("instrumentos/instrumento", { 
        instrumento: undefined, 
        instrumentos: instrumentos 
    });
    const instrumento = _instrumento[0];
    
    const alunosApiReqURL = FILTER(API_ALUNOS, { instrumento: instrumento["#text"] });
    req.log(`Requesting API: ${alunosApiReqURL}`);
    const alunos = await getRequest(alunosApiReqURL);

    res.render("instrumentos/instrumento", { instrumento: instrumento, instrumentos: instrumentos, alunos: alunos });
});

app.listen(1234, () => {
    console.log("Listening on http://localhost:1234");
});
//#endregion ============== Setup Express App ==============
