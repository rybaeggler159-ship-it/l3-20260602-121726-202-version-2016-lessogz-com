(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var opened = mobilePanel.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
      menuButton.textContent = opened ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length) {
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function applyFilters(scope) {
    var input = document.querySelector('[data-filter-input="' + scope + '"]');
    var category = document.querySelector('[data-filter-category="' + scope + '"]');
    var type = document.querySelector('[data-filter-type="' + scope + '"]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope="' + scope + '"] .searchable-card'));
    var empty = document.querySelector('[data-empty-state="' + scope + '"]');

    function run() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var categoryValue = category ? category.value : '';
      var typeValue = type ? type.value : '';
      var shown = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        var cardCategory = card.getAttribute('data-category') || '';
        var cardType = card.getAttribute('data-type') || '';
        var visible = true;

        if (query && text.indexOf(query) === -1) {
          visible = false;
        }

        if (categoryValue && cardCategory !== categoryValue) {
          visible = false;
        }

        if (typeValue && cardType !== typeValue) {
          visible = false;
        }

        card.classList.toggle('hide-card', !visible);
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.style.display = shown ? 'none' : 'block';
      }
    }

    [input, category, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', run);
        node.addEventListener('change', run);
      }
    });
  }

  ['home', 'all', 'category', 'ranking'].forEach(applyFilters);
})();
