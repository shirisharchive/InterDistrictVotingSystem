// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./VotingStorage.sol";

/**
 * @title PartyManager
 * @dev Manages political party registration and retrieval operations
 */
abstract contract PartyManager is VotingStorage {
    
    /**
     * @dev Add a new political party
     * @param _partyName Party's name
     * @param _partyLogoUrl URL to party's logo
     * @param _district District name
     * @param _areaNo Area number
     * @return success True if party was added successfully
     */
    function addParty(
        string memory _partyName,
        string memory _partyLogoUrl,
        string memory _district,
        uint256 _areaNo
    ) public onlyOwner returns (bool success) {
        // Validate no duplicate party names in the same district and area
        for (uint256 i = 0; i < partyCount; i++) {
            if (
                keccak256(abi.encodePacked(parties[i].district)) == 
                    keccak256(abi.encodePacked(_district)) &&
                parties[i].areaNo == _areaNo &&
                keccak256(abi.encodePacked(parties[i].partyName)) == 
                    keccak256(abi.encodePacked(_partyName))
            ) {
                revert("A party with this name already exists in this area");
            }
        }

        // Create new party
        parties[partyCount] = PartyInfo({
            partyName: _partyName,
            partyLogoUrl: _partyLogoUrl,
            district: _district,
            areaNo: _areaNo,
            voteCount: 0
        });

        emit PartyAdded(partyCount, _partyName);
        partyCount++;
        return true;
    }

    /**
     * @dev Get complete information about a party
     * @param partyId The ID of the party
     * @return partyName Party's name
     * @return partyLogoUrl URL to party's logo
     * @return district District name
     * @return areaNo Area number
     * @return voteCount Current vote count
     */
    function getParty(uint256 partyId)
        public
        view
        returns (
            string memory partyName,
            string memory partyLogoUrl,
            string memory district,
            uint256 areaNo,
            uint256 voteCount
        )
    {
        require(partyId < partyCount, "Party does not exist");

        PartyInfo memory party = parties[partyId];
        return (
            party.partyName,
            party.partyLogoUrl,
            party.district,
            party.areaNo,
            party.voteCount
        );
    }

    /**
     * @dev Get the total number of parties
     * @return Total party count
     */
    function getPartyCount() public view returns (uint256) {
        return partyCount;
    }

    /**
     * @dev Get all parties with their vote counts
     * @return ids Array of party IDs
     * @return names Array of party names
     * @return logoUrls Array of party logo URLs
     * @return districts Array of districts
     * @return areaNumbers Array of area numbers
     * @return voteCounts Array of vote counts
     */
    function getAllPartiesWithResults()
        public
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            string[] memory logoUrls,
            string[] memory districts,
            uint256[] memory areaNumbers,
            uint256[] memory voteCounts
        )
    {
        uint256 count = partyCount;
        
        ids = new uint256[](count);
        names = new string[](count);
        logoUrls = new string[](count);
        districts = new string[](count);
        areaNumbers = new uint256[](count);
        voteCounts = new uint256[](count);
        
        for (uint256 i = 0; i < count; i++) {
            PartyInfo memory party = parties[i];
            ids[i] = i;
            names[i] = party.partyName;
            logoUrls[i] = party.partyLogoUrl;
            districts[i] = party.district;
            areaNumbers[i] = party.areaNo;
            voteCounts[i] = party.voteCount;
        }
        
        return (ids, names, logoUrls, districts, areaNumbers, voteCounts);
    }
}
