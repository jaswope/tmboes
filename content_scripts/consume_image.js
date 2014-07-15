/**
 * Created by JonXP on 5/14/2014.
 */
if (!window['tmbo_suite_image_receiver']) {
  (function(tmboes) {
    window['tmbo_suite_image_receiver'] = function(sharedImageUri, sender, sendResponse) {
      var blob = tmboes.datauriToBlob(sharedImageUri);
      var extension = tmboes.typeToExtension[blob.type] || "";
      tmboes.convertToDynamicUpload(blob, "Shared Via TMBO Enhancement Suite" + extension);
      sendResponse();
    };
  })(window['tmboes']);
  chrome.extension.onMessage.addListener(window['tmbo_suite_image_receiver']);
}