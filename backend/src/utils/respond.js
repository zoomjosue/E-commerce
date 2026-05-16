function sendError(res, error) {
  const status = error.status || 500;
  const message = status === 500 ? 'Error interno del servidor' : error.message;

  if (status === 500) {
    console.error(error);
  }

  return res.status(status).json({ error: message });
}

module.exports = { sendError };
