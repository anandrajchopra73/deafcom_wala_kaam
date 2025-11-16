// Background script for Meet Translator Extension (Firefox)

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('meet.google.com')) {
    browser.browserAction.setBadgeText({ text: 'ON', tabId: tabId });
    browser.browserAction.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tabId });
  }
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveTranscript') {
    browser.storage.local.get(['transcripts']).then((result) => {
      const transcripts = result.transcripts || [];
      transcripts.push({
        timestamp: new Date().toISOString(),
        content: request.data,
        meetingUrl: sender.tab?.url
      });
      browser.storage.local.set({ transcripts });
    });
  }
});
