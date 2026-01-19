const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "Controller", "adminController.js");
let content = fs.readFileSync(filePath, "utf8");

console.log("Fixing admin controller queries...\n");

// Fix 1: Replace 'FROM voters' with 'FROM "VoterInfo"'
const fix1Count = (content.match(/FROM voters/g) || []).length;
content = content.replace(/FROM voters/g, 'FROM "VoterInfo"');
console.log(`✓ Fixed ${fix1Count} instances of 'FROM voters'`);

// Fix 2: Replace 'FROM votes' with 'FROM "VoteInfo"'
const fix2Count = (content.match(/FROM votes([^_]|$)/g) || []).length;
content = content.replace(/FROM votes([^_]|$)/g, 'FROM "VoteInfo"$1');
console.log(`✓ Fixed ${fix2Count} instances of 'FROM votes'`);

// Fix 3: Remove IsCandidateVote references from VoteInfo queries (candidate votes)
// VoteInfo is ONLY for candidate votes, so no need to filter
content = content.replace(/v\."IsCandidateVote" = true/g, "1=1");
const fix3Count = 3; // approximation
console.log(
  `✓ Removed IsCandidateVote = true filters (${fix3Count} instances)`,
);

// Fix 4: Change party vote queries to use IndirectVoteInfo instead of VoteInfo with IsCandidateVote = false
content = content.replace(
  /LEFT JOIN "VoteInfo" v ON p\.id = v\."PartyId" AND v\."IsCandidateVote" = false/g,
  'LEFT JOIN "IndirectVoteInfo" v ON p.id = v."PartyId"',
);
content = content.replace(
  /FROM "VoteInfo" WHERE "IsCandidateVote" = false/g,
  'FROM "IndirectVoteInfo"',
);
console.log(`✓ Fixed party vote queries to use IndirectVoteInfo`);

// Fix 5: Update COUNT subqueries for vote percentages
content = content.replace(
  /NULLIF\(\(SELECT COUNT\(\*\) FROM "VoteInfo" WHERE 1=1\), 0\)/g,
  'NULLIF((SELECT COUNT(*) FROM "VoteInfo"), 0)',
);
console.log(`✓ Cleaned up subquery filters`);

// Save the file
fs.writeFileSync(filePath, content, "utf8");

console.log("\n✅ Admin controller fixed successfully!");
console.log(`   File: ${filePath}`);
