// Connect to Truffle Console and verify blockchain data
// Run: truffle console

// 1. Get contract instance
let voting = await Voting.deployed();

// 2. Check total voters registered on blockchain
let voterCount = await voting.getTotalVoterCount();
console.log("Total Voters on Blockchain:", voterCount.toString());

// 3. Check total candidates registered on blockchain
let candidateCount = await voting.getCandidateCount();
console.log("Total Candidates on Blockchain:", candidateCount.toString());

// 4. Check if a specific voter is registered (use voter_id from database)
let isRegistered = await voting.isVoterRegistered(1); // Replace 1 with actual voter_id
console.log("Is Voter 1 Registered:", isRegistered);

// 5. Get candidate details by ID (starts from 1)
let candidate = await voting.getCandidate(1);
console.log("Candidate 1 Name:", candidate.name);
console.log("Candidate 1 Party:", candidate.party);
console.log("Candidate 1 Position:", candidate.position);
console.log("Candidate 1 Vote Count:", candidate.voteCount.toString());

// 6. Get all candidates with results
let allCandidates = await voting.getAllCandidatesWithResults();
console.log("Candidate Names:", allCandidates.names);
console.log(
  "Vote Counts:",
  allCandidates.voteCounts.map((v) => v.toString())
);

// 7. Check party count
let partyCount = await voting.getPartyCount();
console.log("Total Parties on Blockchain:", partyCount.toString());

// 8. Get party details
let party = await voting.getParty(1);
console.log("Party 1 Name:", party.partyName);
console.log("Party 1 Vote Count:", party.voteCount.toString());
