import React, { useState, useEffect } from 'react';
import './App.css';

interface Task {
  id?: number;
  task: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  color: string;
}

const colors = ['color-1', 'color-2', 'color-3'];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [colorIndex, setColorIndex] = useState<number>(() => parseInt(localStorage.getItem('colorIndex') || '0'));
  const [newTask, setNewTask] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('start');

  // Fetch tasks on mount and when sort changes
  useEffect(() => {
    fetchTasks();
  }, [sortBy]);

  const fetchTasks = async () => {
    const sortField = sortBy === 'complete' ? 'completed' : sortBy;
    const response = await fetch(`http://localhost:3000/tasks?_sort=${sortField}&_order=asc`);
    const data = await response.json();
    setTasks(data);
  };

  const createTask = async () => {
    if (newTask && startDate && endDate) {
      const task: Task = {
        task: newTask,
        startDate,
        endDate,
        completed: false,
        color: colors[colorIndex],
      };
      await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      setColorIndex((colorIndex + 1) % 3);
      localStorage.setItem('colorIndex', String((colorIndex + 1) % 3));
      setNewTask('');
      setStartDate('');
      setEndDate('');
      fetchTasks();
    }
  };

  return (
    <>
      <div id="form-container" className={`sticky-note mb-3 mx-auto ${colors[colorIndex]}`} style={{ width: '250px', height: '250px', zIndex: 100 }}>
        <div className="note-content p-2">
          <div className="d-flex justify-content-between">
            <label htmlFor="new-task">Task:</label>
          </div>
          <textarea
            id="new-task"
            className="form-control mb-2"
            maxLength={50}
            placeholder="Enter task (50 chars max)"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <div className="row">
            <div className="col-6">
              <label htmlFor="new-start-date">Start:</label>
              <input
                type="date"
                id="new-start-date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-6">
              <label htmlFor="new-end-date">Deadline:</label>
              <input
                type="date"
                id="new-end-date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <button className="btn btn-primary mt-2 w-100" onClick={createTask}>
            Post
          </button>
        </div>
      </div>
      <div className="mb-3 text-center">
        <select
          id="sort-notes"
          className="form-select d-inline-block w-auto"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="start">Sort: Start</option>
          <option value="deadline">Sort: Deadline</option>
          <option value="complete">Sort: Completed</option>
        </select>
      </div>
      <div id="board" className="row">
        {tasks.map((task) => (
          <StickyNote key={task.id} task={task} fetchTasks={fetchTasks} />
        ))}
      </div>
    </>
  );
};

// Sticky Note Component
const StickyNote: React.FC<{ task: Task; fetchTasks: () => void }> = ({ task, fetchTasks }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}`;
  };

  const updateTask = async (id: number | undefined, updates: Partial<Task>) => {
    await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    fetchTasks();
  };

  const deleteTask = async (id: number | undefined) => {
    await fetch(`http://localhost:3000/tasks/${id}`, {
      method: 'DELETE',
    });
    fetchTasks();
  };

  return (
    <div className={`sticky-note ${task.color} fade-in col-md-4`} data-id={task.id}>
      <div className="note-content p-2">
        <div className="d-flex justify-content-between align-items-start">
          <strong>Task:</strong>
        </div>
        <p>{task.task}</p>
        <div className="row">
          <div className="col-6">Start: {formatDate(task.startDate)}</div>
          <div className="col-6">Deadline: {formatDate(task.endDate)}</div>
        </div>
        <div className="buttons">
          <button
            className="btn btn-sm btn-success complete-btn me-1"
            onClick={() => !task.completed && updateTask(task.id, { completed: true })}
          />
          <button className="btn btn-sm btn-danger delete-btn" onClick={() => deleteTask(task.id)} />
        </div>
        <div className={`completed-overlay ${task.completed ? 'visible' : ''}`} />
      </div>
    </div>
  );
};

export default App;