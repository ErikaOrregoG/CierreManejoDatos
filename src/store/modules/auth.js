import authService from '@/services/authService'

const tokenFromStorage = localStorage.getItem('token') || ''
let userFromStorage = null
try {
  const raw = localStorage.getItem('user')
  userFromStorage = raw ? JSON.parse(raw) : null
} catch {
  userFromStorage = null
}

const state = () => ({
  token: tokenFromStorage,
  user: userFromStorage,
  status: '',
  error: null,
})

const getters = {
  isAuthenticated: (s) => !!s.token,
  authStatus: (s) => s.status,
  currentUser: (s) => s.user,
  authError: (s) => s.error,
}

const actions = {
  register({ commit }, userData) {
    commit('AUTH_REQUEST')
    return authService
      .register(userData)
      .then((res) => {
        commit('AUTH_SUCCESS')
        return res
      })
      .catch((err) => {
        commit('AUTH_ERROR', err)
        throw err
      })
  },
  login({ commit }, credentials) {
    commit('AUTH_REQUEST')
    return authService
      .login(credentials)
      .then((res) => {
        const token = res.data?.token || ''
        const user = res.data?.user || null

        if (token) {
          localStorage.setItem('token', token)
        }
        if (user) {
          localStorage.setItem('user', JSON.stringify(user))
        }

        commit('AUTH_SUCCESS', { token, user })
        return res
      })
      .catch((err) => {
        commit('AUTH_ERROR', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        throw err
      })
  },
  verifyEmail({ commit }, verificationData) {
    commit('AUTH_REQUEST')
    return authService
      .verifyEmail(verificationData)
      .then((res) => {
        commit('AUTH_SUCCESS')
        return res
      })
      .catch((err) => {
        commit('AUTH_ERROR', err)
        throw err
      })
  },
  logout({ commit }) {
    commit('LOGOUT')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  setUser({ commit }, user) {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
    commit('SET_USER', user)
  },
}

const mutations = {
  AUTH_REQUEST(state) {
    state.status = 'loading'
    state.error = null
  },
  AUTH_SUCCESS(state, payload) {
    state.status = 'success'
    state.error = null
    if (payload) {
      state.token = payload.token || state.token
      state.user = payload.user || state.user
    }
  },
  AUTH_ERROR(state, err) {
    state.status = 'error'
    state.error = err
  },
  LOGOUT(state) {
    state.status = ''
    state.token = ''
    state.user = null
    state.error = null
  },
  SET_USER(state, user) {
    state.user = user
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}