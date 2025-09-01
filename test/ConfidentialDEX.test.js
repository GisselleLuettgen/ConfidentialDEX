const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("ConfidentialDEX", function () {
  async function deployConfidentialDEXFixture() {
    const [owner, trader1, trader2] = await ethers.getSigners();

    // Deploy mock ERC20 tokens
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const usdt = await MockERC20.deploy("Tether USD", "USDT", 6, ethers.parseUnits("1000000", 6));
    const usdc = await MockERC20.deploy("USD Coin", "USDC", 6, ethers.parseUnits("1000000", 6));

    // Deploy ConfidentialDEX
    const ConfidentialDEX = await ethers.getContractFactory("ConfidentialDEX");
    const dex = await ConfidentialDEX.deploy();

    return { dex, usdt, usdc, owner, trader1, trader2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { dex, owner } = await loadFixture(deployConfidentialDEXFixture);
      expect(await dex.owner()).to.equal(owner.address);
    });

    it("Should initialize with ETH as supported token", async function () {
      const { dex } = await loadFixture(deployConfidentialDEXFixture);
      expect(await dex.supportedTokens(ethers.ZeroAddress)).to.be.true;
    });

    it("Should have zero orders initially", async function () {
      const { dex } = await loadFixture(deployConfidentialDEXFixture);
      expect(await dex.totalOrders()).to.equal(0);
    });
  });

  describe("Token Management", function () {
    it("Should allow owner to add supported tokens", async function () {
      const { dex, usdt, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await expect(dex.connect(owner).addSupportedToken(usdt.target))
        .not.to.be.reverted;
      
      expect(await dex.supportedTokens(usdt.target)).to.be.true;
    });

    it("Should not allow non-owner to add supported tokens", async function () {
      const { dex, usdt, trader1 } = await loadFixture(deployConfidentialDEXFixture);
      
      await expect(
        dex.connect(trader1).addSupportedToken(usdt.target)
      ).to.be.revertedWithCustomError(dex, "OwnableUnauthorizedAccount");
    });

    it("Should not allow adding same token twice", async function () {
      const { dex, usdt, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await dex.connect(owner).addSupportedToken(usdt.target);
      
      await expect(
        dex.connect(owner).addSupportedToken(usdt.target)
      ).to.be.revertedWith("Token already supported");
    });

    it("Should return supported tokens list", async function () {
      const { dex, usdt, usdc, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await dex.connect(owner).addSupportedToken(usdt.target);
      await dex.connect(owner).addSupportedToken(usdc.target);
      
      const supportedTokens = await dex.getSupportedTokens();
      expect(supportedTokens.length).to.equal(3); // ETH + USDT + USDC
      expect(supportedTokens[0]).to.equal(ethers.ZeroAddress); // ETH
    });
  });

  describe("Trading Pair Management", function () {
    it("Should allow owner to create trading pairs", async function () {
      const { dex, usdt, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await dex.connect(owner).addSupportedToken(usdt.target);
      
      await expect(
        dex.connect(owner).createTradingPair(ethers.ZeroAddress, usdt.target)
      ).to.emit(dex, "PairCreated");
    });

    it("Should not allow creating pair with same tokens", async function () {
      const { dex, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await expect(
        dex.connect(owner).createTradingPair(ethers.ZeroAddress, ethers.ZeroAddress)
      ).to.be.revertedWith("Tokens must be different");
    });

    it("Should not allow creating pair with unsupported tokens", async function () {
      const { dex, usdt, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await expect(
        dex.connect(owner).createTradingPair(ethers.ZeroAddress, usdt.target)
      ).to.be.revertedWith("Unsupported tokens");
    });

    it("Should not allow creating duplicate pairs", async function () {
      const { dex, usdt, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await dex.connect(owner).addSupportedToken(usdt.target);
      await dex.connect(owner).createTradingPair(ethers.ZeroAddress, usdt.target);
      
      await expect(
        dex.connect(owner).createTradingPair(ethers.ZeroAddress, usdt.target)
      ).to.be.revertedWith("Pair already exists");
    });

    it("Should return all trading pairs", async function () {
      const { dex, usdt, usdc, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await dex.connect(owner).addSupportedToken(usdt.target);
      await dex.connect(owner).addSupportedToken(usdc.target);
      
      await dex.connect(owner).createTradingPair(ethers.ZeroAddress, usdt.target);
      await dex.connect(owner).createTradingPair(ethers.ZeroAddress, usdc.target);
      
      const pairs = await dex.getAllTradingPairs();
      expect(pairs.length).to.equal(2);
    });
  });

  describe("Order Management", function () {
    it("Should return user orders", async function () {
      const { dex, trader1 } = await loadFixture(deployConfidentialDEXFixture);
      
      const userOrders = await dex.getUserOrders(trader1.address);
      expect(userOrders.length).to.equal(0);
    });

    it("Should return order details", async function () {
      const { dex } = await loadFixture(deployConfidentialDEXFixture);
      
      const order = await dex.getOrder(1);
      expect(order.id).to.equal(0);
      expect(order.isActive).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle non-existent trading pair queries", async function () {
      const { dex } = await loadFixture(deployConfidentialDEXFixture);
      
      const nonExistentPairId = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      const pair = await dex.getTradingPair(nonExistentPairId);
      expect(pair.isActive).to.be.false;
    });

    it("Should return empty orders for new user", async function () {
      const { dex, trader1 } = await loadFixture(deployConfidentialDEXFixture);
      
      const userOrders = await dex.getUserOrders(trader1.address);
      expect(userOrders).to.be.an('array').that.is.empty;
    });
  });

  describe("Events", function () {
    it("Should emit PairCreated event", async function () {
      const { dex, usdt, owner } = await loadFixture(deployConfidentialDEXFixture);
      
      await dex.connect(owner).addSupportedToken(usdt.target);
      
      await expect(
        dex.connect(owner).createTradingPair(ethers.ZeroAddress, usdt.target)
      ).to.emit(dex, "PairCreated")
       .withArgs(ethers.ZeroAddress, usdt.target, anyValue);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to add supported tokens", async function () {
      const { dex, usdt, trader1 } = await loadFixture(deployConfidentialDEXFixture);
      
      await expect(
        dex.connect(trader1).addSupportedToken(usdt.target)
      ).to.be.revertedWithCustomError(dex, "OwnableUnauthorizedAccount");
    });

    it("Should only allow owner to create trading pairs", async function () {
      const { dex, usdt, trader1 } = await loadFixture(deployConfidentialDEXFixture);
      
      await expect(
        dex.connect(trader1).createTradingPair(ethers.ZeroAddress, usdt.target)
      ).to.be.revertedWithCustomError(dex, "OwnableUnauthorizedAccount");
    });
  });
});

// Helper function for any value matching
function anyValue() {
  return true;
}