const wsUri = "ws://localhost:8080/main";
const webSocket = null;
export const connectSocket = () => {
  if (!webSocket) {
    webSocket = new WebSocket(wsUri);
    webSocket.onopen = function (evt) {
        onOpen(evt)
    };
    webSocket.onmessage = function (evt) {
        onMessage(evt)
    };
    webSocket.onerror = function (evt) {
        onError(evt)
    };
  }
};

export const disconnectSocket = () => {
  if(webSocket) {
    webSocket.close();
  }
}

const onOpen = (evt) => {
  console.log("Connected to Endpoint!");
}

const onMessage = (evt) => {
  console.log("Message Received: " + evt.data);
}

const onError = (evt) => {
  console.log('ERROR: ' + evt.data);
}