/* ==========================================================================
   DMR Info Tecnologia — timeline das letras do hero
   Referência: "Plano - Website DMR Info Tecnologia.md", Etapa 1.2 e 1.4

   POR QUE ESTE ARQUIVO EXISTE
   ---------------------------
   A configuração ix3 do design system (assets/vendor/webflow_1c2a8e406a92.js)
   traz as letras do hero compiladas com larguras em pixel fixas por índice e
   conhece exatamente CINCO slots: _01 a _05. "DMR INFO" tem sete glifos.

   Estender aquela configuração exigiria editar um array dentro de um bundle
   minificado de 240 KB — quebra a cada reexportação e é irrevisável.

   Então este arquivo recria SOMENTE as ações das letras, parametrizadas por
   quantidade de glifos. Todo o resto do hero — o painel .after-banner-wrapper,
   o anel .banner-letter-o, o conteúdo e o ticker — continua rodando pela
   timeline Webflow original, que não é tocada.

   VALORES ORIGINAIS REPRODUZIDOS  (extraídos de webflow_1c2a8e406a92.js)
   ---------------------------------------------------------------------
   Timeline de scroll  t-8fc6facf
     ScrollTrigger: start "top bottom" · end "bottom 80%" · scrub 0.9 · clamp
     duração total 7 (ditada pela ação do painel, que vai de 0 a 7)
     letras  width  -> 0px      duração 1  posição 2    ease 5
     letras  x      -> -15vw    duração 1  posição 1.5  ease 0

   Timeline de load  t-0b0aa1b5
     letras  opacity 0 -> 1, y 30px -> 0   duração .3  ease 14
     posições escalonadas de 0.15 em 0.15

   Tabela de easings do Webflow, lida de assets/vendor/webflow_760c3ff429ba.js:
     índice 0 = "none"  ·  5 = "power2.out"  ·  14 = "back.out"
   ========================================================================== */

(function () {
  "use strict";

  var DESKTOP_MIN = 992; // mesmo breakpoint em que o design system desliga a timeline

  var SCROLL = {
    trigger: ".banner-vh-wrap",
    start: "clamp(top bottom)",
    end: "bottom 80%",
    scrub: 0.9,
    totalDuration: 7
  };

  var LETTER = {
    widthDuration: 1,
    widthPosition: 2,
    widthEase: "power2.out", // ease 5
    xDuration: 1,
    xPosition: 1.5,
    xTarget: "-15vw",
    xEase: "none" // ease 0
  };

  var LOAD = {
    duration: 0.3,
    stagger: 0.15,
    fromY: 30,
    ease: "back.out" // ease 14
  };

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  /* ------------------------------------------------------------------------
     REDE DE SEGURANÇA DO ix3

     O <style> do <head> esconde os elementos animados enquanto o documento
     não tiver a classe w-mod-ix3. Quem adiciona essa classe é o runtime, em
     webflow_1c2a8e406a92.js, mas só depois que IX3.init() resolve:

       window.dispatchEvent(new CustomEvent("__wf_ix3_ready")),
       document.documentElement.classList.add("w-mod-ix3")

     Se essa inicialização falhar — script bloqueado, erro de rede, ordem de
     carga trocada — o hero inteiro fica visibility:hidden PARA SEMPRE, e a
     página abre em branco sem nenhum erro visível.

     Este timeout garante que o conteúdo sempre apareça. Conteúdo visível sem
     animação é degradação aceitável; conteúdo invisível não é.
     ------------------------------------------------------------------------ */
  var IX3_FALLBACK_MS = 1500;

  window.addEventListener("__wf_ix3_ready", function () {
    document.documentElement.classList.add("w-mod-ix3");
  });

  window.setTimeout(function () {
    if (!document.documentElement.classList.contains("w-mod-ix3")) {
      console.warn(
        "[dmr-hero] ix3 nao inicializou em " + IX3_FALLBACK_MS +
        "ms. Revelando o hero sem as animacoes do Webflow."
      );
      document.documentElement.classList.add("w-mod-ix3");
    }
  }, IX3_FALLBACK_MS);

  ready(function () {
    if (!window.gsap || !window.ScrollTrigger) {
      console.warn("[dmr-hero] GSAP ou ScrollTrigger ausente — hero fica estático.");
      return;
    }

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    var letters = Array.prototype.slice.call(
      document.querySelectorAll(".banner-letters-flex .single-banner-letter")
    );

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var mm = gsap.matchMedia();

    // ----------------------------------------------------------------------
    // Vídeo de fundo — toca só em desktop e sem prefers-reduced-motion,
    // exatamente a mesma condição que já rege a timeline das letras. Não
    // depende de `letters` existir: o vídeo é independente do resto do hero.
    //
    // Abaixo de 992px o .banner-bg-video some via CSS (dmr.css) e o poster
    // (a foto estática) cumpre o mesmo papel visual sozinho. O .play() é
    // best effort — autoplay com áudio mudo é permitido pela maioria dos
    // navegadores, mas se a promise rejeitar (política mais restrita, ou o
    // usuário trocou de aba antes do vídeo carregar), o poster já é exibido
    // pelo próprio elemento, então não sobra nada quebrado na tela.
    // ------------------------------------------------------------------
    var video = document.querySelector(".banner-bg-video");
    if (video) {
      var wrap = video.closest(".banner-bg-wrap");

      // A classe is-video-live é quem afrouxa o véu escuro em dmr.css, e só
      // é adicionada aqui — no evento 'playing', a confirmação de que o
      // navegador está de fato renderizando frame, não na promise de
      // .play(), que pode resolver sem chegar a tocar nada em cenários raros
      // (aba em segundo plano, por exemplo). Sem esse evento, o CSS já
      // assume o véu forte por padrão — seguro para quando o poster (a foto
      // clara) é o que está realmente na tela.
      var onPlaying = function () {
        if (wrap) wrap.classList.add("is-video-live");
      };
      video.addEventListener("playing", onPlaying);

      mm.add("(min-width: " + DESKTOP_MIN + "px)", function () {
        video.preload = "auto";
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function (err) {
            console.warn("[dmr-hero] autoplay do vídeo do hero recusado pelo navegador — poster permanece visível.", err);
          });
        }
        return function cleanup() {
          video.pause();
          if (wrap) wrap.classList.remove("is-video-live");
        };
      });
    }

    if (!letters.length) return;

    mm.add("(min-width: " + DESKTOP_MIN + "px)", function () {
      // ----------------------------------------------------------------
      // Entrada no load — replica t-0b0aa1b5
      // ----------------------------------------------------------------
      var intro = gsap.timeline();
      letters.forEach(function (el, i) {
        intro.fromTo(
          el,
          { opacity: 0, y: LOAD.fromY },
          { opacity: 1, y: 0, duration: LOAD.duration, ease: LOAD.ease },
          i * LOAD.stagger
        );
      });

      // ----------------------------------------------------------------
      // Scroll — replica a fatia das letras de t-8fc6facf
      // ----------------------------------------------------------------
      // invalidateOnRefresh faz o GSAP reler a largura natural de cada slot a
      // cada refresh (inclusive em resize). É o que permite às letras terem
      // tamanho fluido em CSS — ver .banner-letter em dmr.css — em vez de
      // larguras fixas em pixel, que estouravam o container abaixo de 1440px.
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: SCROLL.trigger,
          start: SCROLL.start,
          end: SCROLL.end,
          scrub: SCROLL.scrub,
          invalidateOnRefresh: true
        }
      });

      // Trava o comprimento total em 7 para ficar em fase com a timeline do
      // painel, que o Webflow roda no mesmo ScrollTrigger.
      tl.to({}, { duration: SCROLL.totalDuration }, 0);

      // Todos os glifos deslizam para a esquerda. No design system original o
      // slot _05 ia para a direita porque o painel ficava no meio da palavra;
      // em "DMR INFO" o anel é a última letra, então não há nada à direita
      // dele para contrabalançar. Ver Plano Etapa 1.3.
      tl.to(
        letters,
        { x: LETTER.xTarget, duration: LETTER.xDuration, ease: LETTER.xEase },
        LETTER.xPosition
      );

      letters.forEach(function (el) {
        tl.to(
          el,
          { width: 0, duration: LETTER.widthDuration, ease: LETTER.widthEase },
          LETTER.widthPosition
        );
      });

      return function cleanup() {
        intro.kill();
        tl.kill();
        gsap.set(letters, { clearProps: "transform,opacity,width" });
      };
    });
  });
})();
