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

    chrome.tabs.sendMessage(tabs[0].id, "get ids").then((response) => {
      let playlistURL = response.playlistURL;
      let roomURL = response.roomURL;

      chrome.scripting.executeScript({
        target: {
          tabId: tabs[0].id,
        },
        args: [url, title, thumb, roomURL, playlistURL],
        func: function (url, title, thumb, roomURL, playlistURL) {
          // TODO: refactor everything
          fetch(
            `https://api.w2g.tv/rooms/${roomURL}/playlists/${playlistURL}/playlist_items/sync_update`,
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
});

function sendMessageYT(text) {
  chrome.tabs.query({ url: "https://www.youtube.com/*" }).then((YTtabs) => {
    for (let i = 0; i < YTtabs.length; i++) {
      chrome.tabs.sendMessage(YTtabs[i].id, text);
    }
  });
}
