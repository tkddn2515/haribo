package com.tkddn.haribo.db;

import java.sql.PreparedStatement;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import com.tkddn.haribo.model.user;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.simple.SimpleJdbcInsert;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiDb {

  @Autowired
  JdbcTemplate jdbcTemplate;
  private final SimpleJdbcInsert jdbcInsert;


  public ApiDb(JdbcTemplate jdbcTemplate, DataSource source) {
    this.jdbcTemplate = jdbcTemplate;
    this.jdbcInsert = new SimpleJdbcInsert(source)
        .withTableName("user")
        .usingGeneratedKeyColumns("id");
  }

  @CrossOrigin("*")
  @PostMapping("/user/join")
  public user Join(@RequestBody user user) {
    try {
      String sql = "INSERT INTO user (wallet, avatar_id, nickname) VALUES(?, 0, '')";
      KeyHolder keyHolder = new GeneratedKeyHolder();
      
      this.jdbcTemplate.update(connection -> {
        PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
        ps.setString(1, user.getWallet());
        return ps;
      }, keyHolder);
      user.setId(keyHolder.getKey().intValue());
      return user;
    } catch (DuplicateKeyException e) {
      return null;
    }
  }

  @CrossOrigin("*")
  @GetMapping("/user/login/{wallet}")
  public List<Map<String, Object>> Login(@PathVariable String wallet) {
    List<Map<String, Object>> _return = jdbcTemplate.queryForList("select * from user where wallet = ?", wallet);
    if(_return.size() == 0) {
      return null;
    } else {
      return _return;
    }
  }

  @CrossOrigin("*")
  @PutMapping("/user/update")
  public boolean UpdateAvatarId(@RequestBody user user) {
    jdbcTemplate.update("UPDATE user SET avatar_id = ?, nickname = ? WHERE wallet = ?", user.getAvatar_id(), user.getNickname(), user.getWallet());
    return true;
  }
}