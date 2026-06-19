(function () {
  function initMoviePlayer(streamUrl) {
    var video = document.querySelector('[data-player="video"]');
    var button = document.querySelector('[data-player="button"]');

    if (!video || !streamUrl) {
      return;
    }

    function bindStream() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function startPlayback() {
      bindStream();
      if (button) {
        button.classList.add('hide');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          if (button) {
            button.classList.remove('hide');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
