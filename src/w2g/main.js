"use strict";

chrome.runtime.onMessage.addListener(
  (messageFromBg, sender, sendResponseFunction) => {
    if (messageFromBg === "get ids") {
      const roomURL = document
        .getElementById("w2g-top-inviteurl")
        .children[0].value.split("=")[1];

      const playlistURL = document.getElementsByClassName(
        "dropdown fluid selection ui"
      )[0].value;

      sendResponseFunction({ playlistURL, roomURL });
    }
  }
);
