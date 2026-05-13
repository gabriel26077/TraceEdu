const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

let authToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
}

export const isTokenMissing = () => !authToken

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  }

  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`
  } else if (!endpoint.includes("/auth/login") && endpoint !== "/status") {
    // Silent rejection if token is missing
    throw { name: "AuthSkipError", message: "Skipping request: No auth token" }
  }

  const url = `${API_BASE_URL}${endpoint}`
  console.log(`API Request: ${options.method || 'GET'} ${url}`)

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Unknown error" }))
      console.error(`API Error ${response.status}:`, error)
      throw { response: { data: error, status: response.status }, message: error.detail || "Request failed" }
    }

    if (response.status === 204) return {} as T
    return response.json()
  } catch (error: any) {
    if (error.response) throw error // Already handled
    
    console.error("Network/Fetch Error:", error)
    throw { 
      message: `Network error: Could not reach the API at ${url}. Check if the backend is running and CORS is configured.`,
      originalError: error 
    }
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, data: any) => 
    request<T>(endpoint, { method: "POST", body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),
  put: <T>(endpoint: string, data: any) => 
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: any) => 
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(data) }),
}

export default api
