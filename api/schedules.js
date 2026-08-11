let schedules = [];

module.exports = (req, res) => {
  if (req.method === 'GET') {
    return res.status(200).json(schedules);
  }

  if (req.method === 'POST') {
    try {
      const body = Array.isArray(req.body) ? req.body : [];
      schedules = body;
      return res.status(200).json({ ok: true, schedules });
    } catch (error) {
      return res.status(400).json({ ok: false, message: 'Invalid payload' });
    }
  }

  return res.status(405).json({ ok: false, message: 'Method not allowed' });
};
