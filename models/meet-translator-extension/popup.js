// Popup script for extension

document.addEventListener('DOMContentLoaded', () => {
  checkMeetStatus();
  
  document.getElementById('view-transcripts').addEventListener('click', () => {
    chrome.storage.local.get(['transcripts'], (result) => {
      const transcripts = result.transcripts || [];
      if (transcripts.length === 0) {
        alert('No saved transcripts yet!');
      } else {
        alert(`You have ${transcripts.length} saved transcript(s). Check your downloads folder.`);
      }
    });
  });

  document.getElementById('settings').addEventListener('click', () => {
    alert('Settings coming soon! Configure language preferences, confidence thresholds, and more.');
  });
});

function checkMeetStatus() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0];
    const meetStatus = document.getElementById('meet-status');
    
    if (currentTab.url && currentTab.url.includes('meet.google.com')) {
      meetStatus.textContent = 'Connected';
      meetStatus.style.background = 'rgba(76, 175, 80, 0.8)';
    } else {
      meetStatus.textContent = 'Not on Meet';
      meetStatus.style.background = 'rgba(244, 67, 54, 0.8)';
    }
  });
}
