const Item = require("../models/item.js");

module.exports.findById = (id) => {
    return Item.findById(id).exec();
}

// Buscar posts filtrando pelo termo search no title ou content
module.exports.findPostsBySearch = (search) => {
    if (!search || search.trim() === "") {
        return Item.find({ visibility: true })
            .sort({ insert_date: -1 })
            .exec();
    }

    const regex = new RegExp(search, "i");

    return Item.find({
        visibility: true,
        $or: [
            { itemName: { $regex: regex } },
            { productor_id: { $regex: regex } }
        ]
    })
    .sort({ insert_date: -1 })
    .exec();
};

module.exports.findPostsBySearchAndTags = (search, tagsArray) => {
    return Item.find({
        visibility: true,
        itemName: { $regex: search, $options: "i" },
        "resources.type": { $in: tagsArray }
    }).sort({ insert_date: -1 }).exec();
};

module.exports.findPostsByTags = (tagsArray) => {
    return Item.find({
        visibility: true,
        "resources.type": { $in: tagsArray }
    }).sort({ insert_date: -1 }).exec();
};

module.exports.findAllTags = () => {
    return Item.aggregate([
        { $unwind: "$resources" },
        { $unwind: "$resources.type" },
        { $group: { _id: "$resources.type" } },
        { $sort: { _id: 1 } }
    ]).exec().then(results => results.map(r => r._id));
};

// Get all items (sorted by created_at descending)
module.exports.findItems = () => {
    return Item.find().sort({ insert_date: -1}).exec();
}

// Get only items with visibility true
module.exports.findVisibleItems = () => {
    return Item.find({ visibility: true })
        .sort({ insert_date: -1 })
        .exec();
}

// Get last N items (sorted by created_at descending)
module.exports.findLastNItems = (n) => {
    return Item.find()
    .sort({ insert_date: -1})
    .limit(n)
    .exec();
}

// Get last N visible items
module.exports.findLastNVisibleItems = (n) => {
    return Item.find({ visibility: true })
        .sort({ insert_date: -1 })
        .limit(n)
        .exec();
}

module.exports.findByProdutorId = (id) => {
    return Item
            .find({"productor_id": id})
            .sort({ insert_date: -1 })
            .exec();
}

module.exports.findVisiblesByProdutorId = (id) => {
    return Item
            .find({productor_id: id, visibility: true })
            .sort({ insert_date: -1 })
            .exec();
}

//TODO: Perceber se algum ponto pode fazer sentido ou nao
module.exports.findItemsBetween = (first, last) => {
    const limit = last - first;
    return Item.find()
        .sort({ insert_date: -1 })
        .skip(first)
        .limit(limit)
        .exec();
}

module.exports.findVisibleItemsBetween = (first, last) => {
    const limit = last - first;
    return Item.find({ visibility: true })
        .sort({ insert_date: -1 })
        .skip(first)
        .limit(limit)
        .exec();
}


module.exports.update = (id, obj) => {
    return Item
            .findByIdAndUpdate(id, obj)
            .exec();
}

module.exports.addComment = async (itemId, commentObj) => {
    return await Item.findByIdAndUpdate(
        itemId,
        { $push: { comments: commentObj } },
        { new: true } // retorna o item atualizado
    );
};

module.exports.save = (item) => {
    let itemDb = new Item(item);
    return itemDb.save();
}

module.exports.delete = (id) => {

    return Item
            .findByIdAndDelete(id)
            .exec();
}