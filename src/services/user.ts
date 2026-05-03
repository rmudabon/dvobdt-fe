import { API_URL } from "@/utils/constants";
import z from "zod";

export const userSchema = z.object({
    email: z.email("Invalid email address").min(1, "Email is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});
export const loginSchema = userSchema.pick({ username: true, password: true });
export type UserRegistrationData = z.infer<typeof userSchema>;
export type UserLoginData = z.infer<typeof loginSchema>;

const userInfoSchema = userSchema.pick({ username: true})
type User = z.infer<typeof userInfoSchema>

export const register = (data: UserRegistrationData) =>
    fetch(`${API_URL}/users/register/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw res
        return res.json()
    })
    .catch(res => console.error(res))

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

export async function login({ username, password }: { username: string; password: string }) {
  const res = await fetch(`${API_URL}/users/login/`, {
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
  if (data.csrf_token) localStorage.setItem('csrf_token', data.csrf_token)

  return data
}

export async function logout() {
  const csrftoken = getCookie('csrftoken');
  await fetch(`${API_URL}/users/logout/`, {
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

export async function getCurrentUser(): Promise<User | null> {
  const res = await fetch(`${API_URL}/users/me/`, {
    credentials: 'include',
  })

  if (!res.ok) {
    // token invalid or expired
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    return null
  }

  const user = await res.json()
  const parsed = userInfoSchema.safeParse(user)
  if (!parsed.success) {
    console.error('Invalid user data:', parsed.error)
    return null
  }
  localStorage.setItem('auth_user', JSON.stringify(parsed.data))
  return parsed.data
}
