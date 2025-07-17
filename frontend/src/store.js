import create from 'zustand';

export const useStore = create(set => ({
  tasks: [],
  states: [],
  setTasks: tasks => set({ tasks }),
  setStates: states => set({ states }),
}));
