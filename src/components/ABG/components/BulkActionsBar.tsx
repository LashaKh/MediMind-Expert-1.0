import React from 'react';
import { 
  CheckCircle,
  Download,
  GitCompareArrows,
  Trash2
} from 'lucide-react';
import { Button } from '../../ui/button';

interface BulkActionsBarProps {
  selectedCount: number;
  onExport: () => void;
  onCompare: () => void;
  onDelete: () => void;
  onClearSelection: () => void;
  canCompare?: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onExport,
  onCompare,
  onDelete,
  onClearSelection,
  canCompare = true
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="abg-card border-blue-200 bg-blue-50 p-6 animate-in slide-in-from-top-4">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">
              {selectedCount} result(s) selected
            </p>
            <p className="text-sm text-blue-700">Choose an action to apply to selected items</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-white border-blue-200 hover:border-blue-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCompare}
            className="bg-white border-blue-200 hover:border-blue-400"
            disabled={!canCompare || selectedCount < 2}
          >
            <GitCompareArrows className="h-4 w-4 mr-2" />
            Compare
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 bg-white border-red-200 hover:border-red-400"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Selected
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="hover:bg-blue-100"
          >
            Clear Selection
          </Button>
        </div>
      </div>
    </div>
  );
};