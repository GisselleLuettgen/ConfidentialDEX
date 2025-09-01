import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployModule = buildModule("DeployModule", (m) => {
  // Deploy ConfidentialFundPad
  const confidentialFundPad = m.contract("ConfidentialFundPad", []);

  // Deploy ConfidentialDEX
  const confidentialDEX = m.contract("ConfidentialDEX", []);

  // Deploy Mock ERC20 tokens for testing
  const mockUSDT = m.contract("MockERC20", [
    "Tether USD",
    "USDT", 
    6,
    m.bigint(1000000 * 10**6) // 1M USDT
  ]);

  const mockUSDC = m.contract("MockERC20", [
    "USD Coin",
    "USDC",
    6,
    m.bigint(1000000 * 10**6) // 1M USDC
  ]);

  const mockDAI = m.contract("MockERC20", [
    "Dai Stablecoin",
    "DAI",
    18,
    m.bigint("1000000000000000000000000") // 1M DAI
  ]);

  return {
    confidentialFundPad,
    confidentialDEX,
    mockUSDT,
    mockUSDC,
    mockDAI,
  };
});

export default DeployModule;