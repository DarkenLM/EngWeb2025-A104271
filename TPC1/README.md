# TPC 1

**Titulo:** Painel de uma Oficina Automóvel  
**Data:**  2025-02-11  
**Nome:** Rafael Santos Fernandes  
**Número:** A104271  
<img src="../assets/img/foto.jpg" alt="foto" width="200" />

## Resumo
### Enunciado
Construir um serviço em nodejs, que consuma a API de dados servida pelo json-server da oficina de reparações e responda com as páginas web do site:
- Página principal: lista de dados consultáveis;
- Listagem das reparações: Data, nif, nome, marca, modelo, número de intervenções realizadas;
- Listagem dos tipos de intervenção: lista alfabética de código das intervenções - código, nome e descrição;
- Listagem das marcas e modelos dos carros intervencionados: lista alfabética das marcas e modelos dos carros reparados - marca, modelo, número de carros;
- Página da Reparação: página com toda a informação de uma reparação;
- Página do tipo de intervenção: dados da intervenção (código, nome e descrição) e lista de reparações onde foi realizada;
- Página do marca/modelo: idem...

### Resolução
Comecei por examinar o [dataset fornecido](./dataset/dataset_reparacoes.json) e analizar a sua estrutura e retirei as seguintes conclusões:
- Todos os dados encontram-se numa única lista no nível superior, com a chave `reparacoes`.
- Os dados das intervenções são repetidos em todas as reparações.
- Para obter os dados das viaturas é necessário iterar a lista de reparações, havendo a possibilidade de mais do que uma reparação estar associada a uma viatura.

Decidi então preprocessar o dataset antes de ser utilizado pelo `json-server` de modo a corrigir esses problemas, tomando as seguintes decisões:
- Os dados foram separados em três listas: `reparacoes`, `intervencoes` e `viaturas`.
- Foi adicionada a propriedade `id` a cada reparação, e a propriedade `reparacoeId` a cada viatura, de modo a estabelecer relacionamentos em queries executadas com o `json-server`. Foi adicionada a propriedade `id` a cada intervenção pelo mesmo motivo.

Decidi implementar o serviço em nodejs com recurso ás packages [`express`](https://npmjs.com/package/express) e [`ejs`](https://npmjs.com/package/ejs), de modo a melhorar a organização da aplicação.

Todas as páginas seguem um layout constituído por uma navbar horizontal, uma sidebar vertical, uma secção de conteúdo e um footer. A navbar e o footer estão definidos em [`public/routes/_templates`](./public/routes/_templates), e é importada por todas as páginas, enquanto o resto do layout é definido por página.

Durante o desenvolvimento, foi utilizado o package manager `pnpm` em vez do normal `npm`, de modo a reduzir o espaço ocupado pelas dependências do projeto. Foi também utilizado o Typescript em conjunto com o ESLint de modo a detetar e corrigir erros mais facilmente.  
O diretório `public/assets` contém um `jsconfig.json` de modo a ter acesso ás declarações de tipos da DOM sem poluír o escopo do backend do serviço.


### Execução

> É possível utilizar o `npm` para a execução da aplicação simplesmente substutuíndo `pnpm` por `npm` nos comandos seguintes.

Para preprocessar o dataset, execute o comando `pnpm run scripts scripts/processDataset.ts`.  
Para compilar o serviço em nodejs, execute o comando `pnpm run build`.  
Para executar o API fornecido pelo `json-server`, execute o comando `pnpm run run:api`.  
Para executar o serviço em nodejs, execute o comando `pnpm run run`.  

Tanto o API como o serviço têm de estar ativos simultâneamente para o funcionamento da aplicação.

