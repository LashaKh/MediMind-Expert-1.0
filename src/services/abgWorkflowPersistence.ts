import { 
  ABGWorkflowState, 
  WorkflowStep, 
  ProcessingStatus,
  ABGWorkflowPersistenceData,
  WorkflowRecoveryInfo
} from '../types/abg';

/**
 * ABG Workflow Persistence Service
 * Handles saving and recovering ABG workflow states to prevent data loss
 */

const STORAGE_KEY_PREFIX = 'abg-workflow';
const STORAGE_VERSION = '1.0';
const MAX_STORED_WORKFLOWS = 5; // Keep last 5 workflows
const AUTO_CLEANUP_DAYS = 7; // Clean up workflows older than 7 days

interface StoredWorkflowData {
  version: string;
  timestamp: string;
  sessionId: string;
  userId?: string;
  workflow: ABGWorkflowState;
  metadata: {
    imageFile?: {
      name: string;
      type: string;
      size: number;
      lastModified: number;
    };
    patientId?: string;
    abgType?: string;
    processingStartTime?: string;
    recoveryCount: number;
  };
}

/**
 * Generate unique session ID for workflow tracking
 */
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get storage key for a specific workflow session
 */
const getWorkflowKey = (sessionId: string): string => {
  return `${STORAGE_KEY_PREFIX}-${sessionId}`;
};

/**
 * Get all stored workflow keys
 */
const getAllWorkflowKeys = (): string[] => {
  if (typeof window === 'undefined') return [];
  
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(STORAGE_KEY_PREFIX)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Save workflow state to localStorage
 */
export const saveWorkflowState = (
  workflow: ABGWorkflowState,
  metadata: Partial<StoredWorkflowData['metadata']> = {}
): string => {
  if (typeof window === 'undefined') {

    return '';
  }

  try {
    const sessionId = workflow.sessionId || generateSessionId();
    const workflowKey = getWorkflowKey(sessionId);
    
    const storedData: StoredWorkflowData = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      sessionId,
      workflow: {
        ...workflow,
        sessionId
      },
      metadata: {
        recoveryCount: 0,
        ...metadata
      }
    };

    localStorage.setItem(workflowKey, JSON.stringify(storedData));
    
    // Clean up old workflows
    cleanupOldWorkflows();

    return sessionId;
  } catch (error) {

    return '';
  }
};

/**
 * Load workflow state from localStorage
 */
export const loadWorkflowState = (sessionId: string): StoredWorkflowData | null => {
  if (typeof window === 'undefined') {

    return null;
  }

  try {
    const workflowKey = getWorkflowKey(sessionId);
    const storedDataString = localStorage.getItem(workflowKey);
    
    if (!storedDataString) {
      return null;
    }

    const storedData: StoredWorkflowData = JSON.parse(storedDataString);
    
    // Validate version compatibility
    if (storedData.version !== STORAGE_VERSION) {

      removeWorkflowState(sessionId);
      return null;
    }

    // Check if workflow is too old
    const storedDate = new Date(storedData.timestamp);
    const daysDiff = (Date.now() - storedDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > AUTO_CLEANUP_DAYS) {

      removeWorkflowState(sessionId);
      return null;
    }

    return storedData;
  } catch (error) {

    return null;
  }
};

/**
 * Remove workflow state from storage
 */
export const removeWorkflowState = (sessionId: string): void => {
  if (typeof window === 'undefined') return;

  try {
    const workflowKey = getWorkflowKey(sessionId);
    localStorage.removeItem(workflowKey);

  } catch (error) {

  }
};

/**
 * Get all recoverable workflows
 */
export const getRecoverableWorkflows = (): WorkflowRecoveryInfo[] => {
  if (typeof window === 'undefined') return [];

  const workflows: WorkflowRecoveryInfo[] = [];
  const workflowKeys = getAllWorkflowKeys();

  for (const key of workflowKeys) {
    try {
      const sessionId = key.replace(`${STORAGE_KEY_PREFIX}-`, '');
      const storedData = loadWorkflowState(sessionId);
      
      if (storedData) {
        // Only include workflows that are in progress
        const isRecoverable = 
          storedData.workflow.currentStep !== WorkflowStep.COMPLETED &&
          storedData.workflow.processingStatus !== ProcessingStatus.COMPLETED &&
          storedData.workflow.processingStatus !== ProcessingStatus.ERROR;

        if (isRecoverable) {
          workflows.push({
            sessionId,
            timestamp: storedData.timestamp,
            currentStep: storedData.workflow.currentStep,
            progress: storedData.workflow.progress || 0,
            abgType: storedData.metadata.abgType,
            patientId: storedData.metadata.patientId,
            imageFileName: storedData.metadata.imageFile?.name,
            recoveryCount: storedData.metadata.recoveryCount || 0,
            canRecover: true
          });
        }
      }
    } catch (error) {

    }
  }

  // Sort by timestamp (newest first)
  return workflows.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

/**
 * Recover workflow state and increment recovery count
 */
export const recoverWorkflowState = (sessionId: string): ABGWorkflowPersistenceData | null => {
  try {
    const storedData = loadWorkflowState(sessionId);
    
    if (!storedData) {
      return null;
    }

    // Increment recovery count
    const updatedMetadata = {
      ...storedData.metadata,
      recoveryCount: (storedData.metadata.recoveryCount || 0) + 1
    };

    // Update the stored data with new recovery count
    const updatedStoredData: StoredWorkflowData = {
      ...storedData,
      metadata: updatedMetadata
    };

    const workflowKey = getWorkflowKey(sessionId);
    localStorage.setItem(workflowKey, JSON.stringify(updatedStoredData));

    const recoveryData: ABGWorkflowPersistenceData = {
      workflow: storedData.workflow,
      metadata: {
        imageFile: storedData.metadata.imageFile,
        patientId: storedData.metadata.patientId,
        abgType: storedData.metadata.abgType,
        processingStartTime: storedData.metadata.processingStartTime,
        sessionId: storedData.sessionId,
        timestamp: storedData.timestamp,
        recoveryCount: updatedMetadata.recoveryCount
      }
    };

    return recoveryData;
  } catch (error) {

    return null;
  }
};

/**
 * Clean up old workflows to prevent localStorage bloat
 */
export const cleanupOldWorkflows = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const workflowKeys = getAllWorkflowKeys();
    
    // Parse and sort by timestamp
    const workflowsWithTimestamp = workflowKeys
      .map(key => {
        try {
          const sessionId = key.replace(`${STORAGE_KEY_PREFIX}-`, '');
          const storedDataString = localStorage.getItem(key);
          if (!storedDataString) return null;
          
          const storedData = JSON.parse(storedDataString);
          return {
            key,
            sessionId,
            timestamp: new Date(storedData.timestamp).getTime(),
            data: storedData
          };
        } catch {
          return null;
        }
      })
      .filter(item => item !== null)
      .sort((a, b) => b!.timestamp - a!.timestamp);

    // Remove workflows older than AUTO_CLEANUP_DAYS
    const cutoffDate = Date.now() - (AUTO_CLEANUP_DAYS * 24 * 60 * 60 * 1000);
    const oldWorkflows = workflowsWithTimestamp.filter(item => item!.timestamp < cutoffDate);
    
    for (const workflow of oldWorkflows) {
      localStorage.removeItem(workflow!.key);

    }

    // Keep only the most recent MAX_STORED_WORKFLOWS
    const recentWorkflows = workflowsWithTimestamp
      .filter(item => item!.timestamp >= cutoffDate)
      .slice(0, MAX_STORED_WORKFLOWS);

    const excessWorkflows = workflowsWithTimestamp
      .filter(item => item!.timestamp >= cutoffDate)
      .slice(MAX_STORED_WORKFLOWS);

    for (const workflow of excessWorkflows) {
      localStorage.removeItem(workflow!.key);

    }

    if (oldWorkflows.length > 0 || excessWorkflows.length > 0) {

    }
  } catch (error) {

  }
};

/**
 * Clear all workflow data (for testing or reset)
 */
export const clearAllWorkflowData = (): void => {
  if (typeof window === 'undefined') return;

  try {
    const workflowKeys = getAllWorkflowKeys();
    
    for (const key of workflowKeys) {
      localStorage.removeItem(key);
    }

  } catch (error) {

  }
};

/**
 * Get workflow storage statistics
 */
export const getWorkflowStorageStats = () => {
  if (typeof window === 'undefined') {
    return {
      totalWorkflows: 0,
      recoverableWorkflows: 0,
      storageUsedKB: 0,
      oldestWorkflow: null,
      newestWorkflow: null
    };
  }

  try {
    const workflowKeys = getAllWorkflowKeys();
    const recoverableWorkflows = getRecoverableWorkflows();
    
    let totalSize = 0;
    let oldestTimestamp = Date.now();
    let newestTimestamp = 0;

    for (const key of workflowKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += data.length;
        try {
          const parsed = JSON.parse(data);
          const timestamp = new Date(parsed.timestamp).getTime();
          if (timestamp < oldestTimestamp) oldestTimestamp = timestamp;
          if (timestamp > newestTimestamp) newestTimestamp = timestamp;
        } catch {
          // Ignore invalid data
        }
      }
    }

    return {
      totalWorkflows: workflowKeys.length,
      recoverableWorkflows: recoverableWorkflows.length,
      storageUsedKB: Math.round(totalSize / 1024 * 100) / 100,
      oldestWorkflow: workflowKeys.length > 0 ? new Date(oldestTimestamp).toISOString() : null,
      newestWorkflow: workflowKeys.length > 0 ? new Date(newestTimestamp).toISOString() : null
    };
  } catch (error) {

    return {
      totalWorkflows: 0,
      recoverableWorkflows: 0,
      storageUsedKB: 0,
      oldestWorkflow: null,
      newestWorkflow: null
    };
  }
};

/**
 * Auto-save workflow state with debouncing
 */
let autoSaveTimeout: NodeJS.Timeout;

export const autoSaveWorkflow = (
  workflow: ABGWorkflowState,
  metadata: Partial<StoredWorkflowData['metadata']> = {},
  debounceMs: number = 2000
): void => {
  // Clear previous timeout
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout);
  }

  // Only auto-save workflows that are in progress
  const shouldSave = 
    workflow.currentStep !== WorkflowStep.COMPLETED &&
    workflow.processingStatus !== ProcessingStatus.COMPLETED &&
    workflow.processingStatus !== ProcessingStatus.IDLE;

  if (!shouldSave) {
    return;
  }

  autoSaveTimeout = setTimeout(() => {
    saveWorkflowState(workflow, metadata);
  }, debounceMs);
};