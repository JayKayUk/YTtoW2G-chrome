"use strict";

const observerOptions = { childList: true, subtree: true };
const observerTarget = document;
const observer = new MutationObserver(() => {
  const videos = [];
  videos.push(...document.getElementsByTagName("ytd-video-renderer"));
  videos.push(...document.getElementsByTagName("ytd-grid-video-renderer"));
  videos.push(...document.getElementsByTagName("ytd-rich-item-renderer"));
  videos.push(...document.getElementsByTagName("ytd-compact-video-renderer"));
  videos.push(...document.getElementsByTagName("ytd-playlist-video-renderer"));

  for (let i = 0; i < videos.length; i++) {
    videos[i].addEventListener("mouseenter", addButton_thumbnails);
    videos[i].addEventListener("mouseleave", removeButton_thumbnails);
  }

  if (!window.location.href.match(/.*watch/g)) {
    return;
  }

  let buttonId;

  if (
    window
      .getComputedStyle(document.querySelector("body > ytd-app"), null)
      .getPropertyValue("background-color") === "rgb(15, 15, 15)"
  ) {
    buttonId = "YTtoW2G-videoPage-dark";
  } else {
    buttonId = "YTtoW2G-videoPage-light";
  }

  if (document.querySelector(`#${buttonId}`)) {
    return;
  }

  if (!document.querySelector("#menu-container")) {
    return;
  }

  if (
    !document.querySelector(
      "ytd-menu-renderer.ytd-watch-metadata > yt-button-shape:nth-child(4)"
    )
  ) {
    return;
  }

  addButton_videoPage(buttonId);
});
observer.observe(observerTarget, observerOptions);

addNotificationsContainer();

chrome.runtime.onMessage.addListener((message) => {
  if (message === "W2G tab does not exist") {
    addNotification(
      "Opened a W2G tab. Make sure you open a room on W2G.",
      "orange"
    );
    return;
  }
  addNotification("Video added!", "green");
});

function sanitizeString(text) {
  return text.replace(/['"`/\\]/g, "");
}

function addButton_thumbnails(e) {
  const videoTile = e.currentTarget;

  addButtonElement_thumbnails(videoTile);
  addButtonListener_thumbnails(videoTile);
}

function addButtonElement_thumbnails(videoTile) {
  if (videoTile.querySelector("#YTtoW2G")) {
    return;
  }

  const buttonHTMLstring = `<button id='YTtoW2G'><img src='${chrome.runtime.getURL(
    "icons/main-icon-48.png"
  )}'></button>`;
  videoTile.insertAdjacentHTML("beforeend", buttonHTMLstring);

  if (videoTile.tagName === "YTD-PLAYLIST-VIDEO-RENDERER") {
    videoTile.style.position = "relative";
    videoTile.querySelector("#YTtoW2G").style.left = "2.70em";
    videoTile.querySelector("#YTtoW2G").style.top = "0.5em";
  }
}

function addButtonListener_thumbnails(videoTile) {
  const button = document.getElementById("YTtoW2G");
  button.addEventListener("click", () => {
    sendMsgToBgScript(getData_thumbnails(videoTile));
  });
}

function getData_thumbnails(videoTile) {
  const videoURL = videoTile.querySelector("a#thumbnail").href;
  const thumbnailSource = videoTile.querySelector("img").src;
  const videoTitle = sanitizeString(
    videoTile.querySelector("#video-title")?.title ||
      videoTile.querySelector("#video-title-link")?.title ||
      videoTile.querySelector("#video-title")?.textContent
  );
  const data = {
    videoURL,
    thumbnailSource,
    videoTitle,
  };
  return data;
}

function removeButton_thumbnails(e) {
  const buttonToRemove = document.getElementById("YTtoW2G");
  e.currentTarget.removeChild(buttonToRemove);
}

function getData_videoPage() {
  const videoURL = window.location.href;
  const thumbnailSource = `https://img.youtube.com/vi/${videoURL.slice(
    32
  )}/mqdefault.jpg`;
  const videoTitle = sanitizeString(
    document.querySelector(
      "yt-formatted-string.ytd-video-primary-info-renderer:nth-child(1)"
    ).textContent
  );

  const data = {
    videoURL,
    thumbnailSource,
    videoTitle,
  };

  return data;
}

function addButton_videoPage(buttonId) {
  addButtonElement_videoPage(buttonId);
  addButtonListener_videoPage(buttonId);
}

function addButtonElement_videoPage(buttonId) {
  const dotsButton = document.querySelector(
    "ytd-menu-renderer.ytd-watch-metadata > yt-button-shape:nth-child(4)"
  );
  // FIXME: icons don't show
  const buttonHTMLstring_videoPage = `<button id='${buttonId}'><img src='${chrome.runtime.getURL(
    "icons/main-icon-48.png"
  )}'></button>`;

  dotsButton.insertAdjacentHTML("afterend", buttonHTMLstring_videoPage);
}

function addButtonListener_videoPage(buttonId) {
  const button_videoPage = document.getElementById(`${buttonId}`);
  button_videoPage.addEventListener("click", () => {
    sendMsgToBgScript(getData_videoPage());
  });
}

function sendMsgToBgScript(data) {
  if (!data.videoURL) {
    addNotification(`Error! Video URL not found!`, "red");
    return;
  }

  if (!data.thumbnailSource) {
    addNotification(`Error! Thumbnail source not found!`, "red");
    return;
  }

  if (!data.videoTitle) {
    addNotification(`Error! Title not found!`, "red");
    return;
  }

  chrome.runtime.sendMessage({
    url: data.videoURL,
    thumb: data.thumbnailSource,
    title: data.videoTitle,
  });
}

function addNotificationsContainer() {
  if (document.getElementById("YTtoW2G-notificationsContainer")) {
    return;
  }
  const notificationsContainerHTML = `<div id='YTtoW2G-notificationsContainer'></div>`;
  document.body.insertAdjacentHTML("beforeend", notificationsContainerHTML);
}

function addNotification(text, color) {
  const notificationHTML = `<p class="YTtoW2G-notification" style="background-color: ${color}">${text}</p>`;
  const notificationsContainerElement = document.getElementById(
    "YTtoW2G-notificationsContainer"
  );
  notificationsContainerElement.insertAdjacentHTML(
    "beforeend",
    notificationHTML
  );

  const notificationElement = document.getElementById(
    "YTtoW2G-notificationsContainer"
  ).lastChild;

  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}
