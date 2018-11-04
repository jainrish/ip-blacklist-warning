var countWarnings = 0;
var ipset = new Set();
var blacklistedIPCount = 0;
var tabStorage = {};


(function () {

    function syncBlacklistedIPData() {
        let actualCurrentdate = '2018-11-07';//new Date().toISOString().slice(0, 10);
        chrome.storage.sync.get(['currentDate'], function (result) {
            console.log('Value currently is ' + result.currentDate);
            console.log('actual date is ' + actualCurrentdate);

            if (typeof result === 'undefined' || result.currentDate != actualCurrentdate) {

                chrome.storage.sync.set({ currentDate: actualCurrentdate }, function () {
                    console.log('currentDate is set to ' + actualCurrentdate);
                });

                var x = new XMLHttpRequest();
                x.open('GET', 'https://ipblacklist.herokuapp.com/blacklistedIPs');
                x.onload = function () {
                    let response = x.responseText;
                    response = response.substring(1, response.length-1);
                    response = response.replace(/["']/g, "");
                    ipset = new Set(response.split(","));
                    
                    chrome.storage.sync.set({ ipset: ipset }, function () {
                        console.log('ipsList is set to ' + x.responseText);
                    });
                };
                x.send();
            } else {
                console.log('equal');
            }
        });

    }

    const networkFilters = {
        urls: [
            "<all_urls>"
        ]
    };

    chrome.tabs.onCreated.addListener(function (tabId, changeInfo, tab) {
        syncBlacklistedIPData();
    });

    // chrome.windows.onCreated.addListener((window) => {
    //     syncBlacklistedIPData();
    // });

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (tabStorage[tabId].warning.resetCount == true) {
            tabStorage[tabId].warning.url = tab.url;
            tabStorage[tabId].warning.count = 0;
            tabStorage[tabId].warning.resetCount = false;
            console.log("counter value set to 0 : " + tabId);
        }

        if (changeInfo.url === undefined && changeInfo.status === 'complete') {
            console.log(changeInfo);
            console.log("page reloaded");
            tabStorage[tabId].warning.resetCount = true;
        }

    });

    chrome.webRequest.onBeforeRequest.addListener((details) => {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }

        tabStorage[tabId].requests[requestId] = {
            requestId: requestId,
            url: details.url,
            startTime: details.timeStamp,
            status: 'pending'
        };
    }, networkFilters);


    chrome.webRequest.onCompleted.addListener((details) => {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
            return;
        }

        const request = tabStorage[tabId].requests[requestId];

        if (ipset.has(details.ip)) {
            tabStorage[tabId].warning.count += 1;
        }
        Object.assign(request, {
            endTime: details.timeStamp,
            requestDuration: details.timeStamp - request.startTime,
            status: 'complete'
        });
        console.log(tabStorage[tabId].warning.count);
    }, networkFilters);


    chrome.webRequest.onErrorOccurred.addListener((details) => {
        const { tabId, requestId } = details;
        if (!tabStorage.hasOwnProperty(tabId) || !tabStorage[tabId].requests.hasOwnProperty(requestId)) {
            return;
        }

        const request = tabStorage[tabId].requests[requestId];
        Object.assign(request, {
            endTime: details.timeStamp,
            status: 'error',
        });
        console.log(tabStorage[tabId].requests[requestId]);
    }, networkFilters);

    chrome.tabs.onActivated.addListener((tab) => {
        const tabId = tab ? tab.tabId : chrome.tabs.TAB_ID_NONE;
        if (!tabStorage.hasOwnProperty(tabId)) {
            tabStorage[tabId] = {
                id: tabId,
                requests: {},
                warning: {
                    url: "",
                    count: 0,
                    resetCount: false
                },
                registerTime: new Date().getTime()
            };
        }

    });
    chrome.tabs.onRemoved.addListener((tab) => {
        const tabId = tab.tabId;
        if (!tabStorage.hasOwnProperty(tabId)) {
            return;
        }
        tabStorage[tabId] = null;
    });
}());