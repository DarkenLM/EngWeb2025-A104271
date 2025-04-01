## Persistência de dados
Os dados são persistidos através de uma instância de base de dados MongoDB, gerida e mantida por um docker container baseado na imagem `mongo:latest`, definido no [diretório `db`](./db/Dockerfile).

## Tratamento de dados
Todo o tratamento de dados está contido no ficheiro [`processDataset.mts`](./db/processDataset.mts). Para o executar, é necessário ter a ferramenta `tsx` instalada globalmente (pode ser instalada com o comando `npm install -g tsx`), e pode ser executado através do comando `tsx processDataset.mts` ***dentro do diretório `db`***.

## Execução das aplicações
Antes da execução da aplicação, é necessária a preparação do ambiente de desenvolvimento. Para tal, execute o script `./prepare.sh` e siga as instruções dadas.

Para a execução da aplicação, foi utilizado o Docker e Docker Compose para a criação e gestão dos containers necessários para os diferentes serviços da mesma, cujo uso é facilitado pelo uso do script `run.sh`. Para executar a aplicação na sua totalidade, execute o script `./run.sh`. 

- Caso ocorra o erro `permission denied while trying to connect to the Docker daemon socket` ao executar o script, utilize permissões de super-utilizador para a sua execução: `sudo ./run.sh`.
- Caso a base de dados não possua dados carregados (como numa primeira execução), utilize a flag `--db-prep` ao executar o script.

Para a execução de uma das aplicações `ex1` ou `ex2` individualmente, navegue até cada um dos diretórios e executar o script `build` definido no `package.json` de cada uma das aplicações. Para executar a aplicação construiída, execute o comando `node .` dentro do mesmo diretório.

Para a execução da base de dados individualmente, execute o script `./run.sh --no-web --no-api`.

## Notas dos Exercícios

### 1.3 API de dados 
- Para a rota `GET /books/:id`, o id foi obtido ao extraír a parte numérica da propriedade `bookId` do dataset original durante o seu tratamento, substituíndo a mesma propriedade.