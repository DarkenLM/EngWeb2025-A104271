const express = require("express");
const itemController = require("../controllers/item.js");
const router  = express.Router();
const Auth = require('../auth/auth.js')

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
    const tags = req.query.tags || ""; 

    try {
        let items;

        // Caso: search + tags → filtro combinado
        if (search && search.trim() !== "" && tags && tags.trim() !== "") {
            const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
            items = await itemController.findPostsBySearchAndTags(search, tagsArray);
        } 
        // Caso: só search
        else if (search && search.trim() !== "") {
            items = await itemController.findPostsBySearch(search);
        } 
        // Caso: só tags
        else if (tags && tags.trim() !== "") {
            const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
            items = await itemController.findPostsByTags(tagsArray);
        }
        // Caso: from & to definidos, privados e publicos (ex: paginação)
        else if (!visibleOnly && !isNaN(from) && !isNaN(to)) {
            items = await itemController.findItemsBetween(from, to);
        } 
        // Caso: from & to definidos, só os publicos (ex: paginação)
        else if (visibleOnly && !isNaN(from) && !isNaN(to)) {
            items = await itemController.findVisibleItemsBetween(from, to);
        }
        // Caso: privados e publicos mas com limite
        else if (!visibleOnly && !isNaN(limit)) {
            items = await itemController.findLastNItems(limit);
        }
        // Caso: publicos mas com limite
        else if (visibleOnly && !isNaN(limit)) {
            items = await itemController.findLastNVisibleItems(limit);
        }
        // Caso: privados e publicos de um produtor
        else if (!visibleOnly && fromProducer) {
            items = await itemController.findByProdutorId(fromProducer);
        }
        // Caso: publicos de um produtor
        else if (visibleOnly && fromProducer) {
            items = await itemController.findVisiblesByProdutorId(fromProducer);
        }
        // Caso: só visíveis, sem limite
        else if (visibleOnly && isNaN(limit)) {
            items = await itemController.findVisibleItems();
        }
        // Caso: nenhum parâmetro → tudo
        else {
            items = await itemController.findItems();
        }

        res.status(200).json(items);
    } catch (err) {
        console.error("Erro ao buscar items:", err);
        res.status(500).json({ error: "Erro ao buscar items" });
    }
});


router.get('/tags', async (req, res) => {
    try {
        const tags = await itemController.findAllTags();
        res.json({ tags });
    } catch (error) {
        console.error('Erro ao obter tags:', error);
        res.status(500).json({ error: 'Erro ao buscar tags' });
    }
});

router.post("/:id/comments", Auth.validate, async (req, res) => {
    const itemId = req.params.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ error: "Comentário vazio não é permitido." });
    }

    try {
        const comment = {
            author: req.user.username,
            content: content.trim(),
            created_at: new Date()
        };

        const updatedItem = await itemController.addComment(itemId, comment);

        if (!updatedItem) {
            return res.status(404).json({ error: "Item não encontrado para comentar." });
        }

        res.status(200).json({ message: "Comentário adicionado com sucesso.", comment });
    } catch (err) {
        console.error("Erro ao adicionar comentário:", err);
        res.status(500).json({ error: "Erro interno ao adicionar comentário." });
    }
});

router.get("/:id", async (req, res) => {
    try {
        console.log(req.params.id);
        let item = await itemController.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ error: "Item não encontrado" });
        }

        res.status(200).json(item);
    } catch (err) {
        console.error("Erro ao ir buscar o item:", err);
        res.status(500).json({ error: "Erro ao ir buscar o item" });
    }
});


module.exports = router;