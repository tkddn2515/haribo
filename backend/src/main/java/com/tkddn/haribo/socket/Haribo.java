package com.tkddn.haribo.socket;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.tkddn.haribo.model.user;

import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.java.Log;

@Data
@AllArgsConstructor
@NoArgsConstructor
class Message<T> {
    private String type;
    private T data;
}

@Data
@AllArgsConstructor
@NoArgsConstructor
class BattleRoom {
    private user owner;
    private user participant;
}

@Log
@Component
@ServerEndpoint(value = "/main")  //서버가 바인딩된 주소를 뜻함.
public class Haribo {
  private Session session;

  // 메인 화면에 있는 사람
  public static List<Haribo> mainListenrer = new ArrayList<Haribo>();

  // 배틀방에 있는 사람
  public static List<BattleRoom> battleRoomListener = new ArrayList<BattleRoom>();

  private static int onlineCount = 0;

  @OnOpen //클라이언트가 소켓에 연결되때 마다 호출
  public void onOpen(Session session) {
    onlineCount++;
    this.session = session;
    mainListenrer.add(this);

    sendRoomList();
    log.info("onOpen called, userCount:" + onlineCount);
  }

  @OnClose //클라이언트와 소켓과의 연결이 닫힐때 (끊길떄) 마다 호출
  public void onClose(Session session) {
    onlineCount--;
    mainListenrer.remove(this);
    
    sendRoomList();
    log.info("onClose called, userCount:" + onlineCount);
  }

  // Array일 경우
  // JsonArray studentsJsonArray = object.get("user").getAsJsonArray();
  // System.out.println(studentsJsonArray);

  @OnMessage
  public void onMessage(String _message) {
    JsonElement json = JsonParser.parseString(_message);
    JsonObject object = json.getAsJsonObject();
    System.out.println(object);
    String type = object.get("type").getAsString();

    switch(type) {
      case "createRoom":
        JsonObject userJsonObject = object.get("user").getAsJsonObject();
        System.out.println(userJsonObject);
        Gson gson = new Gson();
        System.out.println(gson.toJson(userJsonObject).getClass());
        user _user = gson.fromJson(gson.toJson(userJsonObject), user.class);
        System.out.println(_user);
        BattleRoom _br = new BattleRoom(_user, null);
        System.out.println(_br);
        battleRoomListener.add(_br);
        System.out.println(battleRoomListener);
        Message<user> send = new Message<user>(type, _user);
        System.out.println(send);
        broadcast(gson.toJson(send));
        break;
      default:
        break;
    }
  }

  @OnError //의도치 않은 에러 발생
  public void onError(Session session, Throwable throwable) {
    log.warning("onClose called, error:" + throwable.getMessage());
    mainListenrer.remove(this);
    onlineCount--;
  }

  public void sendRoomList() {
    for (Haribo listener : mainListenrer) {
        listener.sendMessage("새로운 사람이 접속");
    }
  }

  public void broadcast(String message) {
      for (Haribo listener : mainListenrer) {
          listener.sendMessage(message);
      }
  }

  private void sendMessage(String message) {
      try {
          this.session.getBasicRemote().sendText(message);
      } catch (IOException e) {
          log.warning("Caught exception while sending message to Session " + this.session.getId() + "error:" + e.getMessage());
      }
  }
}
