import create from 'zustand';

export const useStore = create(set => ({
  tasks: [],
  states: [],
  setTasks: tasks => set({ tasks }),
  setStates: states => set({ states }),
  addTask: task => set(state => ({ tasks: [...state.tasks, task] })),
  updateTask: updated =>
    set(state => ({ tasks: state.tasks.map(t => (t.id === updated.id ? { ...t, ...updated } : t)) })),
  removeTask: id => set(state => ({ tasks: state.tasks.filter(t => t.id !== id), states: state.states.filter(s => s.taskId !== id) })),
  addState: st => set(state => ({ states: [...state.states, st] })),
  updateState: updated =>
    set(state => ({ states: state.states.map(s => (s.id === updated.id ? { ...s, ...updated } : s)) })),
  removeState: id => set(state => ({ states: state.states.filter(s => s.id !== id) })),
}));
