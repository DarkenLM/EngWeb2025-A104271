const express = require("express");
const axios   = require("axios");
const multer  = require("multer");
const fs      = require("fs");
const jszip   = require("jszip");
const path    = require("path");

const config  = require("../../config.js");
const { requireUserType } = require("../auth/auth.js");
const router  = express.Router();
const { checkIfAuthenticated } = require("../auth/auth.js");

const upload = multer({ dest: config.uploadFolder })

router.get("/form", function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "produtor") {
        return res.redirect("/login");
    }

    res.status(200).render("produtor/produtorForm");
});

router.post("/form", upload.single("file"), async function (req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "produtor") {
        return res.redirect("/login");
    }

    if (!req.file) {
        return res.render("produtor/produtorForm", { error: "Nenhum arquivo enviado." });
    }

    if (path.extname(req.file.originalname) !== '.zip') {
        return res.render("produtor/produtorForm", { error: "Apenas se aceitam ficheiros .zip" });
    }

    try {
        const fileData = fs.readFileSync(req.file.path);
        const zip = await jszip.loadAsync(fileData);

        const manifestFile = zip.file("manifesto-SIP.json");
        if (!manifestFile) {
            return res.render("produtor/produtorForm", { error: "Arquivo manifesto-SIP.json em falta." });
        }

        const data = await manifestFile.async("string");
        const manifest = JSON.parse(data);

        if (!manifest.files || typeof manifest.files !== "object") {
            return res.render("produtor/produtorForm", { error: "Manifesto mal estruturado." });
        }

        let item = {
            itemName: req.body.itemName,
            itemDescription: req.body.itemDescription,
            visibility: req.body.privacy === "on",
            insert_date: new Date(),
            productor_id: user.username,
            comments: [],
            resources: []
        };

        for (const file in manifest["files"]) {
            const fileMetaData = await zip.file(file + ".meta").async("string");
            const metadata = JSON.parse(fileMetaData);

            if (
                !metadata.created_at || 
                !metadata.submit_at || 
                !metadata.resource_title || 
                !metadata.resource_type ||
                !manifest["files"][file].checksum ||
                !manifest["files"][file].encoding ||
                !manifest["files"][file].mimetype ||
                !manifest["files"][file].size
            ) {
                return res.render("produtor/produtorForm", { error: `Encontrado ficheiro '${file}'com informação em falta.` });
            }

            for (const type of metadata.resource_type) {
                if (!config.types.includes(type)) {
                    return res.render("produtor/produtorForm", {
                        error: `Tipo de recurso inválido no '${file}.meta'.`
                    });
                }
            }

            item.resources.push({
                original_path: file,
                created_at: metadata.created_at,
                submit_at: metadata.submit_at,
                resource_title: metadata.resource_title,
                resource_type: metadata.resource_type,
                checksum: manifest["files"][file].checksum,
                encoding: manifest["files"][file].encoding,
                mimetype: manifest["files"][file].mimetype,
                size: manifest["files"][file].size
            });

            const fileContent = await zip.file(file).async("nodebuffer");
            const folder = manifest["files"][file].checksum.slice(0, 2);
            const filename = manifest["files"][file].checksum.slice(2);
            const dirPath = path.join(__dirname + "/../../vault/", folder);

            fs.mkdirSync(dirPath, { recursive: true });

            const filePath = path.join(dirPath, filename);
            fs.writeFileSync(filePath, fileContent);
        }

        await axios.post("http://localhost:3000/produtor/upload", { item: item });
        res.status(201).redirect("/produtor/dashboard");
    } catch (err) {
        console.error("Erro no upload do produtor:", err);
        if (!res.headersSent) {
            return res.render("produtor/produtorForm", { error: `Erro interno ao processar o ficheiro zip.` });
        }
    } finally {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

router.get("/dashboard", async function(req, res, next) {
    const token = req.cookies.token;
    const user = checkIfAuthenticated(req);
    
    if (!user || user.type !== "produtor") {
        return res.redirect("/login");
    }

    const [tagsResponse] = await Promise.all([
        axios.get("http://localhost:3000/posts/tags", {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
        }),
    ]);

    const allTags = tagsResponse.data;

    // Se houver tags, aplicar tags
    //if (tags.trim() !== "") {
    //    apiUrl = `http://localhost:3000/posts?tags=${encodeURIComponent(tags)}&visible=true&limit=20`;
    //}

    try  {
        axios.get("http://localhost:3000/produtor/" + user.username).then( response => {
            let data = response.data;

            function formatDate(date) {
                const pad = num => String(num).padStart(2, '0');

                const year = date.getFullYear();
                const month = pad(date.getMonth() + 1);
                const day = pad(date.getDate());
                const hours = pad(date.getHours());
                const minutes = pad(date.getMinutes());
                const seconds = pad(date.getSeconds());

                return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
            }

            let filteredData = data.map(entry => ({
                ...entry,
                insert_date: formatDate(new Date(entry.insert_date))
            }));

            res.status(200).render('layout', {
                title: 'Feed',
                entries: filteredData,
                tags: allTags,
                sidebarLeft: 'produtor/produtorDashboard_sidebarLeft',
                sidebarRight: 'produtor/produtorDashboard_sidebarRight',
                content: 'produtor/produtorDashboard_content',
                pageCss: ['/stylesheets/consumidor/feed.css', '/stylesheets/post.css', '/stylesheets/produtorCard.css'],
            });
        }).catch( err => {
            res.status(500).jsonp(err);
            return;
        })
    } catch (err) {
        console.log(`ERROR - Invalid token: ${err}`);
        return res.redirect("/login");
    }

});

router.put("/:id", async function(req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "produtor") {
        return res.redirect("/login");
    }

    try {
        await axios.put("http://localhost:3000/produtor/" + req.params.id, { visibility: req.body.visibility });
        return res.redirect("/produtor/dashboard");
    } catch (err) {
        console.log(`ERROR - Couldn't change post visibility: ${err}`);
        return res.redirect("/produtor/dashboard");
    }
});

router.delete("/:id", async function (req, res, next) {
    const user = checkIfAuthenticated(req);
    if (!user || user.type !== "produtor") {
        return res.redirect("/login");
    }

    try {
        await axios.delete("http://localhost:3000/produtor/" + req.params.id);
        return res.redirect("/produtor/dashboard");
    } catch (err) {
        console.log(`ERROR - Couldn't change post visibility: ${err}`);
        return res.redirect("/produtor/dashboard");
    }
});

module.exports = router;