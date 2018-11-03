var countWarnings = 0;
var ips = ["216.58.194.164", "172.217.3.100", "192.229.173.207"];
var ipset = new Set(ips);
var count = 0;

(function () {
    const tabStorage = {};
    const networkFilters = {
        urls: [
            "<all_urls>"
        ]
    };


    chrome.tabs.onCreated.addListener(function (tabId, changeInfo, tab) {
        
    });

    chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        var warnCountTemp = 0;
        if(tabStorage[tabId].warning.url!=tab.url) {
            tabStorage[tabId].warning.url = tab.url;
            tabStorage[tabId].warning.count = 0;
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
                    count: 0
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