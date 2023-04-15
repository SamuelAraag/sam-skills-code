window.addEventListener('scroll', () => {
    var fundo0 = document.getElementById('fundo0');
    var fundo1 = document.getElementById('fundo1');
    var fundo2 = document.getElementById('fundo2');

    let scroll = window.scrollY;

    fundo1.style.marginTop = scroll * -0.03 + '%'

    debugger
    fundo2.style.marginTop = scroll * -0.05 + '%'
})