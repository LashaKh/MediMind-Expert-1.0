import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  Activity,
  Eye,
  Download,
  Share2,
  Maximize2
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { cn } from '../../../lib/utils';

interface ABGParameter {
  name: string;
  value: number;
  unit: string;
  normalRange: {
    min: number;
    max: number;
  };
  criticalRange?: {
    min?: number;
    max?: number;
  };
  category: 'acidbase' | 'oxygenation' | 'ventilation' | 'metabolic';
}

interface PremiumResultsVisualizationProps {
  parameters: ABGParameter[];
  patientAge?: number;
  patientSex?: 'male' | 'female';
  interpretation?: {
    primaryDisorder?: string;
    compensation?: string;
    severity?: 'mild' | 'moderate' | 'severe';
    oxygenationStatus?: string;
  };
  className?: string;
}

const categoryConfig = {
  acidbase: {
    label: 'Acid-Base Balance',
    gradient: 'from-blue-500 to-cyan-500',
    icon: Activity
  },
  oxygenation: {
    label: 'Oxygenation',
    gradient: 'from-emerald-500 to-teal-500',
    icon: TrendingUp
  },
  ventilation: {
    label: 'Ventilation',
    gradient: 'from-purple-500 to-pink-500',
    icon: BarChart3
  },
  metabolic: {
    label: 'Metabolic',
    gradient: 'from-orange-500 to-red-500',
    icon: Zap
  }
};

export const PremiumResultsVisualization: React.FC<PremiumResultsVisualizationProps> = ({
  parameters,
  patientAge,
  patientSex,
  interpretation,
  className
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState<ABGParameter | null>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Group parameters by category
  const parametersByCategory = useMemo(() => {
    const grouped: Record<string, ABGParameter[]> = {};
    parameters.forEach(param => {
      if (!grouped[param.category]) {
        grouped[param.category] = [];
      }
      grouped[param.category].push(param);
    });
    return grouped;
  }, [parameters]);

  // Calculate parameter status
  const getParameterStatus = (param: ABGParameter): {
    status: 'normal' | 'abnormal' | 'critical';
    position: number; // 0-1 where 0 is min, 1 is max
    trend: 'low' | 'high' | 'normal';
  } => {
    const { value, normalRange, criticalRange } = param;
    
    // Check for critical values first
    if (criticalRange) {
      if ((criticalRange.min !== undefined && value < criticalRange.min) ||
          (criticalRange.max !== undefined && value > criticalRange.max)) {
        return {
          status: 'critical',
          position: Math.max(0, Math.min(1, (value - normalRange.min) / (normalRange.max - normalRange.min))),
          trend: value < normalRange.min ? 'low' : value > normalRange.max ? 'high' : 'normal'
        };
      }
    }

    // Check normal range
    const isNormal = value >= normalRange.min && value <= normalRange.max;
    const position = Math.max(0, Math.min(1, (value - normalRange.min) / (normalRange.max - normalRange.min)));
    
    return {
      status: isNormal ? 'normal' : 'abnormal',
      position,
      trend: value < normalRange.min ? 'low' : value > normalRange.max ? 'high' : 'normal'
    };
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'normal': return 'text-emerald-600';
      case 'abnormal': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  // Get status background
  const getStatusBackground = (status: string): string => {
    switch (status) {
      case 'normal': return 'bg-emerald-50 border-emerald-200';
      case 'abnormal': return 'bg-yellow-50 border-yellow-200';
      case 'critical': return 'bg-red-50 border-red-200';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  // Render parameter visualization
  const renderParameterViz = (param: ABGParameter, index: number) => {
    const paramStatus = getParameterStatus(param);
    const config = categoryConfig[param.category];

    return (
      <div
        key={`${param.name}-${index}`}
        className={cn(
          "relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]",
          getStatusBackground(paramStatus.status),
          selectedParameter?.name === param.name && "ring-2 ring-blue-500 ring-offset-2"
        )}
        onClick={() => setSelectedParameter(selectedParameter?.name === param.name ? null : param)}
      >
        {/* Parameter Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center`}>
              <config.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-800">{param.name}</h4>
              <p className="text-xs text-slate-600">{param.unit}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {paramStatus.trend === 'low' && <TrendingDown className="h-4 w-4 text-red-500" />}
            {paramStatus.trend === 'high' && <TrendingUp className="h-4 w-4 text-red-500" />}
            {paramStatus.status === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
            {paramStatus.status === 'normal' && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          </div>
        </div>

        {/* Value Display */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className={cn("text-3xl font-bold", getStatusColor(paramStatus.status))}>
              {param.value}
            </span>
            <span className="text-sm text-slate-600">{param.unit}</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Normal: {param.normalRange.min} - {param.normalRange.max} {param.unit}
          </p>
        </div>

        {/* Visual Range Bar */}
        <div className="relative h-3 bg-slate-200 rounded-full overflow-hidden">
          {/* Normal range background */}
          <div 
            className="absolute top-0 bg-emerald-300 h-full rounded-full"
            style={{
              left: '25%',
              width: '50%'
            }}
          />
          
          {/* Current value indicator */}
          <div
            className={cn(
              "absolute top-0 w-1 h-full transition-all duration-500",
              paramStatus.status === 'normal' && "bg-emerald-600",
              paramStatus.status === 'abnormal' && "bg-yellow-600",
              paramStatus.status === 'critical' && "bg-red-600"
            )}
            style={{
              left: `${Math.max(2, Math.min(98, paramStatus.position * 100))}%`,
              transform: 'translateX(-50%)'
            }}
          />
        </div>

        {/* Status Badge */}
        <div className="mt-3 flex justify-between items-center">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              paramStatus.status === 'normal' && "bg-emerald-100 text-emerald-700",
              paramStatus.status === 'abnormal' && "bg-yellow-100 text-yellow-700",
              paramStatus.status === 'critical' && "bg-red-100 text-red-700"
            )}
          >
            {paramStatus.status.charAt(0).toUpperCase() + paramStatus.status.slice(1)}
          </Badge>
          
          {paramStatus.trend !== 'normal' && (
            <Badge variant="outline" className="text-xs">
              {paramStatus.trend === 'low' ? 'Below Normal' : 'Above Normal'}
            </Badge>
          )}
        </div>

        {/* Expanded Details */}
        {selectedParameter?.name === param.name && (
          <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-slate-700">Normal Range</p>
                <p className="text-slate-600">{param.normalRange.min} - {param.normalRange.max}</p>
              </div>
              {param.criticalRange && (
                <div>
                  <p className="font-medium text-slate-700">Critical Range</p>
                  <p className="text-red-600">
                    {param.criticalRange.min && `< ${param.criticalRange.min}`}
                    {param.criticalRange.min && param.criticalRange.max && ' or '}
                    {param.criticalRange.max && `> ${param.criticalRange.max}`}
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>
              <Button size="sm" variant="outline" className="text-xs">
                <Info className="h-3 w-3 mr-1" />
                Reference
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "abg-premium space-y-8 transition-all duration-700 transform",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-emerald-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">Results Visualization</h3>
            <p className="text-slate-600">Interactive blood gas parameter analysis</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Maximize2 className="h-4 w-4 mr-2" />
            Expand
          </Button>
        </div>
      </div>

      {/* Interpretation Summary */}
      {interpretation && (
        <div className="abg-card bg-gradient-to-br from-blue-50 to-purple-50 p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Clinical Interpretation</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {interpretation.primaryDisorder && (
              <div>
                <p className="text-sm font-medium text-slate-700">Primary Disorder</p>
                <p className="text-blue-600 font-semibold">{interpretation.primaryDisorder}</p>
              </div>
            )}
            {interpretation.compensation && (
              <div>
                <p className="text-sm font-medium text-slate-700">Compensation</p>
                <p className="text-blue-600 font-semibold">{interpretation.compensation}</p>
              </div>
            )}
            {interpretation.severity && (
              <div>
                <p className="text-sm font-medium text-slate-700">Severity</p>
                <Badge
                  className={cn(
                    interpretation.severity === 'mild' && "bg-green-100 text-green-700",
                    interpretation.severity === 'moderate' && "bg-yellow-100 text-yellow-700",
                    interpretation.severity === 'severe' && "bg-red-100 text-red-700"
                  )}
                >
                  {interpretation.severity.charAt(0).toUpperCase() + interpretation.severity.slice(1)}
                </Badge>
              </div>
            )}
            {interpretation.oxygenationStatus && (
              <div>
                <p className="text-sm font-medium text-slate-700">Oxygenation</p>
                <p className="text-blue-600 font-semibold">{interpretation.oxygenationStatus}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const hasParams = parametersByCategory[key]?.length > 0;
          if (!hasParams) return null;
          
          return (
            <Button
              key={key}
              variant={activeCategory === key ? "default" : "outline"}
              onClick={() => setActiveCategory(activeCategory === key ? null : key)}
              className={cn(
                "transition-all duration-300",
                activeCategory === key && `bg-gradient-to-r ${config.gradient} text-white border-transparent`
              )}
            >
              <config.icon className="h-4 w-4 mr-2" />
              {config.label}
              <Badge 
                variant="secondary" 
                className="ml-2 text-xs bg-white/20 text-current border-white/20"
              >
                {parametersByCategory[key]?.length || 0}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Parameters Grid */}
      <div className="space-y-8">
        {Object.entries(parametersByCategory).map(([category, categoryParams]) => {
          if (activeCategory && activeCategory !== category) return null;
          
          const config = categoryConfig[category as keyof typeof categoryConfig];
          
          return (
            <div key={category} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center`}>
                  <config.icon className="h-4 w-4 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-slate-800">{config.label}</h4>
                <Badge variant="secondary">
                  {categoryParams.length} parameter{categoryParams.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryParams.map((param, index) => renderParameterViz(param, index))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="abg-card p-6">
        <h4 className="text-lg font-semibold text-slate-800 mb-4">Analysis Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <p className="text-2xl font-bold text-emerald-600">
              {parameters.filter(p => getParameterStatus(p).status === 'normal').length}
            </p>
            <p className="text-sm text-emerald-700">Normal Values</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <p className="text-2xl font-bold text-yellow-600">
              {parameters.filter(p => getParameterStatus(p).status === 'abnormal').length}
            </p>
            <p className="text-sm text-yellow-700">Abnormal Values</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-2xl font-bold text-red-600">
              {parameters.filter(p => getParameterStatus(p).status === 'critical').length}
            </p>
            <p className="text-sm text-red-700">Critical Values</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-2xl font-bold text-blue-600">{parameters.length}</p>
            <p className="text-sm text-blue-700">Total Parameters</p>
          </div>
        </div>
      </div>
    </div>
  );
};