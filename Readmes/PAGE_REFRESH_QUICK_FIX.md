# 🎯 PAGE REFRESH - QUICK DIAGNOSIS & FIXES

## Two Types of Refreshes

### Type 1: Intentional (Expected) ✓

**Where:** After successful vote  
**Why:** Redirects to results page  
**Is it a problem?** No, it's working as designed

### Type 2: Unintended (Problem) ❌

**When:** Before vote is even submitted, or on error  
**Why:** Unhandled errors, missing event.preventDefault()  
**Is it a problem?** Yes, needs fixing

---

## What's Actually Happening?

### Scenario A: Page Refreshes DURING Voting

**Problem:** Unhandled JavaScript error  
**Solution:** Add error handling + event.preventDefault()

### Scenario B: Page Redirects AFTER Successful Vote

**Status:** This is normal - intentional redirect to results page  
**Solution:** If you want to prevent this, remove the setTimeout redirect

### Scenario C: Page Refreshes When Selecting Candidates

**Problem:** Event is propagating to form or page level  
**Solution:** Add event.preventDefault() and return false

---

## Quick Fixes by Scenario

### If Page Refreshes BEFORE Vote is Submitted:

**Add to voter-dashboard.html - Change this:**

```html
<!-- BEFORE (Bad) -->
<button onclick="voteForCandidate(${candidate.id}, '${position}')">Vote</button>
```

**To this:**

```html
<!-- AFTER (Good) -->
<button
  type="button"
  onclick="voteForCandidate(event, ${candidate.id}, '${position}')"
>
  Vote
</button>
```

**And update the function:**

```javascript
async function voteForCandidate(event, candidateId, position) {
  event.preventDefault(); // Prevent default
  event.stopPropagation(); // Stop bubbling

  // ... rest of function

  return false; // Prevent default
}
```

---

### If Page Redirects AFTER Vote (and you want to prevent it):

**Edit vote-candidate.html:**

**Find this:**

```javascript
setTimeout(() => {
  window.location.href = "results.html"; // ← REMOVE THIS
}, 3000);
```

**Replace with:**

```javascript
// Just show success message, don't redirect
showAlert(
  "Vote cast successfully! Transaction Hash: " +
    result.data.blockchain.transactionHash,
  "success",
);
// No redirect
```

---

## Check Your Browser Console

Open DevTools (F12) and check for errors:

```
1. Press F12 to open DevTools
2. Go to Console tab
3. Try voting
4. Look for red error messages
5. Share the error with me
```

---

## Most Likely Causes

| Symptom                                    | Likely Cause                 | Fix                                     |
| ------------------------------------------ | ---------------------------- | --------------------------------------- |
| Page refreshes immediately when click vote | Missing `e.preventDefault()` | Add event.preventDefault() to handler   |
| Page refreshes after 3 seconds             | Intentional redirect         | Remove `window.location.href` line      |
| Page refreshes on blockchain error         | Unhandled error              | Add try-catch block                     |
| Page refreshes when loading candidates     | Form submission              | Use `type="button"` not `type="submit"` |

---

## Simple One-Line Fixes

### For voter-dashboard.html Button:

```html
<!-- Change this line (around line 404) from: -->
<button
  class="btn btn-primary vote-btn"
  onclick="voteForCandidate(${candidate.id}, '${position}')"
>
  Vote
</button>

<!-- To this: -->
<button
  type="button"
  class="btn btn-primary vote-btn"
  onclick="return voteForCandidate(event, ${candidate.id}, '${position}'), false"
>
  Vote
</button>
```

### For preventing redirect after vote:

**In vote-candidate.html (around line 196):**

```javascript
// REMOVE or COMMENT OUT these lines:
// setTimeout(() => {
//   window.location.href = "results.html";
// }, 3000);
```

---

## What I Think is Happening

Most likely: **The browser is doing a normal page refresh due to an unhandled error or form submission.**

**Common scenario:**

1. You click "Vote"
2. Blockchain call fails with ABI error (from the previous issue!)
3. Error is caught but page navigation isn't prevented
4. Browser does a reload

---

## To Fix This Properly

**Step 1:** Fix the blockchain address issue (from previous guide)

```powershell
# Restart backend and clear database
cd backend
node server.js
```

**Step 2:** Prevent default page behavior in voters-dashboard.html

- Add `event.preventDefault()` to `voteForCandidate()`
- Add `return false` to handlers

**Step 3:** Test voting again

- Should NOT refresh if no error
- Should show success message

---

## Code Examples

### Before (Problematic):

```html
<button onclick="voteForCandidate(123, 'President')">Vote</button>

<script>
  async function voteForCandidate(id, pos) {
    // No event.preventDefault()
    // No error handling
    // No return false
    await castVote({...});
  }
</script>
```

### After (Fixed):

```html
<button type="button" onclick="voteForCandidate(event, 123, 'President')">
  Vote
</button>

<script>
  async function voteForCandidate(event, id, pos) {
    event.preventDefault();        // ← ADDED
    event.stopPropagation();       // ← ADDED

    try {
      // voting code
      await castVote({...});
    } catch (error) {
      console.error('Vote error:', error);
      showAlert('Error: ' + error.message, 'error');
    }

    return false;  // ← ADDED
  }
</script>
```

---

## Test It

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Try to vote**
4. **Watch for errors**
5. **Take a screenshot of any errors**

Then I can give you the exact fix!

---

## TL;DR

**Your page is refreshing because:**

- Either intentional (designed redirect after voting)
- Or unintended (missing event.preventDefault() or unhandled error)

**To fix:**

- Add `event.preventDefault()` to onclick handlers
- Remove the `window.location.href` redirect if you don't want it
- Check browser console for actual errors

**Report back:** Any errors showing in console when you vote?
