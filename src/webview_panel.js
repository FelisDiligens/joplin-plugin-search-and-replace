/*
    This code is executed each time the panel is opened.
*/

// Doesn't work: document.addEventListener("DOMContentLoaded", function() {});

// Buttons:
let closeBtn = document.querySelector("#close-btn");
let findPreviousBtn = document.querySelector("#findprevious-btn");
let findNextBtn = document.querySelector("#findnext-btn");
let replaceBtn = document.querySelector("#replace-btn");
let replaceAllBtn = document.querySelector("#replaceall-btn");

// Elements:
let searchTxt = document.querySelector("#pattern-txt");
let replaceTxt = document.querySelector("#replacement-txt");

let wrapAroundChk = document.querySelector("#wrap-chk");
let matchCaseChk = document.querySelector("#matchcase-chk");

let useLiteralSearchRad = document.querySelector("#useliteralsearch-rad");
let useWildcardsRad = document.querySelector("#usewildcards-rad");
let useRegexRad = document.querySelector("#useregex-rad");

webviewApi.onMessage(function (message) {
    // Message for some reason is: { "message": <actual-message> } ??
    if (message.message)
        message = message.message

    if (message.name == "SARPanel.setText") {
        searchTxt.value = message.value;
    } else {
        // alert(JSON.stringify(message, null, 4));
    }
});

function getForm() {
    let matchMethod = "literal";
    if (useWildcardsRad.checked)
        matchMethod = "wildcards";
    if (useRegexRad.checked)
        matchMethod = "regex";
    return {
        "searchPattern": searchTxt.value,
        "replacement": replaceTxt.value,
        "options": {
            "wrapAround": wrapAroundChk.checked,
            "matchCase": matchCaseChk.checked,
            "matchMethod": matchMethod
        }
    }
}

function closePanel() {
    webviewApi.postMessage({ name: "SARPanel.close" });
}

function findNext() {
    webviewApi.postMessage({
        name: "SARPlugin.findNext",
        form: getForm()
    });
}

function findPrevious() {
    webviewApi.postMessage({
        name: "SARPlugin.findPrevious",
        form: getForm()
    });
}

function replace() {
    webviewApi.postMessage({
        name: "SARPlugin.replace",
        form: getForm()
    });
}

function replaceAll() {
    webviewApi.postMessage({
        name: "SARPlugin.replaceAll",
        form: getForm()
    });
}

// Attach event handler:
closeBtn.addEventListener("click", closePanel);
findNextBtn.addEventListener("click", findNext);
findPreviousBtn.addEventListener("click", findPrevious);
replaceBtn.addEventListener("click", replace);
replaceAllBtn.addEventListener("click", replaceAll);

// Get selected text upon opening the panel:
webviewApi.postMessage({ name: "selectedText" }).then((response) => {
    if (response && response.length > 0)
        searchTxt.value = response;
});