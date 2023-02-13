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
let sarButtons = [findPreviousBtn, findNextBtn, replaceBtn, replaceAllBtn];

// Elements:
let searchTxt = document.querySelector("#pattern-txt");
let replaceTxt = document.querySelector("#replacement-txt");

let wrapAroundChk = document.querySelector("#wrap-chk");
let matchCaseChk = document.querySelector("#matchcase-chk");
let matchWholeWordChk = document.querySelector("#matchwholeword-chk");
let preserveCaseChk = document.querySelector("#preservecase-chk");
let multiLineChk = document.querySelector("#multiline-chk");

let useLiteralSearchRad = document.querySelector("#useliteralsearch-rad");
let useWildcardsRad = document.querySelector("#usewildcards-rad");
let useRegexRad = document.querySelector("#useregex-rad");

// Text:
let helpDetails = document.querySelector("details");
let warnMdEditorParagraph = document.querySelector("#warning-mdeditor");
warnMdEditorParagraph.style.display = "none";
let regexPreviewSpan = document.querySelector("#regex-preview");

webviewApi.onMessage(function (message) {
    // Message for some reason is: { "message": <actual-message> } ??
    if (message.message) message = message.message;

    if (message.name == "SARPanel.setText") {
        searchTxt.value = message.value;
    } else {
        // alert(JSON.stringify(message, null, 4));
    }
});

function getForm() {
    let matchMethod = "literal";
    if (useWildcardsRad.checked) matchMethod = "wildcards";
    if (useRegexRad.checked) matchMethod = "regex";
    return {
        searchPattern: searchTxt.value,
        replacement: replaceTxt.value,
        options: {
            wrapAround: wrapAroundChk.checked,
            matchCase: matchCaseChk.checked,
            matchWholeWord: matchWholeWordChk.checked,
            matchMethod: matchMethod,
            preserveCase: preserveCaseChk.checked,
            multiLine: multiLineChk.checked
        },
    };
}

function closePanel() {
    webviewApi.postMessage({ name: "SARPanel.close" });
}

function findNext() {
    webviewApi.postMessage({
        name: "SARPlugin.findNext",
        form: getForm(),
    });
}

function findPrevious() {
    webviewApi.postMessage({
        name: "SARPlugin.findPrevious",
        form: getForm(),
    });
}

function replace() {
    webviewApi.postMessage({
        name: "SARPlugin.replace",
        form: getForm(),
    });
}

function replaceAll() {
    webviewApi.postMessage({
        name: "SARPlugin.replaceAll",
        form: getForm(),
    });
}

/** Periodically check, if the markdown editor is visible and show a warning, if it isn't. */
function checkEditor() {
    webviewApi.postMessage({ name: "getEditorState" }).then((response) => {
        if (response.markdownEditor) {
            warnMdEditorParagraph.style.display = "none";
            for (let btn of sarButtons) btn.disabled = false;
        } else {
            warnMdEditorParagraph.style.display = "block";
            for (let btn of sarButtons) btn.disabled = true;
        }
    });
    setTimeout(checkEditor, 1000);
}

function updatePreviewRegex() {
    webviewApi
        .postMessage({ name: "getPreviewRegex", form: getForm() })
        .then((response) => {
            if (response.regex) {
                regexPreviewSpan.innerText = response.regex.toString();
                regexPreviewSpan.style.color = "";
            } else if (response.error) {
                regexPreviewSpan.innerText = response.error.message;
                regexPreviewSpan.style.color = "red";
            }
        });
}

// Attach event handler:
closeBtn.addEventListener("click", closePanel);
findNextBtn.addEventListener("click", findNext);
findPreviousBtn.addEventListener("click", findPrevious);
replaceBtn.addEventListener("click", replace);
replaceAllBtn.addEventListener("click", replaceAll);

searchTxt.addEventListener("input", updatePreviewRegex);
matchCaseChk.addEventListener("change", updatePreviewRegex);
matchWholeWordChk.addEventListener("change", updatePreviewRegex);
useLiteralSearchRad.addEventListener("change", updatePreviewRegex);
useWildcardsRad.addEventListener("change", updatePreviewRegex);
useRegexRad.addEventListener("change", updatePreviewRegex);
multiLineChk.addEventListener("change", updatePreviewRegex);

// Hide numbers if the help isn't displayed:
document.querySelectorAll("sup").forEach((el) => {
    el.style.visibility = "hidden";
});
helpDetails.addEventListener("toggle", () => {
    let isDetailsOpen = helpDetails.hasAttribute("open");
    document.querySelectorAll("sup").forEach((el) => {
        el.style.visibility = isDetailsOpen ? "visible" : "hidden";
    });
});

// Get selected text upon opening the panel:
webviewApi.postMessage({ name: "selectedText" }).then((response) => {
    if (response && response.length > 0) searchTxt.value = response;
});

checkEditor();
