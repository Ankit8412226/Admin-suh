const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, enum: ['company','hr','training','events','facilities','it'], default: 'company' },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  isPinned: { type: Boolean, default: false },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'suh_employee' },
  expiresAt: { type: Date },
  readBy: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('suh_announcement', announcementSchema);


