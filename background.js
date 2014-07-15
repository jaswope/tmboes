/**
 * Created by JonXP on 5/13/2014.
 */
var tmboShare = {
  "contextMenuShareId": "shareImage"
};

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    "title": "Share image on TMBO",
    "contexts": ["image"],
    "id": tmboShare.contextMenuShareId
  }, function() {
    if (chrome.runtime.lastError)
      console.dir(chrome.runtime.lastError);
  });
});

function injectSharedImage(sharedTab, datauri) {
  chrome.tabs.create({
    "url": "https://thismight.be/offensive/?c=upload",
    "openerTabId": sharedTab.id,
    "windowId": sharedTab.windowId
  }, function(tab) {
    chrome.tabs.executeScript(tab.id, {"file": "content_scripts/consume_image.js"}, function() {
      chrome.tabs.sendMessage(tab.id, datauri);
    })
  })
}

chrome.contextMenus.onClicked.addListener(function(data, tab) {
  chrome.tabs.executeScript(tab.id, {"file": "content_scripts/retrieve_image.js"}, function() {
    chrome.tabs.sendMessage(tab.id, data.srcUrl, function(dataUri) {
      injectSharedImage(tab, dataUri);
    });
  });
});

function getSetting(setting, callback) {
  chrome.storage.sync.get(setting, callback);
}

function setSetting(settingObj, callback) {
  chrome.storage.sync.set(settingObj, callback);
}

var messageHandlers = {
  "getSetting": getSetting,
  "setSetting": setSetting
};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  messageHandlers[request.type](request.payload, sendResponse);
  return true;
});