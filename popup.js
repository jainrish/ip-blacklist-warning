(function () {
    'use strict';
    var utils;
    var background = chrome.extension.getBackgroundPage();

    function initPopupPage() {
        initWhiteListBtnStatus();
        function initWhiteListBtnStatus() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if(!tabs) {
                    return;
                }
                let ctab = tabs[0];
                document.getElementById('blacklistedIPCount').innerText = background.tabStorage[ctab.id].warning.count;
                console.log(ctab.id);
            });
        }

    }
    initPopupPage();

}());