import { sanitizeUser } from '##/server/services/user.services.js';

function sendSignInResponse(req, res) {
  res.json({
    user: sanitizeUser(req.user),
  });
}

export { sendSignInResponse };
