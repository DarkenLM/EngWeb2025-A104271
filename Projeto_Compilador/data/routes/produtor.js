const express = require("express");
const Item    = require("../controllers/item.js");
const fs      = require("fs");
const path    = require("path");

const router  = express.Router();

router.get("/:id", function(req, res, next) {
    let id = req.params.id;

    Item.findByProdutorId(id)
        .then( data => { res.status(201).jsonp(data); })
        .catch( err => { res.status(500).jsonp(err); });
});

router.put("/:id", function(req, res, next)  {
    let id = req.params.id;

    Item.update(id, req.body)
        .then( data => { res.status(201).jsonp(data); })
        .catch( err => { res.status(500).jsonp(err); });
})

router.delete("/:id", function(req, res, next) {
    let id = req.params.id;

    Item.delete(id)
        .then( data => { res.status(201).jsonp(data); })
        .catch( err => { res.status(500).jsonp(err); });
})

router.post("/upload", function(req, res, next) {
    let item = req.body.item;

    Item.save(item).then( data => {
        res.status(201).jsonp(data);
    }).catch( err => {
        res.status(500).jsonp(err);
    });
})

module.exports = router;