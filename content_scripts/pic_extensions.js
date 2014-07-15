if (window['tmboes']) {
  (function(tmboes) {
    var nightmodeEl = document.createElement('a');
    nightmodeEl.href = "javascript:void(null)";

    var nightModeKey = 'nightMode';

    function renderNightMode() {
      tmboes.getSetting(nightModeKey, function (nightMode) {
        document.querySelector("html").classList.toggle('tmboes-nightmode', nightMode);
        nightmodeEl.innerText = "nightmode(" + (nightMode ? "on" : "off") + ")";
      });
    }


    nightmodeEl.addEventListener('click', function (e) {
      tmboes.getSetting(nightModeKey, function (nightMode) {
        tmboes.setSetting(nightModeKey, nightMode ? false : true, function () {
          renderNightMode();
        });
      });
    });

    renderNightMode();

    document.addEventListener('DOMContentLoaded', function () {
      var extensionControlsEl = document.createElement('span');
      extensionControlsEl.style.marginLeft = '48px';

      extensionControlsEl.appendChild(nightmodeEl);

      document.getElementById("heading").appendChild(extensionControlsEl);
    });
  })(window['tmboes']);
}
