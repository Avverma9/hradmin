import axios from 'axios'
import store from '../redux/store'
import { requestFinished, requestStarted } from '../redux/slices/globalLoader'
import { baseURL, HEALTH_POLL_INTERVAL, SESSION_STORAGE_KEY } from '../util/util'

export const SERVER_STATUS_EVENT = 'hrsadmin:server-status'

const getSavedSession = () => {
  if (typeof window === 'undefined') {
    return null
  }

  const savedSession = window.sessionStorage.getItem(SESSION_STORAGE_KEY)

  if (!savedSession) {
    return null
  }

  try {
    return JSON.parse(savedSession)
  } catch {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

const getStoredToken = () => {
  const savedSession = getSavedSession()
  const state = store.getState()
  const authToken = state?.auth?.token
  const sessionToken =
    savedSession?.token ||
    savedSession?.sessionData?.token ||
    savedSession?.rsToken ||
    savedSession?.sessionData?.rsToken

  const rawToken = authToken || sessionToken || ''

  if (!rawToken) {
    return ''
  }

  return String(rawToken).replace(/^Bearer\s+/i, '').trim()
}

const emitServerStatus = (hasServerError) => {
  if (typeof window === 'undefined') {
    return
  }

  window.dispatchEvent(
    new CustomEvent(SERVER_STATUS_EVENT, {
      detail: { hasServerError },
    }),
  )
}

const api = axios.create({
  baseURL,
  timeout: 10000,
})

const shouldTrackRequest = (config) => config?.url !== '/health' && !config?.skipGlobalLoader

api.interceptors.request.use(
  (config) => {
    if (shouldTrackRequest(config)) {
      store.dispatch(requestStarted())
      config._trackedByGlobalLoader = true
    }

    const token = getStoredToken()

    if (token) {
      config.headers.Authorization = config?.useRawAuthorization ? token : `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => {
    if (response.config?._trackedByGlobalLoader) {
      store.dispatch(requestFinished())
    }

    emitServerStatus(false)
    return response
  },
  (error) => {
    if (error.config?._trackedByGlobalLoader) {
      store.dispatch(requestFinished())
    }

    const hasServerError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.response?.status >= 500

    if (hasServerError) {
      emitServerStatus(true)
    }

    return Promise.reject(error)
  },
)

export const startHealthPolling = (onStatusChange) => {
  const checkHealth = async () => {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      onStatusChange(true)
      return
    }

    try {
      await api.get('/health')
      onStatusChange(false)
    } catch {
      onStatusChange(true)
    }
  }

  checkHealth()
  const intervalId = window.setInterval(checkHealth, HEALTH_POLL_INTERVAL)

  return () => {
    window.clearInterval(intervalId)
  }
}

export default api
