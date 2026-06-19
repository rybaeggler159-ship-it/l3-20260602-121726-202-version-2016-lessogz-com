import { H as Hls } from "./hls-vendor.js";

export function createPlayer(url) {
  const video = document.getElementById("movieVideo");
  const overlay = document.getElementById("playOverlay");

  if (!video || !overlay || !url) {
    return;
  }

  let ready = false;
  let hls = null;

  const load = () => {
    if (ready) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    } else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }

    ready = true;
  };

  const play = () => {
    load();
    overlay.classList.add("is-hidden");
    video.controls = true;
    const action = video.play();

    if (action && typeof action.catch === "function") {
      action.catch(() => {
        overlay.classList.remove("is-hidden");
      });
    }
  };

  overlay.addEventListener("click", play);

  video.addEventListener("click", () => {
    if (!ready || video.paused) {
      play();
    }
  });

  window.addEventListener("pagehide", () => {
    if (hls) {
      hls.destroy();
    }
  });
}
