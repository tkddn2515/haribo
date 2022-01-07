import './App.css';
import { ethers } from "ethers";
import {HARIBO_ROPSTEN_ADDRESS, HARIBO_ABI} from './env';

// Provider 읽기 전용
// Signer 계정 이더에 요금을 청구할 수 있는 권한

function Sample() {
  let provider;
  let signer;
  let account;
  let Haribo_Contract_Signer;
  let Haribo_Contract_Provider;
  async function checkMetamask() {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!');
      
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      account = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log("account : " + account);

      Haribo_Contract_Signer = new ethers.Contract(HARIBO_ROPSTEN_ADDRESS, HARIBO_ABI, signer);
      Haribo_Contract_Provider = new ethers.Contract(HARIBO_ROPSTEN_ADDRESS, HARIBO_ABI, provider);

      Haribo_Contract_Provider.on("EventMint", (_addr, _tokenId) => {
        console.log(_addr, _tokenId);
      });
    }
  }

  window.ethereum.on('accountsChanged', function(_accounts) {
    account = _accounts[0];
    console.log("account changed : " + account);
  });

  const Mint = async () => {
    var sendTransactionPromise = await Haribo_Contract_Signer.mint();
    var txReceipt = await sendTransactionPromise.wait();
    console.log("txReceipt txHash : " + txReceipt.transactionHash);
  }

  const GetAvatar = async () => {
    console.log(account);
    console.log(account[0]);
    var GetAVatar = await Haribo_Contract_Provider.getAvatar(account[0]);
    console.log("getAvatar : " + GetAVatar);
  }

  checkMetamask();

  return (
    <div>
      <button onClick={Mint}>Mint</button>
      <button onClick={GetAvatar}>Get avatar</button>
    </div>
  );
}

export default Sample;