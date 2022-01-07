// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HariboToken is ERC20 {

  uint256 e18 = 1000000000000000000;

  address private owner;

  constructor() ERC20("Haribo Token", "Haribo") {
    _mint(msg.sender, e18 * 1000000000);
  }

  modifier onlyOnwer {
    require(msg.sender == owner, "you are not owner");
    _;
  }

  function mintToAddr(uint256 _eth) onlyOnwer public
  {
      _mint(msg.sender, _eth * e18);
  }
} 