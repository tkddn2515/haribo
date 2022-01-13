//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/structs/EnumerableSetUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/StringsUpgradeable.sol";
import "hardhat/console.sol";

struct Avatar {
  uint256 tokenId;

  string nickname; // 닉네임

  uint8 hp;// 체력
  uint8 hungry; // 배고픔
  uint8 thirst;// 갈증
  uint8 level; // 레벨

  // 전투 관련
  uint8 battle_hp; // 전투 체력 // +1 lv => +10
  uint8 battle_att; // 공격력 // +1 lv => +2
  uint8 battle_def; // 방어력 // +1 lv => +1
  uint8 battle_cri_per; // 크리티컬 확률 // +1 lv => +2
  uint16 battle_cri_att_increase; // 크리티컬 증가율(퍼센테이지) // +1 lv => +50
  
  uint16 exp; // 경험치 // level * 100

  uint256 fill_hungry_time; // 마지막으로 배고픔을 해결한 시간, 배고픔이 0이 되면 30분에 1씩 체력이 깍인다.
  uint256 fill_thirst_time; // 마지막으로 갈증을 해결한 시간, 갈증이 0이 되면 15분에 1씩 체력이 깍인다.

  uint256 battle_win_count; // 배틀 승리 횟수
  uint256 battle_lose_count; // 배틀 패배 횟수

  bool is_dead;
}
contract Haribo is Initializable, ERC721EnumerableUpgradeable, AccessControlUpgradeable {

  using StringsUpgradeable for uint32;
  using SafeMathUpgradeable for uint8;
  using SafeMathUpgradeable for uint16;
  using SafeMathUpgradeable for uint256;

  ERC20 private erc20;  

  // 소유주
  address private owner;
  // 수수료
  uint256 private fee;
  // 토큰
  uint256 private tokenId;

  uint8 defaultHp;// 체력
  uint8 defaultHungry;// 체력
  uint8 defaultThirst;// 갈증
  uint8 defaultLevel;

  // 전투 관련
  uint8 defaultBattleHp; // 전투 체력
  uint8 defaultBattleAtt; // 공격력
  uint8 defaultBattleDef; // 방어력
  uint8 defaultBattleCriPer; // 크리티컬 확률
  uint16 defaultBattleCriAttIncrease; // 크리티컬 증가율(퍼센테이지)

  uint32 liveFee; // 부활에 필요한 수수료
  uint32 hpFeePer; // 체력을 채우기 위한 수수료, 현재 깍인 체력 수치 * hpFeePer
  uint32 hungryFeePer; // 배고픔을 채우기 위한 수수료, 현재 깍인 배고픔 수치 * hungryFeePer
  uint32 thirstFeePer; // 갈증을 채우기 위한 수수료, 현재 깍인 갈증 수치 * thirstFeePer

  // 아바타 리스트
  // 계정당 하나의 아바타만 가질 수 있다.
  mapping(address => Avatar) avatars;

  // 관리자 키
  bytes32 constant private MANAGER_HARIBO = keccak256("MANAGER_HARIBO");

  // 이벤트
  event EventChangeOwner(address _owner);
  event EventChangeFee(uint256 _fee);
  event EventMint(address _addr, uint256 _tokenId);
  event EventBurn(address _addr, Avatar _avatar);
  event EventDecreaseHp(address[] _addr, uint8[] _decrease);
  event EventDecreaseHungry(address[] _addr, uint8[] _decrease);
  event EventDecreaseThirst(address[] _addr, uint8[] _decrease);
  event EventIncreaseHp(address _addr, uint8 fiiled, uint256 fillAmount);
  event EventIncreaseHungry(address _addr, uint8 fiiled, uint256 fillAmount);
  event EventIncreaseThirst(address _addr, uint8 fiiled, uint256 fillAmount);
  event DeadAvatar(address _addr);
  event LiveAvatar(address _addr, bool _isLevelDown, uint8 downStat);
  event BattleResult(address _winner, address _loser);

  // 초기화 함수
  function initialize(address _erc20) initializer external {

    owner = msg.sender;
    setAdminRole();
    erc20 = ERC20(_erc20);

    initDefault();

    // erc20.approveForce(owner, address(this), erc20.totalSupply());

    emit EventChangeOwner(owner);
  }

  // 전투관련 기본값 초기화
  function initDefault() private {
    defaultHp = 100;
    defaultHungry = 100;
    defaultThirst = 100;
    defaultLevel = 1;
    defaultBattleHp = 100;
    defaultBattleAtt = 5;
    defaultBattleDef = 1;
    defaultBattleCriPer = 5;
    defaultBattleCriAttIncrease = 100;

    liveFee = 30;
    hpFeePer = 20;
    hungryFeePer = 10;
    thirstFeePer = 10;
  }

  // address가 제로address인지 체크
  modifier addressCheckZero(address _addr) {
    require(_addr != address(0), "address cannot be zero");
    _;
  }

  // 관리자인지 체크
  modifier isManager() {
    require(hasRole(MANAGER_HARIBO, msg.sender), "you are not manager");
    _;
  }

  // 아바타가 살아있는지 체크
  modifier activity() {
    require(balanceOf(msg.sender) > 0, "this address does not exist.");
    require(!avatars[msg.sender].is_dead, "avatar dead");
    _;
  }

  // 소유주에게 권한 부여
  function setAdminRole() private {
    _setupRole(DEFAULT_ADMIN_ROLE, owner);
    grantRole(MANAGER_HARIBO, owner);
  }

  // 소유주 확인
  function getOwner() view external returns(address) {
    return owner;
  }

  // 소유주 설정
  function setOwner(address _addr) onlyRole(DEFAULT_ADMIN_ROLE) external {
    _revokeRole(DEFAULT_ADMIN_ROLE, owner);
    owner = _addr;
    setAdminRole();
    emit EventChangeOwner(_addr);
  }

  // liveFee 확인
  function getLiveFee()  view external returns(uint32) {
    return liveFee;
  }

  // liveFee 설정
  function setLiveFee(uint32 _fee) isManager external {
    liveFee = _fee;
  }

  // hpFee 확인
  function getHpFeePer()  view external returns(uint32) {
    return hpFeePer;
  }

  // hpFee 설정
  function setHpFeePer(uint32 _fee) isManager external {
    hpFeePer = _fee;
  }

  // hungryFeePer 확인
  function getHungryFeePer()  view external returns(uint32) {
    return hungryFeePer;
  }

  // hungryFeePer 설정
  function setHungryFeePer(uint32 _fee) isManager external {
    hungryFeePer = _fee;
  }

  // thirstFeePer 확인
  function getThirstFeePer()  view external returns(uint32) {
    return thirstFeePer;
  }

  // thirstFeePer 설정
  function setThirstFeePer(uint32 _fee) isManager external {
    thirstFeePer = _fee;
  }

  // 현재 토큰Id 가져오기
  function getTokenId() view private returns(uint256) {
    return tokenId;
  }

  // 토큰Id 증가시키기
  function increaseTokenId() private {
    tokenId++;
  }
  
  // 발행하면서 계정에 아바타 생성
  function mint(string memory _nickname) external returns(uint256) {
    require(msg.sender != address(0), "address is a zero address");
    require(balanceOf(msg.sender) == 0, "this address already exist avatar");
    uint256 newTokenId = getTokenId();
    uint256 timeNow = block.timestamp;
    increaseTokenId();
    _safeMint(msg.sender, newTokenId);

    Avatar memory a = Avatar({
      tokenId: newTokenId,
      nickname: _nickname,
      hp: defaultHp,
      hungry: defaultHungry,
      thirst: defaultThirst,
      level: defaultLevel,
      battle_hp: defaultBattleHp,
      battle_att: defaultBattleAtt,
      battle_def: defaultBattleDef,
      battle_cri_per: defaultBattleCriPer,
      battle_cri_att_increase: defaultBattleCriAttIncrease,
      exp: 0,
      fill_hungry_time: timeNow,
      fill_thirst_time: timeNow,
      battle_win_count: 0,
      battle_lose_count: 0,
      is_dead: false
    });
    avatars[msg.sender] = a;
    erc20.approveForce(owner, address(this), 100);
    bool result = erc20.transferFrom(owner, msg.sender, 100);
    require(result, "transfer token failed");

    emit EventMint(msg.sender, newTokenId);
    return newTokenId;
  }

  // 아바타 삭제하기
  function burn() external returns(bool) {
    require(msg.sender != address(0), "address is a zero address");
    require(balanceOf(msg.sender) > 0, "this address does not exist avatar");
    Avatar memory _avatar = avatars[msg.sender];
    _burn(avatars[msg.sender].tokenId);
    delete avatars[msg.sender];

    emit EventBurn(msg.sender, _avatar);
  }

  // 계정의 아바타 받아오기
  function getAvatar(address _addr) public view returns (Avatar memory _avatar) {
    require(balanceOf(_addr) > 0, "this address does not exist.");
    return avatars[_addr];
  }

  // --------------- 상태 ---------------- //
  // 체력 감소
  function decreaseHp(address[] memory _addr, uint8[] memory _decrease) isManager external returns (uint8[] memory) {
    
    uint8[] memory _hp = new uint8[](_addr.length);
    for(uint256 i = 0; i < _addr.length; i++) {
      if(balanceOf(_addr[i]) > 0 && !avatars[_addr[i]].is_dead) {
        // 체력 감소
        avatars[_addr[i]].hp -= _decrease[i];
        // 체력이 0 이하면 사망
        if(avatars[_addr[i]].hp <= 0) {
          deadAvatar(_addr[i]);
        }
        _hp[i] = avatars[_addr[i]].hp;
      }
    }
    emit EventDecreaseHp(_addr, _decrease);
    return _hp;
  }

  // 배고픔 감소
  function decreaseHungry(address[] memory _addr, uint8[] memory _decrease) isManager external returns (uint8[] memory) {
    uint8[] memory _hungry = new uint8[](_addr.length);
    for(uint256 i = 0; i < _addr.length; i++) {
      if(balanceOf(_addr[i]) > 0 && !avatars[_addr[i]].is_dead) {
        avatars[_addr[i]].hungry -= _decrease[i];
        _hungry[i] = avatars[_addr[i]].hungry;
      }
    }
    emit EventDecreaseHungry(_addr, _decrease);
    return _hungry;
  }

  // 갈증 감소
  function decreaseThirst(address[] memory _addr, uint8[] memory _decrease) isManager external returns (uint8[] memory) {
    uint8[] memory _thirst = new uint8[](_addr.length);
    for(uint256 i = 0; i < _addr.length; i++) {
      if(balanceOf(_addr[i]) > 0 && !avatars[_addr[i]].is_dead) {
        avatars[_addr[i]].thirst -= _decrease[i];
        _thirst[i] = avatars[_addr[i]].thirst;
      }
    }
    emit EventDecreaseThirst(_addr, _decrease);
    return _thirst;
  }

  // 체력 충전
  function increaseHp() activity external {
    require(avatars[msg.sender].hp < defaultHp, "hp is full");
    uint8 toFill = defaultHp - avatars[msg.sender].hp;
    uint32 fillFee = toFill * hpFeePer / 100;

    require(erc20.balanceOf(msg.sender) >= fillFee, "not enough fee");

    erc20.approveForce(msg.sender, address(this), fillFee);
    bool result = erc20.transferFrom(msg.sender, owner, fillFee);
    require(result, "transfer token failed");
    avatars[msg.sender].hp += toFill;
    emit EventIncreaseHp(msg.sender, toFill, fillFee);
  }

  // 배고픔 충전
  function increaseHungry() activity external {
    require(avatars[msg.sender].hungry < defaultHungry, "hungry is full");
    uint8 toFill = defaultHungry - avatars[msg.sender].hungry;
    uint32 fillFee = toFill * hungryFeePer / 100;

    require(erc20.balanceOf(msg.sender) >= fillFee, "not enough fee");
    
    erc20.approveForce(msg.sender, address(this), fillFee);
    bool result = erc20.transferFrom(msg.sender, owner, fillFee);
    require(result, "transfer token failed");
    avatars[msg.sender].hungry += toFill;
    emit EventIncreaseHungry(msg.sender, toFill, fillFee);
  }

   // 갈증 충전
  function increaseThirst() activity external {
    require(avatars[msg.sender].thirst < defaultThirst, "thirst is full");
    uint8 toFill = defaultThirst - avatars[msg.sender].thirst;
    uint32 fillFee = toFill * thirstFeePer / 100;
    require(erc20.balanceOf(msg.sender) >= fillFee, "not enough fee");

    erc20.approveForce(msg.sender, address(this), fillFee);
    bool result = erc20.transferFrom(msg.sender, owner, fillFee);
    require(result, "transfer token failed");
    avatars[msg.sender].thirst += toFill;
    emit EventIncreaseThirst(msg.sender, toFill, fillFee);
  }

  // 아바타 사망
  function deadAvatar(address _addr) private {
    avatars[_addr].is_dead = true;
    emit DeadAvatar(_addr);
  }

  // 아바타 부활
  function liveAvatar() external returns(Avatar memory) {
    require(balanceOf(msg.sender) > 0, "this address does not exist.");
    require(avatars[msg.sender].is_dead, "avatar not dead");
    require(erc20.balanceOf(msg.sender) > liveFee, "not enough fee");

    erc20.approveForce(msg.sender, address(this), liveFee);
    bool result = erc20.transferFrom(msg.sender, owner, liveFee);
    require(result, "transfer token failed");

    avatars[msg.sender].is_dead = false;

    // 부활시 레벨이 1 깍이고 스텟중 랜덤으로 1 lv이 깍인다.
    if(avatars[msg.sender].level > 1) {
      avatars[msg.sender].level--;
      avatars[msg.sender].exp = 0;

      uint8 random = uint8(block.timestamp % 5);
      if(random == 0) {
        avatars[msg.sender].battle_hp -= 10;
      } else if( random == 1) {
        avatars[msg.sender].battle_att -= 2;
      } else if( random == 2) {
        avatars[msg.sender].battle_def -= 1;
      } else if( random == 3) {
        avatars[msg.sender].battle_cri_per -= 2;
      } else if( random == 4) {
        avatars[msg.sender].battle_cri_att_increase -= 50;
      }
      emit LiveAvatar(msg.sender, true, random);
    } else {
      emit LiveAvatar(msg.sender, false, 0);
    }

    return avatars[msg.sender];
  }

  // --------------- 전투 ---------------- //
  function battleWin(address _winner, address _loser) external {

    emit BattleResult(_winner, _loser);
  }

  // --------------- 토큰 ---------------- //
  function sendERC20Token(address _to, uint256 _price) isManager public {
    bool result = erc20.transferFrom(owner, _to, _price);
    require(result, "transfer token failed");
  }

  function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721EnumerableUpgradeable, AccessControlUpgradeable) returns (bool) {
    return interfaceId == type(IERC721EnumerableUpgradeable).interfaceId || super.supportsInterface(interfaceId);
  }
}