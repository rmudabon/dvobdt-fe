export type User = { username: string }

const API_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:8000/api'

export function getCookie(name: string) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

export async function loginApi({ username, password }: { username: string; password: string }) {
  const res = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || 'Login failed')
  }

  const data = await res.json()
  console.log(data)
  // expect { csrf_token, user }
  if (data.csrf_token) localStorage.setItem('csrf_token', data.csrf_token)

  return data
}

export async function logoutApi() {
  const csrftoken = getCookie('csrftoken');
  await fetch(`${API_URL}/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRFToken': csrftoken ?? '',
    },
  }).catch(() => {})

  localStorage.removeItem('auth_token')
  localStorage.removeItem('auth_user')
  return true
}

export async function getLocations() {
  const res = await fetch(`${API_URL}/locations/`, {
    credentials: 'include',
  })

  console.log(res)
}

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch(`${API_URL}/locations/`, {
    credentials: 'include',
  })

  if (!res.ok) {
    // token invalid or expired
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    return null
  }

  const user = await res.json()
  localStorage.setItem('auth_user', JSON.stringify(user))
  return user as User
}
