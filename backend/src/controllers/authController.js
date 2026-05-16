const AuthService = require('../services/AuthService');
const { sendError } = require('../utils/respond');

async function login(req, res) {
  try {
    const data = await AuthService.login(req.body);
    return res.json(data);
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  login,
  seedAdmin: AuthService.seedAdmin,
};
