// package com.tkddn.haribo.db;

// import java.sql.ResultSet;
// import java.sql.SQLException;
// import java.util.List;
// import java.util.Map;

// import javax.sql.DataSource;

// import com.tkddn.haribo.model.*;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.jdbc.core.JdbcTemplate;
// import org.springframework.jdbc.core.RowMapper;
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.PathVariable;
// import org.springframework.web.bind.annotation.PostMapping;
// import org.springframework.web.bind.annotation.RequestParam;
// import org.springframework.web.bind.annotation.RestController;

// @RestController
// public class TestDBConnect {

//   @Autowired
//   DataSource dataSource;

//   @Autowired
//   JdbcTemplate jdbcTemplate;

//   @GetMapping("/create")
//   public void GetTest() {
//     jdbcTemplate.execute("INSERT INTO USER VALUES(57, 'saelobi')");
//     jdbcTemplate.execute("CREATE TABLE USER2(" +
//                         "ID INTEGER NOT NULL AUTO_INCREMENT PRIMARY KEY," +
//                         "NAME VARCHAR(255)," +
//                         "PRIMARY KEY(ID))");
//     jdbcTemplate.execute("INSERT INTO USER2 VALUES(123, 'tkddn')");
//     /*
//       http://wonwoo.ml/index.php/post/1960

//       update 메서드 : Read를 제외한 나머지 insert, update, delete 는 모두 이 메서드를 사용하면 된다.

//       int update(String sql, @Nullable Object... args) throws DataAccessException;
//       public int insert(String name) {
//         return jdbcTemplate.update("insert into persons (name) values (?)", name);
//       }

//       int[] batchUpdate(String sql, List<Object[]> batchArgs) throws DataAccessException;
//       public void batchUpdate(List<String> name) {
//       List<Object[]> ts = name.stream().map(i -> new Object[]{i}).collect(Collectors.toList());
//         jdbcTemplate.batchUpdate("insert into persons (name) values (?)", ts);
//       }
//       jdbcTemplate.batchUpdate(Arrays.asList("hello", "world"));

//       public List<Person> findAll() {
//       return this.jdbcTemplate.query("SELECT id, name FROM persons",
//         (rs, rowNum) -> new Person(rs.getLong("id"), rs.getString("name")));
//       }
//     */
//   }

//   @PostMapping("/user")
//   public void InsertUsers(user user) {
//     int _return = jdbcTemplate.update("insert into user (wallet, avatar_id) values (?, ?)", user.getWallet(), user.getAvatar_id());
//     System.out.println("return : " + _return);
//   }

//   @GetMapping("/user1")
//   public List<user> FindAllUser1() {
//     return jdbcTemplate.query("select * from user", new RowMapper<user>() {
//       public user mapRow(ResultSet rs, int rowNum) throws SQLException {
//         user _user = new user();
//         _user.setId(rs.getInt("id"));
//         _user.setWallet(rs.getString("wallet"));
//         _user.setAvatar_id(rs.getInt("avatar_id"));
//         _user.setCreatetime(rs.getTimestamp("createtime"));
//         return _user;
//       };
//     });
//   }

//   @GetMapping("/user")
//   public void FindAllUser() {
//     List<Map<String, Object>> _return = jdbcTemplate.queryForList("select * from user");
//     System.out.println("return : " + _return);
//   }

//   @GetMapping("/user/{id}")
//   public void FindAllUser(@PathVariable String id) {
//     List<Map<String, Object>> _return = jdbcTemplate.queryForList("select * from user where id = ?", id);
//     System.out.println("return : " + _return);
//   }
// }