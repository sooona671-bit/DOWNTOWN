const authApiUrl = import.meta.env.VITE_AUTH_API_URL?.trim().replace(/\/+$/, '');

export const isAuthConfigured = Boolean(authApiUrl);

function endpoint(path) {
  if (!authApiUrl) throw new Error('Secure authentication is not configured.');
  return `${authApiUrl}/api/auth/${path}`;
}

async function readAccount(response, currentUser = null) {
  if (response.status === 401 || response.status === 204) return null;
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.message || `Authentication request failed (${response.status}).`);
  }

  const payload = await response.json();
  const account = payload.user || payload;
  const email = account.email || currentUser?.email;
  if (typeof email !== 'string' || !email.includes('@')) {
    throw new Error('The authentication service returned an invalid account profile.');
  }

  return {
    ...currentUser,
    id: account.id || currentUser?.id,
    name: account.name || account.displayName || currentUser?.name || '',
    email,
    phone: account.phone ?? currentUser?.phone ?? '',
    photo: account.photo ?? account.picture ?? account.photoURL ?? currentUser?.photo ?? '',
    dateOfBirth: account.dateOfBirth ?? currentUser?.dateOfBirth ?? '',
    gender: account.gender ?? currentUser?.gender ?? '',
    provider: account.provider || currentUser?.provider || 'google',
  };
}

export async function getAuthenticatedUser() {
  if (!isAuthConfigured) return null;
  const response = await fetch(endpoint('session'), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  return readAccount(response);
}

export function beginGoogleSignIn() {
  window.location.assign(endpoint('google'));
}

export async function endAuthSession() {
  if (!isAuthConfigured) throw new Error('Secure authentication is not configured.');
  const response = await fetch(endpoint('logout'), {
    method: 'POST',
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.message || `Could not log out (${response.status}).`);
  }
}

export async function updateAuthenticatedProfile(profile, currentUser) {
  if (!isAuthConfigured) throw new Error('Secure authentication is not configured.');
  const response = await fetch(endpoint('profile'), {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: profile.name,
      phone: profile.phone,
      photo: profile.photo,
      dateOfBirth: profile.dateOfBirth,
      gender: profile.gender,
    }),
  });

  if (response.status === 204) return getAuthenticatedUser();
  return readAccount(response, currentUser);
}
