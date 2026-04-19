// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {AgntMarketplace} from "../src/AgntMarketplace.sol";

contract AgntMarketplaceTest is Test {
    AgntMarketplace mkt;
    address client = address(0xC1);
    address agentOwner = address(0xA1);

    function setUp() public {
        mkt = new AgntMarketplace();
        vm.deal(client, 100 ether);
        vm.deal(agentOwner, 1 ether);
    }

    function test_HappyPath() public {
        uint256 budget = 10 ether;

        // Post job with native OG escrow
        vm.prank(client);
        uint256 jobId = mkt.postJob{value: budget}("base-token-scanner", "Scan BRETT");
        assertEq(jobId, 1);
        assertEq(address(mkt).balance, budget);

        // Accept
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);

        // Complete
        bytes32 deliverable = keccak256("deliverable blob");
        vm.prank(agentOwner);
        mkt.completeJob(jobId, deliverable);

        uint256 ownerBalBefore = agentOwner.balance;

        // Approve
        bytes32 repBlob = keccak256("reputation blob");
        vm.prank(client);
        mkt.approveJob(jobId, 5, repBlob);

        // Funds released to agent owner
        assertEq(agentOwner.balance, ownerBalBefore + budget);
        assertEq(address(mkt).balance, 0);

        // Reputation
        (uint64 hires, uint64 ratingSum,, bytes32 blob, uint16 avgE2) = mkt.getAgentReputation("base-token-scanner");
        assertEq(hires, 1);
        assertEq(ratingSum, 5);
        assertEq(blob, repBlob);
        assertEq(avgE2, 500); // 5.00
    }

    function test_Cancel_Refunds() public {
        uint256 budget = 5 ether;
        vm.prank(client);
        uint256 jobId = mkt.postJob{value: budget}("x", "y");
        uint256 balBefore = client.balance;
        vm.prank(client);
        mkt.cancelJob(jobId);
        assertEq(client.balance, balBefore + budget);
    }

    function test_AgentOwnership_LocksOnFirstAccept() public {
        uint256 budget = 1 ether;
        vm.prank(client);
        uint256 job1 = mkt.postJob{value: budget}("same-slug", "");
        vm.prank(agentOwner);
        mkt.acceptJob(job1);

        address stranger = address(0xBAD);
        vm.prank(client);
        uint256 job2 = mkt.postJob{value: budget}("same-slug", "");
        vm.expectRevert("Agent owned by someone else");
        vm.prank(stranger);
        mkt.acceptJob(job2);
    }

    function testRevert_ApproveBeforeComplete() public {
        uint256 budget = 1 ether;
        vm.prank(client);
        uint256 jobId = mkt.postJob{value: budget}("x", "");
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);
        vm.expectRevert("Wrong status");
        vm.prank(client);
        mkt.approveJob(jobId, 5, bytes32(0));
    }

    function testRevert_BadRating() public {
        uint256 budget = 1 ether;
        vm.prank(client);
        uint256 jobId = mkt.postJob{value: budget}("x", "");
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);
        vm.prank(agentOwner);
        mkt.completeJob(jobId, keccak256("d"));
        vm.expectRevert("Bad rating");
        vm.prank(client);
        mkt.approveJob(jobId, 0, bytes32(0));
    }

    function test_Dispute_LocksFunds() public {
        uint256 budget = 1 ether;
        vm.prank(client);
        uint256 jobId = mkt.postJob{value: budget}("x", "");
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);
        vm.prank(agentOwner);
        mkt.completeJob(jobId, keccak256("d"));
        vm.prank(client);
        mkt.disputeJob(jobId);
        AgntMarketplace.Job memory j = mkt.getJob(jobId);
        assertEq(uint256(j.status), uint256(AgntMarketplace.JobStatus.Disputed));
        assertEq(address(mkt).balance, budget);
    }

    function testRevert_ZeroBudget() public {
        vm.expectRevert("Budget must be > 0");
        vm.prank(client);
        mkt.postJob("x", "");
    }

    function test_RegisterAgent() public {
        vm.prank(agentOwner);
        uint256 id = mkt.registerAgent("my-bot", "My Bot", "I scan tokens", "defi");
        assertEq(id, 1);
        assertEq(mkt.agentCount(), 1);
        assertEq(mkt.agentOwnerOf("my-bot"), agentOwner);
        assertEq(mkt.agentIdBySlug("my-bot"), 1);
        AgntMarketplace.AgentProfile memory p = mkt.getAgent(1);
        assertEq(p.owner, agentOwner);
        assertEq(keccak256(bytes(p.slug)), keccak256(bytes("my-bot")));
    }

    function testRevert_DuplicateSlug() public {
        vm.prank(agentOwner);
        mkt.registerAgent("same", "A", "", "");
        vm.expectRevert("Slug taken");
        vm.prank(client);
        mkt.registerAgent("same", "B", "", "");
    }

    function test_RegisterMintsNFT() public {
        vm.prank(agentOwner);
        uint256 id = mkt.registerAgent("nft-bot", "NFT Bot", "mints stuff", "nft");
        assertEq(mkt.ownerOf(id), agentOwner);
        assertEq(mkt.balanceOf(agentOwner), 1);
    }

    function test_TransferNFTUpdatesOwnership() public {
        vm.prank(agentOwner);
        uint256 id = mkt.registerAgent("transfer-bot", "Transfer Bot", "", "");
        assertEq(mkt.agentOwnerOf("transfer-bot"), agentOwner);

        address newOwner = address(0xBEEF);
        vm.prank(agentOwner);
        mkt.transferFrom(agentOwner, newOwner, id);

        assertEq(mkt.ownerOf(id), newOwner);
        assertEq(mkt.agentOwnerOf("transfer-bot"), newOwner);
    }

    function test_OnlyNFTOwnerCanAcceptAfterTransfer() public {
        vm.prank(agentOwner);
        mkt.registerAgent("owned-bot", "Owned Bot", "", "defi");

        address newOwner = address(0xBEEF);
        vm.deal(newOwner, 10 ether);
        vm.prank(agentOwner);
        mkt.transferFrom(agentOwner, newOwner, 1);

        vm.prank(client);
        uint256 jobId = mkt.postJob{value: 1 ether}("owned-bot", "test");

        vm.expectRevert("Agent owned by someone else");
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);

        vm.prank(newOwner);
        mkt.acceptJob(jobId);
    }

    function test_RegisterThenHire() public {
        vm.prank(agentOwner);
        mkt.registerAgent("scanner", "Scanner Bot", "Scans tokens", "defi");

        vm.prank(client);
        uint256 jobId = mkt.postJob{value: 1 ether}("scanner", "scan BRETT");

        vm.prank(agentOwner);
        mkt.acceptJob(jobId);

        vm.prank(agentOwner);
        mkt.completeJob(jobId, keccak256("result"));

        vm.prank(client);
        mkt.approveJob(jobId, 5, bytes32(0));

        assertEq(mkt.agentOwnerOf("scanner"), agentOwner);
        (uint64 hires,,,,) = mkt.getAgentReputation("scanner");
        assertEq(hires, 1);
    }
}
