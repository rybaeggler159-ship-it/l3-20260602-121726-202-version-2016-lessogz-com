(() => {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      navMenu.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let activeSlide = 0;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === activeSlide);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  if (slides.length > 1) {
    setInterval(() => showSlide(activeSlide + 1), 6000);
  }

  const searchInput = document.getElementById("movieSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const cards = Array.from(document.querySelectorAll("[data-movie-card]"));
  const emptyState = document.querySelector("[data-empty-state]");

  const filterCards = () => {
    const keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
    const category = categoryFilter ? categoryFilter.value : "all";
    let visible = 0;

    cards.forEach((card) => {
      const haystack = [
        card.dataset.title,
        card.dataset.genre,
        card.dataset.region,
        card.dataset.year
      ].join(" ").toLowerCase();

      const keywordMatched = !keyword || haystack.includes(keyword);
      const categoryMatched = category === "all" || card.dataset.category === category;
      const matched = keywordMatched && categoryMatched;

      card.classList.toggle("is-hidden", !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? "none" : "block";
    }
  };

  if (searchInput) {
    searchInput.addEventListener("input", filterCards);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      const selected = categoryFilter.value;
      const page = selected === "all" ? "categories.html" : `category-${selected}.html`;

      if (document.body.dataset.categoryPage === "true" && selected !== document.body.dataset.currentCategory) {
        window.location.href = `./${page}`;
        return;
      }

      filterCards();
    });
  }

  filterCards();
})();
