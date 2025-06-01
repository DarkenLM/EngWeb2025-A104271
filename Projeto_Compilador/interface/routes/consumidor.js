const express = require("express");
const router = express.Router();
const axios = require("axios");
const { requireUserType } = require("../auth/auth");

// Pagina incial com todos os posts e produtores, search bar, etc.
router.get("/feed", requireUserType(['consumidor']), async (req, res) => {
    const token = req.cookies.token;
    const search = req.query.search || "";
    const tags = req.query.tags || "";

    try {
        let apiUrl = "http://localhost:3000/posts?visible=true&limit=20";

        // Se houver search, aplicar search
        if (search.trim() !== "") {
            apiUrl = `http://localhost:3000/posts?search=${encodeURIComponent(search)}&visible=true&limit=20`;
        }

        // Se houver tags, aplicar tags
        if (tags.trim() !== "") {
            apiUrl = `http://localhost:3000/posts?tags=${encodeURIComponent(tags)}&visible=true&limit=20`;
        }

        // Se houver ambos, combinar ambos
        if (search.trim() !== "" && tags.trim() !== "") {
            apiUrl = `http://localhost:3000/posts?search=${encodeURIComponent(search)}&tags=${encodeURIComponent(tags)}&visible=true&limit=20`;
        }

        const [postsResponse, producersResponse, tagsResponse] = await Promise.all([
            axios.get(apiUrl, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }),
            axios.get("http://localhost:3000/user/produtores", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }),
            axios.get("http://localhost:3000/posts/tags", {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            }),
        ]);

        const posts = postsResponse.data;
        const producers = producersResponse.data;
        const allTags = tagsResponse.data;

        res.render('layout', {
            title: 'Feed',
            posts,
            producers,
            tags: allTags,
            search,
            sidebarLeft: 'consumidor/feed_sidebarLeft',
            sidebarRight: 'consumidor/feed_sidebarRight',
            content: 'consumidor/feed_content',
            pageCss: ['/stylesheets/consumidor/feed.css', '/stylesheets/post.css', '/stylesheets/produtorCard.css'],
        });

    } catch (err) {
        console.error("Erro ao buscar posts:", err.message);
        res.status(500).send("Erro ao carregar o feed.");
    }
});

// Pagina com todos os posts de um produtor especifico
// TODO: Estão a aparecer os private
router.get("/:username", requireUserType(['consumidor']), async function(req, res, next) {
    const token = req.cookies.token;
    const username = req.params.username;
    const order = req.query.order === 'asc' ? 'asc' : 'desc'; // padrão: desc

    try {
        const response = await axios.get(`http://localhost:3000/posts?fromProducer=${username}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });

        let posts = response.data;

        posts.sort((a, b) => {
            const dateA = new Date(a.insert_date);
            const dateB = new Date(b.insert_date);
            return order === 'asc' ? dateA - dateB : dateB - dateA;
        });

        const userRes = await axios.get(`http://localhost:3000/user/${username}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });

        res.render('layout', {
            title: 'singlefeed',
            posts,
            order: req.query.order || 'desc',
            user: userRes.data.userInfo,
            sidebarLeft: 'consumidor/feed_sidebarLeft',
            sidebarRight: 'consumidor/singlefeed_sidebarRight',
            content: 'consumidor/singlefeed_content',
            pageCss: ['/stylesheets/consumidor/singlefeed.css', '/stylesheets/post.css'],
        });

    } catch (err) {
        console.error("Erro ao buscar posts:", err.message);
        res.status(500).send("Erro ao carregar o feed.");
    }
});

router.post('/:idProdutor/:idEntrada', requireUserType(['consumidor']), async (req, res) => {
    const token = req.cookies.token;
    const postId = req.params.idEntrada;
    const produtorId = req.params.idProdutor;
    const commentText = req.body.content;

    try {
        await axios.post(`http://localhost:3000/posts/${postId}/comments`, {
            content: commentText
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });

        res.redirect(`/consumidor/${produtorId}/${postId}`);
    } catch (err) {
        console.error('Erro ao enviar comentário:', err.message);
        res.status(500).send('Erro ao enviar comentário.');
    }
});

router.get("/:idProdutor/:idEntrada", requireUserType(['consumidor']), async function(req, res, next) {
    const token = req.cookies.token;

    try {
        const response = await axios.get(`http://localhost:3000/posts/${req.params.idEntrada}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });

        let post = response.data;

        const userRes = await axios.get(`http://localhost:3000/user/${req.params.idProdutor}`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            withCredentials: true
        });

        post.user = userRes.data.userInfo;

        if (post.comments && post.comments.length > 0) {
            const uniqueAuthors = [...new Set(post.comments.map(c => c.author))];

            const authorDataArr = await Promise.all(uniqueAuthors.map(async author => {
                try {
                    const resUser = await axios.get(`http://localhost:3000/user/${author}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        withCredentials: true
                    });
                    return {
                        username: author,
                        avatarUrl: resUser.data.userInfo.avatar || '/images/default-avatar.png'
                    };
                } catch {
                    return {
                        username: author,
                        avatarUrl: '/images/default-avatar.png'
                    };
                }
            }));

            const authorMap = {};
            authorDataArr.forEach(a => {
                authorMap[a.username] = a.avatarUrl;
            });

            post.comments = post.comments.map(comment => ({
                ...comment,
                avatarUrl: authorMap[comment.author] || '/images/default-avatar.png'
            }));
        }

        res.render('layout', {
            title: 'item',
            post,
            user: userRes.data.userInfo,
            sidebarLeft: 'consumidor/item_sidebarLeft',
            sidebarRight: 'consumidor/item_sidebarRight',
            content: 'consumidor/item_content',
            pageCss: ['/stylesheets/consumidor/feed.css', '/stylesheets/consumidor/item.css'],
        });

    } catch (err) {
        console.error("Erro ao buscar posts:", err.message);
        res.status(500).send("Erro ao carregar o post.");
    }
});


module.exports = router;