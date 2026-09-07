/* ==========================================================================
   DMR Info Tecnologia — entrada das secoes no scroll
   Referencia: pedido do cliente para que as animacoes sigam o estilo do
   design system Arooth (blocos com entrada propria: opacidade + translateY,
   por vezes escalonada entre irmaos) e do site de referencia (cada secao
   entra com "slide-up" ao cruzar a viewport).

   POR QUE UM ARQUIVO SEPARADO DE dmr-hero.js
   -------------------------------------------------------------------------
   dmr-hero.js resolve UM problema especifico: a config ix3 do Webflow
   (assets/vendor/webflow_1c2a8e406a92.js) so conhece os elementos exatos do
   template Arooth. Este arquivo generaliza a mesma ideia - entrada no
   scroll - para qualquer elemento marcado com data-reveal, sem tocar a
   config do vendor e sem inventar um segundo motor de animacao: usa o mesmo
   GSAP + ScrollTrigger que ja esta carregado na pagina.

   POR QUE NAO HA NENHUM CSS DE "ESCONDER ATE O JS RODAR"
   -------------------------------------------------------------------------
   O hero, na Etapa 1, ficou em branco porque um <style> escondia os
   elementos por padrao e so a config do Webflow os revelava - se ela
   falhasse, nada aparecia. Aqui o oposto: o estado inicial (opacity:0,
   deslocado) so e aplicado SE este script conseguir criar o tween via
   GSAP. Se GSAP ou ScrollTrigger nao carregarem, ou o registerPlugin
   falhar, a funcao sai cedo e os elementos ficam no estado padrao do CSS,
   que e totalmente visivel. Nao existe caminho em que o conteudo fique
   preso invisivel.
   ========================================================================== */

(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  ready(function () {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn("[dmr-reveal] GSAP ou ScrollTrigger ausente — seções ficam estáticas, sem animação.");
      return;
    }

    var gsap = window.gsap;
    try {
      gsap.registerPlugin(window.ScrollTrigger);
    } catch (e) {
      console.warn("[dmr-reveal] registerPlugin falhou — seções ficam estáticas.", e);
      return;
    }

    var DIST = 28; // px — mesma ordem de grandeza do translateY(30px) do hero original
    var DUR = 0.7;
    var EASE = "power2.out"; // ease 5 da tabela do Webflow, a mesma usada no hero
    var START = "top 88%";

    // Blocos com entrada própria: título de seção, coluna de texto, mídia,
    // faixa-ponte, marquee de parceiros, card de CTA. Cada um dispara ao
    // cruzar a própria posição de scroll — o mesmo padrão do Arooth
    // original, em que cada bloco carrega seu próprio data-w-id e trigger.
    var singles = document.querySelectorAll("[data-reveal]");
    singles.forEach(function (el) {
      var delay = parseFloat(el.getAttribute("data-reveal-delay") || "0") / 1000;
      gsap.fromTo(
        el,
        { opacity: 0, y: DIST },
        {
          opacity: 1,
          y: 0,
          duration: DUR,
          ease: EASE,
          delay: delay,
          scrollTrigger: { trigger: el, start: START, toggleActions: "play none none none" }
        }
      );
    });

    // Grades de card: um ScrollTrigger por grade, com os filhos entrando em
    // cascata — a mesma lógica de stagger que a config original do Webflow
    // usa nas letras do hero (amount 0.2, from start), aqui a 0.09s por item.
    var grupos = document.querySelectorAll("[data-reveal-group]");
    grupos.forEach(function (grupo) {
      var itens = grupo.children;
      if (!itens.length) return;
      gsap.fromTo(
        itens,
        { opacity: 0, y: DIST },
        {
          opacity: 1,
          y: 0,
          duration: DUR,
          ease: EASE,
          stagger: 0.09,
          scrollTrigger: { trigger: grupo, start: START, toggleActions: "play none none none" }
        }
      );
    });
  });
})();
