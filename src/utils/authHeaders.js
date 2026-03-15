export async function buildAuthHeaders(getToken, headers = {}) {
  const token = await getToken()

  if (!token) {
    return headers
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  }
}
