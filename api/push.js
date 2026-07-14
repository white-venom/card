// Vercel Serverless Function: /api/push
// Pushes updated employees.json to GitHub using a server-side token.
// Set GITHUB_TOKEN in your Vercel project environment variables.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'GITHUB_TOKEN environment variable is not set in Vercel.' });
  }

  const { content } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Missing content in request body.' });
  }

  const REPO   = 'white-venom/card';
  const FILE   = 'data/employees.json';
  const BRANCH = 'main';
  const API    = `https://api.github.com/repos/${REPO}/contents/${FILE}`;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'XenelasiaCardAdmin/1.0'
  };

  try {
    // Step 1: Get current file SHA
    const getRes = await fetch(`${API}?ref=${BRANCH}`, { headers });
    if (!getRes.ok) {
      const err = await getRes.json();
      return res.status(getRes.status).json({ error: err.message || 'Failed to fetch current file SHA.' });
    }
    const fileData = await getRes.json();
    const sha = fileData.sha;

    // Step 2: Push updated content
    const base64Content = Buffer.from(content, 'utf-8').toString('base64');
    const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const putRes = await fetch(API, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Admin update: ${now}`,
        content: base64Content,
        sha,
        branch: BRANCH
      })
    });

    if (!putRes.ok) {
      const err = await putRes.json();
      return res.status(putRes.status).json({ error: err.message || 'Failed to push update to GitHub.' });
    }

    const result = await putRes.json();
    return res.status(200).json({ 
      success: true, 
      commit: result.commit?.sha,
      message: 'Deployed successfully! Vercel will update in ~10 seconds.'
    });

  } catch (err) {
    console.error('Push error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error.' });
  }
}
