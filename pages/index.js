import { useState, useEffect } from "react";
import { ethers } from "ethers";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipientBalance, setRecipientBalance] = useState(undefined); // New state for recipient's balance

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }
    
    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };
  
  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Connected account: ", accounts[0]);
      setAccount(accounts[0]);
      getBalance(); // Fetch the balance immediately after setting the account
    } else {
      console.log("No accounts found");
    }
  };
  
  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }
    
    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts); // This will now also fetch the balance
  };
  
  const getBalance = async () => {
    if (ethWallet && account) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const balance = await provider.getBalance(account);
      setBalance(ethers.utils.formatEther(balance)); // Converts balance to ETH
    }
  };
  
  const transferEther = async () => {
    if (ethWallet && account) {
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount to transfer.");
        return;
      }
      
      if (!ethers.utils.isAddress(recipient)) {
        alert("Please enter a valid recipient address.");
        return;
      }
      
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      
      const balance = await provider.getBalance(account);
      const gasPrice = await provider.getGasPrice();
      const estimatedGas = await provider.estimateGas({
        to: recipient,
        value: ethers.utils.parseEther(transferAmount),
      });
      
      if (balance.lt(ethers.utils.parseEther(transferAmount).add(estimatedGas.mul(gasPrice)))) {
        alert("Insufficient balance for the transfer.");
        return;
      }
      
      try {
        const tx = await signer.sendTransaction({
          to: recipient,
          value: ethers.utils.parseEther(transferAmount),
        });
        await tx.wait();
        alert(`Successfully transferred ${transferAmount} ETH to ${recipient}`);
        setTransferAmount("");
        getBalance(); // Refresh balance after the transfer
      } catch (error) {
        console.error("Transfer failed:", error);
        alert("Transfer failed. Please check the transaction details.");
      }
    }
  };
  
  const getRecipientBalance = async () => {
    if (!ethers.utils.isAddress(recipient)) {
      alert("Please enter a valid recipient address.");
      return;
    }
    
    const provider = new ethers.providers.Web3Provider(ethWallet);
    try {
      const balance = await provider.getBalance(recipient);
      setRecipientBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Failed to fetch recipient balance:", error);
      alert("Could not retrieve recipient's balance.");
    }
  };
  
  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }
    
    if (!account) {
      return <button onClick={connectAccount}>Connect MetaMask Wallet</button>;
    }
    
    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance} ETH</p>
        <div>
          <input
            type="text"
            placeholder="Enter recipient address"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            />
          <input
            type="number"
            placeholder="Enter amount to transfer"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            />
          <button onClick={transferEther}>Transfer ETH</button>
        </div>
        <div>
          <button onClick={getRecipientBalance}>Check Recipient Balance</button>
          {recipientBalance !== undefined && (
            <p>Recipient's Balance: {recipientBalance} ETH</p>
          )}
        </div>
      </div>
    );
  };
  useEffect(() => {
    getWallet();
  }, []);
  
  useEffect(() => {
    if (account) {
      getBalance(); // Automatically fetch balance when account changes
    }
  }, [account]);

  console.log(contractAddress);
  
  return (
    <main className="container">
      <header>
        <h1>Welcome to the MetaMask Ether Transfer!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          }
          input {
            margin-right: 10px;
            padding: 5px;
            }
            `}</style>
    </main>
  );
  
}


