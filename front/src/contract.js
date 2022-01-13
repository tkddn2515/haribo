import { ethers } from "ethers";
import {HARIBO_ROPSTEN_ADDRESS, HARIBO_ABI} from './env';

let provider;
let signer;
let account;
export let Haribo_Contract_Signer;
export let Haribo_Contract_Provider;

async function checkMetamask() {
  if (typeof window.ethereum !== 'undefined') {
    
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    account = (await window.ethereum.request({ method: 'eth_requestAccounts' }))[0];
    Haribo_Contract_Signer = new ethers.Contract(HARIBO_ROPSTEN_ADDRESS, HARIBO_ABI, signer);
    Haribo_Contract_Provider = new ethers.Contract(HARIBO_ROPSTEN_ADDRESS, HARIBO_ABI, provider);
  }
}

window.ethereum.on('accountsChanged', function(_accounts) {
  account = _accounts[0];
  console.log("account changed : " + account);
});

checkMetamask();

export const mint = (wallet, nickname, success, fail) => {
  action(wallet, async () => {
    await Haribo_Contract_Signer.mint(nickname)
      .then((res) => {
        console.log("insertAvatar res : ");
        console.log(res);
        success(res);
      })
      .catch((error)=>{
        fail(error);
      })
  });
}

export const burn = (wallet) => {
  action(wallet, async () => {
    await Haribo_Contract_Signer.burn()
      .then(res => {
        console.log("burn res : ");
        console.log(res);
      })
      .catch(error => {
        console.log("burn error : ");
        console.log(error);
      })
    
  })
}

export const getAvatar = (wallet, func) => {
  action(wallet, async () => {
    await Haribo_Contract_Provider.getAvatar(wallet)
    .then(res => {
      func(res);
    })
    .catch(error => {
      console.log("getAvatar error : ");
        console.log(error);
    })
  })
}

const action = (wallet, func) => {
  if (!typeof window.ethereum) {
    console.log('metamask not install!');
    return;
  }
  if(wallet !== account) {
    console.log('wallet', wallet);
    console.log('account', account);
    console.log('account is changed!')
    return;
  }
  func();
}