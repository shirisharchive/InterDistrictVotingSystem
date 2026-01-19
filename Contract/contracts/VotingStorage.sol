// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VotingStorage
 * @dev Base contract containing all storage variables, structs, and events
 */
abstract contract VotingStorage {
    
    // ============ Structs ============
    
    struct CandidateInfo {
        string name;
        string party;
        string position;
        string district;
        uint256 areaNo;
        uint256 voteCount;
        string candidatePhotoUrl;
        string candidatePartyLogoUrl;
    }

    struct PartyInfo {
        string partyName;
        string partyLogoUrl;
        string district;
        uint256 areaNo;
        uint256 voteCount;
    }

    // ============ State Variables ============
    
    // Owner and access control
    address public owner;
    
    // Candidate tracking
    mapping(uint256 => CandidateInfo) public candidates;
    uint256 public candidateCount;
    
    // Voter tracking
    mapping(uint256 => bool) public registeredVoters;
    uint256 public voterCount;
    
    // Voting tracking
    mapping(uint256 => mapping(string => bool)) public hasVotedForPosition;

    // Party tracking
    mapping(uint256 => PartyInfo) public parties;
    uint256 public partyCount;
    
    // Indirect voting tracking
    mapping(uint256 => bool) public hasVotedForParty;

    // ============ Events ============
    
    event CandidateAdded(
        uint256 indexed candidateId,
        string name,
        string party,
        string position
    );
    
    event VoterRegistered(uint256 indexed voterID);
    
    event VoteCast(
        uint256 indexed voterID,
        uint256 indexed candidateId,
        string position
    );
    
    event PartyAdded(
        uint256 indexed partyId,
        string partyName
    );
    
    event PartyVoteCast(
        uint256 indexed voterID,
        uint256 indexed partyId,
        string partyName
    );
    
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
}
