# Relatório do Projeto Final – Engenharia Web 2025
### "O meu eu digital"    
**1 de junho de 2025**

---

## 1. Introdução

Este relatório descreve o desenvolvimento do projeto final da unidade curricular de Engenharia Web. O objetivo do projeto foi criar uma aplicação Web que representasse o “meu eu digital”, correspondendo a um diário digital que permite a cada utilizador registar e organizar os seus dados pessoais com uma componente cronológica e semântica.

A aplicação suporta diferentes tipos de conteúdos (como texto, imagens, eventos, etc.), com o objetivo de proporcionar uma representação personalizada e estruturada da vida do utilizador.

---

## 2. Análise e Planeamento

Foi feita uma análise aos requisitos funcionais propostos no enunciado, e definiram-se as seguintes decisões de projeto:
8
- A aplicação tem como eixo principal a **linha temporal** dos conteúdos.
- Os conteúdos são classificados por **tipos** e **tags**, com base numa **taxonomia controlada** definida pela equipa.
- Cada entrada possui metadados: título, descrição, data, visibilidade (privado/público), e comentários.
- Por omissão, os conteúdos são privados, mas o produtor pode torná-los públicos.
- Os conteúdos públicos são visíveis no **frontoffice**, enquanto os privados só são acessíveis via **backoffice** do próprio utilizador.

---

## 3. Arquitetura da Solução

A aplicação segue uma arquitetura dividida em serviços, com componentes separadas para o frontend, API e armazenamento:

- **Frontend (porta 3001)**: Interface Web pública e privada para interação com o utilizador.
- **API de Dados (porta 3000)**: Responsável por todas as operações sobre a base de dados e gestão de conteúdos.
- **Base de dados MongoDB**: Guarda todos os metadados e relações entre recursos, assim como os utilizadores e as notícias.
- **Sistema de ficheiros**: Armazena os ficheiros de forma organizada e escalável.

O fluxo básico é o seguinte: o utilizador interage com o frontend, que comunica com a API, que por sua vez manipula dados na base de dados ou sistema de ficheiros conforme necessário.

---

## 4. Implementação Técnica

### Autenticação

A autenticação foi implementada com o módulo **Passport**, garantindo a gestão de sessões e o controlo de acessos à interface de administração (Backoffice).

### Ingestão de SIP

A submissão de novos recursos é feita via um formulário que aceita ficheiros ZIP com a estrutura de um **SIP (Submission Information Package)**. O processo inclui:

- Validação da existência do `manifesto-SIP.json` ;
- Verificação dos ficheiros referenciados no manifesto;
- Validação das tags de cada recurso;
- Armazenamento da metainformação na base de dados;
- Armazenamento dos ficheiros no file system.

### Armazenamento de Ficheiros (AIP)

Cada recurso submetido gera um **AIP (Archival Information Package)**, sendo guardado de forma híbrida:

- Metainformação na base de dados MongoDB;
- Ficheiros físicos no file system, com organização baseada no **checksum SHA256**:
  - **Dois primeiros caracteres** definem a pasta;
  - **Restantes caracteres** formam o nome do ficheiro.

Este sistema garante uma gestão de ficheiros eficiente, evitando colisões e facilitando a escalabilidade.

### Metainformação dos Recursos

Cada item possui:

- Título e descrição;
- Data (para ordenação cronológica);
- Tags (taxonomia);
- Visibilidade;
- Comentários;
- Referência ao ficheiro físico.

---

## 5. Integrações Externas

Nesta versão do projeto, **não foram implementadas integrações externas** com plataformas sociais como Facebook, Twitter ou Strava, tendo sido desenvolvidas as operações de forma autónoma dentro do ecossistema da aplicação.

---

## 6. Perfis de Utilizador

O sistema distingue **três tipos de entidades**:

### Produtor

- Cria e gere os seus conteúdos.
- Pode tornar itens públicos ou privados.
- Submete SIPs e remove entradas.
- Edita o seu perfil.

### Consumidor

- Acede apenas a conteúdos **públicos**.
- Explora os recursos através de navegação cronológica ou semântica.
- Comenta sobre os recursos.
- Edita o seu perfil.


### Administrador

- Acede ao **backoffice** com funcionalidades de:
  - Gestão de utilizadores;
  - Gestão de notícias;
- Edita o seu perfil.

---

## 7. Disseminação de Conteúdos (DIP)

O acesso e visualização dos recursos é feito através do website (Frontoffice), permitindo:

- Listagem de recursos públicos;
- Consulta de metainformação;
- Descarregamento dos ficheiros.

Existe também a funcionalidade de **exportação de um item**, podendo o consumidor descarregar individualmente cada ficheiro de uma entrada.

---

## 8. Dockerização

A aplicação foi containerizada com **Docker**, permitindo uma implementação simples e modular:

- Cada componente (API, frontend, base de dados) corre num **serviço separado**.
- Foi criado um ficheiro `docker-compose.yml` para orquestração dos serviços.

---

## 9. Testes e Validação

Foram realizados vários testes para garantir o bom funcionamento da aplicação:

- Testes de submissão e ingestão de SIPs com ficheiros reais;
- Validação de erros e ficheiros em falta no manifesto;
- Testes à criação, manipulação e visualização de recursos;
- Testes de autenticação e permissões de acesso;
- Testes à exportação de ficheiros;
- Verificação da organização e acesso aos ficheiros no file system;

---

### Melhorias Futuras:

- Implementação de integrações com redes sociais;
- Suporte a mais tipos de itens (vídeo, mapas, etc.);
- Dashboards personalizados para produtores;
- Sistema de recomendação baseado em tags e histórico;
- Sistema de logs;
- Sistema de ingestão dinâmico.
