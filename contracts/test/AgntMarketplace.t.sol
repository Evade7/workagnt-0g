// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {AgntMarketplace} from "../src/AgntMarketplace.sol";
import {AgntTestToken} from "../src/AgntTestToken.sol";

contract AgntMarketplaceTest is Test {
    AgntMarketplace mkt;
    AgntTestToken token;
    address client = address(0xC1);
    address agentOwner = address(0xA1);

    function setUp() public {
        mkt = new AgntMarketplace();
        token = new AgntTestToken();
        deal(address(token), client, 1_000 ether);
    }

    function test_HappyPath() public {
        uint256 budget = 100 ether;

        // Post job
        vm.startPrank(client);
        token.approve(address(mkt), budget);
        uint256 jobId = mkt.postJob("base-token-scanner", "Scan BRETT", token, budget);
        vm.stopPrank();
        assertEq(jobId, 1);
        assertEq(token.balanceOf(address(mkt)), budget);

        // Accept
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);

        // Complete
        bytes32 deliverable = keccak256("deliverable blob");
        vm.prank(agentOwner);
        mkt.completeJob(jobId, deliverable);

        // Approve
        bytes32 repBlob = keccak256("reputation blob");
        vm.prank(client);
        mkt.approveJob(jobId, 5, repBlob);

        // Funds released
        assertEq(token.balanceOf(agentOwner), budget);
        assertEq(token.balanceOf(address(mkt)), 0);

        // Reputation
        (uint64 hires, uint64 ratingSum,, bytes32 blob, uint16 avgE2) = mkt.getAgentReputation("base-token-scanner");
        assertEq(hires, 1);
        assertEq(ratingSum, 5);
        assertEq(blob, repBlob);
        assertEq(avgE2, 500); // 5.00
    }

    function test_Cancel_Refunds() public {
        uint256 budget = 50 ether;
        vm.startPrank(client);
        token.approve(address(mkt), budget);
        uint256 jobId = mkt.postJob("x", "y", token, budget);
        uint256 balBefore = token.balanceOf(client);
        mkt.cancelJob(jobId);
        vm.stopPrank();
        assertEq(token.balanceOf(client), balBefore + budget);
    }

    function test_AgentOwnership_LocksOnFirstAccept() public {
        uint256 budget = 10 ether;
        vm.startPrank(client);
        token.approve(address(mkt), budget);
        uint256 job1 = mkt.postJob("same-slug", "", token, budget);
        vm.stopPrank();
        vm.prank(agentOwner);
        mkt.acceptJob(job1);

        // Someone else tries to claim same agent slug
        address stranger = address(0xBAD);
        vm.startPrank(client);
        token.approve(address(mkt), budget);
        // fund stranger to attempt
        vm.stopPrank();
        vm.prank(client);
        token.approve(address(mkt), budget);
        vm.prank(client);
        uint256 job2 = mkt.postJob("same-slug", "", token, budget);
        vm.expectRevert("Agent owned by someone else");
        vm.prank(stranger);
        mkt.acceptJob(job2);
    }

    function testRevert_ApproveBeforeComplete() public {
        uint256 budget = 10 ether;
        vm.startPrank(client);
        token.approve(address(mkt), budget);
        uint256 jobId = mkt.postJob("x", "", token, budget);
        vm.stopPrank();
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);
        vm.expectRevert("Wrong status");
        vm.prank(client);
        mkt.approveJob(jobId, 5, bytes32(0));
    }

    function testRevert_BadRating() public {
        uint256 budget = 10 ether;
        vm.startPrank(client);
        token.approve(address(mkt), budget);
        uint256 jobId = mkt.postJob("x", "", token, budget);
        vm.stopPrank();
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);
        vm.prank(agentOwner);
        mkt.completeJob(jobId, keccak256("d"));
        vm.expectRevert("Bad rating");
        vm.prank(client);
        mkt.approveJob(jobId, 0, bytes32(0));
    }

    function test_Dispute_LocksFunds() public {
        uint256 budget = 10 ether;
        vm.startPrank(client);
        token.approve(address(mkt), budget);
        uint256 jobId = mkt.postJob("x", "", token, budget);
        vm.stopPrank();
        vm.prank(agentOwner);
        mkt.acceptJob(jobId);
        vm.prank(agentOwner);
        mkt.completeJob(jobId, keccak256("d"));
        vm.prank(client);
        mkt.disputeJob(jobId);
        AgntMarketplace.Job memory j = mkt.getJob(jobId);
        assertEq(uint256(j.status), uint256(AgntMarketplace.JobStatus.Disputed));
        // Funds still escrowed
        assertEq(token.balanceOf(address(mkt)), budget);
    }
}
