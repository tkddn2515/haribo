const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Haribo", function () {

  console.log(Math.floor(new Date().getTime() / 1000));

  let owner, addr1, addr2, addr3;

  let ERC20;
  let erc20;

  let HARIBO;
  let haribo;

  this.beforeEach(async function() {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    ERC20 = await ethers.getContractFactory("HariboToken");
    erc20 = await ERC20.deploy();
    HARIBO = await ethers.getContractFactory("Haribo");
    haribo = await upgrades.deployProxy(HARIBO, [erc20.address]);

    console.log('erc20 address is ', erc20.address);
    console.log('haribo address is ', haribo.address);
  });

  it("Decrease State", async ()=> {
    
    // owner의 돈을 haribo가 100만큼 옮길 수 있게 승인
    let approve = await erc20.connect(owner).approve(haribo.address, 100);
    // approve = await erc20.connect(addr1).approve(owner.address, 100);
    // approve = await erc20.connect(owner).approve(addr1.address, 100);
    // allowance = await erc20.allowance(addr1.address, owner.address);

    // addr1이 아바타를 하나 발행하고 배고픔 10 감소
    console.log("addr1이 아바타를 하나 발행하고 배고픔 10 감소");
    await haribo.connect(addr1).mint();
    let getAvatar = await haribo.getAvatar(addr1.address);
    await haribo.decreaseHungry([addr1.address], [10]);
    getAvatar = await haribo.getAvatar(addr1.address);
    console.log(getAvatar["hungry"]);

    // addr1 이 발행했으니 owner가 addr1한테 100을 줬는지 확인
    console.log("addr1 이 발행했으니 owner가 addr1한테 100을 줬는지 확인");
    ownerBalance = await erc20.balanceOf(owner.address);
    addr1Balance = await erc20.balanceOf(addr1.address);
    console.log("ownerBalance : " + ownerBalance);
    console.log("addr1Balance : " + addr1Balance);

    // addr1의 아바타가 배고픔이 10 감소했으니 충전
    // 배고픔 충전 비용은 감소율 * 10 / 100
    console.log("addr1의 아바타가 배고픔이 10 감소했으니 충전");
    let increaseHungry = await haribo.connect(addr1).increaseHungry();
    getAvatar = await haribo.getAvatar(addr1.address);
    console.log(getAvatar["hungry"]);
    addr1Balance = await erc20.balanceOf(addr1.address);
    console.log("addr1Balance : " + addr1Balance);
  })

});
