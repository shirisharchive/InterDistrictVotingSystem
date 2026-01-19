# 🔄 PAGE REFRESH ON BLOCKCHAIN FETCH - FIX GUIDE

## Problem Identified

Your page is refreshing when fetching blockchain data for these reasons:

### Issue 1: Intentional Redirects ✓ (Expected)

**File:** `vote-candidate.html` & `vote-party.html`  
**Line:** After vote success, intentional redirect to results page

```javascript
setTimeout(() => {
  window.location.href = "results.html"; // ← INTENTIONAL REFRESH
}, 3000);
```

This is **designed behavior** - redirects after voting success.

### Issue 2: Unhandled Errors Causing Refresh ❌ (Problem)

**File:** `voter-dashboard.html`  
**Line:** 404 - Inline onclick handlers

```html
<button onclick="voteForCandidate(${candidate.id}, '${position}')">Vote</button>
```

If an error occurs here:

- No `e.preventDefault()` to stop form submission
- Error propagates and may cause page behavior issues
- Network errors aren't properly caught

---

## Solutions

### Solution 1: Fix Error Handling in voter-dashboard.html ✅

The problem is that `voteForCandidate()` is called inline without preventing default behavior. If an error occurs, it can cause unexpected page behavior.

**Current Code (Problematic):**

```html
<button onclick="voteForCandidate(${candidate.id}, '${position}')">Vote</button>
```

**Better Approach:**

```html
<button
  onclick="event.preventDefault(); event.stopPropagation(); voteForCandidate(${candidate.id}, '${position}'); return false;"
>
  Vote
</button>
```

---

### Solution 2: Prevent Unintended Page Refreshes ✅

Make sure all async operations are properly handled:

**In voter-dashboard.html - voteForCandidate function:**

```javascript
async function voteForCandidate(candidateId, position) {
  // Prevent default behavior
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (votedPositions.has(position)) {
    showAlert("You have already voted for this position!", "error");
    return false; // ← Prevent default
  }

  // ... rest of code

  try {
    // ... voting code
  } catch (error) {
    // ... error handling
    return false; // ← Prevent default on error too
  }

  return false; // ← Always prevent default
}
```

---

### Solution 3: Add Global Error Handler ✅

Catch any unhandled errors that might cause refreshes:

```javascript
// Add to voter-dashboard.html in <head>
<script>
  // Prevent accidental page navigation
  window.addEventListener('beforeunload', (e) => {
    if (isVotingInProgress) {
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  });
</script>
```

---

## Is Your Page Refresh Expected or Not?

### Expected Refreshes (Normal) ✓

- After successful vote in **vote-candidate.html** - redirects to results
- After successful vote in **vote-party.html** - redirects to results
- These are **designed** redirects

### Unexpected Refreshes (Problem) ❌

- While voting is in progress
- When selecting a candidate without submitting
- When loading candidates/parties
- On network errors
- On blockchain errors

---

## Quick Diagnostic

### Check What's Causing the Refresh

**In browser DevTools Console:**

```javascript
// Monitor page reloads
let reloadCount = 0;
window.addEventListener("beforeunload", () => {
  reloadCount++;
  console.log("Page reload #" + reloadCount);
  console.trace(); // Shows where the reload was triggered
});
```

**Then try voting and see what prints.**

---

## To Fix Voter-Dashboard Completely

You need to:

1. **Add event.preventDefault() to inline onclick handlers**
2. **Return false from handler functions**
3. **Wrap buttons in proper click handlers instead of onclick**

**Better approach - use event listeners:**

```javascript
// Instead of: onclick="voteForCandidate(...)"
// Use this in your JavaScript:

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("vote-btn")) {
    e.preventDefault();
    e.stopPropagation();
    const candidateId = e.target.dataset.candidateId;
    const position = e.target.dataset.position;
    voteForCandidate(candidateId, position);
    return false;
  }
});

// Then change the button HTML to:
<button
  class="btn btn-primary vote-btn"
  data-candidate-id="${candidate.id}"
  data-position="${position}"
>
  Vote
</button>;
```

---

## Common Causes of Unwanted Page Refresh

| Cause                        | Solution                                                  |
| ---------------------------- | --------------------------------------------------------- |
| Missing `e.preventDefault()` | Add event.preventDefault()                                |
| Missing `return false`       | Add return false in handlers                              |
| Uncaught errors              | Wrap in try-catch blocks                                  |
| Form auto-submission         | Use `<button type="button">` not `<button type="submit">` |
| Link navigation              | Don't use `<a href>` for actions                          |
| `window.location`            | Only use intentionally for redirects                      |

---

## Files Involved

| File                   | Issue                           | Status                |
| ---------------------- | ------------------------------- | --------------------- |
| `voter-dashboard.html` | Inline onclick handlers         | ⚠️ Needs improvement  |
| `vote-candidate.html`  | Intentional redirect on success | ✓ Working as designed |
| `vote-party.html`      | Intentional redirect on success | ✓ Working as designed |

---

## Summary

**Your page refresh is likely:**

- ✓ **Intentional** after successful voting (by design)
- ❌ **Unintended** if happening during/before vote submission (needs fix)

**To prevent unintended refreshes:**

1. Add `e.preventDefault()` to all event handlers
2. Return `false` from click handlers
3. Use proper error handling
4. Avoid inline `onclick` attributes

**Is this the behavior you want to fix, or are you asking about the intentional redirect?**
