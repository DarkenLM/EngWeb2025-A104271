# TPC 3

**Titulo:** Painel de Gestão de Alunos
**Data:**  2025-02-25  
**Nome:** Rafael Santos Fernandes  
**Número:** A104271  
<img src="../assets/img/foto.jpg" alt="foto" width="200" />

## Resumo
### Enunciado
***Não Fornecido***

### Resolução
Comecei por examinar o [dataset fornecido](./dataset/alunos.json), analizar a sua estrutura e retirar as seguintes conclusões:
- Os alunos são caracterizados pelas propriedades `id`, `nome` e `git`.
- A propriedade `git`, os campos não estão normalizados. Não havendo indicação para o contrário, decidi não normalizar o dataset nem tratar o campo programáticamente no serviço.

Decidi implementar o serviço em nodejs com recurso ás packages [`express`](https://npmjs.com/package/express) e [`ejs`](https://npmjs.com/package/ejs), de modo a melhorar a organização da aplicação.

Todas as páginas foram adaptadas a partir dos [templates fornecidos](./_ORIGINAL/templates.js) e convertidas para ejs, sendo depois associadas ao serviço em nodejs.

As rotas criadas foram definidas segundo os placeholders presentes no [esqueleto de servido fornecido](./_ORIGINAL/alunos_server_skeleton.js) originalmente.
- As rotas `GET` fazem uso de requests `GET` para o API para obter as informações necessárias para a construção das páginas requeridas.
- A rota `POST /alunos/registo` faz uso de um request `POST` para o API para adicionar novas entradas ao conjunto de dados.
- A rota `POST /alunos/edit/:id` faz uso de um request `PUT` para o API para modificar entradas no conjunto de dados.
- A rota `GET /alunos/delete/:id` faz uso de um request `DELETE` para o API para eliminar entradas do conjunto de dados.

Durante o desenvolvimento, foi utilizado o package manager `pnpm` em vez do normal `npm`, de modo a reduzir o espaço ocupado pelas dependências do projeto. Foi também utilizado o Typescript em conjunto com o ESLint de modo a detetar e corrigir erros mais facilmente.  
O diretório `public/assets` contém um `jsconfig.json` de modo a ter acesso ás declarações de tipos da DOM sem poluír o escopo do backend do serviço.


### Execução

> É possível utilizar o `npm` para a execução da aplicação simplesmente substutuíndo `pnpm` por `npm` nos comandos seguintes.

Para compilar o serviço em nodejs, execute o comando `pnpm run build`.  
Para executar o API fornecido pelo `json-server`, execute o comando `pnpm run run:api`.  
Para executar o serviço em nodejs, execute o comando `pnpm run run:service`.  

Tanto o API como o serviço têm de estar ativos simultâneamente para o funcionamento da aplicação.
