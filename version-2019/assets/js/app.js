(function () {
    var header = document.querySelector('[data-header]');
    var navToggle = document.querySelector('[data-nav-toggle]');
    var navMenu = document.querySelector('[data-nav-menu]');

    function onScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 20);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, position) {
            slide.classList.toggle('active', position === activeSlide);
        });
        dots.forEach(function (dot, position) {
            dot.classList.toggle('active', position === activeSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            var target = Number(dot.getAttribute('data-hero-dot')) || 0;
            showSlide(target);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function setupFilter(panel) {
        var input = panel.querySelector('[data-filter-input]');
        var yearFilter = panel.querySelector('[data-year-filter]');
        var regionFilter = panel.querySelector('[data-region-filter]');
        var resetButton = panel.querySelector('[data-filter-reset]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var summary = document.querySelector('[data-filter-summary]');

        function applyFilter() {
            var keyword = normalize(input && input.value);
            var year = normalize(yearFilter && yearFilter.value);
            var region = normalize(regionFilter && regionFilter.value);
            var shown = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category'),
                    card.textContent
                ].join(' '));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                var matchRegion = !region || normalize(card.getAttribute('data-region')).indexOf(region) !== -1;
                var visible = matchKeyword && matchYear && matchRegion;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    shown += 1;
                }
            });

            if (summary) {
                summary.textContent = '当前显示 ' + shown + ' 部影片';
            }
        }

        panel.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilter();
        });

        [input, yearFilter, regionFilter].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        if (resetButton) {
            resetButton.addEventListener('click', function () {
                if (input) {
                    input.value = '';
                }
                if (yearFilter) {
                    yearFilter.value = '';
                }
                if (regionFilter) {
                    regionFilter.value = '';
                }
                applyFilter();
            });
        }

        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q && input) {
            input.value = q;
            applyFilter();
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(setupFilter);

    function playWithHls(video, src) {
        if (!video || !src) {
            return;
        }

        if (video._hlsInstance) {
            video._hlsInstance.destroy();
            video._hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(function () {});
            }, { once: true });
            return;
        }

        video.src = src;
        video.play().catch(function () {});
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
        var button = player.querySelector('.play-button');
        var video = player.querySelector('[data-video]');
        if (!button || !video) {
            return;
        }
        button.addEventListener('click', function () {
            var src = button.getAttribute('data-hls');
            player.classList.add('is-playing');
            playWithHls(video, src);
        });
    });
})();
