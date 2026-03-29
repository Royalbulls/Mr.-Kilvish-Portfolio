import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return new NextResponse(`<html><body><script>window.opener.postMessage({ type: 'OAUTH_ERROR', error: '${error}' }, '*'); window.close();</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  if (!code) {
    return new NextResponse(`<html><body><script>window.opener.postMessage({ type: 'OAUTH_ERROR', error: 'No code provided' }, '*'); window.close();</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${url.origin}/api/auth/google/callback`;

  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to exchange token');
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userData = await userResponse.json();

    // Send success message to parent window with user data
    const html = `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS', 
                user: {
                  id: '${userData.id}',
                  username: '${userData.name || userData.email.split('@')[0]}',
                  email: '${userData.email}',
                  avatarUrl: '${userData.picture || ''}',
                  bio: 'A loyal follower of the dark.',
                  isPublic: true,
                  shadowPoints: 0
                }
              }, '*');
              window.close();
            } else {
              document.body.innerHTML = 'Authentication successful. You can close this window.';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `;

    return new NextResponse(html, { headers: { 'Content-Type': 'text/html' } });
  } catch (err: any) {
    return new NextResponse(`<html><body><script>window.opener.postMessage({ type: 'OAUTH_ERROR', error: '${err.message}' }, '*'); window.close();</script></body></html>`, { headers: { 'Content-Type': 'text/html' } });
  }
}
