const API_BASE_URL = "http://localhost:5500/api";

// Utility function to make API calls
async function apiCall(endpoint, method = "GET", data = null) {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (data && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Request failed");
    }

    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

// Show alert messages
function showAlert(message, type = "success") {
  const alertDiv = document.getElementById("alert");
  if (alertDiv) {
    alertDiv.className = `alert alert-${type} show`;
    alertDiv.textContent = message;

    setTimeout(() => {
      alertDiv.classList.remove("show");
    }, 5000);
  }
}

// Show loading state
function showLoading(show = true) {
  const loadingDiv = document.getElementById("loading");
  if (loadingDiv) {
    loadingDiv.style.display = show ? "block" : "none";
  }
}

// Voter APIs
async function registerVoter(voterData) {
  return await apiCall("/voters/register", "POST", voterData);
}

async function registerVoterWithPhoto(voterData) {
  return await apiCall("/voters/register-with-photo", "POST", voterData);
}

async function getAllVoters() {
  return await apiCall("/voters");
}

async function getVoterById(voterId) {
  return await apiCall(`/voters/${voterId}`);
}

async function checkVoterStatus(voterId) {
  return await apiCall(`/votes/status/${voterId}`);
}

// Candidate APIs
async function registerCandidate(candidateData) {
  return await apiCall("/candidates/register", "POST", candidateData);
}

async function registerCandidateWithFiles(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/candidates/register`, {
      method: "POST",
      body: formData, // Don't set Content-Type, browser will set it with boundary
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Request failed");
    }
    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

async function getAllCandidates() {
  return await apiCall("/candidates");
}

async function getAllCandidatesWithResults() {
  return await apiCall("/candidates/results");
}

// Party APIs
async function registerParty(partyData) {
  return await apiCall("/parties/register", "POST", partyData);
}

async function registerPartyWithFile(formData) {
  try {
    const response = await fetch(`${API_BASE_URL}/parties/register`, {
      method: "POST",
      body: formData, // Don't set Content-Type, browser will set it with boundary
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Request failed");
    }
    return result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

async function getAllParties() {
  return await apiCall("/parties");
}

async function getAllPartiesWithResults() {
  return await apiCall("/parties/results");
}

// Voting APIs
async function castVote(voteData) {
  return await apiCall("/vote", "POST", voteData);
}

async function castPartyVote(voteData) {
  return await apiCall("/vote/party", "POST", voteData);
}

async function getVotingResults() {
  return await apiCall("/votes/results");
}

async function getElectionCommissionReport(district = null, areaNo = null) {
  let url = "/votes/report";
  const params = new URLSearchParams();
  if (district) params.append("district", district);
  if (areaNo) params.append("area_no", areaNo);
  if (params.toString()) url += `?${params.toString()}`;
  return await apiCall(url);
}

async function getPartyVoteReport(district = null, areaNo = null) {
  let url = "/vote/party/report";
  const params = new URLSearchParams();
  if (district) params.append("district", district);
  if (areaNo) params.append("area_no", areaNo);
  if (params.toString()) url += `?${params.toString()}`;
  return await apiCall(url);
}

async function checkPartyVoteStatus(voterId) {
  return await apiCall(`/vote/party/status/${voterId}`);
}

// Tab switching functionality
function initTabs() {
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.tab;

      tabs.forEach((t) => t.classList.remove("active"));
      tabContents.forEach((tc) => tc.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(target).classList.add("active");
    });
  });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
});
