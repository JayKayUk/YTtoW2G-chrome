"use strict";

chrome.runtime.onInstalled.addListener(() => {
  console.log("YTtoW2G installed");
});

chrome.runtime.onMessage.addListener((message) => {
  chrome.tabs.query({ url: "https://w2g.tv/*/room/*" }).then((tabs) => {
    if (!tabs[0]) {
      chrome.tabs.create({ active: true, url: "https://w2g.tv/" });
      sendMessageYT("W2G tab does not exist");
      return;
    }
    chrome.tabs.sendMessage(tabs[0].id, message);
    sendMessageYT("Video added!");
  });
});

function sendMessageYT(text) {
  chrome.tabs.query({ url: "https://www.youtube.com/*" }).then((YTtabs) => {
    for (let i = 0; i < YTtabs.length; i++) {
      chrome.tabs.sendMessage(YTtabs[i].id, text);
    }
  });
}
