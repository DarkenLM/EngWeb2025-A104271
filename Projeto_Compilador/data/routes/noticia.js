const express = require("express");
const noticiaController = require("../controllers/noticia.js");
const router  = express.Router();

/**
 * Queremos obter posts entre = from n to n' 
 * Queremos obter x posts = limit n
 * Queremos obter os anteriores mas com regras de visibilidade.
 * Queremos obter todos os posts de alguem 
 * Queremos obter todos os posts
 * GET /posts
 * GET /posts?visible=true
 * GET /posts?limit=10
 * GET /posts?limit=10&visible=true
 * GET /posts?from=0&to=20
 * GET /posts?from=0&to=20&visible=true
 * GET /posts?fromProducer=username123
 * GET /posts?fromProducer=username123&visible=true
 */
router.get("/", async (req, res) => {
    const limit = parseInt(req.query.limit);
    const visibleOnly = req.query.visible === "true";
    const from = parseInt(req.query.from);
    const to = parseInt(req.query.to);
    const fromProducer = req.query.fromProducer;

    const search = req.query.search || "";

    try {
        let noticias;

        // if (search && search.trim() !== "") {
        //     // Caso exista search, só usas a função específica para search (ignoras outros filtros)
        //     noticias = await noticiaController.findPostsBySearch(search);
        // }
        // // Caso: from & to definidos, privados e publicos (ex: paginação)
        // else if (!visibleOnly && !isNaN(from) && !isNaN(to)) {
        //     noticias = await noticiaController.findItemsBetween(from, to);
        // } 
        // // Caso: from & to definidos, só os publicos (ex: paginação)
        // else if (visibleOnly && !isNaN(from) && !isNaN(to)) {
        //     noticias = await noticiaController.findVisibleItemsBetween(from, to);
        // }
        // // Caso: privados e publicos mas com limite
        // else if (!visibleOnly && !isNaN(limit)) {
        //     noticias = await noticiaController.findLastNItems(limit);
        // }
        // // Caso: publicos mas com limite
        // else if (visibleOnly && !isNaN(limit)) {
        //     noticias = await noticiaController.findLastNVisibleItems(limit);
        // }
        // // Caso: privados e publicos de um produtor
        // else if (!visibleOnly && fromProducer) {
        //     noticias = await noticiaController.findByProdutorId(fromProducer);
        // }
        // // Caso: publicos de um produtor
        // else if (visibleOnly && fromProducer) {
        //     noticias = await noticiaController.findVisiblesByProdutorId(fromProducer);
        // }
        // // Caso: só visíveis, sem limite
        // else if (visibleOnly && isNaN(limit)) {
        //     noticias = await noticiaController.findVisibleItems();
        // }
        // // Caso: nenhum parâmetro → tudo
        // else {
            noticias = await noticiaController.findNoticias();
        // }
        res.status(200).json(noticias);
    } catch (err) {
        console.error("Erro ao buscar items:", err);
        res.status(500).json({ error: "Erro ao buscar items" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        let noticia = await noticiaController.findById(req.params.id);

        if (!noticia) {
            return res.status(404).json({ error: "Noticia não encontrado" });
        }

        res.status(200).json(noticia);
    } catch (err) {
        console.error("Erro ao ir buscar a noticia:", err);
        res.status(500).json({ error: "Erro ao ir buscar a noticia" });
    }
});

router.post("/", async function(req, res, next) {
    try {
        let data = req.body;
        await noticiaController.save(data);

        res.sendStatus(201);
    } catch (err) {
        console.error(`Error while creating a new: ${err}`);
        res.status(500).json({ error: "Error while creating a new." });
    }
})

router.put("/:id", async function(req, res, next) {
    try {
        let data = req.body;
        await noticiaController.update(req.params.id, data);

        res.sendStatus(200);
    } catch (err) {
        console.error(`Error while updating a new: ${err}`);
        res.status(500).json({ error: "Error while updating a new." });
    }
});

router.delete("/:id", async function(req, res, next) {
    try {
        await noticiaController.delete(req.params.id);

        res.sendStatus(200);
    } catch (err) {
        console.error(`Error while deleting a new: ${err}`);
        res.status(500).json({ error: "Error while deleting a new." });
    }
});


module.exports = router;