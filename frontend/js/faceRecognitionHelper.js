/**
 * Face Recognition Auto-Retry Helper
 * Polls rate limit status and auto-enables capture when timeout expires
 */

class FaceRecognitionHelper {
  constructor() {
    this.pollInterval = null;
    this.isLocked = false;
    this.secondsRemaining = 0;
    this.onUnlock = null;
    this.countdownElement = null;
  }

  /**
   * Start polling rate limit status
   * @param {Function} onUnlockCallback - Called when lockout expires
   * @param {HTMLElement} countdownElement - Element to show countdown
   */
  startPolling(onUnlockCallback, countdownElement = null) {
    this.onUnlock = onUnlockCallback;
    this.countdownElement = countdownElement;

    // Initial check
    this.checkRateLimit();

    // Poll every second
    this.pollInterval = setInterval(() => {
      this.checkRateLimit();
    }, 1000);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  /**
   * Check current rate limit status
   */
  async checkRateLimit() {
    try {
      const response = await fetch(
        "http://localhost:5001/api/face-recognition/check-rate-limit"
      );
      const data = await response.json();

      if (data.locked) {
        this.isLocked = true;
        this.secondsRemaining = data.secondsRemaining;
        this.updateCountdown();
      } else {
        // Unlocked!
        if (this.isLocked) {
          // Was locked, now unlocked - trigger callback
          this.isLocked = false;
          this.stopPolling();

          if (this.onUnlock) {
            this.onUnlock();
          }
        }
      }
    } catch (error) {
      console.error("Error checking rate limit:", error);
    }
  }

  /**
   * Update countdown display
   */
  updateCountdown() {
    if (this.countdownElement && this.secondsRemaining > 0) {
      const minutes = Math.floor(this.secondsRemaining / 60);
      const seconds = this.secondsRemaining % 60;
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

      this.countdownElement.innerHTML = `
        <div style="
          background: #fff3cd;
          border: 2px solid #ffc107;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          margin: 16px 0;
        ">
          <strong>⏳ Too Many Failed Attempts</strong><br/>
          Please wait <strong>${timeStr}</strong> before trying again.<br/>
          <small>The page will automatically enable retry when ready.</small>
        </div>
      `;
    }
  }

  /**
   * Manually reset attempts (admin only)
   */
  async resetAttempts(identifier = null) {
    try {
      const response = await fetch(
        "http://localhost:5001/api/face-recognition/reset-attempts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ identifier }),
        }
      );

      const data = await response.json();

      if (data.success) {
        this.isLocked = false;
        this.secondsRemaining = 0;
        this.stopPolling();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error resetting attempts:", error);
      return false;
    }
  }
}

// Usage example:
/*
const faceHelper = new FaceRecognitionHelper();

// When voter starts face verification
const countdownDiv = document.getElementById('countdownMessage');

faceHelper.startPolling(() => {
  // This callback runs when timeout expires
  console.log('Timeout expired! Auto-enabling camera...');
  
  // Auto-enable camera or upload button
  document.getElementById('capturePhotoBtn').disabled = false;
  document.getElementById('uploadPhotoBtn').disabled = false;
  
  // Show success message
  showAlert('You can try again now!', 'success');
  
  // Optionally auto-open camera
  document.getElementById('capturePhotoBtn').click();
  
}, countdownDiv);

// When verification succeeds or page is closed
window.addEventListener('beforeunload', () => {
  faceHelper.stopPolling();
});
*/
