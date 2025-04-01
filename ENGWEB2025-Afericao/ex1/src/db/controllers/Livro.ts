import { type Model } from "mongoose";
import LivroModel from "../models/Livro.js";

type ExtractModelSchema<M> = M extends Model<infer X> ? X : never

async function getLivros(filter: Partial<ExtractModelSchema<typeof LivroModel>> = {}) {
    return LivroModel.find(filter);
}

async function getSingleLivro(filter: Partial<ExtractModelSchema<typeof LivroModel>> = {}) {
    return LivroModel.findOne(filter);
}

async function getDistinctLivros(filter: keyof ExtractModelSchema<typeof LivroModel>) {
    return LivroModel.distinct(filter);
}

async function createLivro(init: ExtractModelSchema<typeof LivroModel>) {
    const contrato = new LivroModel(init);
    await contrato.save();
}

async function killLivro(filter: Partial<ExtractModelSchema<typeof LivroModel>>) {
    await LivroModel.deleteOne(filter);
}

export {
    getLivros,
    getSingleLivro,
    getDistinctLivros,
    createLivro,
    killLivro
};