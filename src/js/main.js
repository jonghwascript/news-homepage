      const $button = document.querySelector('.nav-toggle');
      const $close = document.querySelector('.news-nav button.close');

      $button.onclick = () => {
        $button.setAttribute('aria-expanded', 'true');
      };

      $close.onclick = () => {
        $button.setAttribute('aria-expanded', 'false');
        $button.focus();
      };

      const desktop = window.matchMedia('(min-width: 1024px)');

      function resetMenu() {
        if (desktop.matches) {
          $button.setAttribute('aria-expanded', 'false');
        }
      }

      desktop.addEventListener('change', resetMenu);
      resetMenu();