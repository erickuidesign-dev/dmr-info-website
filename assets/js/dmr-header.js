/* ==========================================================================
   DMR Info Tecnologia — comportamento do header

   Quatro coisas, todas presas ao mesmo elemento (#site-header) e ao mesmo
   listener de scroll:

   1. Entrada no scroll — o menu não aparece na abertura do site; entra depois
      que a página começa a rolar, deixando o hero limpo no primeiro frame.
   2. Faixa de contato — recolhe assim que o scroll começa, para o header ficar
      compacto durante a leitura.
   3. Menu hambúrguer — abre e fecha o painel mobile.
   4. Indicador de scroll do hero — some depois do primeiro scroll.

   POR QUE O ESTADO PADRÃO É "VISÍVEL"
   -------------------------------------------------------------------------
   O CSS não esconde nada por conta própria: quem adiciona .is-hidden é este
   script (e o script inline do index.html, que faz o mesmo antes do primeiro
   paint para o menu não piscar). Se nenhum dos dois rodar, o menu fica visível
   o tempo todo — degradação aceitável. O caminho inverso (esconder no CSS e
   depender do JS pra revelar) foi o que deixou o hero em branco na Etapa 1;
   não se repete aqui.
   ========================================================================== */

(function () {
  "use strict";

  // Rola mais que isso e o header entra. Meia tela: o suficiente pra sair da
  // abertura do hero sem obrigar o usuário a rolar a seção inteira (300vh).
  var LIMIAR = function () {
    return window.innerHeight * 0.5;
  };

  // O indicador de scroll do hero some no primeiro scroll intencional; 8px
  // ignora o ruído de 1-2px de trackpad.
  var LIMIAR_CUE = 8;

  // Seção a partir da qual a faixa de contato recolhe. Fica visível durante
  // toda a abertura e só sai quando começa a leitura de fato.
  var SECAO_COMPACTA = "sobre";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    var header = document.getElementById("site-header");
    if (!header) return;

    var escondido = null;
    var compacto = null;
    var cueOculto = null;
    var cue = document.querySelector(".dmr-scroll-cue");
    var temHero = document.querySelector(".banner-section");
    var secao = document.getElementById(SECAO_COMPACTA);
    var barra = header.querySelector(".header");

    /* A faixa recolhe quando a seção alvo encosta na barra do menu.
       A referência de altura é a .header (a linha do logo), não o header
       inteiro: a altura do header inteiro muda justamente quando a faixa
       recolhe, e comparar contra um valor que o próprio efeito altera faria
       o estado oscilar na fronteira. */
    function passouDaSecao() {
      if (!secao) return window.scrollY > window.innerHeight;
      var alturaBarra = barra ? barra.offsetHeight : 76;
      return secao.getBoundingClientRect().top <= alturaBarra;
    }

    function aplicar() {
      var y = window.scrollY;

      // Só a home esconde o menu na abertura, porque só ela tem o hero de
      // 300vh. Numa página interna o topo já é conteúdo: sumir com o menu ali
      // deixaria o visitante sem navegação logo na entrada.
      var deveEsconder = !!temHero && y < LIMIAR();
      if (deveEsconder !== escondido) {
        escondido = deveEsconder;
        header.classList.toggle("is-hidden", deveEsconder);
      }

      var deveCompactar = passouDaSecao();
      if (deveCompactar !== compacto) {
        compacto = deveCompactar;
        header.classList.toggle("is-scrolled", deveCompactar);
      }

      var deveOcultarCue = y > LIMIAR_CUE;
      if (cue && deveOcultarCue !== cueOculto) {
        cueOculto = deveOcultarCue;
        cue.classList.toggle("is-oculto", deveOcultarCue);
      }
    }

    aplicar();

    // O script inline põe .sem-transicao junto com .is-hidden para o header
    // já nascer fora da tela sem animar. Devolvido no quadro seguinte, quando
    // a posição inicial já foi pintada.
    requestAnimationFrame(function () {
      header.classList.remove("sem-transicao");
    });

    var agendado = false;
    window.addEventListener(
      "scroll",
      function () {
        if (agendado) return;
        agendado = true;
        window.requestAnimationFrame(function () {
          agendado = false;
          aplicar();
        });
      },
      { passive: true }
    );

    window.addEventListener("resize", aplicar);

    /* --- Menu hambúrguer --------------------------------------------------
       O painel usa o atributo hidden, não uma classe: assim ele nasce fechado
       mesmo sem CSS, e leitores de tela não anunciam os links duplicados
       enquanto está fechado. */
    var botao = document.querySelector(".dmr-nav-toggle");
    var painel = document.getElementById("dmr-mobile-menu");

    if (botao && painel) {
      var fechar = function () {
        painel.hidden = true;
        botao.setAttribute("aria-expanded", "false");
        botao.setAttribute("aria-label", "Abrir menu");
      };

      var abrir = function () {
        painel.hidden = false;
        botao.setAttribute("aria-expanded", "true");
        botao.setAttribute("aria-label", "Fechar menu");
      };

      botao.addEventListener("click", function () {
        if (painel.hidden) abrir();
        else fechar();
      });

      // Clicar num link fecha: são âncoras na mesma página, o painel taparia
      // justamente a seção que o usuário acabou de pedir.
      painel.addEventListener("click", function (evento) {
        if (evento.target.closest("a")) fechar();
      });

      document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape" && !painel.hidden) {
          fechar();
          botao.focus();
        }
      });

      // Voltando para desktop o painel fica órfão (o CSS já mostra o menu
      // normal), então fecha junto.
      window.addEventListener("resize", function () {
        if (window.innerWidth > 991 && !painel.hidden) fechar();
      });
    }
  });
})();
