/**
 * Busca inteligente dos cards da base de conhecimento.
 *
 * A busca casa por:
 *  - trecho do texto (substring), ignorando acentos e maiusculas;
 *  - inicio de palavra (recebe mais relevancia);
 *  - erro de digitacao (distancia de edicao de ate 2 caracteres);
 *  - caracteres soltos na ordem digitada (ex.: "cmt" encontra "commits").
 *
 * Varios termos separados por espaco funcionam como "E" (todos precisam casar).
 */
(function () {
  const input = document.getElementById('campoBusca');
  const lista = document.getElementById('listaCards');
  const status = document.getElementById('buscaStatus');
  const vazio = document.getElementById('buscaVazio');
  const vazioTitulo = document.getElementById('buscaVazioTitulo');
  const btnLimpar = document.getElementById('limparBusca');
  const atalho = document.getElementById('buscaAtalho');
  if (!input || !lista || !status) return;

  const ehMac = /mac|iphone|ipad|ipod/i.test(navigator.platform || navigator.userAgent);
  if (atalho) atalho.textContent = ehMac ? '\u2318 K' : 'Ctrl K';

  function normalizar(texto) {
    return String(texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  const itens = Array.from(lista.querySelectorAll('.col-auto')).map(function (coluna) {
    const titulo = coluna.querySelector('.card-body h3');
    const descricao = coluna.querySelector('.card-body p');
    const data = coluna.querySelector('.data-publicacao');
    const tags = Array.from(coluna.querySelectorAll('.card-tag'));
    const extra = coluna.getAttribute('data-busca') || '';

    // Nos cujo texto recebe destaque quando casa com a busca.
    const destacaveis = [titulo, descricao].concat(tags).filter(Boolean).map(function (no) {
      const texto = no.textContent.trim();
      return { no: no, texto: texto, alvo: normalizar(texto) };
    });

    return {
      coluna: coluna,
      destacaveis: destacaveis,
      alvoTitulo: normalizar(titulo ? titulo.textContent : ''),
      alvoTags: normalizar(tags.map(function (t) { return t.textContent; }).join(' ')),
      alvoExtra: normalizar([
        descricao ? descricao.textContent : '',
        data ? data.textContent : '',
        extra
      ].join(' '))
    };
  });

  const totalItens = itens.length;

  /** Distancia de edicao com corte: para assim que passa do limite. */
  function distanciaEdicao(a, b, limite) {
    if (Math.abs(a.length - b.length) > limite) return limite + 1;
    let anterior = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const atual = [i];
      let menor = i;
      for (let j = 1; j <= b.length; j++) {
        const custo = a[i - 1] === b[j - 1] ? 0 : 1;
        atual[j] = Math.min(atual[j - 1] + 1, anterior[j] + 1, anterior[j - 1] + custo);
        if (atual[j] < menor) menor = atual[j];
      }
      if (menor > limite) return limite + 1;
      anterior = atual;
    }
    return anterior[b.length];
  }

  function separarPalavras(texto) {
    return texto.split(/[^a-z0-9#+.]+/).filter(Boolean);
  }

  /** Aceita erro de digitacao no inicio de alguma palavra do texto. */
  function casaComErroDeDigitacao(texto, termo) {
    // Numeros nao ganham tolerancia: 2023 e 2026 sao coisas diferentes.
    if (termo.length < 4 || /^[0-9]+$/.test(termo)) return false;
    const limite = termo.length >= 7 ? 2 : 1;
    for (const palavra of separarPalavras(texto)) {
      const recorte = palavra.slice(0, termo.length + limite);
      if (distanciaEdicao(recorte, termo, limite) <= limite) return true;
    }
    return false;
  }

  /** Caracteres na ordem digitada dentro de uma mesma palavra (ex.: "cmt" -> "commits"). */
  function casaComoSequencia(texto, termo) {
    if (termo.length < 2) return false;
    for (const palavra of separarPalavras(texto)) {
      if (palavra[0] !== termo[0] || palavra.length < termo.length) continue;
      let posicao = 0;
      let indice = 1;
      while (indice < termo.length) {
        const proximo = palavra.indexOf(termo[indice], posicao + 1);
        if (proximo === -1) break;
        posicao = proximo;
        indice++;
      }
      if (indice === termo.length) return true;
    }
    return false;
  }

  function pontuarTexto(texto, termo) {
    if (!texto) return 0;
    const indice = texto.indexOf(termo);
    if (indice === 0) return 100;
    if (indice > 0) {
      const meioDePalavra = /[a-z0-9]/.test(texto[indice - 1]);
      // Um unico caractere so vale quando inicia uma palavra, senao casaria com tudo.
      if (meioDePalavra) return termo.length === 1 ? 0 : 60;
      return 80;
    }
    if (casaComErroDeDigitacao(texto, termo)) return 40;
    if (casaComoSequencia(texto, termo)) return 20;
    return 0;
  }

  function pontuarItem(item, termos) {
    let total = 0;
    for (const termo of termos) {
      const pontos = Math.max(
        pontuarTexto(item.alvoTitulo, termo) * 1.5,
        pontuarTexto(item.alvoTags, termo) * 1.2,
        pontuarTexto(item.alvoExtra, termo)
      );
      if (pontos === 0) return 0;
      total += pontos;
    }
    return total;
  }

  function escaparHtml(texto) {
    return texto.replace(/[&<>"]/g, function (caractere) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[caractere];
    });
  }

  /** Envolve em <mark> os trechos digitados, preservando o texto original. */
  function destacar(texto, alvo, termos) {
    if (!termos.length || alvo.length !== texto.length) return escaparHtml(texto);

    const marcados = new Array(texto.length).fill(false);
    for (const termo of termos) {
      let indice = alvo.indexOf(termo);
      while (indice !== -1) {
        for (let i = indice; i < indice + termo.length; i++) marcados[i] = true;
        indice = alvo.indexOf(termo, indice + 1);
      }
    }

    let html = '';
    let dentro = false;
    for (let i = 0; i < texto.length; i++) {
      if (marcados[i] && !dentro) { html += '<mark class="busca-destaque">'; dentro = true; }
      if (!marcados[i] && dentro) { html += '</mark>'; dentro = false; }
      html += escaparHtml(texto[i]);
    }
    return dentro ? html + '</mark>' : html;
  }

  function aplicarDestaque(item, termos) {
    item.destacaveis.forEach(function (alvo) {
      alvo.no.innerHTML = destacar(alvo.texto, alvo.alvo, termos);
    });
  }

  function atualizarStatus(quantidade, consulta) {
    if (!consulta) {
      status.textContent = totalItens + (totalItens === 1 ? ' conteúdo disponível' : ' conteúdos disponíveis');
      return;
    }
    if (quantidade === 0) {
      // A mensagem fica no estado vazio, que tambem e uma regiao viva; evita texto duplicado.
      status.textContent = '';
      if (vazioTitulo) vazioTitulo.textContent = 'Nenhum conteúdo encontrado para "' + consulta + '"';
      return;
    }
    status.textContent = quantidade + (quantidade === 1 ? ' resultado' : ' resultados') + ' para "' + consulta + '".';
  }

  function buscar() {
    const consulta = input.value.trim();
    const termos = normalizar(consulta).split(/\s+/).filter(Boolean);

    if (btnLimpar) btnLimpar.hidden = consulta.length === 0;
    if (atalho) atalho.hidden = consulta.length > 0 || document.activeElement === input;

    if (!termos.length) {
      itens.forEach(function (item) {
        item.coluna.hidden = false;
        item.coluna.style.order = '';
        aplicarDestaque(item, []);
      });
      if (vazio) vazio.hidden = true;
      atualizarStatus(totalItens, '');
      return;
    }

    const encontrados = [];
    itens.forEach(function (item) {
      const pontos = pontuarItem(item, termos);
      item.coluna.hidden = pontos === 0;
      aplicarDestaque(item, pontos === 0 ? [] : termos);
      if (pontos > 0) encontrados.push({ item: item, pontos: pontos });
    });

    encontrados
      .sort(function (a, b) { return b.pontos - a.pontos; })
      .forEach(function (resultado, posicao) { resultado.item.coluna.style.order = String(posicao); });

    if (vazio) vazio.hidden = encontrados.length > 0;
    atualizarStatus(encontrados.length, consulta);
  }

  input.addEventListener('input', buscar);
  input.addEventListener('focus', function () { if (atalho) atalho.hidden = true; });
  input.addEventListener('blur', function () { if (atalho) atalho.hidden = input.value.length > 0; });

  Array.prototype.forEach.call(document.querySelectorAll('.busca-sugestao'), function (chip) {
    chip.addEventListener('click', function () {
      input.value = chip.getAttribute('data-termo') || '';
      buscar();
      input.focus();
    });
  });

  input.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && input.value) {
      evento.preventDefault();
      input.value = '';
      buscar();
    }
  });

  if (btnLimpar) {
    btnLimpar.addEventListener('click', function () {
      input.value = '';
      buscar();
      input.focus();
    });
  }

  function focarBusca() {
    input.focus();
    input.select();
    input.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  // Ctrl+K (Cmd+K no Mac) e "/" focam a busca, como em sites de documentacao.
  document.addEventListener('keydown', function (evento) {
    const teclaK = evento.key === 'k' || evento.key === 'K';
    if (teclaK && (evento.metaKey || evento.ctrlKey) && !evento.altKey) {
      evento.preventDefault();
      focarBusca();
      return;
    }

    if (evento.key !== '/' || evento.ctrlKey || evento.metaKey || evento.altKey) return;
    const ativo = document.activeElement;
    if (ativo && /^(input|textarea|select)$/i.test(ativo.tagName)) return;
    evento.preventDefault();
    focarBusca();
  });

  buscar();
})();
