"use strict";

chrome.runtime.onInstalled.addListener(() => {
  console.log("YTtoW2G installed");
});

chrome.runtime.onMessage.addListener((messageFromYT) => {
  chrome.tabs.query({ url: "https://w2g.tv/*/room/*" }).then((w2gTabs) => {
    if (!w2gTabs[0]) {
      chrome.tabs.create({ active: true, url: "https://w2g.tv/" });
      sendMessageYT("W2G tab does not exist");
      return;
    }

    let videoUrl = messageFromYT.url;
    let videoTitle = messageFromYT.title;
    let videoThumb = messageFromYT.thumb;

    chrome.tabs.sendMessage(w2gTabs[0].id, "get ids").then((w2gResponse) => {
      let playlistURL = w2gResponse.playlistURL;
      let roomURL = w2gResponse.roomURL;

      chrome.scripting.executeScript({
        target: {
          tabId: w2gTabs[0].id,
        },
        args: [videoUrl, videoTitle, videoThumb, roomURL, playlistURL],
        func: function (
          videoUrl,
          videoTitle,
          videoThumb,
          roomURL,
          playlistURL
        ) {
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
                videoUrl +
                `","title":"` +
                videoTitle +
                `","thumb":"` +
                videoThumb +
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

function sendMessageYT(notificationText) {
  chrome.tabs.query({ url: "https://www.youtube.com/*" }).then((YtTabs) => {
    for (let i = 0; i < YtTabs.length; i++) {
      chrome.tabs.sendMessage(YtTw2gRbs[i].id, notificationText);
    }
  });
}
