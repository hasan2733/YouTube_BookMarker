document.getElementById("saveBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);

  if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
    const videoId = url.searchParams.get("v");

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.querySelector('video')?.currentTime
    }, async (results) => {
      const currentTime = Math.floor(results?.[0]?.result || 0);
      const bookmark = {
        id: videoId,
        time: currentTime,
        title: tab.title
      };

      chrome.storage.local.get(["ytBookmarks"], (data) => {
        const bookmarks = data.ytBookmarks || [];
        bookmarks.push(bookmark);
        chrome.storage.local.set({ ytBookmarks: bookmarks }, renderBookmarks);
      });
    });
  } else {
    alert("Please open a YouTube video.");
  }
});

function renderBookmarks() {
  chrome.storage.local.get(["ytBookmarks"], (data) => {
    const list = document.getElementById("bookmarksList");
    list.innerHTML = "";

    (data.ytBookmarks || []).forEach((bm, index) => {
      const li = document.createElement("li");

      const a = document.createElement("a");
      a.href = `https://www.youtube.com/watch?v=${bm.id}&t=${bm.time}s`;
      a.target = "_blank";
      a.innerText = `${bm.title.split(" - ")[0]} [${bm.time}s]`;

      const del = document.createElement("button");
      del.className = "deleteBtn";
      del.innerText = "Delete";
      del.onclick = () => {
        const bookmarks = data.ytBookmarks || [];
        bookmarks.splice(index, 1);
        chrome.storage.local.set({ ytBookmarks: bookmarks }, renderBookmarks);
      };

      li.appendChild(a);
      li.appendChild(del);
      list.appendChild(li);
    });
  });
}

document.addEventListener("DOMContentLoaded", renderBookmarks);
