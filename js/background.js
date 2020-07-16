chrome.contextMenus.create({
  title: '录制',
  onclick: () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'record' });
    });
  },
});

chrome.contextMenus.create({
  title: '回放',
  onclick: () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'replay' });
    });
  },
});
