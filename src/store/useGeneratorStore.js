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
}));
