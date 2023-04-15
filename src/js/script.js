var inicioPaddin = 26;
window.addEventListener('scroll', () => {
    var fundo0 = document.getElementById('fundo0');
    var fundo1 = document.getElementById('fundo1');
    var fundo2 = document.getElementById('fundo2');

    let scroll = window.scrollY;

    fundo0.style.top = scroll * 0.05 + '%'
    fundo1.style.top = scroll * 0.03 + '%';
    // fundo2.style.marginTop = inicioPaddin - (scroll * 0.1) + '%';

})