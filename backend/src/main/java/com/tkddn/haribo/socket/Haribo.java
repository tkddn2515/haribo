package com.tkddn.haribo.socket;

import java.io.Console;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

import org.apache.catalina.User;
import org.springframework.stereotype.Component;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.java.Log;

interface Page {
  public String Login= "Login";
  public String Join = "Join";
  public String Main = "Main";
  public String BattleRoom = "BattleRoom";
}

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
    private long id;
    private String roomName;
    private user owner;
    private user participant;
}

@Log
@Component
@ServerEndpoint(value = "/main")  //서버가 바인딩된 주소를 뜻함.
public class Haribo {
  private Session session;

  // 전체 접속자
  public static List<Haribo> allListener = new ArrayList<Haribo>();

  // 페이지 별 접속자
  public static HashMap<String, List<Haribo>> pageListener = new HashMap<>();

  // 배틀방에 있는 사람, 배틀방 리스트이기도 하지
  public static List<BattleRoom> battleRoomList = new ArrayList<BattleRoom>();

  private static int onlineCount = 0;
  private static long battleRoomId = 0;

  Gson gson = new Gson();

  @OnOpen //클라이언트가 소켓에 연결되때 마다 호출
  public void onOpen(Session session) {
    onlineCount++;
    this.session = session;
    allListener.add(this);

    log.info("onOpen called, userCount:" + onlineCount);
  }

  @OnClose //클라이언트와 소켓과의 연결이 닫힐때 (끊길떄) 마다 호출
  public void onClose(Session session) {
    onlineCount--;
    allListener.remove(this);
    
    log.info("onClose called, userCount:" + onlineCount);
  }

  @OnError //의도치 않은 에러 발생
  public void onError(Session session, Throwable throwable) {
    log.warning("onClose called, error:" + throwable.getMessage());
    allListener.remove(this);
    onlineCount--;
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
      case "page":
        Message_Page(type, object);
        break;
      case "createBattleRoom":
        Message_CreateBattleRoom(type, object);
        break;
      case "getAllListner":
        getAllListner();
        break;
      case "getPageListener":
        getPageListener();
        break;
      case "getBattleRoomListener":
        getBattleRoomListener();
        break;
      default:
        break;
    }
  }

  public void broadcast(List<Haribo> listeners, String message) {
      for (Haribo listener : listeners) {
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

  public void getAllListner() {
    System.out.println(allListener.size());
  }
  public void getPageListener() {
    System.out.println(pageListener.get(Page.Login));
    System.out.println(pageListener.get(Page.Join));
    System.out.println(pageListener.get(Page.Main));
    System.out.println(gson.toJson(pageListener.get(Page.BattleRoom)));
  }

  public void getBattleRoomListener() {
    System.out.println(battleRoomList);
  }

  // 페이지 이동 시
  private void Message_Page(String type, JsonObject object) {
    // 새로 이동할 페이지
    String newPage = object.get("page").getAsString();

    // 기존에 있던 페이지에서 제거
    LeavePage(Page.Login);
    LeavePage(Page.Join);
    LeavePage(Page.Main);
    LeavePage(Page.BattleRoom);

    // 페이지에 추가
    List<Haribo> _Haribos = pageListener.get(newPage);
    if(_Haribos == null) {
      _Haribos = new ArrayList<Haribo>();
    }
    _Haribos.add(this);
    pageListener.put(newPage, _Haribos);

    switch(newPage) {
      case Page.Login:
        break;
      case Page.Join:
        break;
      case Page.Main:
        user _u1 = new user(0, "1", 1, "상우", "");
        user _u2 = new user(2, "2", 2, "한", "");
        BattleRoom _br = new BattleRoom(0, "1",_u1, null);
        battleRoomList.add(_br);
        _br = new BattleRoom(1, "2",_u2, null);
        battleRoomList.add(_br);
        String roomListJson = gson.toJson(battleRoomList);
        System.out.println(roomListJson);
        Message<String> message = new Message<String>("battleRoomList", roomListJson);
        broadcast(pageListener.get(Page.Main), gson.toJson(message));
        break;
      case Page.BattleRoom:
        break;
    }
  }

  // 페이지 나가기
  private void LeavePage(String _page) {
    if(pageListener.get(_page) != null) {
      if(pageListener.get(_page).contains(this)) {
        pageListener.get(_page).remove(this);
      }
    }
  }

  // 배틀룸 생성 시
  private void Message_CreateBattleRoom(String type, JsonObject object) {
    JsonObject userJsonObject = object.get("user").getAsJsonObject();
    String roomName = object.get("roomName").getAsString();
    user _user = gson.fromJson(gson.toJson(userJsonObject), user.class);
    BattleRoom _br = new BattleRoom(battleRoomId++, roomName, _user, null);
    battleRoomList.add(_br);
    Message<user> send = new Message<user>(type, _user);
    broadcast(pageListener.get(Page.Main), gson.toJson(send));
  }
}
