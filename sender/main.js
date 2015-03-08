/**
 * Main JavaScript for handling Chromecast interactions.
 */

var applicationID = 'F6C8F0A1';
var namespace = 'urn:x-cast:is.brett.chromecast-dashboard';
var session = null;

initializeCastApi();

function initializeCastApi() {
    if(!chrome.cast || !chrome.cast.isAvailable) {
        setTimeout(initializeCastApi, 1000);
        return;
    }
    var sessionRequest = new chrome.cast.SessionRequest(applicationID);
    var apiConfig = new chrome.cast.ApiConfig(
        sessionRequest, sessionListener, receiverListener
    );

    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
};

function onInitSuccess() {
    console.log('onInitSuccess');
}

function onError(message) {
    console.log('onError: ' + JSON.stringify(message));
}

function onSuccess(message) {
    console.log('onSuccess: ' + JSON.stringify(message));

    if(message['type'] == 'load') {
        $('button[type=reset]').prop('disabled', false);
    }
}

function onStopAppSuccess() {
    console.log('onStopAppSuccess');

    $('button[type=reset]').prop('disabled', true);
}

function sessionListener(e) {
    console.log('New session ID: ' + e.sessionId);
    session = e;
    session.addUpdateListener(sessionUpdateListener);
}

function sessionUpdateListener(isAlive) {
    console.log((isAlive ? 'Session Updated' : 'Session Removed') + ': ' + session.sessionId);
    if(!isAlive) {
        session = null;
    }
};

function receiverListener(e) {
    if(e !== 'available') {
        alert('No Chromecast receivers available');
        setTimeout(initializeCastApi, 1000);
    } else {
        $('button[type=submit]').prop('disabled',false);
    }
}

function sendMessage(message) {
    if(session !== null) {
        session.sendMessage(namespace, message, onSuccess.bind(this, message), onError);
    } else {
        chrome.cast.requestSession(function(e) {
            session = e;
            sessionListener(e);
            session.sendMessage(namespace, message, onSuccess.bind(this, message), onError);
        }, onError);
    }
}

function stopApp() {
    if(session){
        session.stop(onStopAppSuccess, onError);
    }
}

function connect() {
    var urls = $('textarea[name=urls]').val().split("\n");

    console.log('connect()');
    sendMessage({
        type: 'load',
        urls: urls,
        delay: $('input[name=delay]').val(),
    });
}


$(document).on('submit', 'form', function(evt){
    evt.preventDefault();
    return false;
});

$(document).on('click', 'button[type=reset]', stopApp);
$(document).on('click', 'button[type=submit]', connect);
