# Portfólio de Miguel Camargo Serafim

Abra index.html no navegador. Não é necessário instalar dependências.

## Onde editar

| Arquivo | O que editar |
| --- | --- |
| index.html | Estrutura da página principal, nome, navegação e contatos superiores |
| contact.html | Links e estrutura dos contatos |
| images.js | Caminhos de todas as imagens, com comentários indicando cada posição |
| js/translations.js | Textos em inglês e português, no formato [inglês, português] |
| js/i18n.js | Seletor de idioma e aplicação das traduções |
| js/theme.js | Tema claro/escuro |
| js/images.js | Carregamento das imagens e visual padrão quando falta um arquivo |
| js/animations.js | Efeitos de rolagem, retrato ASCII e movimento com o mouse |
| js/hover.js | Inclinação, luz seguindo o mouse e atração dos botões |
| js/main.js | Inicialização da página |
| css/style.css | Cores, fontes, layout e adaptação para celular |
| css/animations.css | Animações, contorno do nome e estilos dos efeitos |
| assets/ | Fotos e prévias dos projetos |
| scripts/build.mjs | Prepara os arquivos públicos em dist/ |

## Imagens

- nameBackground: assets/bliss.jpg — Bliss atrás do nome na página principal.
- projectsBackground: assets/projects-background.jpg — download.jpg atrás da galeria inteira.
- hero: foto principal ao lado do nome. Caminho vazio mantém o monograma.
- signal: prévia do WEBSITE Signal Solution.
- dai: prévia do site Dai Lanches.
- leads: prévia do APLICATIVO INTERNO Leads Signal Solution.

Coloque o arquivo em assets/ e informe o caminho em images.js. Também é possível usar um link direto HTTPS de imagem. Uma imagem que não carrega mantém o visual padrão.

## Animações

As opções ficam no início de js/animations.js:

- asciiPortrait: false desativa o retrato em caracteres.
- asciiColumns: controla a quantidade de detalhes.
- pointerDistance: controla o movimento pelo mouse.
- staggerDelay: intervalo de entrada dos projetos.

O retrato ASCII usa o monograma enquanto não existe foto. Fotos externas sem permissão de leitura pelo navegador permanecem com o visual original. Todos os movimentos respeitam a preferência por movimento reduzido. Textos e imagens continuam acessíveis sem animações.

## Projetos dentro do Stack Lab

Edite somente as informações documentadas em js/lab/projects.js. A antiga seção independente de projetos foi removida. Os caminhos das capturas continuam em images.js.

## Preparar publicação

Depois de editar, execute na pasta do projeto:

    node scripts/build.mjs

Ou: npm run build. Não é necessário npm install.

Os arquivos prontos ficam em dist/. Não edite dist/ diretamente. As pastas .backup* preservam versões anteriores; .reference-frames guarda os quadros usados na análise da gravação. Elas não fazem parte do site publicado.

A publicação online continua pendente por falta de conexão com o servidor da hospedagem. O identificador existente foi preservado em .openai/hosting.json.

## Efeitos ao passar o mouse

Em js/hover.js, tiltDegrees controla a inclinação (padrão: 4 graus) e buttonDistance controla quanto os botões seguem o cursor (padrão: 5 pixels). Os efeitos param em telas de toque e quando a preferência por movimento reduzido está ativa.

## Stack Lab

O menu abre #stack-lab na própria página. Os módulos estão em js/lab/ e os estilos em css/stack-lab.css. Consulte STACK-LAB.md para editar os minijogos, tutoriais, cenários, biblioteca de suporte e formulário de WhatsApp. Todos funcionam localmente, sem credenciais ou cadastro.
