export interface Task {
    id?: number;
    task: string;
    startDate: string;
    endDate: string;
    completed: boolean;
    color: string;
  }
  
  export const fetchTasks = async (sortBy: string): Promise<Task[]> => {
    const sortField = sortBy === 'complete' ? 'completed' : sortBy;
    const response = await fetch(`http://localhost:3000/tasks?_sort=${sortField}&_order=asc`);
    return response.json();
  };