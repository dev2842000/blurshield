// Runs in the PAGE's MAIN world (registered via manifest.json world:"MAIN").
// Patches MediaDevices.prototype so the intercept works regardless of when
// the page accesses navigator.mediaDevices.getDisplayMedia.
(function () {
  if (typeof MediaDevices === "undefined" || !MediaDevices.prototype.getDisplayMedia) return;

  const original = MediaDevices.prototype.getDisplayMedia;

  MediaDevices.prototype.getDisplayMedia = async function (constraints) {
    const stream = await original.call(this, constraints);

    window.postMessage({ __blurshield: "started" }, "*");

    let notified = false;
    function onStop() {
      if (notified) return;
      notified = true;
      window.postMessage({ __blurshield: "stopped" }, "*");
    }

    // Primary signal: stream goes inactive (all tracks ended)
    stream.addEventListener("inactive", onStop);

    // Secondary signal: each individual track ends
    stream.getTracks().forEach((track) => {
      track.addEventListener("ended", () => {
        // Wait a tick then check if all tracks are done
        setTimeout(() => {
          if (stream.getTracks().every((t) => t.readyState === "ended")) {
            onStop();
          }
        }, 100);
      });
    });

    // Safety fallback: poll every 2s in case events don't fire
    const poll = setInterval(() => {
      if (stream.getTracks().every((t) => t.readyState === "ended")) {
        onStop();
        clearInterval(poll);
      }
    }, 2000);

    // Clear poll once we've already notified
    stream.addEventListener("inactive", () => clearInterval(poll));

    return stream;
  };
})();
