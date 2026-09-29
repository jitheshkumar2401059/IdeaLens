const Domain = require('../models/Domain');

const getDomains = async (req, res, next) => {
  try {
    const domains = await Domain.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, count: domains.length, data: domains });
  } catch (error) {
    next(error);
  }
};

const createDomain = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Domain name is required' });
    }

    const domain = await Domain.create({ name, description, icon });
    res.status(201).json({ success: true, data: domain });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDomains,
  createDomain
};
