<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Welcome Back</h1>
        <p>Sign in to your account</p>
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

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            v-model="credentials.email"
            type="email"
            placeholder="Enter your email"
            class="form-input"
            required
            @focus="clearMessages"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="password-input-wrapper">
            <input
              id="password"
              v-model="credentials.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              class="form-input"
              required
              @focus="clearMessages"
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
        </div>

        <button
          type="submit"
          class="btn-login"
          :disabled="isLoading"
          :class="{ 'btn-loading': isLoading }"
        >
          <span v-if="!isLoading">Sign In</span>
          <span v-else class="spinner">Loading...</span>
        </button>
      </form>

      <!-- Footer Links -->
      <div class="login-footer">
        <p class="footer-text">
          Don't have an account?
          <router-link to="/register" class="footer-link">Create one</router-link>
        </p>
        <p class="footer-text">
          <router-link to="/forgot-password" class="footer-link">Forgot password?</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import authService from '@/services/authService'

export default {
  name: 'LoginView',
  data() {
    return {
      credentials: {
        email: '',
        password: '',
      },
      isLoading: false,
      showPassword: false,
      successMessage: '',
      errorMessage: '',
    }
  },
  methods: {
    async handleLogin() {
      // Validate inputs
      if (!this.credentials.email || !this.credentials.password) {
        this.errorMessage = 'Please fill in all fields'
        return
      }

      this.isLoading = true
      this.clearMessages()

      try {
        const response = await authService.login(this.credentials)

        // Store token in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
        }

        // Store user data if provided
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
        }

        this.successMessage = 'Login successful! Redirecting...'

        // Redirect after a short delay
        setTimeout(() => {
          this.$router.push('/dashboard') // Change route as needed
        }, 1500)
      } catch (error) {
        if (error.response?.data?.message) {
          this.errorMessage = error.response.data.message
        } else if (error.response?.status === 401) {
          this.errorMessage = 'Invalid email or password'
        } else if (error.response?.status === 400) {
          this.errorMessage = 'Please verify your email first'
        } else {
          this.errorMessage = 'An error occurred. Please try again.'
        }
        console.error('Login error:', error)
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
    // Clear any previous messages on mount
    this.clearMessages()
  },
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  width: 100%;
  max-width: 420px;
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 30px;
  text-align: center;
}

.login-header h1 {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  opacity: 0.9;
  font-weight: 300;
}

.login-form {
  padding: 30px;
}

/* Alert Styles */
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.alert-icon {
  font-weight: bold;
  font-size: 16px;
}

/* Form Styles */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background-color: #f8f9ff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #999;
}

/* Password Input Wrapper */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
  color: #667eea;
  transition: opacity 0.2s ease;
}

.password-toggle:hover {
  opacity: 0.7;
}

/* Button Styles */
.btn-login {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 10px;
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-loading {
  background: linear-gradient(135deg, #999 0%, #666 100%);
}

.spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

/* Footer Styles */
.login-footer {
  padding: 20px 30px;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.footer-text {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 10px;
}

.footer-text:last-child {
  margin-bottom: 0;
}

.footer-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.footer-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-card {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .login-header {
    padding: 30px 20px;
  }

  .login-header h1 {
    font-size: 24px;
  }

  .login-form {
    padding: 20px;
  }

  .form-input {
    font-size: 16px; /* Prevents zoom on iOS */
  }
}
</style>