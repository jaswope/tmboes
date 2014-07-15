/**
 * Created by JonXP on 5/14/2014.
 */

if (!window['tmbo_suite_image_listener']) {
  (function() {
    var waitBox = document.createElement("div");
    waitBox.style.cssText = "position: fixed; top: -100%; left: 0; right: 0; padding: 10px; margin: 0; color: #CCF; border: 0; border-bottom: 2px solid black; background-color: #336; text-align: center; transition: top 0.25s; font-family: verdana; font-weight: bold; font-size: 16px;";
    waitBox.style.display = "none";
    document.body.appendChild(waitBox);

    function failedToAcquire(code) {
      waitBox.innerHTML = "Can't get that image. Sorry. (" + code + ")";
      setTimeout(function() { waitBox.style.top = "-100%";}, 2000);
    }

    window['tmbo_suite_image_listener'] = function(request, sender, sendResponse) {
      waitBox.style.display = "";
      waitBox.innerHTML = "Grabbing Image...";
      waitBox.style.top = "0";

      var req = new XMLHttpRequest();
      req.responseType = 'arraybuffer';
      req.onload = function() {
        if (req.status == "200") {
          waitBox.innerHTML = "Parsing Image...";
          var mimeType = this.getResponseHeader("Content-Type").split(';')[0];

          var blob = new Blob([this.response], {type: mimeType});
          var reader = new FileReader();
          reader.addEventListener("loadend", function() {
            waitBox.innerHTML = "Sending Image...";
            sendResponse(reader.result);
            waitBox.style.top = "-100%";
          });
          reader.readAsDataURL(blob);
        } else {
          failedToAcquire(req.status);
        }
      };
      req.onerror = function() {
        failedToAcquire("0");
      };
      req.open("GET", request, true);
      req.send(null);

      return true;
    };
  })();
  chrome.extension.onMessage.addListener(window['tmbo_suite_image_listener']);
}


