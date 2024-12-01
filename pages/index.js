import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  // State variables
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [owner, setOwner] = useState(undefined); // State to store owner address
  const [isLoading, setIsLoading] = useState(false); // Loading state for transactions
  const [depositAmount, setDepositAmount] = useState(""); // State for deposit amount
  const [withdrawAmount, setWithdrawAmount] = useState(""); // State for withdraw amount

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
  const atmABI = atm_abi.abi;

  // Check if Ethereum wallet is available
  const getWallet = async () => {
    try {
      if (window.ethereum) {
        setEthWallet(window.ethereum);
      } else {
        console.log("MetaMask not detected");
      }

      if (ethWallet) {
        const accounts = await ethWallet.request({ method: "eth_accounts" });
        handleAccount(accounts);
      }
    } catch (error) {
      console.error("Error initializing wallet:", error);
    }
  };

  // Handle connected account
  const handleAccount = (accounts) => {
    if (accounts && accounts.length > 0) {
      console.log("Account connected: ", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  // Connect user's MetaMask wallet
  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    try {
      const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
      handleAccount(accounts);

      // Initialize contract after wallet connection
      getATMContract();
    } catch (error) {
      console.error("Error connecting to account:", error);
    }
  };

  // Get a reference to the deployed contract
  const getATMContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

      // Retrieve contract owner and save to state
      const contractOwner = await atmContract.owner();
      console.log("Contract Owner:", contractOwner);
      setOwner(contractOwner);

      setATM(atmContract);
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  // Get the current contract balance
  const getBalance = async () => {
    try {
      if (atm) {
        const currentBalance = await atm.getBalance();
        // Convert from wei to ether for display
        setBalance(ethers.utils.formatUnits(currentBalance, "ether"));
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  // Deposit amount (owner-only action)
  const deposit = async () => {
    try {
      setIsLoading(true);
      if (atm && depositAmount > 0) {
        // Convert deposit amount from ETH to wei
        const amountInWei = ethers.utils.parseUnits(depositAmount, "ether");
        const tx = await atm.deposit(amountInWei);
        await tx.wait();
        getBalance(); // Refresh balance after transaction
      } else {
        alert("Please enter a valid deposit amount.");
      }
    } catch (error) {
      console.error("Error during deposit:", error);
      alert("Deposit failed. Ensure you are the contract owner.");
    } finally {
      setIsLoading(false);
    }
  };

  // Withdraw amount (owner-only action)
  const withdraw = async () => {
    try {
      setIsLoading(true);
      if (atm && withdrawAmount > 0) {
        // Convert withdraw amount from ETH to wei
        const amountInWei = ethers.utils.parseUnits(withdrawAmount, "ether");
        const tx = await atm.withdraw(amountInWei);
        await tx.wait();
        getBalance(); // Refresh balance after transaction
      } else {
        alert("Please enter a valid withdrawal amount.");
      }
    } catch (error) {
      console.error("Error during withdrawal:", error);
      alert("Withdrawal failed. Ensure you are the contract owner.");
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize UI elements based on user connection state
  const initUser = () => {
    // If MetaMask is not installed
    if (!ethWallet) {
      return <p>Please install MetaMask to use this ATM.</p>;
    }

    // If account is not connected
    if (!account) {
      return <button className="button" onClick={connectAccount}>Connect MetaMask Wallet</button>;
    }

    // Fetch balance if not already set
    if (balance === undefined) {
      getBalance();
    }

    return (
      <div className="atm-info">
        <p>Your Account: {account}</p>
        <p>Contract Owner: {owner || "Loading..."}</p>
        <p>Your Balance: {balance !== undefined ? `${balance} ETH` : "Loading..."}</p>

        {/* Deposit Amount Input */}
        <div className="input-container">
          <label htmlFor="depositAmount">Deposit Amount (ETH): </label>
          <input
            type="number"
            id="depositAmount"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <button className="button" onClick={deposit} disabled={isLoading}>
            {isLoading ? "Depositing..." : "Deposit"}
          </button>
        </div>

        {/* Withdraw Amount Input */}
        <div className="input-container">
          <label htmlFor="withdrawAmount">Withdraw Amount (ETH): </label>
          <input
            type="number"
            id="withdrawAmount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            placeholder="Enter amount"
          />
          <button className="button" onClick={withdraw} disabled={isLoading}>
            {isLoading ? "Withdrawing..." : "Withdraw"}
          </button>
        </div>
      </div>
    );
  };

  // Fetch wallet on initial render
  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
          background: linear-gradient(145deg, #6a11cb, #2575fc);
          color: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        header h1 {
          font-size: 36px;
          margin-bottom: 20px;
        }
        .atm-info {
          background: #f9f9f9;
          color: #333;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .input-container {
          margin: 15px 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        input {
          padding: 10px;
          font-size: 16px;
          border: 2px solid #ddd;
          border-radius: 5px;
          margin-left: 10px;
          width: 200px;
        }
        button {
          padding: 10px 20px;
          background-color: #2575fc;
          border: none;
          border-radius: 5px;
          color: white;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.3s ease;
          margin-left: 10px;
        }
        button:hover {
          background-color: #1a5db9;
        }
        button:disabled {
          background-color: #b0b0b0;
        }
      `}</style>
    </main>
  );
}
