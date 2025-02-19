# TPC 2

**Titulo:** Painel de uma Escola de Música  
**Data:**  2025-02-18  
**Nome:** Rafael Santos Fernandes  
**Número:** A104271  
<img src="../assets/img/foto.jpg" alt="foto" width="200" />

## Resumo
### Enunciado
* Construir um serviço em nodejs, que consuma a API de dados servida pelo json-server da escola de música (implementada na segunda aula teórica) e sirva um website com as seguintes caraterísticas:

- Página principal: Listar alunos, Listar Cursos, Listar Instrumentos;

- Página de alunos: Tabela com a informação dos alunos (clicando numa linha deve saltar-se para a página de aluno);

- Página de cursos: Tabela com a informação dos cursos (clicando numa linha deve saltar-se para a página do curso onde deverá aparecer a lista de alunos a frequentá-lo);

- Página de instrumentos: Tabela com a informação dos instrumentos (clicando numa linha deve saltar-se para a página do instrumento onde deverá aparecer a lista de alunos que o tocam).

### Resolução
Comecei por examinar o [dataset fornecido](./dataset/db.json), analizar a sua estrutura e retirar as seguintes conclusões:
- Existem três coleções de dados: `alunos`, `cursos` e `instrumentos`.
- Não existem chaves de relacionamento entre `alunos` e `instrumentos`. Os dados dos segundos estão embebidos nas estruturas de dados dos primeiros.
- Os alunos contém uma chave de relacionamento entre `alunos` e `cursos`.
- Existem cursos que não possúem alunos inscritos e alunos inscritos em cursos que não existem.

Durante o desenvolvimento, decidi então tomar as seguintes decisões de design:
- Para cursos que não existem, o serviço tenta na mesma obter a lista de alunos inscritos nesse curso. Se existirem alunos inscritos, é apresentada a página de dados do curso, com valores por defeito e a lista de alunos inscritos nesse turno. Caso não existam alunos inscritos nesse curso, uma página de erro é apresentada.
- Para as páginas de dados para um dado aluno ou instrumento, uma página de erro é apresentada caso esse aluno/instrumento não exista.
- É possível obter a página de dados de um instrumento tanto pelo seu id como pelo seu nome.

Decidi implementar o serviço em nodejs com recurso ás packages [`express`](https://npmjs.com/package/express) e [`ejs`](https://npmjs.com/package/ejs), de modo a melhorar a organização da aplicação.

Todas as páginas seguem um layout constituído por uma navbar horizontal, uma sidebar vertical, uma secção de conteúdo e um footer. A navbar e o footer estão definidos em [`public/routes/_templates`](./public/routes/_templates), e é importada por todas as páginas, enquanto o resto do layout é definido por página.

Durante o desenvolvimento, foi utilizado o package manager `pnpm` em vez do normal `npm`, de modo a reduzir o espaço ocupado pelas dependências do projeto. Foi também utilizado o Typescript em conjunto com o ESLint de modo a detetar e corrigir erros mais facilmente.  
O diretório `public/assets` contém um `jsconfig.json` de modo a ter acesso ás declarações de tipos da DOM sem poluír o escopo do backend do serviço.


### Execução

> É possível utilizar o `npm` para a execução da aplicação simplesmente substutuíndo `pnpm` por `npm` nos comandos seguintes.

Para compilar o serviço em nodejs, execute o comando `pnpm run build`.  
Para executar o API fornecido pelo `json-server`, execute o comando `pnpm run run:api`.  
Para executar o serviço em nodejs, execute o comando `pnpm run run`.  

Tanto o API como o serviço têm de estar ativos simultâneamente para o funcionamento da aplicação.

