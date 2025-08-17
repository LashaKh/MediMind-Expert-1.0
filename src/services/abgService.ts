import { supabase } from '../lib/supabase';
import i18next from 'i18next';

export interface CreateABGResult {
  patient_id?: string;
  raw_analysis: string;
  interpretation?: string;
  action_plan?: string;
  image_url?: string;
  type: string; // Will use translation keys: common.serviceErrors.arterialBloodGas | common.serviceErrors.venousBloodGas
  processing_time_ms?: number;
  gemini_confidence?: number;
}

export interface UpdateABGResult {
  interpretation?: string;
  action_plan?: string;
  image_url?: string;
  type?: 'Arterial Blood Gas' | 'Venous Blood Gas';
  processing_time_ms?: number;
  gemini_confidence?: number;
}

export interface ABGResult {
  id: string;
  user_id: string;
  patient_id?: string;
  raw_analysis: string;
  interpretation?: string;
  action_plan?: string;
  image_url?: string;
  type: string; // Will use translation keys: common.serviceErrors.arterialBloodGas | common.serviceErrors.venousBloodGas
  processing_time_ms?: number;
  gemini_confidence?: number;
  created_at: string;
  updated_at: string;
  patient?: PatientInfo;
}

export interface PatientInfo {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  medical_record_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePatient {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  medical_record_number?: string;
}

export interface ABGFilters {
  patientId?: string;
  type?: 'Arterial Blood Gas' | 'Venous Blood Gas';
  startDate?: string;
  endDate?: string;
  hasInterpretation?: boolean;
  hasActionPlan?: boolean;
  limit?: number;
  offset?: number;
}

export interface ABGServiceError {
  code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'DATABASE_ERROR' | 'NETWORK_ERROR';
  message: string;
  details?: string;
}

/**
 * Create a new ABG result record
 */
export const createABGResult = async (result: CreateABGResult): Promise<string> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ABGServiceError('UNAUTHORIZED', i18next.t('common.serviceErrors.userNotAuthenticated'));
    }

    // Validate required fields
    if (!result.raw_analysis || result.raw_analysis.trim().length === 0) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.rawAnalysisRequired'));
    }

    const validTypes = [i18next.t('common.serviceErrors.arterialBloodGas'), i18next.t('common.serviceErrors.venousBloodGas')];
    if (!result.type || !validTypes.includes(result.type)) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.validABGTypeRequired'));
    }

    // Validate confidence score if provided
    if (result.gemini_confidence !== undefined && 
        (result.gemini_confidence < 0 || result.gemini_confidence > 1)) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.geminiConfidenceRange'));
    }

    // Validate patient exists if patient_id provided
    if (result.patient_id) {
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('id', result.patient_id)
        .eq('user_id', user.id)
        .single();

      if (patientError || !patient) {
        throw new ABGServiceError('NOT_FOUND', i18next.t('common.serviceErrors.patientNotFound'));
      }
    }

    // Insert ABG result
    const { data, error } = await supabase
      .from('abg_results')
      .insert([
        {
          ...result,
          user_id: user.id
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Database error creating ABG result:', error);
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToCreateABGResult'), error.message);
    }

    if (!data?.id) {
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.noIdReturned'));
    }

    console.log('ABG result created successfully:', { id: data.id, userId: user.id });
    return data.id;

  } catch (error) {
    if (error instanceof ABGServiceError) {
      throw error;
    }
    console.error('Unexpected error creating ABG result:', error);
    throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToCreateABGResult'));
  }
};

/**
 * Update an existing ABG result
 */
export const updateABGResult = async (id: string, updates: UpdateABGResult): Promise<void> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ABGServiceError('UNAUTHORIZED', i18next.t('common.serviceErrors.userNotAuthenticated'));
    }

    // Validate ID
    if (!id || id.trim().length === 0) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.abgResultIdRequired'));
    }

    // Validate confidence score if provided
    if (updates.gemini_confidence !== undefined && 
        (updates.gemini_confidence < 0 || updates.gemini_confidence > 1)) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.geminiConfidenceRange'));
    }

    // Validate type if provided
    if (updates.type) {
      const validTypes = [i18next.t('common.serviceErrors.arterialBloodGas'), i18next.t('common.serviceErrors.venousBloodGas')];
      if (!validTypes.includes(updates.type)) {
        throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.validABGTypeRequired'));
      }
    }

    // Update ABG result (RLS ensures user can only update their own records)
    const { error } = await supabase
      .from('abg_results')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      if (error.code === 'PGRST116') { // No rows updated
        throw new ABGServiceError('NOT_FOUND', i18next.t('common.serviceErrors.abgResultNotFound'));
      }
      console.error('Database error updating ABG result:', error);
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToUpdateABGResult'), error.message);
    }

    console.log('ABG result updated successfully:', { id, userId: user.id });

  } catch (error) {
    if (error instanceof ABGServiceError) {
      throw error;
    }
    console.error('Unexpected error updating ABG result:', error);
    throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToUpdateABGResult'));
  }
};

/**
 * Get a single ABG result by ID
 */
export const getABGResult = async (id: string): Promise<ABGResult> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ABGServiceError('UNAUTHORIZED', i18next.t('common.serviceErrors.userNotAuthenticated'));
    }

    // Validate ID
    if (!id || id.trim().length === 0) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.abgResultIdRequired'));
    }

    // Get ABG result with optional patient information
    const { data, error } = await supabase
      .from('abg_results')
      .select(`
        *,
        patient:patients(
          id,
          user_id,
          first_name,
          last_name,
          date_of_birth,
          medical_record_number,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new ABGServiceError('NOT_FOUND', i18next.t('common.serviceErrors.abgResultNotFound'));
      }
      console.error('Database error getting ABG result:', error);
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToGetABGResult'), error.message);
    }

    return data as ABGResult;

  } catch (error) {
    if (error instanceof ABGServiceError) {
      throw error;
    }
    console.error('Unexpected error getting ABG result:', error);
    throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToGetABGResult'));
  }
};

/**
 * Get multiple ABG results with optional filtering
 */
export const getUserABGResults = async (filters: ABGFilters = {}): Promise<ABGResult[]> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ABGServiceError('UNAUTHORIZED', i18next.t('common.serviceErrors.userNotAuthenticated'));
    }

    // Build query
    let query = supabase
      .from('abg_results')
      .select(`
        *,
        patient:patients(
          id,
          user_id,
          first_name,
          last_name,
          date_of_birth,
          medical_record_number,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    // Apply filters
    if (filters.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    if (filters.hasInterpretation !== undefined) {
      if (filters.hasInterpretation) {
        query = query.not('interpretation', 'is', null);
      } else {
        query = query.is('interpretation', null);
      }
    }

    if (filters.hasActionPlan !== undefined) {
      if (filters.hasActionPlan) {
        query = query.not('action_plan', 'is', null);
      } else {
        query = query.is('action_plan', null);
      }
    }

    // Apply pagination
    if (filters.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 50)) - 1);
    } else if (filters.limit) {
      query = query.limit(filters.limit);
    }

    // Order by most recent first
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Database error getting user ABG results:', error);
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToGetABGResults'), error.message);
    }

    return (data as ABGResult[]) || [];

  } catch (error) {
    if (error instanceof ABGServiceError) {
      throw error;
    }
    console.error('Unexpected error getting user ABG results:', error);
    throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToGetABGResults'));
  }
};

/**
 * Delete an ABG result
 */
export const deleteABGResult = async (id: string): Promise<void> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ABGServiceError('UNAUTHORIZED', i18next.t('common.serviceErrors.userNotAuthenticated'));
    }

    // Validate ID
    if (!id || id.trim().length === 0) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.abgResultIdRequired'));
    }

    // Delete ABG result (RLS ensures user can only delete their own records)
    const { error } = await supabase
      .from('abg_results')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Database error deleting ABG result:', error);
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToDeleteABGResult'), error.message);
    }

    console.log('ABG result deleted successfully:', { id, userId: user.id });

  } catch (error) {
    if (error instanceof ABGServiceError) {
      throw error;
    }
    console.error('Unexpected error deleting ABG result:', error);
    throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToDeleteABGResult'));
  }
};

/**
 * Create a new patient
 */
export const createPatient = async (patient: CreatePatient): Promise<string> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ABGServiceError('UNAUTHORIZED', i18next.t('common.serviceErrors.userNotAuthenticated'));
    }

    // Validate required fields
    if (!patient.first_name || patient.first_name.trim().length === 0) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.firstNameRequired'));
    }

    if (!patient.last_name || patient.last_name.trim().length === 0) {
      throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.lastNameRequired'));
    }

    // Validate date of birth if provided
    if (patient.date_of_birth) {
      const dob = new Date(patient.date_of_birth);
      if (isNaN(dob.getTime())) {
        throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.invalidDateOfBirth'));
      }
      if (dob > new Date()) {
        throw new ABGServiceError('VALIDATION_ERROR', i18next.t('common.serviceErrors.dateOfBirthFuture'));
      }
    }

    // Insert patient
    const { data, error } = await supabase
      .from('patients')
      .insert([
        {
          ...patient,
          user_id: user.id
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Database error creating patient:', error);
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToCreatePatient'), error.message);
    }

    if (!data?.id) {
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.noIdReturned'));
    }

    console.log('Patient created successfully:', { id: data.id, userId: user.id });
    return data.id;

  } catch (error) {
    if (error instanceof ABGServiceError) {
      throw error;
    }
    console.error('Unexpected error creating patient:', error);
    throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToCreatePatient'));
  }
};

/**
 * Get user's patients
 */
export const getUserPatients = async (limit = 50, offset = 0): Promise<PatientInfo[]> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ABGServiceError('UNAUTHORIZED', i18next.t('common.serviceErrors.userNotAuthenticated'));
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error getting patients:', error);
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToGetPatients'), error.message);
    }

    return (data as PatientInfo[]) || [];

  } catch (error) {
    if (error instanceof ABGServiceError) {
      throw error;
    }
    console.error('Unexpected error getting patients:', error);
    throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToGetPatients'));
  }
};

/**
 * Search patients by name or medical record number
 */
export const searchPatients = async (searchTerm: string, limit = 10): Promise<PatientInfo[]> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new ABGServiceError('UNAUTHORIZED', i18next.t('common.serviceErrors.userNotAuthenticated'));
    }

    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const searchPattern = `%${searchTerm.trim().toLowerCase()}%`;

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', user.id)
      .or(`first_name.ilike.${searchPattern},last_name.ilike.${searchPattern},medical_record_number.ilike.${searchPattern}`)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Database error searching patients:', error);
      throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToSearchPatients'), error.message);
    }

    return (data as PatientInfo[]) || [];

  } catch (error) {
    if (error instanceof ABGServiceError) {
      throw error;
    }
    console.error('Unexpected error searching patients:', error);
    throw new ABGServiceError('DATABASE_ERROR', i18next.t('common.serviceErrors.failedToSearchPatients'));
  }
};

/**
 * Custom error class for ABG service errors
 */
function ABGServiceError(code: ABGServiceError['code'], message: string, details?: string): ABGServiceError {
  return {
    code,
    message,
    details
  };
}