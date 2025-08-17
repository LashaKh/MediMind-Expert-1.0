import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, CheckCircle2, Hash } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Card } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { ABGSearchFilters, PatientInfo } from '../../../../types/abg';

interface PatientSectionProps {
  filters: ABGSearchFilters;
  updateFilter: (key: keyof ABGSearchFilters, value: any) => void;
  patients: PatientInfo[];
}

const genders = ['Male', 'Female'];

export const PatientSection: React.FC<PatientSectionProps> = ({
  filters,
  updateFilter,
  patients
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl mb-4">
          <User className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Patient Context</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          Filter by patient demographics and medical record information
        </p>
      </div>

      {/* Patient Selection */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <Label className="text-lg font-bold text-slate-800">Patient Selection</Label>
            <p className="text-sm text-slate-600">Filter results by specific patient</p>
          </div>
        </div>
        
        <select
          value={filters.patientId || ''}
          onChange={(e) => updateFilter('patientId', e.target.value || undefined)}
          className="w-full p-4 bg-white/80 border border-emerald-200 rounded-xl focus:border-emerald-300 focus:ring-emerald-200 text-slate-800"
        >
          <option value="">All Patients ({patients.length} total)</option>
          {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
              {patient.last_name}, {patient.first_name}
              {patient.medical_record_number && ` • MRN: ${patient.medical_record_number}`}
            </option>
          ))}
        </select>

        {filters.patientId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl border border-emerald-200"
          >
            <div className="flex items-center gap-2 text-emerald-800">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold">Patient-Specific Search Active</span>
            </div>
            <p className="text-sm text-emerald-700 mt-1">
              Results filtered to selected patient's ABG records only
            </p>
          </motion.div>
        )}
      </Card>

      {/* Additional Patient Filters */}
      <div className="grid grid-cols-2 gap-4">
        {/* Age Range */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg">
              <Hash className="h-5 w-5 text-white" />
            </div>
            <div>
              <Label className="text-base font-bold text-slate-800">Age Range</Label>
              <p className="text-xs text-slate-600">Filter by patient age</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Min Age</label>
              <Input
                type="number"
                min="0"
                max="150"
                placeholder="0"
                value={filters.ageMin || ''}
                onChange={(e) => updateFilter('ageMin', e.target.value ? parseInt(e.target.value) : undefined)}
                className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">Max Age</label>
              <Input
                type="number"
                min="0"
                max="150"
                placeholder="150"
                value={filters.ageMax || ''}
                onChange={(e) => updateFilter('ageMax', e.target.value ? parseInt(e.target.value) : undefined)}
                className="bg-white/80 border-blue-200 focus:border-blue-300 focus:ring-blue-200"
              />
            </div>
          </div>
        </Card>

        {/* Gender */}
        <Card className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200/60">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <Label className="text-base font-bold text-slate-800">Gender</Label>
              <p className="text-xs text-slate-600">Filter by gender</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {genders.map((gender) => (
              <button
                key={gender}
                onClick={() => updateFilter('gender', filters.gender === gender ? undefined : gender)}
                className={cn(
                  "p-4 rounded-xl border transition-all text-center group",
                  filters.gender === gender
                    ? "bg-pink-100 border-pink-300 text-pink-800"
                    : "bg-white/70 border-pink-200/60 hover:bg-pink-50 hover:border-pink-300"
                )}
              >
                <Users className={cn(
                  "h-6 w-6 mx-auto mb-2 transition-colors",
                  filters.gender === gender
                    ? "text-pink-600"
                    : "text-pink-400 group-hover:text-pink-500"
                )} />
                <div className="font-medium">{gender}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};