const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'https://staging.fastor.ai').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const text = await response.text();
  let payload = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.status !== 'Success') {
    const message =
      payload?.message ||
      payload?.error ||
      payload?.data?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload.data;
}

function formBody(values) {
  return new URLSearchParams(values).toString();
}

export function registerPhone(phone, dialCode = '+91') {
  return request('/v1/pwa/user/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ phone, dial_code: dialCode }),
  });
}

export function loginWithOtp(phone, otp, dialCode = '+91') {
  return request('/v1/pwa/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody({ phone, otp, dial_code: dialCode }),
  });
}

export function fetchRestaurants(token, cityId = '118') {
  return request(`/v1/m/restaurant?city_id=${cityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
