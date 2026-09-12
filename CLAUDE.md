# sam-skills-code

## Commits

Nunca adicionar IA como contribuinte dos commits. Sem `Co-Authored-By` de
assistente, sem linha de sessão, sem menção a ferramenta de IA na mensagem —
os commits são assinados apenas pelo autor humano.

## Estrutura

Site estático, sem build: `index.html` na raiz, `src/css/styles.css`,
`src/js/*.js`. Bootstrap e Bootstrap Icons vêm por CDN.

Cada conteúdo é um card em `index.html`, com as tags visíveis em
`<ul class="card-tags">` e sinônimos de busca no atributo `data-busca` da
coluna. `src/js/busca.js` lê os cards direto do HTML — nenhum registro extra
é necessário ao adicionar um card.

Para testar localmente: `python3 -m http.server` na raiz do projeto (abrir por
`file://` quebra o carregamento dos scripts em alguns navegadores).
