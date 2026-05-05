import React, { useMemo, useState } from 'react';
import {
  Plus, Search, Clock, Calendar, AlertCircle, CheckCircle2, Trash2, Edit2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/common/Modal';
import { useToast } from '../context/ToastContext';

const emptyForm = {
  title: '',
  subject: '',
  priority: 'Medium',
  status: 'Todo',
  estimatedHours: 1,
  deadline: new Date().toISOString().slice(0, 10),
  notes: ''
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass-card p-4 group border-l-4 border-l-transparent hover:border-l-violet-500"
  >
    <div className="flex justify-between items-start mb-3">
      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
        task.priority === 'High' ? 'bg-red-500/10 text-red-500' :
        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
        'bg-emerald-500/10 text-emerald-500'
      }`}>
        {task.priority}
      </span>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(task)} className="text-slate-500 hover:text-cyan-400">
          <Edit2 size={15} />
        </button>
        <button onClick={() => onDelete(task.id)} className="text-slate-500 hover:text-red-400">
          <Trash2 size={15} />
        </button>
      </div>
    </div>

    <h4 className="font-bold text-sm mb-2">{task.title}</h4>
    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{task.notes || 'No additional notes'}</p>

    <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-white/5 pt-3">
      <div className="flex items-center gap-1.5">
        <Clock size={12} />
        {task.estimatedHours}h
      </div>
      <div className="flex items-center gap-1.5">
        <Calendar size={12} />
        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No date'}
      </div>
    </div>

    <select
      value={task.status}
      onChange={(e) => onStatusChange(task.id, e.target.value)}
      className="mt-4 w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs focus:outline-none"
    >
      <option>Todo</option>
      <option>In Progress</option>
      <option>Done</option>
    </select>
  </motion.div>
);

const Tasks = () => {
  const { tasks, addTask, updateTask, deleteTask } = useAppContext();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [query, setQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [form, setForm] = useState(emptyForm);

  const columns = [
    { title: 'Todo', status: 'Todo', icon: Clock, color: 'text-blue-400' },
    { title: 'In Progress', status: 'In Progress', icon: AlertCircle, color: 'text-amber-400' },
    { title: 'Done', status: 'Done', icon: CheckCircle2, color: 'text-emerald-400' }
  ];

  const filteredTasks = useMemo(() => {
    const q = query.toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch =
        task.title?.toLowerCase().includes(q) ||
        task.subject?.toLowerCase().includes(q) ||
        task.notes?.toLowerCase().includes(q);

      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, query, priorityFilter]);

  const openAddModal = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      subject: task.subject || '',
      priority: task.priority || 'Medium',
      status: task.status || 'Todo',
      estimatedHours: task.estimatedHours || 1,
      deadline: task.deadline || new Date().toISOString().slice(0, 10),
      notes: task.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      showToast('Please enter task title.', 'error');
      return;
    }

    try {
      if (editingTask) {
        await updateTask(editingTask.id, form);
        showToast('Task updated successfully.', 'success');
      } else {
        await addTask(form);
        showToast('Task added successfully.', 'success');
      }

      setIsModalOpen(false);
      setEditingTask(null);
      setForm(emptyForm);
    } catch (error) {
      console.error(error);
      showToast('Task action failed.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm('Delete this task?');
    if (!ok) return;

    try {
      await deleteTask(id);
      showToast('Task deleted.', 'info');
    } catch (error) {
      console.error(error);
      showToast('Delete failed.', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateTask(id, { status });
      showToast(status === 'Done' ? 'Task completed! +50 XP' : 'Task status updated.', 'success');
    } catch (error) {
      console.error(error);
      showToast('Status update failed.', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Study Tasks</h2>
          <p className="text-slate-400">Organize your subjects and deadlines dynamically</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search tasks..."
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-violet-500/50 w-52"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none"
          >
            <option>All</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white px-4 py-2 text-sm font-bold shadow-lg shadow-violet-600/20"
          >
            <Plus size={18} />
            Add Task
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[calc(100vh-260px)]">
        {columns.map((col) => {
          const Icon = col.icon;
          const columnTasks = filteredTasks.filter((task) => task.status === col.status);

          return (
            <div key={col.status} className="flex flex-col gap-4 bg-white/[0.02] border border-white/5 rounded-3xl p-4">
              <div className="flex items-center justify-between px-2 mb-2">
                <h3 className="font-bold flex items-center gap-2">
                  <Icon size={16} className={col.color} />
                  {col.title}
                  <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-slate-500">
                    {columnTasks.length}
                  </span>
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-1">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-slate-600 text-xs italic">
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask ? 'Edit Task' : 'Add New Task'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
            placeholder="Task title"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-violet-500/50 focus:outline-none"
              placeholder="Subject"
            />

            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
            >
              <option>Todo</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>

            <input
              type="number"
              min="0.5"
              step="0.5"
              value={form.estimatedHours}
              onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
            />

            <input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none"
            />
          </div>

          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none h-24 resize-none"
            placeholder="Notes"
          />

          <button className="w-full py-3 bg-violet-600 hover:bg-violet-500 rounded-xl font-bold">
            {editingTask ? 'Save Changes' : 'Create Task'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
