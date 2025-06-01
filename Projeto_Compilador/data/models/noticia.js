const mongoose = require("mongoose");

const noticiaSchema = new mongoose.Schema({
    title: String,
    description: String,
    autor: String,
    created_at: Date,
    visibility: Boolean
});

module.exports = mongoose.model("noticia", noticiaSchema);