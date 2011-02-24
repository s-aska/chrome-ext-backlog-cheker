var badgeCountLoadingText = '.';

function getBacklog() {
  var backlog = new Backlog();
  
  backlog.init({
    space:    localStorage.getItem('org.7kai.chrome.backlog.space'),
    username: localStorage.getItem('org.7kai.chrome.backlog.username'),
    password: localStorage.getItem('org.7kai.chrome.backlog.password')
  });
  
  return backlog;
}

function countIssue() {
  var backlog = getBacklog();
  
  var due = localStorage.getItem('org.7kai.chrome.backlog.due');
  var status = localStorage.getItem('org.7kai.chrome.backlog.status');
  var project = localStorage.getItem('org.7kai.chrome.backlog.project');
  var assigner = localStorage.getItem('org.7kai.chrome.backlog.assigner');
  
  if (status == null) {
    throw('status is null');
  }
  
  if (project == null) {
    throw('project is null');
  }
  
  if (assigner == null) {
    throw('assigner is null');
  }
  
  return backlog.countIssue(due, status.split(':'), project.split(':'), assigner.split(':'));
}

function updateBadgeCountLoading() {
  badgeCountLoadingText = badgeCountLoadingText == '.' ? '..' : 
                          badgeCountLoadingText == '..' ? '...' : '.';
  chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 255]});
  chrome.browserAction.setBadgeText({text:badgeCountLoadingText});
}

function updateBadgeCount() {
  
  // Loading Set
  badgeCountLoadingText = '';
  
  updateBadgeCountLoading();
  
  var timer = setInterval('updateBadgeCountLoading()', 1000);
  
  try {
    var count = countIssue();
    if (count > 0) {
      chrome.browserAction.setBadgeBackgroundColor({color: [208, 0, 24, 255]});
      chrome.browserAction.setBadgeText({text: count.toString()});
    } else if (count == 0) {
      chrome.browserAction.setBadgeText({text: ''});
    }
  } catch (e) {
    chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 255]});
    chrome.browserAction.setBadgeText({text:"?"});
    console.log(e);
  }
  
  // Loading Clear
  clearInterval(timer);
}

$.escapeHTML = function(val) {
  return $('<div>').text(val).html();
};

function findTab(url, callback) {
  chrome.tabs.getAllInWindow(undefined, function(tabs) {
    for (var i = 0, tab; tab = tabs[i]; i++) {
      if (tab.url && tab.url.substr(0, url.length) == url) {
        callback(tab);
        return;
      }
    }
    callback(null);
  });
}
