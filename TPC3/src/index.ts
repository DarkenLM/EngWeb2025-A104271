import path from "path";
import express from "express";
import getRequest from "./request/get.js";
import { 
    API_ALUNOS, LIMIT, TARGET 
} from "./api.js";
import putRequest from "./request/put.js";
import postRequest from "./request/post.js";
import deleteRequest from "./request/delete.js";

const __dirname = path.dirname(import.meta.url.replace("file://", ""));

//#region ============== Setup Express App ==============
const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../public/routes"));
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
        console.log(`${req.method} ${req.path} ${res.statusCode ?? "---"}`, ...args);
        if (res.statusCode === undefined) res.statusCode = 200;
    };
    res.statusCode = undefined;

    next();
});

app.get("/", (req, res) => {
    req.log(``);

    res.status(405).end();
});

app.get("/alunos", async (req, res) => {
    req.log(``);

    let apiReqURL = API_ALUNOS;
    if (req.query.limit && typeof req.query.limit === "string") {
        apiReqURL = LIMIT(apiReqURL, parseInt(req.query.limit, 10) ?? 10);
    }
    req.log(`Requesting API: ${apiReqURL}`);
    
    const alunos = await getRequest(apiReqURL);
    res.render("alunos/alunos", { alunos: alunos, date: new Date() });
});

app.get("/alunos/registo", async (req, res) => {
    req.log(``);

    res.render("alunos/registo", { date: new Date().toISOString().substring(0, 16) });
});
app.post("/alunos/registo", async (req, res) => {
    req.log(``);

    try {
        if (!["id", "nome", "git"].every(p => p in req.body)) {
            return void res.status(405).json({ error: true, message: "Missing fields." });
        }

        req.log("BODYKEYS:", Object.keys(req.body));
        const { id, nome, git } = req.body;
        const tpcs = Object.keys(req.body).filter(k => k.match(/^tpc\d+$/));
        req.log(`BODY:`, id, nome, git);

        if (!id.match(/^A\d+$/)) return void res.status(405).json({ error: true, message: "Invalid ID." });

        let apiReqURL = TARGET(API_ALUNOS, id);
        req.log(`Requesting API: ${apiReqURL}`);
        const userExists = Object.keys(await getRequest(apiReqURL)).length > 0;

        if (userExists) return void res.status(405).json({ error: true, message: "Invalid ID." });

        const ntpcs = Object.fromEntries(tpcs.map(k => [k, true]));
        const nuser = { id, nome, git, ...ntpcs };
        apiReqURL = API_ALUNOS;
        req.log(`Requesting API: ${apiReqURL}`);
        await postRequest(apiReqURL, nuser, false);

        res.status(300).redirect("/alunos");
    } catch(e) {
        req.log(e);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

app.get("/alunos/edit/:id", async (req, res) => {
    req.log(``);

    if (!req.params.id.match(/^(A|PG)\d+$/)) return void res.status(405).send("Invalid user.");

    const alunosApiReqURL = API_ALUNOS;
    const alunos = await getRequest(alunosApiReqURL);
    const aluno = (alunos?.filter(a => a.id === req.params.id) || [])[0];

    res.render("alunos/edit", { aluno: aluno, date: new Date() });
});
app.post("/alunos/edit/:id", async (req, res) => {
    req.log(``);

    try {
        if (!req.params.id.match(/^(A|PG)\d+$/)) return void res.status(405).send("Invalid user.");

        if (!["id", "nome", "git"].every(p => p in req.body)) {
            return void res.status(405).json({ error: true, message: "Missing fields." });
        }

        req.log("BODYKEYS:", Object.keys(req.body));
        const { id, nome, git } = req.body;
        const tpcs = Object.keys(req.body).filter(k => k.match(/^tpc\d+$/));
        req.log(`BODY:`, id, nome, git);

        if (!id.match(/^A\d+$/)) return void res.status(405).json({ error: true, message: "Invalid ID." });

        if (id !== req.params.id) {
            const apiReqURL = TARGET(API_ALUNOS, id);
            req.log(`Requesting API: ${apiReqURL}`);

            const userExists = Object.keys(await getRequest(apiReqURL)).length > 0;
            if (userExists) return void res.status(405).json({ error: true, message: "Invalid ID." });
        }

        const ntpcs = Object.fromEntries(tpcs.map(k => [k, true]));
        const nuser = { id, nome, git, ...ntpcs };
        const apiReqURL = TARGET(API_ALUNOS, req.params.id);

        req.log(`Requesting API: ${apiReqURL}`);
        await putRequest(apiReqURL, nuser);

        res.status(300).redirect("/alunos");
    } catch(e) {
        req.log(e);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

app.get("/alunos/delete/:id", async (req, res) => {
    req.log(``);

    if (!req.params.id.match(/^(A|PG)\d+$/)) return void res.status(405).send("Invalid user.");

    try {
        const alunosApiReqURL = TARGET(API_ALUNOS, req.params.id);
        await deleteRequest(alunosApiReqURL);

        res.redirect("..");
    } catch (e) {
        req.log(e);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
});

app.get("/alunos/:id", async (req, res) => {
    req.log(``);

    if (!req.params.id.match(/^(A|PG)\d+$/)) return void res.status(405).send("Invalid user.");

    const alunosApiReqURL = API_ALUNOS;
    const alunos = await getRequest(alunosApiReqURL);
    const aluno = (alunos?.filter(a => a.id === req.params.id) || [])[0];

    res.render("alunos/aluno", { aluno: aluno, alunos: alunos, date: new Date() });
});

app.listen(1234, () => {
    console.log("Listening on http://localhost:1234");
});
//#endregion ============== Setup Express App ==============
