import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { 
  ABGStore, 
  ABGStoreState, 
  ABGResult, 
  CreateABGResult, 
  UpdateABGResult, 
  PatientInfo, 
  CreatePatient,
  ABGFilters,
  WorkflowStep,
  ProcessingStatus,
  ABGWorkflowState,
  ABGConfiguration
} from '../types/abg';

// Import services
import {
  createABGResult,
  updateABGResult,
  getABGResult,
  getUserABGResults,
  deleteABGResult,
  createPatient,
  getUserPatients,
  searchPatients
} from '../services/abgService';

/**
 * Default configuration for ABG feature
 */
const defaultConfiguration: Partial<ABGConfiguration> = {
  timeouts: {
    analysis: 30000,
    interpretation: 45000,
    actionPlan: 45000
  },
  retries: {
    analysis: 3,
    interpretation: 2,
    actionPlan: 2
  },
  validation: {
    maxFileSizeMB: 10,
    allowedFileTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    requirePatient: false
  },
  ui: {
    showProgressIndicator: true,
    autoSaveInterval: 30000, // 30 seconds
    defaultABGType: 'Arterial Blood Gas',
    enableRealTimeUpdates: true
  }
};

/**
 * Initial state for the ABG store
 */
const initialState: ABGStoreState = {
  currentWorkflow: undefined,
  results: [],
  currentResult: undefined,
  patients: [],
  loading: false,
  error: undefined,
  filters: {},
  searchQuery: '',
  configuration: defaultConfiguration
};

/**
 * ABG Store using Zustand with subscriptions for real-time updates
 */
export const useABGStore = create<ABGStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    ...initialState,

    // Workflow actions
    startWorkflow: (initialData) => {
      const newWorkflow: ABGWorkflowState = {
        currentStep: WorkflowStep.UPLOAD,
        processingStatus: ProcessingStatus.IDLE,
        progress: 0,
        canProceed: false,
        error: undefined,
        ...initialData
      };

      set({
        currentWorkflow: newWorkflow,
        error: undefined
      });

    },

    updateWorkflowStep: (step, data) => {
      const current = get().currentWorkflow;
      if (!current) {

        return;
      }

      const updatedWorkflow: ABGWorkflowState = {
        ...current,
        currentStep: step,
        ...data
      };

      // Auto-update progress based on step
      if (!data?.progress) {
        switch (step) {
          case WorkflowStep.UPLOAD:
            updatedWorkflow.progress = 0;
            break;
          case WorkflowStep.ANALYSIS:
            updatedWorkflow.progress = 25;
            break;
          case WorkflowStep.INTERPRETATION:
            updatedWorkflow.progress = 90; // Ensure progress reflects completion of interpretation
            break;
          case WorkflowStep.ACTION_PLAN:
            updatedWorkflow.progress = 75;
            break;
          case WorkflowStep.COMPLETED:
            updatedWorkflow.progress = 100;
            break;
        }
      }

      set({ currentWorkflow: updatedWorkflow });

    },

    setProcessingStatus: (status, message) => {
      const current = get().currentWorkflow;
      if (!current) {

        return;
      }

      const updatedWorkflow: ABGWorkflowState = {
        ...current,
        processingStatus: status,
        error: status === ProcessingStatus.ERROR ? message : undefined
      };

      set({ 
        currentWorkflow: updatedWorkflow,
        error: status === ProcessingStatus.ERROR ? message : undefined
      });

    },

    completeWorkflow: (result) => {
      const current = get().currentWorkflow;
      
      set({
        currentWorkflow: {
          ...current!,
          currentStep: WorkflowStep.COMPLETED,
          processingStatus: ProcessingStatus.COMPLETED,
          progress: 100,
          canProceed: false
        },
        currentResult: result,
        error: undefined
      });

      // Add result to the results list if not already present
      const existingResults = get().results;
      const existingIndex = existingResults.findIndex(r => r.id === result.id);
      
      if (existingIndex >= 0) {
        // Update existing result
        const updatedResults = [...existingResults];
        updatedResults[existingIndex] = result;
        set({ results: updatedResults });
      } else {
        // Add new result at the beginning
        set({ results: [result, ...existingResults] });
      }

    },

    resetWorkflow: () => {
      set({
        currentWorkflow: undefined,
        currentResult: undefined,
        error: undefined
      });

    },

    // ABG result actions
    loadResults: async (filters) => {
      set({ loading: true, error: undefined });
      
      try {
        const combinedFilters = { ...get().filters, ...filters };
        const results = await getUserABGResults(combinedFilters);
        
        set({ 
          results,
          filters: combinedFilters,
          loading: false 
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load results';
        set({ 
          error: errorMessage,
          loading: false 
        });

      }
    },

    loadResult: async (id) => {
      set({ loading: true, error: undefined });
      
      try {
        const result = await getABGResult(id);
        set({ 
          currentResult: result,
          loading: false 
        });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load result';
        set({ 
          error: errorMessage,
          loading: false 
        });

        throw error;
      }
    },

    createResult: async (result) => {
      set({ loading: true, error: undefined });
      
      try {
        const id = await createABGResult(result);
        
        // Load the created result to get complete data
        const createdResult = await getABGResult(id);
        
        // Add to results list
        const existingResults = get().results;
        set({ 
          results: [createdResult, ...existingResults],
          currentResult: createdResult,
          loading: false 
        });

        return id;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create result';
        set({ 
          error: errorMessage,
          loading: false 
        });

        throw error;
      }
    },

    updateResult: async (id, updates) => {
      set({ loading: true, error: undefined });
      
      try {
        await updateABGResult(id, updates);
        
        // Update result in current results list
        const existingResults = get().results;
        const existingIndex = existingResults.findIndex(r => r.id === id);
        
        if (existingIndex >= 0) {
          const updatedResult = { 
            ...existingResults[existingIndex], 
            ...updates,
            updated_at: new Date().toISOString()
          };
          
          const updatedResults = [...existingResults];
          updatedResults[existingIndex] = updatedResult;
          
          set({ 
            results: updatedResults,
            currentResult: get().currentResult?.id === id ? updatedResult : get().currentResult,
            loading: false 
          });
        } else {
          // If result not in list, reload from database
          const updatedResult = await getABGResult(id);
          set({ 
            currentResult: get().currentResult?.id === id ? updatedResult : get().currentResult,
            loading: false 
          });
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update result';
        set({ 
          error: errorMessage,
          loading: false 
        });

        throw error;
      }
    },

    deleteResult: async (id) => {
      set({ loading: true, error: undefined });
      
      try {
        await deleteABGResult(id);
        
        // Remove from results list
        const existingResults = get().results;
        const filteredResults = existingResults.filter(r => r.id !== id);
        
        set({ 
          results: filteredResults,
          currentResult: get().currentResult?.id === id ? undefined : get().currentResult,
          loading: false 
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete result';
        set({ 
          error: errorMessage,
          loading: false 
        });

        throw error;
      }
    },

    // Patient actions
    loadPatients: async () => {
      try {
        const patients = await getUserPatients();
        set({ patients });

      } catch (error) {

        // Don't set error for patients as it's not critical
      }
    },

    searchPatients: async (query) => {
      try {
        const patients = await searchPatients(query);

        return patients;
      } catch (error) {

        return [];
      }
    },

    createPatient: async (patient) => {
      try {
        const id = await createPatient(patient);
        
        // Reload patients list
        const patients = await getUserPatients();
        set({ patients });

        return id;
      } catch (error) {

        throw error;
      }
    },

    // UI actions
    setCurrentResult: (result) => {
      set({ currentResult: result });
    },

    setFilters: (filters) => {
      const currentFilters = get().filters;
      const newFilters = { ...currentFilters, ...filters };
      set({ filters: newFilters });
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    setError: (error) => {
      set({ error });
    },

    clearError: () => {
      set({ error: undefined });
    },

    // Configuration actions
    updateConfiguration: (config) => {
      const currentConfig = get().configuration;
      const newConfig = { ...currentConfig, ...config };
      set({ configuration: newConfig });

    }
  }))
);

// Selectors for common use cases
export const useABGResults = () => useABGStore(state => state.results);
export const useCurrentABGResult = () => useABGStore(state => state.currentResult);
export const useABGWorkflow = () => useABGStore(state => state.currentWorkflow);
export const useABGPatients = () => useABGStore(state => state.patients);
export const useABGLoading = () => useABGStore(state => state.loading);
export const useABGError = () => useABGStore(state => state.error);
export const useABGFilters = () => useABGStore(state => state.filters);
export const useABGConfiguration = () => useABGStore(state => state.configuration);

// Action selectors
export const useABGActions = () => {
  return useABGStore(state => ({
    startWorkflow: state.startWorkflow,
    updateWorkflowStep: state.updateWorkflowStep,
    setProcessingStatus: state.setProcessingStatus,
    completeWorkflow: state.completeWorkflow,
    resetWorkflow: state.resetWorkflow,
    loadResults: state.loadResults,
    loadResult: state.loadResult,
    createResult: state.createResult,
    updateResult: state.updateResult,
    deleteResult: state.deleteResult,
    loadPatients: state.loadPatients,
    searchPatients: state.searchPatients,
    createPatient: state.createPatient,
    setCurrentResult: state.setCurrentResult,
    setFilters: state.setFilters,
    setSearchQuery: state.setSearchQuery,
    setError: state.setError,
    clearError: state.clearError,
    updateConfiguration: state.updateConfiguration
  }));
};

// Real-time subscription helper
export const subscribeToABGUpdates = (callback: (state: ABGStoreState) => void) => {
  return useABGStore.subscribe(
    state => ({
      results: state.results,
      currentResult: state.currentResult,
      currentWorkflow: state.currentWorkflow
    }),
    callback,
    {
      equalityFn: (a, b) => 
        a.results.length === b.results.length &&
        a.currentResult?.id === b.currentResult?.id &&
        a.currentWorkflow?.currentStep === b.currentWorkflow?.currentStep
    }
  );
};

// Workflow progress subscription
export const subscribeToWorkflowProgress = (callback: (workflow?: ABGWorkflowState) => void) => {
  return useABGStore.subscribe(
    state => state.currentWorkflow,
    callback,
    {
      equalityFn: (a, b) => 
        a?.currentStep === b?.currentStep &&
        a?.processingStatus === b?.processingStatus &&
        a?.progress === b?.progress
    }
  );
};

// Results list subscription
export const subscribeToResults = (callback: (results: ABGResult[]) => void) => {
  return useABGStore.subscribe(
    state => state.results,
    callback,
    {
      equalityFn: (a, b) => 
        a.length === b.length &&
        a.every((result, index) => result.id === b[index]?.id && result.updated_at === b[index]?.updated_at)
    }
  );
};

// Persist configuration to localStorage
if (typeof window !== 'undefined') {
  useABGStore.subscribe(
    state => state.configuration,
    (configuration) => {
      try {
        localStorage.setItem('abg-configuration', JSON.stringify(configuration));
      } catch (error) {

      }
    }
  );

  // Load configuration from localStorage on initialization
  try {
    const storedConfig = localStorage.getItem('abg-configuration');
    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      useABGStore.getState().updateConfiguration(parsedConfig);
    }
  } catch (error) {

  }
}