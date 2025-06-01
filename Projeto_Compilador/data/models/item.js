const mongoose = require("mongoose");

// Subdocumento de comentário
const commentSchema = new mongoose.Schema({
    author: String, // username do utilizador
    content: String,
    created_at: { type: Date, default: Date.now }
});

const resourceSchema = new mongoose.Schema({
    original_path: String,
    checksum: String,
    encoding: String,
    mimetype: String,
    size: Number,
    title: String,
    type: [String],
    created_at: Date,
    submit_at: Date
});

const itemSchema = new mongoose.Schema({
    itemName: String,
    visibility: Boolean,
    insert_date: Date,
    productor_id: String,
    itemDescription: String,
    comments: [commentSchema], 
    resources: [resourceSchema]
});

module.exports = mongoose.model("item", itemSchema);
