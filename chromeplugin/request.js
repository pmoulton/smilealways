/************************ REDIRECT CODE ***********************/
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    return detectRedirect(details);
}, {
    urls: ["<all_urls>"],
    types: ["main_frame", "sub_frame"]
}, ["blocking"]);

function detectRedirect(details) {
    url = details.url
    if (!shouldRedirect(url)) {
        return
    }
    return redirectToSmile(url);
}

function shouldRedirect(url) {
    if (url === null) {
        return;
    }
    // Ignore links with these strings in them
    var filter = "(sa-no-redirect=)"
        + "|(redirect=true)"
        + "|(redirect.html)"
        + "|(r.html)"
        + "|(f.html)"
        + "|(/dmusic/cloudplayer)"
        + "|(/photos)"
        + "|(/wishlist)"
        + "|(/clouddrive)"
        + "|(/ap/)"
        + "|(aws.amazon.)"
        + "|(read.amazon.)"
        + "|(login.amazon.)"
        + "|(payments.amazon.)"
        // All Amazon pages now redirect to HTTPS, also fixes conflict with HTTPS Everywhere extension
        + "|(http://)";
    return url.match(filter) === null;
}

function redirectToSmile(url) {
    var domain = url_domain(url);

    if (domain.includes("amazon.de")) {
        var smileurl = "smile.amazon.de";
        var amazonurl = "www.amazon.de"
    } else if (domain.includes("amazon.co.uk")) {
        var smileurl = "smile.amazon.co.uk";
        var amazonurl = "www.amazon.co.uk"
    } else {
        var smileurl = "smile.amazon.com";
        var amazonurl = "www.amazon.com"
    }

    return {
        // redirect to amazon smile append the rest of the url
        redirectUrl: "https://" + smileurl + getRelativeRedirectUrl(amazonurl, url)
    };
}

function getRelativeRedirectUrl(amazonurl, url) {
    var relativeUrl = url.split(amazonurl)[1];
    var noRedirectIndicator = "sa-no-redirect=1";
    var paramStart = "?";
    var paramStartRegex = "\\" + paramStart;
    var newurl = null;

    // check to see if there are already GET variables in the url
    if (relativeUrl.match(paramStartRegex) != null) {
        newurl = relativeUrl + "&" + noRedirectIndicator;
    } else {
        newurl = relativeUrl + paramStart + noRedirectIndicator;
    }
    return newurl;
}

function url_domain(data) {
    var a = document.createElement('a');
    a.href = data;
    return a.hostname;
}