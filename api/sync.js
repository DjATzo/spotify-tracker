const FIREBASE_URL = 'https://spotify-65d2b-default-rtdb.europe-west1.firebasedatabase.app';
const CLIENT_ID = '59283d89c95a4a178e7e7ff5d09ccc10';

async function fbGet(path) {
  const res = await fetch(`${FIREBASE_URL}/${path}.json?auth=${process.env.FIREBASE_SECRET}`);
  return res.ok ? res.json() : null;
}

async function fbUpdate(updates) {
  await fetch(`${FIREBASE_URL}/.json?auth=${process.env.FIREBASE_SECRET}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

async function getNewAccessToken(rt) {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: rt, client_id: CLIENT_ID }),
  });
  if (!res.ok) return null;
  const d = await res.json();
  return { accessToken: d.access_token, newRt: d.refresh_token || rt };
}

module.exports = async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  const users = await fbGet('users');
  if (!users) return res.status(200).json({ synced: 0 });

  let synced = 0;
  for (const [userId, userData] of Object.entries(users)) {
    if (!userData.refreshToken) continue;

    const tokens = await getNewAccessToken(userData.refreshToken);
    if (!tokens) continue;

    const { accessToken, newRt } = tokens;
    const updates = {};

    if (newRt !== userData.refreshToken) {
      updates[`users/${userId}/refreshToken`] = newRt;
    }

    const r = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
      headers: { Authorization: 'Bearer ' + accessToken },
    });
    if (!r.ok) continue;

    const data = await r.json();
    if (!data.items?.length) continue;

    const plays = userData.plays || {};

    for (const item of data.items) {
      const id = item.track.id;
      const ts = new Date(item.played_at).getTime();
      const play = plays[id] || { count: 0, seen: {} };

      if (play.seen?.[ts]) continue;

      const count = (play.count || 0) + 1;
      updates[`users/${userId}/plays/${id}/count`] = count;
      updates[`users/${userId}/plays/${id}/name`] = item.track.name;
      updates[`users/${userId}/plays/${id}/artist`] = item.track.artists.map(a => a.name).join(', ');
      updates[`users/${userId}/plays/${id}/imageUrl`] = item.track.album.images?.[1]?.url || null;
      updates[`users/${userId}/plays/${id}/lastPlayed`] = item.played_at;
      updates[`users/${userId}/plays/${id}/seen/${ts}`] = true;

      if (!plays[id]) plays[id] = { count: 0, seen: {} };
      if (!plays[id].seen) plays[id].seen = {};
      plays[id].seen[ts] = true;
      plays[id].count = count;
    }

    if (Object.keys(updates).length) await fbUpdate(updates);
    synced++;
  }

  res.status(200).json({ synced });
};
