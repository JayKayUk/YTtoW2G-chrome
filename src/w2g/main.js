"use strict";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "get ids") {
    const roomURL = document
      .getElementById("w2g-top-inviteurl")
      .children[0].value.split("=")[1];

    const playlistURL = document.getElementsByClassName(
      "dropdown fluid selection ui"
    )[0].value;

    sendResponse({ playlistURL, roomURL });
  }
});

function runScriptElement(code) {
  const script = document.createElement("script");
  script.textContent = code;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
}

function getScriptCode(message) {
  return `fetch(
    "https://api.w2g.tv/rooms/${roomURL}/playlists/${playlistURL}/playlist_items/sync_update",
    {
      credentials: "include",
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: '{"add_items":[{"url":"${message.url}","title":"${message.title}","thumb":"${message.thumb}"}]}',
    }
  ).then((fetchResponose) => {
    if (!fetchResponose.ok) {
      console.log(fetchResponose);
    }
  });`;
}

function addVideoToPlaylist(message) {
  const code = getScriptCode(message);
  console.log(chrome.tabs);
  // chrome.scripting.executeScript = {
  //   target: {
  //     tabId: chrome.tabs.id,
  //   },
  //   func: code,
  // };
  // runScriptElement(code);
}
