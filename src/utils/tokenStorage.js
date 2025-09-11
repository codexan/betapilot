// Utility functions for storing and retrieving OAuth provider tokens

// Store provider tokens securely
export const storeProviderTokens = (session) => {
  if (!session) return;

  const tokens = {
    provider_token: session.provider_token,
    provider_refresh_token: session.provider_refresh_token,
    expires_at: session.expires_at,
    stored_at: Date.now()
  };

  // Store in localStorage for persistence
  if (tokens.provider_token) {
    localStorage.setItem('google_access_token', tokens.provider_token);
  }
  
  if (tokens.provider_refresh_token) {
    localStorage.setItem('google_refresh_token', tokens.provider_refresh_token);
  }

  if (tokens.expires_at) {
    localStorage.setItem('google_token_expires_at', tokens.expires_at.toString());
  }

  localStorage.setItem('google_tokens_stored_at', tokens.stored_at.toString());

  console.log('Provider tokens stored:', {
    hasAccessToken: !!tokens.provider_token,
    hasRefreshToken: !!tokens.provider_refresh_token,
    expiresAt: tokens.expires_at
  });
};

// Retrieve stored provider tokens
export const getStoredProviderTokens = () => {
  const accessToken = localStorage.getItem('google_access_token');
  const refreshToken = localStorage.getItem('google_refresh_token');
  const expiresAt = localStorage.getItem('google_token_expires_at');
  const storedAt = localStorage.getItem('google_tokens_stored_at');

  if (!accessToken) return null;

  return {
    provider_token: accessToken,
    provider_refresh_token: refreshToken,
    expires_at: expiresAt ? parseInt(expiresAt) : null,
    stored_at: storedAt ? parseInt(storedAt) : null
  };
};

// Check if tokens are expired
export const areTokensExpired = () => {
  const tokens = getStoredProviderTokens();
  if (!tokens || !tokens.expires_at) return true;

  const now = Math.floor(Date.now() / 1000);
  return now >= tokens.expires_at;
};

// Clear stored tokens
export const clearProviderTokens = () => {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_refresh_token');
  localStorage.removeItem('google_token_expires_at');
  localStorage.removeItem('google_tokens_stored_at');
  console.log('Provider tokens cleared');
};

// Get access token for API calls
export const getAccessTokenForAPI = () => {
  const tokens = getStoredProviderTokens();
  
  if (!tokens) {
    console.warn('No stored provider tokens found');
    return null;
  }

  if (areTokensExpired()) {
    console.warn('Provider tokens are expired');
    return null;
  }

  return tokens.provider_token;
};
