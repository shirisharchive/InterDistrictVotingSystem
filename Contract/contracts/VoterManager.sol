// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VotingStorage.sol";

/**
 * @title VoterManager
 * @dev Manages voter registration and voter-related queries
 */
abstract contract VoterManager is VotingStorage {
    
    /**
     * @dev Register a new voter
     * @param _voterID Unique identifier for the voter
     */
    function registerVoter(uint256 _voterID) public onlyOwner {
        require(!registeredVoters[_voterID], "This voter is already registered");
        require(_voterID > 0, "Voter ID must be greater than 0");
        
        registeredVoters[_voterID] = true;
        voterCount++;
        
        emit VoterRegistered(_voterID);
    }

    /**
     * @dev Get total number of registered voters
     * @return Total voter count
     */
    function getTotalVoterCount() public view returns (uint256) {
        return voterCount;
    }
}
