const Announcement = require('../models/announcement.model');

exports.create = async (req, res) => {
  try {
    const { title, content, category, priority, expiresAt, isPinned } = req.body;
    const ann = await Announcement.create({
      title, content, category, priority, expiresAt, isPinned: !!isPinned, author: req.user._id
    });
    res.status(201).json({ success: true, data: ann });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to create', error: e.message });
  }
};

exports.list = async (req, res) => {
  try {
    const { category, pinned } = req.query;
    const filter = {};
    if (category && category !== 'all') filter.category = category;
    if (pinned) filter.isPinned = pinned === 'true';
    const anns = await Announcement.find(filter).sort({ isPinned: -1, createdAt: -1 });
    res.status(200).json({ success: true, data: anns });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch', error: e.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Announcement.findByIdAndUpdate(id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to update', error: e.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Announcement.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(400).json({ success: false, message: 'Failed to delete', error: e.message });
  }
};


