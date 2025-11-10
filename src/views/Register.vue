<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Create Account</h1>
        <p>Join us today</p>
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

      <!-- Registration Form -->
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="fullname" class="form-label">Full Name</label>
          <input
            id="fullname"
            v-model="formData.fullname"
            type="text"
            placeholder="Enter your full name"
            class="form-input"
            required
            @focus="clearMessages"
          />
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            placeholder="Enter your email"
            class="form-input"
            required
            @focus="clearMessages"
          />
          <small class="form-hint">We'll send a verification code to this email</small>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create a strong password"
              class="form-input"
              required
              @focus="clearMessages"
              @input="validatePassword"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :title="showPassword ? 'Hide password' : 'Show password'"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <div class="password-strength">
            <div class="strength-bar">
              <div
                class="strength-fill"
                :style="{ width: passwordStrength + '%' }"
                :class="'strength-' + getPasswordStrengthLabel()"
              ></div>
            </div>
            <small class="strength-text">
              Password strength:
              <span class="strength-label">{{ getPasswordStrengthLabel() }}</span>
            </small>
          </div>
        </div>

        <div class="form-group">
          <label for="confirm-password" class="form-label">Confirm Password</label>
          <div class="password-input-wrapper">
            <input
              id="confirm-password"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Confirm your password"
              class="form-input"
              :class="{ 'form-input-error': passwordMismatch }"
              required
              @focus="clearMessages"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
              :title="showConfirmPassword ? 'Hide password' : 'Show password'"
            >
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <small v-if="passwordMismatch" class="form-error">Passwords do not match</small>
        </div>

        <div class="form-group checkbox-group">
          <input
            id="terms"
            v-model="agreedToTerms"
            type="checkbox"
            class="form-checkbox"
            required
          />
          <label for="terms" class="checkbox-label">
            I agree to the
            <a href="#" class="link">Terms and Conditions</a>
            and
            <a href="#" class="link">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          class="btn-register"
          :disabled="isLoading || !agreedToTerms || passwordMismatch"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="!isLoading">Create Account</span>
          <span v-else class="spinner">Creating...</span>
        </button>
      </form>

      <!-- Footer Links -->
      <div class="register-footer">
        <p class="footer-text">
          Already have an account?
          <router-link to="/login" class="footer-link">Sign in</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'RegisterView',
  data() {
    return {
      formData: {
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      isLoading: false,
      showPassword: false,
      showConfirmPassword: false,
      agreedToTerms: false,
      successMessage: '',
      errorMessage: '',
      passwordStrength: 0,
    }
  },
  computed: {
    passwordMismatch() {
      return (
        this.formData.password &&
        this.formData.confirmPassword &&
        this.formData.password !== this.formData.confirmPassword
      )
    },
  },
  methods: {
    validatePassword() {
      const password = this.formData.password
      let strength = 0

      if (password.length >= 8) strength += 25
      if (password.length >= 12) strength += 25
      if (/[a-z]/.test(password)) strength += 10
      if (/[A-Z]/.test(password)) strength += 10
      if (/[0-9]/.test(password)) strength += 10
      if (/[^a-zA-Z0-9]/.test(password)) strength += 20

      this.passwordStrength = Math.min(strength, 100)
    },
    getPasswordStrengthLabel() {
      if (this.passwordStrength < 25) return 'weak'
      if (this.passwordStrength < 50) return 'fair'
      if (this.passwordStrength < 75) return 'good'
      return 'strong'
    },
    async handleRegister() {
      // Validate inputs
      if (!this.formData.fullname || !this.formData.email || !this.formData.password) {
        this.errorMessage = 'Please fill in all fields'
        return
      }

      if (this.passwordMismatch) {
        this.errorMessage = 'Passwords do not match'
        return
      }

      if (!this.agreedToTerms) {
        this.errorMessage = 'Please agree to the terms and conditions'
        return
      }

      this.isLoading = true
      this.clearMessages()

      try {
        await authService.register({
          fullname: this.formData.fullname,
          email: this.formData.email,
          current_password: this.formData.password,
        })

        this.successMessage = 'Registration successful! Redirecting to email verification...'

        // Redirect to email verification after a short delay
        setTimeout(() => {
          this.$router.push({
            name: 'VerifyEmail',
            params: { email: this.formData.email },
          })
        }, 1500)
      } catch (error) {
        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message
        } else if (error.response?.status === 400) {
          this.errorMessage = 'Invalid data. Please check your inputs.'
        } else if (error.response?.status === 409) {
          this.errorMessage = 'Email already registered. Please sign in instead.'
        } else {
          this.errorMessage = 'An error occurred. Please try again.'
        }
        console.error('Registration error:', error)
      } finally {
        this.isLoading = false
      }
    },
    clearMessages() {
      this.successMessage = ''
      this.errorMessage = ''
    },
  },
  mounted() {
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

.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  padding: 30px;
  font-family: "Inter", sans-serif;
}

.register-card {
  width: 100%;
  max-width: 480px;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0px 12px 32px rgba(0, 0, 0, 0.06);
  overflow: hidden;
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
.register-header {
  padding: 36px 30px;
  text-align: center;
  background: #f9fafb;
  border-bottom: 1px solid #eee;
}

.register-header h1 {
  font-size: 26px;
  font-weight: 700;
  color: #1f2937;
}

.register-header p {
  font-size: 14px;
  color: #6b7280;
  margin-top: 4px;
}

.register-form {
  padding: 30px;
}

/* ALERTS */
.alert {
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
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
    transform: translateY(0);
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

/* FORM FIELDS */
.form-group {
  margin-bottom: 22px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  background: #f9fafb;
  font-size: 14px;
  transition: 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15);
}

.form-input-error {
  border-color: #dc2626 !important;
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 5px;
}

.form-error {
  font-size: 12px;
  margin-top: 6px;
  color: #dc2626;
  font-weight: 600;
}

/* PASSWORD FIELD */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #6b7280;
  transition: 0.2s;
}

.password-toggle:hover {
  opacity: 0.7;
}

/* PASSWORD STRENGTH */
.password-strength {
  margin-top: 10px;
}

.strength-bar {
  width: 100%;
  height: 5px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
}

.strength-fill {
  height: 100%;
  width: 0;
  border-radius: 6px;
  transition: width 0.35s ease;
}

.strength-weak {
  background: #ef4444;
}

.strength-fair {
  background: #f59e0b;
}

.strength-good {
  background: #3b82f6;
}

.strength-strong {
  background: #10b981;
}

.strength-text {
  font-size: 12px;
  color: #6b7280;
}

.strength-label {
  font-weight: 600;
}

/* TERMS CHECKBOX */
.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 25px 0;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-label {
  font-size: 13px;
  color: #4b5563;
  line-height: 1.5;
}

.link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

/* BUTTON */
.btn-register {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: #111827;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.25s;
}

.btn-register:hover:not(:disabled) {
  background: #000;
  transform: translateY(-2px);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-loading {
  background: #6b7280 !important;
}

.spinner {
  animation: pulse 0.8s infinite alternate;
}

@keyframes pulse {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}

/* FOOTER */
.register-footer {
  padding: 22px;
  background: #f9fafb;
  border-top: 1px solid #eee;
  text-align: center;
}

.footer-text {
  font-size: 14px;
  color: #6b7280;
}

.footer-link {
  color: #2563eb;
  font-weight: 600;
  text-decoration: none;
}

.footer-link:hover {
  text-decoration: underline;
}

/* RESPONSIVE */
@media (max-width: 480px) {
  .register-card {
    margin: 0 10px;
  }

  .register-header {
    padding: 28px 20px;
  }
}

</style>