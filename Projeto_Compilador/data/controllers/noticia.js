const Noticia = require("../models/noticia.js");

module.exports.findById = (id) => {
    return Noticia.findById(id).exec();
}

// Get all items (sorted by created_at descending)
module.exports.findNoticias = () => {
    return Noticia.find().sort({ created_at: -1}).exec();
}

// // Get only items with visibility true
// module.exports.findVisibleItems = () => {
//     return Item.find({ visibility: true })
//         .sort({ insert_date: -1 })
//         .exec();
// }

// // Get last N items (sorted by created_at descending)
// module.exports.findLastNItems = (n) => {
//     return Item.find()
//     .sort({ insert_date: -1})
//     .limit(n)
//     .exec();
// }

// // Get last N visible items
// module.exports.findLastNVisibleItems = (n) => {
//     return Item.find({ visibility: true })
//         .sort({ insert_date: -1 })
//         .limit(n)
//         .exec();
// }

// module.exports.findByProdutorId = (id) => {
//     return Item
//             .find({"productor_id": id})
//             .sort({ insert_date: -1 })
//             .exec();
// }

// module.exports.findVisiblesByProdutorId = (id) => {
//     return Item
//             .find({productor_id: id, visibility: true })
//             .sort({ insert_date: -1 })
//             .exec();
// }

// //TODO: Perceber se algum ponto pode fazer sentido ou nao
// module.exports.findItemsBetween = (first, last) => {
//     const limit = last - first;
//     return Item.find()
//         .sort({ insert_date: -1 })
//         .skip(first)
//         .limit(limit)
//         .exec();
// }

// module.exports.findVisibleItemsBetween = (first, last) => {
//     const limit = last - first;
//     return Item.find({ visibility: true })
//         .sort({ insert_date: -1 })
//         .skip(first)
//         .limit(limit)
//         .exec();
// }


module.exports.update = (id, obj) => {
    return Noticia
            .findByIdAndUpdate(id, obj)
            .exec();
}

module.exports.save = (noticia) => {
    let noticiaDb = new Noticia(noticia);
    return noticiaDb.save();
}

module.exports.delete = (id) => {
    return Noticia
            .findByIdAndDelete(id)
            .exec();
}