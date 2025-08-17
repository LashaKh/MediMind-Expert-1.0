import React from 'react';
import { Card } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { cn } from '../../../../lib/utils';

interface ParameterCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  minValue?: number | string;
  maxValue?: number | string;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  placeholder?: {
    min: string;
    max: string;
  };
  step?: string;
  inputProps?: {
    min?: string;
    max?: string;
  };
}

export const ParameterCard: React.FC<ParameterCardProps> = ({
  title,
  description,
  icon,
  color,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholder = { min: '', max: '' },
  step,
  inputProps = {}
}) => {
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMinChange(value ? parseFloat(value) : undefined);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onMaxChange(value ? parseFloat(value) : undefined);
  };

  return (
    <Card className={cn(
      "p-4 bg-gradient-to-br border",
      `from-${color}-50 to-${color}-50 border-${color}-200/60`
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "p-2 bg-gradient-to-br rounded-lg",
          `from-${color}-500 to-${color}-500`
        )}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div>
          <Label className="text-sm font-bold text-slate-800">{title}</Label>
          <p className="text-xs text-slate-600">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Minimum</label>
          <Input
            type="number"
            step={step}
            placeholder={placeholder.min}
            value={minValue || ''}
            onChange={handleMinChange}
            className={cn(
              "bg-white/80 border focus:ring",
              `border-${color}-200 focus:border-${color}-300 focus:ring-${color}-200`
            )}
            {...inputProps}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Maximum</label>
          <Input
            type="number"
            step={step}
            placeholder={placeholder.max}
            value={maxValue || ''}
            onChange={handleMaxChange}
            className={cn(
              "bg-white/80 border focus:ring",
              `border-${color}-200 focus:border-${color}-300 focus:ring-${color}-200`
            )}
            {...inputProps}
          />
        </div>
      </div>
    </Card>
  );
};