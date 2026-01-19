// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CandidateManager.sol";
import "./VoterManager.sol";
import "./PartyManager.sol";

/**
 * @title Voting
 * @dev Main voting contract - streamlined for essential functionality
 * @notice Voting period management handled off-chain
 */
contract Voting is CandidateManager, VoterManager, PartyManager {
    
    /**
     * @dev Constructor sets the contract deployer as owner
     */
    constructor() {
        owner = msg.sender;
    }

    // ============ Voting Function ============

    /**
     * @dev Cast a vote for a candidate
     * @param voterID The ID of the voter casting the vote
     * @param candidateId The ID of the candidate to vote for
     * @return success True if vote was cast successfully
     * @notice Voting period management is handled off-chain
     */
    function vote(uint256 voterID, uint256 candidateId) 
        public 
        returns (bool success) 
    {
        require(registeredVoters[voterID], "You are not registered");
        require(candidateId < candidateCount, "Candidate does not exist");

        // Ensure the voter has not voted already for this position
        CandidateInfo storage candidate = candidates[candidateId];
        require(
            !hasVotedForPosition[voterID][candidate.position],
            "You have already voted for this position"
        );

        // Record the vote
        hasVotedForPosition[voterID][candidate.position] = true;

        // Increment vote count for the candidate
        candidate.voteCount++;
        
        emit VoteCast(voterID, candidateId, candidate.position);
        return true;
    }

    // ============ Indirect Voting (Party Voting) ============

    /**
     * @dev Cast a vote for a political party (indirect voting)
     * @param voterID The ID of the voter casting the vote
     * @param partyId The ID of the party to vote for
     * @return success True if vote was cast successfully
     * @notice Each voter can only vote for one party
     */
    function voteForParty(uint256 voterID, uint256 partyId) 
        public 
        returns (bool success) 
    {
        require(registeredVoters[voterID], "You are not registered");
        require(partyId < partyCount, "Party does not exist");
        require(!hasVotedForParty[voterID], "You have already voted for a party");

        // Record the party vote
        hasVotedForParty[voterID] = true;

        // Increment vote count for the party
        parties[partyId].voteCount++;
        
        emit PartyVoteCast(voterID, partyId, parties[partyId].partyName);
        return true;
    }

    /**
     * @dev Check if a voter has voted for a party
     * @param voterID The ID of the voter
     * @return True if voter has voted for a party
     */
    function hasVoterVotedForParty(uint256 voterID) public view returns (bool) {
        return hasVotedForParty[voterID];
    }

    // ============ Results & Statistics ============

    /**
     * @dev Get all candidates with their complete information including votes
     * @return ids Array of candidate IDs
     * @return names Array of candidate names
     * @return parties Array of party names
     * @return positions Array of positions
     * @return voteCounts Array of vote counts
     * @return photoUrls Array of candidate photo URLs
     * @return logoUrls Array of party logo URLs
     */
    function getAllCandidatesWithResults() 
        public 
        view 
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory parties,
            string[] memory positions,
            uint256[] memory voteCounts,
            string[] memory photoUrls,
            string[] memory logoUrls
        ) 
    {
        uint256 count = candidateCount;
        
        ids = new uint256[](count);
        names = new string[](count);
        parties = new string[](count);
        positions = new string[](count);
        voteCounts = new uint256[](count);
        photoUrls = new string[](count);
        logoUrls = new string[](count);
        
        for (uint256 i = 0; i < count; i++) {
            CandidateInfo memory candidate = candidates[i];
            ids[i] = i;
            names[i] = candidate.name;
            parties[i] = candidate.party;
            positions[i] = candidate.position;
            voteCounts[i] = candidate.voteCount;
            photoUrls[i] = candidate.candidatePhotoUrl;
            logoUrls[i] = candidate.candidatePartyLogoUrl;
        }
        
        return (ids, names, parties, positions, voteCounts, photoUrls, logoUrls);
    }

    /**
     * @dev Get total votes cast across all positions
     * @return Total number of votes cast
     */
    function getTotalVotesCast() public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < candidateCount; i++) {
            totalVotes += candidates[i].voteCount;
        }
        return totalVotes;
    }

    /**
     * @dev Get total party votes cast
     * @return Total number of party votes cast
     */
    function getTotalPartyVotesCast() public view returns (uint256) {
        uint256 totalVotes = 0;
        for (uint256 i = 0; i < partyCount; i++) {
            totalVotes += parties[i].voteCount;
        }
        return totalVotes;
    }
}
