const Task = require("../models/task.model");
const Employee = require("../models/empSuh.model");

// Create a new task
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, priority, category, attachments } = req.body;

    const employee = await Employee.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: "Assigned employee not found" 
      });
    }

    const task = new Task({
      title,
      description,
      assignedTo,
      dueDate,
      priority: priority || "medium",
      category: category || "general",
      createdBy: req.user.id,
      attachments: attachments || []
    });

    await task.save();

    // Populate the created task with employee details
    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email employeeId designation department")
      .populate("createdBy", "name email employeeId");

    res.status(201).json({ 
      success: true,
      message: "Task created successfully", 
      data: populatedTask 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error creating task", 
      error: error.message 
    });
  }
};

// Get all tasks with filtering and pagination
const getAllTasks = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      assignedTo, 
      category,
      startDate,
      endDate,
      search,
      page = 1, 
      limit = 10 
    } = req.query;
    
    let query = {};
    
    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (category) query.category = category;
    
    // Date range filter
    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.dueDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.dueDate = { $lte: new Date(endDate) };
    }
    
    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email employeeId designation department")
      .populate("createdBy", "name email employeeId")
      .sort({ priority: -1, dueDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tasks.length,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching tasks", 
      error: error.message 
    });
  }
};

// Get tasks assigned to a specific employee
const getEmployeeTasks = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, priority, category } = req.query;
    
    let query = { assignedTo: employeeId };
    
    // Apply filters
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email employeeId")
      .populate("createdBy", "name email employeeId")
      .sort({ priority: -1, dueDate: 1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching employee tasks", 
      error: error.message 
    });
  }
};

// Get a specific task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email employeeId designation department")
      .populate("createdBy", "name email employeeId")
      .populate("comments.author", "name email employeeId");

    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching task", 
      error: error.message 
    });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      assignedTo, 
      status, 
      dueDate, 
      priority,
      category,
      attachments,
      progress
    } = req.body;

    // Check if task exists
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    // If assignedTo is being changed, verify the employee exists
    if (assignedTo && assignedTo !== task.assignedTo.toString()) {
      const employee = await Employee.findById(assignedTo);
      if (!employee) {
        return res.status(404).json({ 
          success: false,
          message: "Assigned employee not found" 
        });
      }
    }

    // Update task fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (assignedTo) task.assignedTo = assignedTo;
    if (status) task.status = status;
    if (dueDate) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (category) task.category = category;
    if (attachments) task.attachments = attachments;
    if (progress !== undefined) task.progress = progress;
    
    // If task is marked as completed, set completedAt
    if (status === "completed" && task.status !== "completed") {
      task.completedAt = new Date();
    } else if (status !== "completed") {
      task.completedAt = null;
    }

    // Save the updated task
    await task.save();

    // Return the updated task with populated fields
    const updatedTask = await Task.findById(req.params.id)
      .populate("assignedTo", "name email employeeId designation department")
      .populate("createdBy", "name email employeeId")
      .populate("comments.author", "name email employeeId");

    res.status(200).json({ 
      success: true,
      message: "Task updated successfully", 
      data: updatedTask 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error updating task", 
      error: error.message 
    });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Task deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error deleting task", 
      error: error.message 
    });
  }
};

// Approve a task
const approveTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { comments } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    if (task.status !== "waiting-for-approval") {
      return res.status(400).json({ 
        success: false,
        message: "Task is not in 'waiting-for-approval' state" 
      });
    }

    task.status = "completed";
    task.completedAt = new Date();
    task.progress = 100;
    
    // Add approval comment if provided
    if (comments) {
      task.comments.push({
        text: comments,
        author: req.user.id,
        type: "approval"
      });
    }
    
    await task.save();

    // Return the updated task with populated fields
    const updatedTask = await Task.findById(taskId)
      .populate("assignedTo", "name email employeeId designation department")
      .populate("createdBy", "name email employeeId")
      .populate("comments.author", "name email employeeId");

    res.status(200).json({ 
      success: true,
      message: "Task approved and marked as completed", 
      data: updatedTask 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error approving task", 
      error: error.message 
    });
  }
};

// Add comment to a task
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ 
        success: false,
        message: "Comment text is required" 
      });
    }
    
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }
    
    task.comments.push({
      text,
      author: req.user.id,
      type: "comment"
    });
    
    await task.save();
    
    // Return the updated task with populated fields
    const updatedTask = await Task.findById(id)
      .populate("assignedTo", "name email employeeId designation department")
      .populate("createdBy", "name email employeeId")
      .populate("comments.author", "name email employeeId");
    
    res.status(200).json({ 
      success: true,
      message: "Comment added successfully", 
      data: updatedTask 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error adding comment", 
      error: error.message 
    });
  }
};

// Get task statistics
const getTaskStatistics = async (req, res) => {
  try {
    const { department, assignedTo, startDate, endDate } = req.query;
    
    let matchQuery = {};
    
    // Filter by department
    if (department) {
      const employees = await Employee.find({ department }).select('_id');
      const employeeIds = employees.map(emp => emp._id);
      matchQuery.assignedTo = { $in: employeeIds };
    }
    
    // Filter by specific employee
    if (assignedTo) {
      matchQuery.assignedTo = assignedTo;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      matchQuery.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      matchQuery.createdAt = { $lte: new Date(endDate) };
    }
    
    // Get task counts by status
    const statusCounts = await Task.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    // Get task counts by priority
    const priorityCounts = await Task.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);
    
    // Get task counts by category
    const categoryCounts = await Task.aggregate([
      { $match: matchQuery },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    // Format the results
    const formatCounts = (aggregation) => {
      const result = {};
      aggregation.forEach(item => {
        result[item._id || 'unknown'] = item.count;
      });
      return result;
    };
    
    // Calculate completion rate
    const totalTasks = await Task.countDocuments(matchQuery);
    const completedTasks = await Task.countDocuments({ 
      ...matchQuery, 
      status: "completed" 
    });
    
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // Calculate overdue tasks
    const overdueTasks = await Task.countDocuments({
      ...matchQuery,
      status: { $ne: "completed" },
      dueDate: { $lt: new Date() }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalTasks,
        completed: completedTasks,
        overdue: overdueTasks,
        completionRate,
        byStatus: formatCounts(statusCounts),
        byPriority: formatCounts(priorityCounts),
        byCategory: formatCounts(categoryCounts)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching task statistics", 
      error: error.message 
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getEmployeeTasks,
  getTaskById,
  updateTask,
  deleteTask,
  approveTask,
  addComment,
  getTaskStatistics
};
