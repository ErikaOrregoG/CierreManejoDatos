<template>
  <div class="verify-container">
    <div class="verify-card">
      <div class="verify-header">
        <h1>Verify Email</h1>
        <p>Enter the code sent to your email</p>
      </div>

      <!-- Alert Messages -->
      <div v-if="successMessage" class="alert alert-success">
        <span class="alert-icon">✓</span>
        {{ successMessage }}
      </div>
      <div v-if="errorMessage" class="alert alert-error">
        <span class="alert-icon">✕</span>
        {{ errorMessage }}
      </div>

      <!-- Email Display -->
      <div class="email-display">
        <p class="email-label">Verification code sent to:</p>
        <p class="email-address">{{ displayEmail }}</p>
      </div>

      <!-- Verification Form -->
      <form @submit.prevent="handleVerify" class="verify-form">
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            v-model="verificationData.email"
            type="email"
            placeholder="Enter your email"
            class="form-input"
            required
            @focus="clearMessages"
          />
        </div>

        <div class="form-group">
          <label for="code" class="form-label">Verification Code</label>
          <input
            id="code"
            v-model="verificationData.verificationCode"
            type="text"
            placeholder="Enter the 6-digit code"
            class="form-input code-input"
            maxlength="6"
            @input="formatCode"
            @focus="clearMessages"
          />
          <small class="form-hint">Check your email for the verification code</small>
        </div>

        <button
          type="submit"
          class="btn-verify"
          :disabled="isLoading || !isCodeValid"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="!isLoading">Verify Email</span>
          <span v-else class="spinner">Verifying...</span>
        </button>
      </form>

      <!-- Resend Code Section -->
      <div class="resend-section">
        <p class="resend-text">
          Didn't receive the code?
          <button
            type="button"
            class="btn-resend"
            @click="handleResendCode"
            :disabled="isResending || resendCountdown > 0"
          >
            <span v-if="resendCountdown === 0">Resend Code</span>
            <span v-else>Resend in {{ resendCountdown }}s</span>
          </button>
        </p>
      </div>

      <!-- Footer Links -->
      <div class="verify-footer">
        <p class="footer-text">
          <router-link to="/login" class="footer-link">Back to Login</router-link>
        </p>
      </div>
    </div>

    <!-- Help Section -->
    <div class="help-section">
      <p class="help-title">Having trouble?</p>
      <ul class="help-list">
        <li>Check your spam or junk folder</li>
        <li>Make sure you entered the correct email address</li>
        <li>Try requesting a new verification code</li>
      </ul>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'VerifyEmailView',
  data() {
    return {
      verificationData: {
        email: '',
        verificationCode: '',
      },
      displayEmail: '',
      isLoading: false,
      isResending: false,
      resendCountdown: 0,
      successMessage: '',
      errorMessage: '',
    }
  },
  computed: {
    isCodeValid() {
      return (
        this.verificationData.email &&
        this.verificationData.verificationCode &&
        this.verificationData.verificationCode.length === 6 &&
        /^\d+$/.test(this.verificationData.verificationCode)
      )
    },
  },
  methods: {
    formatCode() {
      // Only allow numbers and limit to 6 digits
      this.verificationData.verificationCode = this.verificationData.verificationCode
        .replace(/\D/g, '')
        .substring(0, 6)
    },
    async handleVerify() {
      if (!this.isCodeValid) {
        this.errorMessage = 'Please enter a valid 6-digit verification code'
        return
      }

      this.isLoading = true
      this.clearMessages()

      try {
        await authService.verifyEmail({
          email: this.verificationData.email,
          verificationCode: this.verificationData.verificationCode,
        })

        this.successMessage = 'Email verified successfully! Redirecting to login...'

        // Redirect to login after a short delay
        setTimeout(() => {
          this.$router.push('/login')
        }, 1500)
      } catch (error) {
        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message
        } else if (error.response?.status === 400) {
          this.errorMessage = 'Invalid verification code. Please try again.'
        } else if (error.response?.status === 404) {
          this.errorMessage = 'Email not found. Please register first.'
        } else if (error.response?.status === 410) {
          this.errorMessage = 'Verification code has expired. Please request a new one.'
        } else {
          this.errorMessage = 'Verification failed. Please try again.'
        }
        console.error('Verification error:', error)
      } finally {
        this.isLoading = false
      }
    },
    async handleResendCode() {
      if (!this.verificationData.email) {
        this.errorMessage = 'Please enter your email address'
        return
      }

      this.isResending = true
      this.clearMessages()

      try {
        // You might need to create a resendCode method in authService
        // For now, we'll simulate the resend by calling register again
        await authService.register({
          email: this.verificationData.email,
          fullname: '',
          current_password: '',
        })

        this.successMessage = 'Verification code resent to your email'
        this.startResendCountdown()
      } catch (error) {
        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message
        } else {
          this.errorMessage = 'Failed to resend code. Please try again later.'
        }
        console.error('Resend error:', error)
      } finally {
        this.isResending = false
      }
    },
    startResendCountdown() {
      this.resendCountdown = 60
      const interval = setInterval(() => {
        this.resendCountdown--
        if (this.resendCountdown <= 0) {
          clearInterval(interval)
        }
      }, 1000)
    },
    clearMessages() {
      this.successMessage = ''
      this.errorMessage = ''
    },
  },
  mounted() {
    // Get email from route params or localStorage
    const email = this.$route.params?.email || localStorage.getItem('registerEmail')
    if (email) {
      this.verificationData.email = email
      this.displayEmail = email
      localStorage.setItem('registerEmail', email)
    }
    this.clearMessages()
  },
}
</script>

<style scoped>
/* RESET */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.verify-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 30px;
  font-family: "Inter", sans-serif;
}

/* CARD */
.verify-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 32px;
  box-shadow: 0px 12px 32px rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.35s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* HEADER */
.verify-header {
  text-align: center;
  margin-bottom: 26px;
}

.verify-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
}

.verify-header p {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

/* ALERTS */
.alert {
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 18px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  animation: fadeSlide 0.25s ease-out;
}

@keyframes fadeSlide {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
  }
}

.alert-success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.alert-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.alert-icon {
  font-size: 16px;
  font-weight: bold;
}

/* EMAIL DISPLAY */
.email-display {
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 26px;
  text-align: center;
}

.email-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 5px;
}

.email-address {
  font-size: 15px;
  font-weight: 600;
  color: #2563eb;
}

/* FORM */
.verify-form .form-group {
  margin-bottom: 20px;
}

.form-label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  display: block;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  font-size: 14px;
  transition: 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.form-input::placeholder {
  color: #9ca3af;
}

/* CODE INPUT */
.code-input {
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 8px;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 6px;
}

/* BUTTON VERIFY */
.btn-verify {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: #111827;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s ease;
}

.btn-verify:hover:not(:disabled) {
  background: #000;
  transform: translateY(-2px);
}

.btn-verify:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  background: #6b7280 !important;
}

.spinner {
  animation: pulse 0.8s infinite alternate;
  opacity: 0.85;
}

@keyframes pulse {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

/* RESEND */
.resend-section {
  text-align: center;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #e5e7eb;
}

.resend-text {
  font-size: 13px;
  color: #4b5563;
}

.btn-resend {
  background: none;
  border: none;
  color: #2563eb;
  font-weight: 600;
  cursor: pointer;
}

.btn-resend:hover:not(:disabled) {
  text-decoration: underline;
}

.btn-resend:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* FOOTER */
.verify-footer {
  margin-top: 22px;
  text-align: center;
}

.footer-link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

/* HELP SECTION */
.help-section {
  margin-top: 28px;
  max-width: 480px;
  padding: 20px 22px;
  background: white;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0px 10px 26px rgba(0, 0, 0, 0.04);
}

.help-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #374151;
}

.help-list {
  list-style: none;
}

.help-list li {
  padding: 6px 0;
  font-size: 13px;
  color: #4b5563;
  position: relative;
  padding-left: 20px;
}

.help-list li::before {
  content: "•";
  position: absolute;
  left: 4px;
  top: -2px;
  font-size: 22px;
  color: #2563eb;
}

/* RESPONSIVE */
@media (max-width: 480px) {
  .verify-card {
    padding: 24px;
  }

  .code-input {
    font-size: 20px;
    letter-spacing: 6px;
  }
}
</style>