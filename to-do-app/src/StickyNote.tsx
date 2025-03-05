import React from 'react';

interface Task {
  id?: number;
  task: string;
  startDate: string;
  endDate: string;
  completed: boolean;
  color: string;
}

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
          <div className="buttons">
            <button
              className="btn btn-sm btn-success complete-btn me-1"
              onClick={() => !task.completed && updateTask(task.id, { completed: true })}
            >
            ✓ 
            </button>
            <button
              className="btn btn-sm btn-danger delete-btn"
              onClick={() => deleteTask(task.id)}
            >
            ✗ 
            </button>
          </div>
        </div>
        <p>{task.task}</p>
        <div className="row">
          <div className="col-6">Start: {formatDate(task.startDate)}</div>
          <div className="col-6">Deadline: {formatDate(task.endDate)}</div>
        </div>
        <div className={`completed-overlay ${task.completed ? 'visible' : ''}`} />
      </div>
    </div>
  );
};

export default StickyNote;