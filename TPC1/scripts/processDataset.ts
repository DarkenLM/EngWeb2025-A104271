import * as fsp from "fs/promises";
import path from "path";

const __dirname = path.dirname(import.meta.url.replace("file://", ""));

const fileData = await fsp.readFile(path.resolve(__dirname, "../dataset/dataset_reparacoes.json"), { encoding: "utf8" });
const dataset = JSON.parse(fileData);

const newDataset = {
    reparacoes: [],
    intervencoes: [],
    viaturas: []
};

const nifSet = new Set<number>();
const interSet = new Set<string>();
// for (const rep of dataset.reparacoes) {
for (const i in dataset.reparacoes) {
    const rep = dataset.reparacoes[i];
    if (nifSet.has(rep.nif)) {
        console.warn(`NIF already processed: ${rep.nif}.`);
        continue;
    }
    nifSet.add(rep.nif);

    if (rep.viatura) {
        const veiculo = rep.viatura;
        veiculo.reparacoeId = i;

        newDataset.viaturas.push(veiculo);
    }
    if (rep.intervencoes) {
        // newDataset.intervencoes.push(...rep.intervencoes.map(interv => ({...interv, reparacoeId: i})));
        for (const interv of rep.intervencoes) {
            if (interSet.has(interv.codigo)) continue;

            newDataset.intervencoes.push({ ...interv, id: interv.codigo });
            interSet.add(interv.codigo);
        }
    }

    const intervs = rep.intervencoes.map(interv => interv.codigo);

    delete rep.viatura;
    delete rep.intervencoes;
    
    rep.id = i;
    rep.intervencoes = intervs;
    newDataset.reparacoes.push(rep);
}

newDataset.intervencoes.sort((a,b) => a.codigo.localeCompare(b.codigo));

await fsp.writeFile(
    path.resolve(__dirname, "../dataset/dataset_reparacoes_norm.json"), 
    JSON.stringify(newDataset, null, 2), 
    { encoding: "utf8" }
);
