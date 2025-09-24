import React from 'react'
import { EditInstructionInputProps } from '../../types/reportEditing'
import VoiceInstructionTextArea from './VoiceInstructionTextArea'

/**
 * EditInstructionInput Component
 * 
 * Voice instruction input component with text editing capability.
 * Integrates with existing Georgian TTS system for voice input.
 * Users can both record voice instructions and type directly in the text area.
 * 
 * Features:
 * - Voice instruction recording with Georgian TTS integration
 * - Direct text input and editing in the same interface
 * - Real-time transcription display
 * - HIPAA-compliant input handling
 */
const EditInstructionInput: React.FC<EditInstructionInputProps> = ({
  onTextInstruction,
  disabled = false
}) => {

  const handleVoiceTranscription = (instruction: string) => {
    // For now, we'll treat voice instructions as text instructions
    // since the VoiceInstructionTextArea already handles the transcription
    onTextInstruction(instruction)
  }

  return (
    <div className="space-y-4">
      {/* Voice Input Mode */}
      <div className="space-y-4">
        <VoiceInstructionTextArea 
          onTranscription={handleVoiceTranscription}
          disabled={disabled}
        />
      </div>
    </div>
  )
}

export default EditInstructionInput