/**
 * Indicador de rolagem do topo.
 *
 * Aparece alguns segundos depois do carregamento, sinalizando que o conteudo
 * continua abaixo, e some assim que a pessoa rola a pagina.
 */
(function () {
  const indicador = document.getElementById('indicadorScroll');
  const container = document.querySelector('.parallax');
  const destino = document.querySelector('.busca-area') || document.getElementById('listaCards');
  if (!indicador || !container) return;

  const ESPERA_ATE_APARECER = 4000;
  const ROLAGEM_MINIMA = 40;
  let temporizador = null;
  // Rolagem suave e movimento: respeita quem pediu menos animacao.
  const semMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  function comportamentoRolagem() { return semMovimento.matches ? 'auto' : 'smooth'; }

  function esconder() {
    indicador.classList.remove('visivel');
    window.clearTimeout(temporizador);
    container.removeEventListener('scroll', aoRolar);
  }

  function aoRolar() {
    if (container.scrollTop > ROLAGEM_MINIMA) esconder();
  }

  function mostrar() {
    if (container.scrollTop > ROLAGEM_MINIMA) return;
    indicador.classList.add('visivel');
  }

  indicador.addEventListener('click', function () {
    esconder();
    if (!destino) return;
    const topo = container.scrollTop + destino.getBoundingClientRect().top - 24;
    container.scrollTo({ top: topo, behavior: comportamentoRolagem() });
  });

  container.addEventListener('scroll', aoRolar, { passive: true });
  temporizador = window.setTimeout(mostrar, ESPERA_ATE_APARECER);
})();
