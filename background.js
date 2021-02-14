try {
    chrome.tabs.onUpdated.addListener(function (tabId, changeinfo) {

        if (changeinfo.status === 'complete') {
            chrome.tabs.executeScript(null, {file: 'expandCollapse.js'});
        }
    });
}
catch (e){
    console.log(e);
}