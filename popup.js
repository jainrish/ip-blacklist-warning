//https://www.w3schools.com/sql/default.asp - sample
(function () {
    'use strict';
    var utils;
    var background = chrome.extension.getBackgroundPage();
    var ipNode = document.getElementById('localIP');

    function initPopupPage() {
        initWhiteListBtnStatus();
        function initWhiteListBtnStatus() {


            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (!tabs) {
                    return;
                }
                let ctab = tabs[0];

                ipNode.innerHTML = background.isLocalIPBlackListed ? ('Your IP <font color="#C12706">' 
                + background.localIP + '</font> is blacklisted') : ('Your IP <font color="#0B7929">' 
                + background.localIP + '</font> is not blacklisted');


                if (!background.tabStorage[ctab.id] || !background.tabStorage[ctab.id].warning) {
                    return;
                }

                document.getElementById('blacklistedIPCount').innerText = background.tabStorage[ctab.id].warning.count;
                let prop,
                    trEl,
                    tdEl,
                    tableEl = document.getElementById('blockedIPs');

                if (background.tabStorage[ctab.id].warning && background.tabStorage[ctab.id].warning.blackList) {

                    var blackListSet = background.tabStorage[ctab.id].warning.blackList;
                    if (blackListSet && blackListSet.size > 0) {
                        blackListSet.forEach(function display(key, element, blackListSet) {
                            trEl = document.createElement('tr');
                            tdEl = document.createElement('td');
                            tdEl.innerText = element;
                            tdEl.style.color = '#C12706';
                            trEl.appendChild(tdEl);
                            tableEl.appendChild(trEl);
                        })
                    }
                }


                if (background.tabStorage[ctab.id].warning && background.tabStorage[ctab.id].warning.whiteList) {
                    var whiteListSet = background.tabStorage[ctab.id].warning.whiteList;
                    if (whiteListSet && whiteListSet.size > 0) {
                        whiteListSet.forEach(function display(key, element, whiteListSet) {
                            trEl = document.createElement('tr');
                            tdEl = document.createElement('td');
                            tdEl.innerText = element;
                            tdEl.style.color = '#0B7929';
                            trEl.appendChild(tdEl);
                            tableEl.appendChild(trEl);
                        })
                    }

                }



                setWlistStatus(true);
                console.log(ctab.id);
            });
        }

    }

    function setWlistStatus(status) {
        document.getElementById('hideWl').style.display = (status === true) ? '' : '';
        document.getElementById('hidePs').style.display = (status === true) ? '' : '';
    }


    initPopupPage();

}());