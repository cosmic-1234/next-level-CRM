const Task = require('../models/Task');
const { logAudit } = require('./contactController');

// @desc    List all tasks
// @route   GET /api/crm/tasks
const getTasks = async (req, res) => {
  try {
    const { status, assignedAdmin } = req.query;
    const query = {};

    if (status) query.status = status;
    if (assignedAdmin) {
      query.assignedAdmin = assignedAdmin === 'null' ? null : assignedAdmin;
    }

    const tasks = await Task.find(query)
      .populate('assignedAdmin', 'name email')
      .populate('contactUser', 'name email phone')
      .populate('ticket', 'subject status')
      .populate('hub', 'area address')
      .sort({ dueDate: 1 });

    res.json({ success: true, tasks });
  } catch (error) {
    console.error('CRM Get Tasks error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving tasks.' });
  }
};

// @desc    Create a Task
// @route   POST /api/crm/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedAdminId, contactUserId, ticketId, hubId, reminder } = req.body;

    if (!title || !dueDate || !assignedAdminId) {
      return res.status(400).json({ success: false, message: 'Title, due date, and assigned admin are required.' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      dueDate,
      priority: priority || 'medium',
      assignedAdmin: assignedAdminId,
      contactUser: contactUserId || null,
      ticket: ticketId || null,
      hub: hubId || null,
      reminder: reminder || false,
      status: 'todo'
    });

    const populated = await Task.findById(task._id)
      .populate('assignedAdmin', 'name email')
      .populate('contactUser', 'name email')
      .populate('ticket', 'subject');

    await logAudit(
      req.user._id,
      task._id,
      'Task',
      'CREATE_TASK',
      null,
      { title, dueDate }
    );

    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    console.error('CRM Create Task error:', error);
    res.status(500).json({ success: false, message: 'Server error creating task.' });
  }
};

// @desc    Update a Task
// @route   PATCH /api/crm/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, status, priority, assignedAdminId, reminder } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const beforeValues = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      assignedAdmin: task.assignedAdmin,
      reminder: task.reminder
    };

    if (title) task.title = title;
    if (description !== undefined) task.description = description || '';
    if (dueDate) task.dueDate = dueDate;
    if (status) task.status = status;
    if (priority) task.priority = priority;
    if (assignedAdminId) task.assignedAdmin = assignedAdminId;
    if (reminder !== undefined) task.reminder = reminder;

    await task.save();

    const afterValues = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      assignedAdmin: task.assignedAdmin,
      reminder: task.reminder
    };

    await logAudit(
      req.user._id,
      task._id,
      'Task',
      'UPDATE_TASK',
      beforeValues,
      afterValues
    );

    const populated = await Task.findById(task._id)
      .populate('assignedAdmin', 'name email')
      .populate('contactUser', 'name email')
      .populate('ticket', 'subject');

    res.json({ success: true, message: 'Task updated successfully.', task: populated });
  } catch (error) {
    console.error('CRM Update Task error:', error);
    res.status(500).json({ success: false, message: 'Server error updating task.' });
  }
};

// @desc    Delete a Task
// @route   DELETE /api/crm/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await Task.findByIdAndDelete(req.params.id);

    await logAudit(
      req.user._id,
      task._id,
      'Task',
      'DELETE_TASK',
      { title: task.title },
      null
    );

    res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('CRM Delete Task error:', error);
    res.status(500).json({ success: false, message: 'Server error removing task.' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
