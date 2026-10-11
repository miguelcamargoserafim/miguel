# Stack Lab — guia de edição

O laboratório funciona no próprio index.html, com HTML, CSS e JavaScript puro. Abra index.html e use Stack Lab no menu. Não exige instalação, API externa ou credenciais.

## Onde editar

| Arquivo | Responsabilidade |
| --- | --- |
| index.html | Cabeçalho, cards, área de módulos e integração ao portfólio |
| css/stack-lab.css | Tema azul escuro/ciano, fontes, responsividade e foco |
| js/lab/data.js | Textos dos cards, registros fictícios, consultas, cenários e desafios |
| js/lab/engines.js | Consulta SQL permitida, API em memória, correção e pontuação |
| js/lab/core.js | Botões, campos, tabelas, confirmação, cópia e armazenamento |
| js/lab/app.js | Navegação e montagem/desmontagem dos módulos |
| js/lab/playground.js | Exemplos HTML/CSS/JS, editor e iframe isolado |
| js/lab/terminal.js | Prompt, histórico e digitação |
| js/lab/sql.js | Interface de consultas e tabelas |
| js/lab/api.js | Formulário HTTP, resposta e confirmação de alterações |
| js/lab/support.js | Investigação e solução dos cenários |
| js/lab/challenges.js | Os seis desafios clássicos, preservados |
| js/lab/games-data.js | Tutoriais, códigos iniciais, soluções e validações dos cinco minijogos |
| js/lab/game-editor.js | Editor com sintaxe colorida, linhas e marcações ALTERE AQUI |
| js/lab/game-runner.js | Execução em iframe/Worker isolado, com limite de tempo |
| js/lab/games.js | Navegação guiada, dicas, soluções, pontuação e progresso |
| js/lab/support-data.js | Biblioteca de problemas e geração da mensagem |
| js/lab/support-center.js | Orientações, formulário e revisão antes do WhatsApp |
| js/lab/projects.js | Projetos reais, estados e links documentados |
| images.js | Caminhos das imagens do portfólio e das capturas |

## Imagens

Edite somente o caminho do slot desejado em images.js:
- nameBackground: fundo atrás do nome (Bliss).
- projectsBackground: fundo da galeria de projetos (download).
- signal: captura do website Signal Solution.
- dai: captura do website Daí Lanches.
- leads: captura do aplicativo interno Leads Signal Solution.

O Stack Lab reutiliza signal, dai e leads. Não existe formulário de upload. Prefira imagens em assets/. O build também copia imagens que já estão na raiz, incluindo signalsolutions.png e dai lanches.png.

## Funcionamento do MVP

1. Estrutura e navegação: seis cards abrem os módulos na mesma página; seletor troca o experimento e o botão de retorno devolve o foco ao card.
2. Playground e terminal: três abas com navegação por setas, execução, restauração e cópia; terminal com sete comandos, histórico por setas, clear e digitação respeitando movimento reduzido.
3. SQL e API: quatro tabelas fictícias relacionadas e cinco consultas educativas; GET/POST/PUT/DELETE simulados com validação e confirmação antes de alterações. As alterações da API são descartadas ao sair do módulo.
4. Suporte e desafios: quatro cenários com explicações e seis desafios em três dificuldades. Dicas, validação, pontos únicos e tentativas salvos localmente.
5. Projetos: estados existentes preservados. DreamStation é identificado como documentação pendente; não foram atribuídos tecnologias, entregas ou links desconhecidos.
6. Revisão: interface em pt-BR; fontes Inter e JetBrains Mono com fallback local; controles de idioma e tema do restante do portfólio preservados. O laboratório mantém a identidade escura especificada, mesmo no tema claro do portfólio.

## Limites das demonstrações

- SQL não interpreta consultas arbitrárias: aceita apenas exemplos cadastrados.
- API não usa fetch nem modifica recursos externos; os dados são apenas desta sessão.
- Terminal não é um shell.
- Os seis desafios clássicos verificam respostas como texto. Os cinco minijogos guiados executam JavaScript em Worker dentro de iframe opaco, com CSP bloqueando conexões e interrupção após 2,2 segundos. HTML/CSS usam prévia isolada e verificação específica de texto e estilos.
- Playground executa código em iframe com sandbox allow-scripts, sem allow-same-origin. CSP bloqueia rede, formulários e recursos externos. HTML é processado em template inerte; scripts e atributos de navegação/evento são removidos da aba HTML. JavaScript é inserido exclusivamente na prévia isolada. Código com laços infinitos ainda pode deixar a prévia sem resposta; o MVP é destinado a exemplos pequenos.
- Somente preferências e progresso educativo ficam no localStorage; nenhum segredo ou token é usado.
- As capturas atuais vêm dos arquivos fornecidos. Tecnologias e funcionalidades detalhadas dos projetos precisam de documentação do autor.

## Testes e publicação

Execute na pasta do projeto:

    npm test
    npm run build

Testes de lógica em tests/stack-lab.test.cjs cobrem SQL, CRUD, isolamento de dados, validação, pontuação, comandos, recursos locais e configurações de segurança.

A interface também foi verificada em Chrome headless: seis módulos em 390, 768 e 1440px; abertura por teclado, foco, abas, histórico, prévia funcional e erro de sintaxe, confirmação de API, cenários e progresso. Capturas locais ficam em .test-results/. Esse teste é repetível com tests/browser-check.mjs e Chrome de teste com depuração na porta local 9229. Não use o perfil pessoal para esse teste.

O build prepara dist/ com os arquivos públicos. Nenhuma publicação foi feita nesta alteração. Antes de publicar, complete os detalhes de DreamStation e confira os links e o conteúdo final.

## Atualização educativa e suporte

A seção antiga de projetos e seus atalhos foram removidos. Os projetos documentados fora dela permanecem no Stack Lab. Os contatos ficam também no topo das duas páginas, incluindo o Instagram da Signal Solutions.

Developer Challenges inicia em Prática guiada. Cada atividade oferece tutorial, código preenchido, execução, dicas progressivas, restauração, solução, próximo desafio e retorno. O modo Desafios clássicos mantém as seis atividades anteriores. Pontos guiados não são duplicados e usam a chave local stack-lab-games-v1; os clássicos mantêm stack-lab-progress-v1.

Tech Support Lab oferece 12 categorias com sintomas, possibilidades e passos iniciais. Os quatro cenários anteriores continuam no painel de prática. O formulário pede problema, dificuldade, período, descrição e equipamento; tentativas anteriores são opcionais. Outro período e Outro dispositivo habilitam campos próprios. O relato não é persistido. Revisar mensagem gera texto e um link para o WhatsApp +55 (24) 99976-5334; apenas o visitante abre e envia a mensagem. Alterações no formulário invalidam o link anterior.

As habilidades informadas pelo autor estão identificadas: HTML, CSS, JavaScript, TypeScript, Cobalt e AI Specialist. Isso não altera as tecnologias usadas na implementação do site.

Testes adicionais: tests/browser-updates.mjs cobre as cinco soluções, respostas erradas, tempo limite, restauração, dicas, progresso, formulário, codificação do WhatsApp e responsividade. Nenhuma conversa foi aberta ou mensagem enviada durante os testes.

## Aba de suporte

O suporte tem um botão roxo grande abaixo do nome na página principal, com texto bilíngue e descrição de diagnóstico/WhatsApp. Não há item de suporte no menu superior. O endereço index.html#tech-support abre diretamente a central na mesma página. O card do Stack Lab continua disponível. Ao fechar ou trocar o módulo, o destaque ativo é atualizado.
