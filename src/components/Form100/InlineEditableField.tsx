/**
 * InlineEditableField Component
 *
 * Allows clicking on "Value_to_be_filled" warning fields to edit them inline.
 * - Transforms into input field on click
 * - Auto-saves on blur or Enter key
 * - Displays as plain text once filled
 */

import React, { useState, useRef, useEffect } from 'react';

interface InlineEditableFieldProps {
  fieldName?: string;
  fieldId: string;
  onSave: (fieldId: string, value: string) => void;
}

export const InlineEditableField: React.FC<InlineEditableFieldProps> = ({
  fieldName,
  fieldId,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset value and focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // Clear the input value when starting to edit
      setValue('');
      // Focus the input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('InlineEditableField clicked:', fieldId, fieldName);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (value.trim()) {
      onSave(fieldId, value.trim());
      setValue(''); // Reset value after saving
      setIsEditing(false);
    } else {
      // If empty, just cancel editing
      setValue('');
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setValue('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={fieldName || 'Enter value...'}
        className="inline-flex items-center bg-white dark:bg-slate-800 border-2 border-[#2b6cb0] dark:border-[#63b3ed] rounded-md px-3 py-1 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#2b6cb0]/50 dark:focus:ring-[#63b3ed]/50 transition-all duration-200 min-w-[200px]"
        style={{
          minHeight: '32px'
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center space-x-1 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 text-amber-800 dark:text-amber-200 px-3 py-1 rounded-md border border-amber-300 dark:border-amber-600 font-semibold text-sm cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-105 animate-pulse"
      title={`Click to fill: ${fieldName || 'Unknown field'}`}
      style={{
        pointerEvents: 'auto',
        zIndex: 10,
        position: 'relative'
      }}
    >
      <span className="empty-field-text">Value_to_be_filled</span>
      <span className="empty-field-icon text-amber-600 dark:text-amber-400" role="img" aria-label="Warning">
        ⚠️
      </span>
    </button>
  );
};

export default InlineEditableField;
