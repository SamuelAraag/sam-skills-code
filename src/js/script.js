var inicioPaddin = 26;
window.addEventListener('scroll', () => {
    var fundo0 = document.getElementById('fundo0');
    var fundo1 = document.getElementById('fundo1');

    let scroll = window.scrollY;

    fundo0.style.top = scroll * 0.05 + '%'
    fundo1.style.top = scroll * 0.03 + '%';
})