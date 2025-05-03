import { sanitizeUser } from '##/server/services/user.services.js';

function loadMe(req, res) {
  res.json({ user: sanitizeUser(req.user) });
}

export { loadMe };
