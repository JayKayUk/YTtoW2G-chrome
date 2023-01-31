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

    let url = message.url;
    let title = message.title;
    let thumb = message.thumb;

    chrome.scripting.executeScript({
      target: {
        tabId: tabs[0].id,
      },
      args: [url, title, thumb],
      func: function (url, title, thumb) {
        // TODO: get room id and playlist id from the w2g page
        // TODO: refactor everything
        // TODO: check if host permissions are needed
        fetch(
          "https://api.w2g.tv/rooms/p7y3810cmowjl4rqwz/playlists/qwuawx921e3c99j0zgwyjuzn9ex22zzj/playlist_items/sync_update",
          {
            credentials: "include",
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body:
              `{"add_items":[{"url":"` +
              url +
              `","title":"` +
              title +
              `","thumb":"` +
              thumb +
              `"}]}`,
          }
        ).then((fetchResponose) => {
          if (!fetchResponose.ok) {
            console.log("YTtoW2G: " + fetchResponose);
          }
        });
      },
    });
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
