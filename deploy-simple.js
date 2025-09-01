import { ethers } from "ethers";
import fs from "fs";

async function main() {
    // Use the mnemonic directly
    const mnemonic = "pool grab screen stick subject use issue retire live merry universe sing";
    
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    const wallet = ethers.Wallet.fromPhrase(mnemonic).connect(provider);
    
    console.log("Deploying contracts with the account:", wallet.address);
    console.log("Account balance:", ethers.formatEther(await wallet.provider.getBalance(wallet.address)));

    // Read and compile contract
    const contractSource = fs.readFileSync('./contracts/ConfidentialFundPad.sol', 'utf8');
    console.log("Contract source loaded");

    // For now, let's just print the address that will deploy
    console.log("Deployment address:", wallet.address);
    
    // Return the wallet address for frontend integration
    return {
        deployerAddress: wallet.address,
        network: "sepolia"
    };
}

main()
    .then((result) => {
        console.log("Deployment info:", result);
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });