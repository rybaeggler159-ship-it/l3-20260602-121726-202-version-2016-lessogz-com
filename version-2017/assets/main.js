(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector('.menu-toggle');
        var menu = document.querySelector('.mobile-menu');
        if (!button || !menu) {
            return;
        }

        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            menu.hidden = expanded;
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var nextIndex = parseInt(dot.getAttribute('data-hero-dot') || '0', 10);
                show(nextIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('.filter-scope'));
        scopes.forEach(function (scope) {
            var search = scope.querySelector('[data-filter-search]');
            var region = scope.querySelector('[data-filter-region]');
            var year = scope.querySelector('[data-filter-year]');
            var type = scope.querySelector('[data-filter-type]');
            var reset = scope.querySelector('[data-filter-reset]');
            var count = scope.querySelector('[data-filter-count]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

            if (!cards.length) {
                return;
            }

            function apply() {
                var query = normalize(search && search.value);
                var selectedRegion = normalize(region && region.value);
                var selectedYear = normalize(year && year.value);
                var selectedType = normalize(type && type.value);
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matchesQuery = !query || haystack.indexOf(query) !== -1;
                    var matchesRegion = !selectedRegion || normalize(card.getAttribute('data-region')) === selectedRegion;
                    var matchesYear = !selectedYear || normalize(card.getAttribute('data-year')) === selectedYear;
                    var matchesType = !selectedType || normalize(card.getAttribute('data-type')) === selectedType;
                    var isVisible = matchesQuery && matchesRegion && matchesYear && matchesType;

                    card.hidden = !isVisible;
                    if (isVisible) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = visible + ' 部影片';
                }
            }

            [search, region, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            if (reset) {
                reset.addEventListener('click', function () {
                    if (search) {
                        search.value = '';
                    }
                    if (region) {
                        region.value = '';
                    }
                    if (year) {
                        year.value = '';
                    }
                    if (type) {
                        type.value = '';
                    }
                    apply();
                });
            }

            apply();
        });
    }

    function attachHls(video, sourceUrl) {
        if (!video || !sourceUrl || video.dataset.ready === 'true') {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(sourceUrl);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
            video._hls = hls;
            video.dataset.ready = 'true';
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = sourceUrl;
            video.dataset.ready = 'true';
            return;
        }

        video.src = sourceUrl;
        video.dataset.ready = 'true';
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.js-player-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video[data-src]');
            var overlay = shell.querySelector('.player-overlay');
            if (!video) {
                return;
            }

            function startPlayback(event) {
                if (event) {
                    event.preventDefault();
                }
                attachHls(video, video.getAttribute('data-src'));
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener('click', startPlayback);
            }

            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        });

        var startLinks = Array.prototype.slice.call(document.querySelectorAll('[data-player-start]'));
        startLinks.forEach(function (link) {
            link.addEventListener('click', function (event) {
                event.preventDefault();
                var shell = document.querySelector('.js-player-shell');
                var overlay = shell && shell.querySelector('.player-overlay');
                if (overlay) {
                    overlay.click();
                    shell.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
