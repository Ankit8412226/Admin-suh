const Lead = require("../models/lead.model");

// Create a new lead
const createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    const savedLead = await lead.save();
    res.status(201).json(savedLead);
  } catch (error) {
    res.status(400).json({ message: "Error creating lead", error });
  }
};

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().populate("assignedTo", "name email");
    res.status(200).json(leads);
  } catch (error) {
    res.status(500).json({ message: "Error fetching leads", error });
  }
};

// Get a single lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate("assignedTo", "name email");
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.status(200).json(lead);
  } catch (error) {
    res.status(500).json({ message: "Error fetching lead", error });
  }
};

// Update lead by ID
const updateLead = async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLead) return res.status(404).json({ message: "Lead not found" });
    res.status(200).json(updatedLead);
  } catch (error) {
    res.status(400).json({ message: "Error updating lead", error });
  }
};

// Delete lead by ID
const deleteLead = async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);
    if (!deletedLead) return res.status(404).json({ message: "Lead not found" });
    res.status(200).json({ message: "Lead deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting lead", error });
  }
};

const incrementReachCount = async (req, res) => {
  const { leadId } = req.params;

  try {
    const lead = await Lead.findByIdAndUpdate(
      leadId,
      { $inc: { reachCount: 1 } },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.status(200).json({ message: "Reach count updated", lead });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


module.exports = {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  deleteLead,
  incrementReachCount,
};
