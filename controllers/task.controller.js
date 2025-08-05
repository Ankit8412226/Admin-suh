const Task = require("../models/task.model");
const Emp = require("../models/empSuh.model");

const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate } = req.body;

    const employee = await Emp.findById(assignedTo);
    if (!employee) {
      return res.status(404).json({ message: "Assigned employee not found" });
    }

    const task = new Task({ title, description, assignedTo, dueDate });
    await task.save();

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error: error.message });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "name email");
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks", error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate("assignedTo", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, dueDate } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, assignedTo, status, dueDate },
      { new: true }
    ).populate("assignedTo", "name email");

    if (!updatedTask) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task updated", task: updatedTask });
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error: error.message });
  }
};
const approveTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "waiting-for-approval") {
      return res.status(400).json({ message: "Task is not in 'waiting-for-approval' state" });
    }

    task.status = "completed";
    await task.save();

    res.status(200).json({ message: "Task approved and marked as completed", task });
  } catch (error) {
    res.status(500).json({ message: "Error approving task", error: error.message });
  }
};


module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  approveTask ,
};
