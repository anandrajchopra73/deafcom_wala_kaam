// Background service worker for Meet Translator Extension

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('meet.google.com')) {
    chrome.action.setBadgeText({ text: 'ON', tabId: tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tabId });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveTranscript') {
    chrome.storage.local.get(['transcripts'], (result) => {
      const transcripts = result.transcripts || [];
      transcripts.push({
        timestamp: new Date().toISOString(),
        content: request.data,
        meetingUrl: sender.tab?.url
      });
      chrome.storage.local.set({ transcripts });
    });
  }
});
