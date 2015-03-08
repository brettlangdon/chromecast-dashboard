/**
 * Main JavaScript for handling Chromecast interactions.
 */

var urls = [];
var index = 0;
var delay = 30;
var interval = null;


window.onload = function() {
    cast.receiver.logger.setLevelValue(0);
    window.castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');

    castReceiverManager.onReady = function(event) {
        console.log('Received Ready event: ' + JSON.stringify(event.data));
        window.castReceiverManager.setApplicationState('chromecast-dashboard is ready...');
    };

    castReceiverManager.onSenderConnected = function(event) {
        console.log('Received Sender Connected event: ' + event.senderId);
    };

    castReceiverManager.onSenderDisconnected = function(event) {
        console.log('Received Sender Disconnected event: ' + event.senderId);
    };

    window.messageBus =
        window.castReceiverManager.getCastMessageBus(
            'urn:x-cast:is.brett.chromecast-dashboard', cast.receiver.CastMessageBus.MessageType.JSON);

    window.messageBus.onMessage = function(event) {
        console.log('Message [' + event.senderId + ']: ' + event.data);

        if (event.data.type === 'load') {
            urls = event.data.urls;
            delay = event.data.delay;
            clearInterval(interval);
            interval = setInterval(function(){
                if(!urls.length){
                    return;
                }
                index += 1;
                if(index > urls.length){
                    index = 0;
                }

                $('#dashboard').attr('src', urls[index]);
            }, delay);
        }
    }

    // Initialize the CastReceiverManager with an application status message.
    window.castReceiverManager.start({statusText: 'Application is starting'});
    console.log('Receiver Manager started');

    $('#dashboard').load(function() {
        $('#center').hide();
        console.log('Loading animation hidden.');
    });
};
