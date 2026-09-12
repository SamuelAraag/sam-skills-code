# Sam-Skills-Code
Dicas de programação 
<a target="_blank" rel="noopener noreferrer" href="https://samuelaraag.github.io/sam-skills-code/">link para acessar</a>

![Alt Text](https://raw.githubusercontent.com/SamuelAraag/sam-skills-code/main/src/assets/screenshot/sam-skills-code-home.gif)

## Busca

A home tem um campo de busca que filtra os cards em tempo real. Ele encontra o conteúdo por:

- trecho do texto, ignorando acentos e maiúsculas (`padroes` acha `Padrões`);
- erro de digitação de até 2 caracteres (`comits` acha `commits`);
- iniciais na ordem digitada dentro da palavra (`cmt` acha `commits`);
- tags do card (`padrao de projeto` acha o card de S.O.L.I.D);
- vários termos ao mesmo tempo, funcionando como "E" (`commit git`).

Os resultados são ordenados por relevância e os trechos que casaram ficam destacados.
Atalhos: `Ctrl + K` (ou `⌘ + K` no Mac) e `/` focam a busca; `Esc` limpa.

### Adicionando um card novo

1. Copie um bloco `<div class="col-auto" data-busca="...">` no `index.html`.
2. Liste as tags visíveis do card em `<ul class="card-tags">` — elas aparecem no card e alimentam a busca.
3. Use o atributo `data-busca` para sinônimos que não vale a pena mostrar no card
   (ex.: `csharp`, `dotnet`, `naming convention`).

Nenhum passo extra é necessário: `src/js/busca.js` lê os cards direto do HTML.
