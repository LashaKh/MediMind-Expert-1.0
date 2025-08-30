import React, { useState, useCallback, useEffect } from 'react';
import { 
  User, 
  Search, 
  Plus, 
  X, 
  Calendar,
  FileText,
  Loader2,
  ChevronDown,
  Check
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';
import { useABGActions } from '../../../stores/useABGStore';
import { PatientInfo, CreatePatient } from '../../../types/abg';

interface PatientSelectorProps {
  selectedPatient?: PatientInfo;
  onPatientSelect: (patient: PatientInfo) => void;
  onPatientClear: () => void;
}

export const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatient,
  onPatientSelect,
  onPatientClear
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PatientInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state for new patient
  const [newPatient, setNewPatient] = useState<CreatePatient>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    medical_record_number: ''
  });

  // Store actions
  const { searchPatients, createPatient } = useABGActions();

  // Search patients with debouncing
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPatients(query.trim());
      setSearchResults(results);
    } catch (error) {

      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [searchPatients]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && isOpen) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, handleSearch]);

  // Select patient
  const handleSelectPatient = (patient: PatientInfo) => {
    onPatientSelect(patient);
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Clear selection
  const handleClearSelection = () => {
    onPatientClear();
    setSearchQuery('');
    setSearchResults([]);
  };

  // Create new patient
  const handleCreatePatient = async () => {
    // Validate required fields
    if (!newPatient.first_name.trim() || !newPatient.last_name.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const patientId = await createPatient(newPatient);
      
      // Create a patient object for selection
      const createdPatient: PatientInfo = {
        id: patientId,
        user_id: '', // Will be filled by the backend
        first_name: newPatient.first_name,
        last_name: newPatient.last_name,
        date_of_birth: newPatient.date_of_birth || undefined,
        medical_record_number: newPatient.medical_record_number || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      handleSelectPatient(createdPatient);
      setShowCreateForm(false);
      setNewPatient({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        medical_record_number: ''
      });
    } catch (error) {

    } finally {
      setIsCreating(false);
    }
  };

  // Cancel patient creation
  const handleCancelCreate = () => {
    setShowCreateForm(false);
    setNewPatient({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      medical_record_number: ''
    });
  };

  // Format patient age
  const getPatientAge = (dateOfBirth?: string): string => {
    if (!dateOfBirth) return '';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return `${age - 1} years`;
    }
    
    return `${age} years`;
  };

  // Format date for display
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {/* Selected Patient Display */}
      {selectedPatient ? (
        <Card className="p-4 border-green-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900">
                  {selectedPatient.first_name} {selectedPatient.last_name}
                </h4>
                <div className="text-sm text-green-700 space-y-1 mt-1">
                  {selectedPatient.date_of_birth && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDate(selectedPatient.date_of_birth)} 
                        ({getPatientAge(selectedPatient.date_of_birth)})
                      </span>
                    </div>
                  )}
                  {selectedPatient.medical_record_number && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>MRN: {selectedPatient.medical_record_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ) : (
        /* Patient Selection Interface */
        <div className="space-y-3">
          {/* Dropdown Toggle */}
          <Button
            variant="outline"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Select Patient (Optional)
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )} />
          </Button>

          {/* Dropdown Content */}
          {isOpen && (
            <Card className="p-4 space-y-4">
              {!showCreateForm ? (
                /* Search Interface */
                <>
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search patients by name or MRN..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md"
                    />
                    {isSearching && (
                      <Loader2 className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-muted-foreground" />
                    )}
                  </div>

                  {/* Search Results */}
                  {searchQuery && (
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {searchResults.length > 0 ? (
                        searchResults.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => handleSelectPatient(patient)}
                            className="p-3 border rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <div className="font-medium">
                              {patient.first_name} {patient.last_name}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-4">
                              {patient.date_of_birth && (
                                <span>{getPatientAge(patient.date_of_birth)}</span>
                              )}
                              {patient.medical_record_number && (
                                <span>MRN: {patient.medical_record_number}</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : !isSearching ? (
                        <div className="text-center text-muted-foreground py-4">
                          No patients found
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCreateForm(true)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Patient
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      Skip
                    </Button>
                  </div>
                </>
              ) : (
                /* Create Patient Form */
                <div className="space-y-4">
                  <h4 className="font-semibold">Create New Patient</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name *</label>
                      <input
                        type="text"
                        value={newPatient.first_name}
                        onChange={(e) => setNewPatient(prev => ({ 
                          ...prev, 
                          first_name: e.target.value 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="Enter first name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Last Name *</label>
                      <input
                        type="text"
                        value={newPatient.last_name}
                        onChange={(e) => setNewPatient(prev => ({ 
                          ...prev, 
                          last_name: e.target.value 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Date of Birth</label>
                      <input
                        type="date"
                        value={newPatient.date_of_birth}
                        onChange={(e) => setNewPatient(prev => ({ 
                          ...prev, 
                          date_of_birth: e.target.value 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Medical Record Number</label>
                      <input
                        type="text"
                        value={newPatient.medical_record_number}
                        onChange={(e) => setNewPatient(prev => ({ 
                          ...prev, 
                          medical_record_number: e.target.value 
                        }))}
                        className="w-full mt-1 px-3 py-2 border rounded-md"
                        placeholder="Enter MRN"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreatePatient}
                      disabled={!newPatient.first_name.trim() || !newPatient.last_name.trim() || isCreating}
                      className="flex-1"
                    >
                      {isCreating ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Create Patient
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelCreate}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

    </div>
  );
};