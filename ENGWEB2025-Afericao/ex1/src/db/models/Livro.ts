import mongoose, { Schema } from "mongoose";

const LivroSchema = new Schema(
    {
        bookId: String,
        author: [String],
        awards: [String],
        bbeScore: String,
        bbeVotes: String,
        bookFormat: String,
        characters: [String],
        coverImg: String,
        description: String,
        edition: String,
        firstPublishDate: String,
        genres: [String],
        isbn: String,
        language: String,
        likedPercent: String,
        numRatings: String,
        pages: String,
        price: String,
        publisher: String,
        publishDate: String,
        rating: String,
        ratingsByStars: [String],
        series: String,
        setting: [String],
        title: String,
    },
    // { strict: false }
);
const LivroModel = mongoose.model("Livro", LivroSchema, "livros");
// const LivroModel = mongoose.model("Livro", {}, "contratos");

export default LivroModel;