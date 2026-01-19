// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VotingStorage.sol";

/**
 * @title CandidateManager
 * @dev Manages candidate registration and retrieval operations
 */
abstract contract CandidateManager is VotingStorage {
    
    /**
     * @dev Add a new candidate to the election
     * @param _name Candidate's full name
     * @param _party Political party
     * @param _position Position running for
     * @param _district District name
     * @param _areaNo Area number
     * @param _candidatePhotoUrl URL to candidate's photo
     * @param _candidatePartyLogoUrl URL to party logo
     * @return success True if candidate was added successfully
     */
    function addCandidate(
        string memory _name,
        string memory _party,
        string memory _position,
        string memory _district,
        uint256 _areaNo,
        string memory _candidatePhotoUrl,
        string memory _candidatePartyLogoUrl
    ) public onlyOwner returns (bool success) {
        // Validate no duplicate party candidates for the same position in the same area
        // Rule: One party can only have one candidate per position per district per area
        for (uint256 i = 0; i < candidateCount; i++) {
            require(
                !(keccak256(abi.encodePacked(candidates[i].position)) == 
                    keccak256(abi.encodePacked(_position)) &&
                    keccak256(abi.encodePacked(candidates[i].party)) == 
                    keccak256(abi.encodePacked(_party)) &&
                    keccak256(abi.encodePacked(candidates[i].district)) == 
                    keccak256(abi.encodePacked(_district)) &&
                    candidates[i].areaNo == _areaNo),
                "A candidate from the same party is already running for this position in this area"
            );
        }

        // Create new candidate
        candidates[candidateCount] = CandidateInfo({
            name: _name,
            party: _party,
            position: _position,
            district: _district,
            areaNo: _areaNo,
            voteCount: 0,
            candidatePhotoUrl: _candidatePhotoUrl,
            candidatePartyLogoUrl: _candidatePartyLogoUrl
        });

        emit CandidateAdded(candidateCount, _name, _party, _position);
        candidateCount++;
        return true;
    }

    /**
     * @dev Get complete information about a candidate
     * @param candidateId The ID of the candidate
     * @return name Candidate's name
     * @return party Candidate's party
     * @return position Position they're running for
     * @return district Candidate's district
     * @return areaNo Candidate's area number
     * @return voteCount Current vote count
     * @return candidatePhotoUrl URL to candidate's photo
     * @return candidatePartyLogoUrl URL to party logo
     */
    function getCandidate(uint256 candidateId)
        public
        view
        returns (
            string memory name,
            string memory party,
            string memory position,
            string memory district,
            uint256 areaNo,
            uint256 voteCount,
            string memory candidatePhotoUrl,
            string memory candidatePartyLogoUrl
        )
    {
        require(candidateId < candidateCount, "Candidate does not exist");

        CandidateInfo memory candidate = candidates[candidateId];
        return (
            candidate.name,
            candidate.party,
            candidate.position,
            candidate.district,
            candidate.areaNo,
            candidate.voteCount,
            candidate.candidatePhotoUrl,
            candidate.candidatePartyLogoUrl
        );
    }

    /**
     * @dev Get the total number of candidates
     * @return Total candidate count
     */
    function getCandidateCount() public view returns (uint256) {
        return candidateCount;
    }
}
