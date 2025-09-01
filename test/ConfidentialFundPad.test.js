const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("ConfidentialFundPad", function () {
  async function deployConfidentialFundPadFixture() {
    const [owner, creator, backer1, backer2] = await ethers.getSigners();

    const ConfidentialFundPad = await ethers.getContractFactory("ConfidentialFundPad");
    const fundPad = await ConfidentialFundPad.deploy();

    return { fundPad, owner, creator, backer1, backer2 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { fundPad, owner } = await loadFixture(deployConfidentialFundPadFixture);
      expect(await fundPad.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero projects", async function () {
      const { fundPad } = await loadFixture(deployConfidentialFundPadFixture);
      expect(await fundPad.totalProjects()).to.equal(0);
    });
  });

  describe("Project Creation", function () {
    it("Should create a project successfully", async function () {
      const { fundPad, creator } = await loadFixture(deployConfidentialFundPadFixture);
      
      const name = "Test Project";
      const description = "A test project for fundraising";
      const targetAmount = ethers.parseEther("10");
      const duration = 30 * 24 * 60 * 60; // 30 days

      await expect(
        fundPad.connect(creator).createProject(name, description, targetAmount, duration)
      ).to.emit(fundPad, "ProjectCreated");

      expect(await fundPad.totalProjects()).to.equal(1);
      
      const project = await fundPad.getProject(1);
      expect(project.name).to.equal(name);
      expect(project.description).to.equal(description);
      expect(project.targetAmount).to.equal(targetAmount);
      expect(project.creator).to.equal(creator.address);
      expect(project.isActive).to.be.true;
    });

    it("Should fail with zero target amount", async function () {
      const { fundPad, creator } = await loadFixture(deployConfidentialFundPadFixture);
      
      await expect(
        fundPad.connect(creator).createProject("Test", "Description", 0, 30 * 24 * 60 * 60)
      ).to.be.revertedWith("Target amount must be greater than 0");
    });

    it("Should fail with zero duration", async function () {
      const { fundPad, creator } = await loadFixture(deployConfidentialFundPadFixture);
      
      await expect(
        fundPad.connect(creator).createProject("Test", "Description", ethers.parseEther("10"), 0)
      ).to.be.revertedWith("Duration must be greater than 0");
    });
  });

  describe("Project Queries", function () {
    it("Should return user projects", async function () {
      const { fundPad, creator } = await loadFixture(deployConfidentialFundPadFixture);
      
      await fundPad.connect(creator).createProject(
        "Project 1", 
        "Description 1", 
        ethers.parseEther("10"), 
        30 * 24 * 60 * 60
      );
      
      await fundPad.connect(creator).createProject(
        "Project 2", 
        "Description 2", 
        ethers.parseEther("20"), 
        60 * 24 * 60 * 60
      );

      const userProjects = await fundPad.getUserProjects(creator.address);
      expect(userProjects.length).to.equal(2);
      expect(userProjects[0]).to.equal(1);
      expect(userProjects[1]).to.equal(2);
    });

    it("Should return all active projects", async function () {
      const { fundPad, creator, backer1 } = await loadFixture(deployConfidentialFundPadFixture);
      
      await fundPad.connect(creator).createProject(
        "Project 1", 
        "Description 1", 
        ethers.parseEther("10"), 
        30 * 24 * 60 * 60
      );
      
      await fundPad.connect(backer1).createProject(
        "Project 2", 
        "Description 2", 
        ethers.parseEther("20"), 
        60 * 24 * 60 * 60
      );

      const activeProjects = await fundPad.getAllActiveProjects();
      expect(activeProjects.length).to.equal(2);
    });
  });

  describe("Project Management", function () {
    it("Should allow creator to request decryption", async function () {
      const { fundPad, creator } = await loadFixture(deployConfidentialFundPadFixture);
      
      await fundPad.connect(creator).createProject(
        "Test Project", 
        "Description", 
        ethers.parseEther("10"), 
        30 * 24 * 60 * 60
      );

      // Creator should be able to request decryption at any time
      await expect(
        fundPad.connect(creator).requestDecryption(1)
      ).to.emit(fundPad, "DecryptionRequested");
    });

    it("Should not allow non-creator to request decryption before deadline", async function () {
      const { fundPad, creator, backer1 } = await loadFixture(deployConfidentialFundPadFixture);
      
      await fundPad.connect(creator).createProject(
        "Test Project", 
        "Description", 
        ethers.parseEther("10"), 
        30 * 24 * 60 * 60
      );

      await expect(
        fundPad.connect(backer1).requestDecryption(1)
      ).to.be.revertedWith("Can only decrypt after deadline or by creator");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle non-existent project queries", async function () {
      const { fundPad } = await loadFixture(deployConfidentialFundPadFixture);
      
      const project = await fundPad.getProject(999);
      expect(project.id).to.equal(0);
      expect(project.name).to.equal("");
      expect(project.isActive).to.be.false;
    });

    it("Should return empty array for user with no projects", async function () {
      const { fundPad, backer1 } = await loadFixture(deployConfidentialFundPadFixture);
      
      const userProjects = await fundPad.getUserProjects(backer1.address);
      expect(userProjects.length).to.equal(0);
    });
  });

  describe("Events", function () {
    it("Should emit ProjectCreated event", async function () {
      const { fundPad, creator } = await loadFixture(deployConfidentialFundPadFixture);
      
      const name = "Test Project";
      const targetAmount = ethers.parseEther("10");
      const duration = 30 * 24 * 60 * 60;

      await expect(
        fundPad.connect(creator).createProject(name, "Description", targetAmount, duration)
      ).to.emit(fundPad, "ProjectCreated")
       .withArgs(1, creator.address, name, targetAmount, anyValue);
    });

    it("Should emit ProjectStatusUpdated event", async function () {
      const { fundPad, creator } = await loadFixture(deployConfidentialFundPadFixture);
      
      await fundPad.connect(creator).createProject(
        "Test Project", 
        "Description", 
        ethers.parseEther("10"), 
        30 * 24 * 60 * 60
      );

      await expect(
        fundPad.connect(creator).requestDecryption(1)
      ).to.emit(fundPad, "ProjectStatusUpdated");
    });
  });
});

// Helper function for any value matching
function anyValue() {
  return true;
}