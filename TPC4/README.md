# TPC 4

**Titulo:** Cinema
**Data:**  2025-03-17  
**Nome:** Rafael Santos Fernandes  
**Número:** A104271  
<img src="../assets/img/foto.jpg" alt="foto" width="200" />

## Resumo
### Enunciado
Criar uma página para a visualização de um dataset de um cinema.
- Adicionar uma página para a visualização de filmes.
  - Deve permitir navegar para a página de edição da informação de cada filme e eliminar esse filme.
- Adicionar uma página para a edição da informação de um filme.
- Adicionar uma página para a visualização da informação de um ator.
  - Deve mostrar os filmes em que o ator participa.

### Resolução
Comecei por examinar o [dataset fornecido](./dataset/cinema.json), analizar a sua estrutura e retirar as seguintes conclusões:
- Existe apenas uma única lista de dados contendo a informação de cada filme.
- Cada filme é caracterizado pelos campos `title`, `year`, `cast` e `genres`, que representam o título, ano de produção, elenco e géneros do filme.
  - O campo `cast` do filme é caracterizado por uma lista de strings, que representam os nomes dos membros do elenco.
  - O campo `genres` do filme é caracterizado por uma lista de strings, que representam os géneros do filme.
  
Decidi então preprocessar o dataset para permitir uma melhor organização dos dados na aplicação, tomando as seguintes decisões:
- Criei uma estrutura com três campos: `filmes`, `cast`, `genres`, que contém listas com as informações relativas aos filmes, atores e géneros dos filmes, respetivamente.
- A lista `filmes` contém todos os campos de primeira ordem de cada entrada do dataset original, á excepção dos campos `cast` e `genres`, que foram subtituídos por listas contendo as chaves de relacionamento com as suas entradas nas coleções `cast` e `genres`, respetivamente.
- A lista `cast` contém todos os atores de todos os filmes no dataset original, sem duplicados, caracterizados pelo seu `id` e pelo seu nome (`name`).
- A lista `genres` contém todos os géneros de todos os filmes no dataset original, sem duplicados, caracterizados pelo seu `id` e pelo seu nome (`name`).

Decidi implementar o serviço em nodejs com recurso ás packages [`express`](https://npmjs.com/package/express) e [`pug`](https://npmjs.com/package/pug), de modo a melhorar a organização da aplicação, tomando as seguintes decições:
- Os templates das páginas a servir existem no diretório `views`.
- As rotas da aplicação estão agrupadas por Routers no diretório `src/routes`, que agrupam rotas mediante o nome do componente de primeira ordem do path do URL, nomeadamente, nos routers `films` e `actors`.
- As rotas `GET` fazem uso de requests `GET` para o API para obter as informações necessárias para a construção das páginas requeridas.
- A rota `POST /filmes/edit/:id` fazem uso de requests `GET` para o API para obter as informações necessárias para a reconstrução dos dados do pedido, convertendo os membros de elenco e géneros do filme para os seus `id`s e faz uso de vários request `POST` para o API para adicionar novas entradas aos conjuntos de dados, incluíndo as entradas não existentes nos conjuntos `cast` e `genres`.
- A rota `GET /filmes/delete/:id` faz uso de um request `DELETE` para o API para eliminar entradas do conjunto de dados.

Durante o desenvolvimento, foi utilizado o package manager `pnpm` em vez do normal `npm`, de modo a reduzir o espaço ocupado pelas dependências do projeto. Foi também utilizado o Typescript em conjunto com o ESLint de modo a detetar e corrigir erros mais facilmente.  
O diretório `public/assets` contém um `jsconfig.json` de modo a ter acesso ás declarações de tipos da DOM sem poluír o escopo do backend do serviço.


### Execução

> É possível utilizar o `npm` para a execução da aplicação simplesmente substutuíndo `pnpm` por `npm` nos comandos seguintes.

Para compilar o serviço em nodejs, execute o comando `pnpm run build`.  
Para executar o API fornecido pelo `json-server`, execute o comando `pnpm run run:api`.  
Para executar o serviço em nodejs, execute o comando `pnpm run run:service`.  

Tanto o API como o serviço têm de estar ativos simultâneamente para o funcionamento da aplicação.
