package com.tkddn.haribo.model;

import java.sql.Timestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class user {
  public int id;
  public String wallet;
  public int avatar_id;
  public String nickname;
  public String createtime;
}
