const Lead = require("../models/lead.model");
const Employee = require("../models/empSuh.model");

// Create a new lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, source, status, assignedTo, notes, company, budget, requirements } = req.body;
    
    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required fields"
      });
    }
    
    // Check if assignedTo employee exists
    if (assignedTo) {
      const employee = await Employee.findById(assignedTo);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Assigned employee not found"
        });
      }
    }
    
    const lead = new Lead({
      name,
      email,
      phone,
      source: source || "direct",
      status: status || "new",
      assignedTo,
      notes,
      company,
      budget,
      requirements,
      createdBy: req.user.id
    });
    
    const savedLead = await lead.save();
    
    // Populate the created lead with employee details
    const populatedLead = await Lead.findById(savedLead._id)
      .populate("assignedTo", "name email employeeId designation")
      .populate("createdBy", "name email employeeId");
    
    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: populatedLead
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error creating lead",
      error: error.message
    });
  }
};

// Get all leads with filtering and pagination
const getAllLeads = async (req, res) => {
  try {
    const { 
      status, 
      source, 
      assignedTo, 
      startDate, 
      endDate, 
      search,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (source) query.source = source;
    if (assignedTo) query.assignedTo = assignedTo;
    
    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }
    
    // Search in name, email, phone, company
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const leads = await Lead.find(query)
      .populate("assignedTo", "name email employeeId designation")
      .populate("createdBy", "name email employeeId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Lead.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: leads.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching leads",
      error: error.message
    });
  }
};

// Get leads assigned to a specific employee
const getEmployeeLeads = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, source } = req.query;
    
    let query = { assignedTo: employeeId };
    
    // Apply filters
    if (status) query.status = status;
    if (source) query.source = source;
    
    const leads = await Lead.find(query)
      .populate("assignedTo", "name email employeeId")
      .populate("createdBy", "name email employeeId")
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching employee leads",
      error: error.message
    });
  }
};

// Get a single lead by ID
const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email employeeId designation")
      .populate("createdBy", "name email employeeId")
      .populate("activities.performedBy", "name email employeeId");
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching lead",
      error: error.message
    });
  }
};

// Update lead by ID
const updateLead = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      source, 
      status, 
      assignedTo, 
      notes, 
      company, 
      budget, 
      requirements 
    } = req.body;
    
    // Check if lead exists
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }
    
    // Check if assignedTo employee exists
    if (assignedTo && assignedTo !== lead.assignedTo?.toString()) {
      const employee = await Employee.findById(assignedTo);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Assigned employee not found"
        });
      }
    }
    
    // Update lead fields
    if (name) lead.name = name;
    if (email) lead.email = email;
    if (phone) lead.phone = phone;
    if (source) lead.source = source;
    if (status) lead.status = status;
    if (assignedTo) lead.assignedTo = assignedTo;
    if (notes) lead.notes = notes;
    if (company) lead.company = company;
    if (budget) lead.budget = budget;
    if (requirements) lead.requirements = requirements;
    
    // Add activity log for status change
    if (status && status !== lead.status) {
      lead.activities.push({
        type: "status_change",
        description: `Status changed from ${lead.status} to ${status}`,
        performedBy: req.user.id,
        timestamp: new Date()
      });
    }
    
    // Add activity log for assignment change
    if (assignedTo && assignedTo !== lead.assignedTo?.toString()) {
      lead.activities.push({
        type: "assignment_change",
        description: `Lead assigned to a different employee`,
        performedBy: req.user.id,
        timestamp: new Date()
      });
    }
    
    await lead.save();
    
    // Return the updated lead with populated fields
    const updatedLead = await Lead.findById(req.params.id)
      .populate("assignedTo", "name email employeeId designation")
      .populate("createdBy", "name email employeeId")
      .populate("activities.performedBy", "name email employeeId");
    
    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: updatedLead
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating lead",
      error: error.message
    });
  }
};

// Delete lead by ID
const deleteLead = async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);
    
    if (!deletedLead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Lead deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting lead",
      error: error.message
    });
  }
};

// Increment reach count and add activity
const incrementReachCount = async (req, res) => {
  try {
    const { id } = req.params;
    const { method, notes } = req.body;
    
    if (!method) {
      return res.status(400).json({
        success: false,
        message: "Contact method is required"
      });
    }
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }
    
    // Increment reach count
    lead.reachCount += 1;
    
    // Add activity log
    lead.activities.push({
      type: "contact",
      description: `Contacted via ${method}${notes ? `: ${notes}` : ''}`,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    
    await lead.save();
    
    // Return the updated lead with populated fields
    const updatedLead = await Lead.findById(id)
      .populate("assignedTo", "name email employeeId designation")
      .populate("createdBy", "name email employeeId")
      .populate("activities.performedBy", "name email employeeId");
    
    res.status(200).json({
      success: true,
      message: "Reach count updated and activity logged",
      data: updatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating reach count",
      error: error.message
    });
  }
};

// Add a note or activity to a lead
const addActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description } = req.body;
    
    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: "Activity type and description are required"
      });
    }
    
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }
    
    lead.activities.push({
      type,
      description,
      performedBy: req.user.id,
      timestamp: new Date()
    });
    
    await lead.save();
    
    // Return the updated lead with populated fields
    const updatedLead = await Lead.findById(id)
      .populate("assignedTo", "name email employeeId designation")
      .populate("createdBy", "name email employeeId")
      .populate("activities.performedBy", "name email employeeId");
    
    res.status(200).json({
      success: true,
      message: "Activity added successfully",
      data: updatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding activity",
      error: error.message
    });
  }
};

// Get lead statistics
const getLeadStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    
    // Filter by date range
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.createdAt = { $lte: new Date(endDate) };
    }
    
    // Get lead counts by status
    const statusCounts = await Lead.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get lead counts by source
    const sourceCounts = await Lead.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);
    
    // Format the results
    const formatCounts = (aggregation) => {
      const result = {};
      aggregation.forEach(item => {
        result[item._id || 'unknown'] = item.count;
      });
      return result;
    };
    
    // Calculate conversion rate
    const totalLeads = await Lead.countDocuments(dateFilter);
    const convertedLeads = await Lead.countDocuments({ 
      ...dateFilter, 
      status: "converted" 
    });
    
    const conversionRate = totalLeads > 0 
      ? Math.round((convertedLeads / totalLeads) * 100) 
      : 0;
    
    res.status(200).json({
      success: true,
      data: {
        total: totalLeads,
        converted: convertedLeads,
        conversionRate,
        byStatus: formatCounts(statusCounts),
        bySource: formatCounts(sourceCounts)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching lead statistics",
      error: error.message
    });
  }
};

module.exports = {
  createLead,
  getAllLeads,
  getEmployeeLeads,
  getLeadById,
  updateLead,
  deleteLead,
  incrementReachCount,
  addActivity,
  getLeadStatistics
};
