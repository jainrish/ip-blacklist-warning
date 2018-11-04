//https://www.w3schools.com/sql/default.asp - sample
(function () {
    'use strict';
    var utils;
    var background = chrome.extension.getBackgroundPage();

    function initPopupPage() {
        initWhiteListBtnStatus();
        function initWhiteListBtnStatus() {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (!tabs) {
                    return;
                }
                let ctab = tabs[0];
                document.getElementById('blacklistedIPCount').innerText = background.tabStorage[ctab.id].warning.count;
                let prop,
                    trEl,
                    tdEl,
                    tableEl = document.getElementById('blockedIPs');

                background.tabStorage[ctab.id].warning.ipList.forEach(element => {
                    trEl = document.createElement('tr');
                    tdEl = document.createElement('td');
                    tdEl.innerText = element;
                    trEl.appendChild(tdEl);
                    tableEl.appendChild(trEl);
                });
                setWlistStatus(true);
                console.log(ctab.id);
            });
        }

    }

    function setWlistStatus(status) {
        document.getElementById('addWlist').style.display = (status === true) ? 'none' : '';
        document.getElementById('removeWlist').style.display = (status === true) ? '' : 'none';
        document.getElementById('hideWl').style.display = (status === true) ? '' : '';
        document.getElementById('hidePs').style.display = (status === true) ? '' : '';
    }
    initPopupPage();

}());