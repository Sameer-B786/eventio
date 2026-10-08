import { create } from 'zustand';

export const useGeneratorStore = create((set) => ({
  records: [],
  setRecords: (records) => set({ records }),
  templateJson: null,
  setTemplateJson: (templateJson) => set({ templateJson }),
  generatedOutput: null,
  setGeneratedOutput: (generatedOutput) => set({ generatedOutput }),
  isGenerating: false,
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  progress: 0,
  setProgress: (progress) => set({ progress }),

  // Editing actions
  selectedElementId: null,
  setSelectedElementId: (id) => set({ selectedElementId: id }),
  
  addElement: (element) => set((state) => {
    if (!state.templateJson) return state;
    return {
      templateJson: {
        ...state.templateJson,
        elements: [...state.templateJson.elements, { ...element, id: crypto.randomUUID() }]
      }
    };
  }),

  updateElement: (id, newProps) => set((state) => {
    if (!state.templateJson) return state;
    return {
      templateJson: {
        ...state.templateJson,
        elements: state.templateJson.elements.map(el => 
          el.id === id ? { ...el, ...newProps } : el
        )
      }
    };
  }),

  removeElement: (id) => set((state) => {
    if (!state.templateJson) return state;
    return {
      templateJson: {
        ...state.templateJson,
        elements: state.templateJson.elements.filter(el => el.id !== id)
      },
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
    };
  })
}));
