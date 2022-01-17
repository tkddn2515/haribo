import store, { SET_BATTLEROOMLIST } from './store';


const wsUri = "ws://localhost:8080/main";
let webSocket = null;
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

export const sendMessage = (message) => {
  if(webSocket) {
    webSocket.send(message);
  }
}

export const disconnectSocket = () => {
  if(webSocket) {
    webSocket.close();
  }
}

const onOpen = (evt) => {
  if(store.getState().page) {
    const data = {
      type: "page",
      page: store.getState().page,
    }
    sendMessage(JSON.stringify(data));
  }
}

const onMessage = (evt) => {
  const obj = JSON.parse(evt.data);
  switch(obj.type) {
    case "battleRoomList":
      console.log(obj.data);
      const battleRoomList = Object.entries(JSON.parse(obj.data)).map(v => v[1]);
      console.log(battleRoomList);
      store.dispatch(SET_BATTLEROOMLIST(battleRoomList));
      break;
    case "createBattleRoom":

      break;
  }
}

const onError = (evt) => {
  console.log('ERROR: ' + evt.data);
}