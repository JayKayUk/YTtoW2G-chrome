"use strict";

browser.runtime.onInstalled.addListener(() => {
  console.log("YTtoW2G installed");
});

browser.runtime.onMessage.addListener((message) => {
  browser.tabs.query({ url: "https://w2g.tv/*/room/*" }).then((tabs) => {
    if (!tabs[0]) {
      browser.tabs.create({ active: true, url: "https://w2g.tv/" });
      sendMessageYT("W2G tab does not exist");
      return;
    }
    browser.tabs.sendMessage(tabs[0].id, message);
    sendMessageYT("Video added!");
  });
});

function sendMessageYT(text) {
  browser.tabs.query({ url: "https://www.youtube.com/*" }).then((YTtabs) => {
    for (let i = 0; i < YTtabs.length; i++) {
      browser.tabs.sendMessage(YTtabs[i].id, text);
    }
  });
}
