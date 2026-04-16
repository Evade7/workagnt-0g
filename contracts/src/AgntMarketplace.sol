// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "openzeppelin-contracts/utils/ReentrancyGuard.sol";

/// @title AgntMarketplace
/// @notice Onchain hiring marketplace for AI agents. Clients post jobs with
///         native-coin escrow (OG on 0G Chain). Deliverables are committed
///         as hashes pointing to 0G Storage. Approval releases escrow + records
///         reputation.
/// @dev Deployed on 0G Galileo testnet; escrow denominated in native OG.
///      On mainnet, a separate version will accept an ERC20 (the canonical project token).
contract AgntMarketplace is ReentrancyGuard {
    enum JobStatus {
        None,      // 0
        Posted,    // 1 — escrow locked, awaiting agent accept
        Accepted,  // 2 — agent owner accepted, working
        Completed, // 3 — agent posted deliverable, awaiting approval
        Approved,  // 4 — client approved, funds released, reputation recorded
        Disputed,  // 5 — locked pending manual arbitration (v0)
        Cancelled  // 6 — client cancelled before accept, refund
    }

    struct Job {
        uint256 id;
        address client;
        address agentOwner;    // 0 until accepted; must match registered agent owner
        string agentSlug;      // agent slug (e.g. "base-token-scanner")
        string brief;          // what the client wants done
        uint256 budget;        // native OG locked in escrow
        JobStatus status;
        bytes32 deliverableHash; // 0G Storage CID hash of the deliverable
        uint8 rating;            // 1-5 on approval
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 completedAt;
        uint256 approvedAt;
    }

    /// @notice Per-agent cumulative reputation. Updated on every Approved job.
    struct Reputation {
        uint64 totalHires;
        uint64 ratingSum;       // sum of ratings 1..5, avg = ratingSum/totalHires
        uint128 totalEarned;    // cumulative budget approved (in OG wei)
        bytes32 reputationBlobHash; // pointer to the latest reputation JSON blob on 0G Storage
    }

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;
    mapping(string => Reputation) public reputation; // keyed by agentSlug
    mapping(string => address) public agentOwnerOf;  // slug -> owner; first acceptor claims

    event JobPosted(uint256 indexed jobId, address indexed client, string indexed agentSlug, uint256 budget);
    event JobAccepted(uint256 indexed jobId, address indexed agentOwner);
    event JobCompleted(uint256 indexed jobId, bytes32 deliverableHash);
    event JobApproved(uint256 indexed jobId, uint8 rating, bytes32 reputationBlobHash);
    event JobDisputed(uint256 indexed jobId, address indexed by);
    event JobCancelled(uint256 indexed jobId);
    event ReputationUpdated(string indexed agentSlug, uint64 totalHires, uint64 ratingSum, bytes32 blobHash);

    modifier onlyClient(uint256 jobId) {
        require(jobs[jobId].client == msg.sender, "Not client");
        _;
    }
    modifier onlyAgentOwner(uint256 jobId) {
        require(jobs[jobId].agentOwner == msg.sender, "Not agent owner");
        _;
    }
    modifier inStatus(uint256 jobId, JobStatus s) {
        require(jobs[jobId].status == s, "Wrong status");
        _;
    }

    /// @notice Post a job. Locks msg.value of native OG in escrow.
    function postJob(string calldata agentSlug, string calldata brief)
        external
        payable
        nonReentrant
        returns (uint256 jobId)
    {
        require(msg.value > 0, "Budget must be > 0");
        require(bytes(agentSlug).length > 0, "Missing agent");

        jobId = ++jobCount;
        Job storage j = jobs[jobId];
        j.id = jobId;
        j.client = msg.sender;
        j.agentSlug = agentSlug;
        j.brief = brief;
        j.budget = msg.value;
        j.status = JobStatus.Posted;
        j.createdAt = block.timestamp;

        emit JobPosted(jobId, msg.sender, agentSlug, msg.value);
    }

    /// @notice Agent owner accepts the job. First acceptor for a slug claims ownership.
    function acceptJob(uint256 jobId) external inStatus(jobId, JobStatus.Posted) {
        Job storage j = jobs[jobId];
        address claimed = agentOwnerOf[j.agentSlug];
        if (claimed == address(0)) {
            agentOwnerOf[j.agentSlug] = msg.sender;
        } else {
            require(claimed == msg.sender, "Agent owned by someone else");
        }
        j.agentOwner = msg.sender;
        j.status = JobStatus.Accepted;
        j.acceptedAt = block.timestamp;
        emit JobAccepted(jobId, msg.sender);
    }

    /// @notice Agent owner posts the deliverable hash (0G Storage CID).
    function completeJob(uint256 jobId, bytes32 deliverableHash)
        external
        onlyAgentOwner(jobId)
        inStatus(jobId, JobStatus.Accepted)
    {
        require(deliverableHash != bytes32(0), "Empty deliverable");
        Job storage j = jobs[jobId];
        j.deliverableHash = deliverableHash;
        j.status = JobStatus.Completed;
        j.completedAt = block.timestamp;
        emit JobCompleted(jobId, deliverableHash);
    }

    /// @notice Client approves. Funds release to agent owner. Reputation blob hash updated.
    function approveJob(uint256 jobId, uint8 rating, bytes32 newReputationBlobHash)
        external
        nonReentrant
        onlyClient(jobId)
        inStatus(jobId, JobStatus.Completed)
    {
        require(rating >= 1 && rating <= 5, "Bad rating");
        Job storage j = jobs[jobId];
        j.status = JobStatus.Approved;
        j.rating = rating;
        j.approvedAt = block.timestamp;

        // Release native OG to agent owner
        (bool ok, ) = j.agentOwner.call{value: j.budget}("");
        require(ok, "Transfer failed");

        // Update reputation
        Reputation storage r = reputation[j.agentSlug];
        r.totalHires += 1;
        r.ratingSum += rating;
        r.totalEarned += uint128(j.budget);
        r.reputationBlobHash = newReputationBlobHash;

        emit JobApproved(jobId, rating, newReputationBlobHash);
        emit ReputationUpdated(j.agentSlug, r.totalHires, r.ratingSum, newReputationBlobHash);
    }

    /// @notice Either party can flag a dispute from Completed status. Locks funds pending arbitration.
    function disputeJob(uint256 jobId) external inStatus(jobId, JobStatus.Completed) {
        Job storage j = jobs[jobId];
        require(msg.sender == j.client || msg.sender == j.agentOwner, "Not a party");
        j.status = JobStatus.Disputed;
        emit JobDisputed(jobId, msg.sender);
    }

    /// @notice Client can cancel before the job is accepted. Refund escrow.
    function cancelJob(uint256 jobId)
        external
        nonReentrant
        onlyClient(jobId)
        inStatus(jobId, JobStatus.Posted)
    {
        Job storage j = jobs[jobId];
        j.status = JobStatus.Cancelled;
        (bool ok, ) = j.client.call{value: j.budget}("");
        require(ok, "Refund failed");
        emit JobCancelled(jobId);
    }

    /// @notice View cumulative reputation for an agent.
    function getAgentReputation(string calldata agentSlug)
        external
        view
        returns (uint64 totalHires, uint64 ratingSum, uint128 totalEarned, bytes32 blobHash, uint16 avgRatingE2)
    {
        Reputation memory r = reputation[agentSlug];
        totalHires = r.totalHires;
        ratingSum = r.ratingSum;
        totalEarned = r.totalEarned;
        blobHash = r.reputationBlobHash;
        avgRatingE2 = r.totalHires == 0 ? 0 : uint16((uint256(r.ratingSum) * 100) / r.totalHires);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }
}
