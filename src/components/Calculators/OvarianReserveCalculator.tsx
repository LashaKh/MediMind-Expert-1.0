import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator, Info, AlertTriangle, CheckCircle, Baby, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { MobileInput } from '../ui/mobile-form';
import { Badge } from '../ui/badge';
import { CalculatorResultShare } from './CalculatorResultShare';
import { safeAsync, ErrorSeverity } from '../../lib/utils/errorHandling';
import { calculateOBGYN, validateOBGYNInput } from '../../services/obgynCalculatorService';
import type { OvarianReserveInput, OvarianReserveResult } from '../../types/obgyn-calculators';

interface FormData {
  age: string;
  amh: string;
  antalFolicleCount: string;
  fsh: string;
  estradiol: string;
  inhibinB: string;
}

const OvarianReserveCalculatorComponent: React.FC = () => {
  const { t } = useTranslation();
  
  // Helper function to access nested translations
  const getOvarianText = useCallback((key: string, options?: { returnObjects?: boolean }): string => {
    const result = t(`calculators.ObGyn.ovarianReserveCalculator.${key}`, options);
    return typeof result === 'string' ? result : key;
  }, [t]);
  
  // Helper function to get array translations
  const getOvarianArray = useCallback((key: string): string[] => {
    const result = t(`calculators.ObGyn.ovarianReserveCalculator.${key}`, { returnObjects: true });
    return Array.isArray(result) ? result : [];
  }, [t]);
  
  const [activeTab, setActiveTab] = useState<'calculator' | 'about'>('calculator');
  const [formData, setFormData] = useState<FormData>({
    age: '',
    amh: '',
    antalFolicleCount: '',
    fsh: '',
    estradiol: '',
    inhibinB: ''
  });
  
  const [result, setResult] = useState<OvarianReserveResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setErrors([]);
    setResult(null);

    const [calculationResult, error] = await safeAsync(
      async () => {
        // Create input for validation - keep as strings as expected by the interface
        const input: OvarianReserveInput = {
          age: formData.age,
          amh: formData.amh,
          antalFolicleCount: formData.antalFolicleCount || undefined,
          fsh: formData.fsh || undefined,
          estradiol: formData.estradiol || undefined,
          inhibinB: formData.inhibinB || undefined
        };

        // Validate input
        const validation = validateOBGYNInput('ovarian-reserve', input);
        if (!validation.isValid) {
          setErrors(validation.errors);
          throw new Error('Validation failed');
        }

        // Calculate result
        const calcResult = calculateOBGYN('ovarian-reserve', input);
        
        // Process the result - parse strings to numbers for classification logic
        const amh = parseFloat(input.amh);
        const afc = input.antalFolicleCount ? parseFloat(input.antalFolicleCount) : 0;
        const fsh = input.fsh ? parseFloat(input.fsh) : 0;

        // Simple classification logic
        let category: 'low' | 'normal' | 'high';
        if (amh < 1.0 || afc < 7 || fsh > 10) {
          category = 'low';
        } else if (amh > 3.0 || afc > 15) {
          category = 'high';
        } else {
          category = 'normal';
        }

        return {
          reserveCategory: category,
          reproductivePotential: getOvarianText(category),
          treatmentOptions: getOvarianArray(`${category}ReserveDetails`),
          counselingPoints: [],
          value: amh,
          unit: 'ng/mL',
          category: category as 'low' | 'moderate' | 'high',
          interpretation: getOvarianText(`${category}Interpretation`),
          recommendations: getOvarianArray(`${category}Recommendations`),
          references: getOvarianArray('references')
        };
      },
      {
        context: 'calculate ovarian reserve',
        showToast: true,
        severity: ErrorSeverity.HIGH
      }
    );

    if (error) {
      setErrors([getOvarianText('calculationError')]);
    } else {
      setResult(calculationResult);
    }
    
    setIsLoading(false);
  }, [formData, getOvarianText, getOvarianArray]);

  const handleReset = useCallback(() => {
    setFormData({
      age: '',
      amh: '',
      antalFolicleCount: '',
      fsh: '',
      estradiol: '',
      inhibinB: ''
    });
    setResult(null);
    setErrors([]);
  }, []);

  const getReserveColor = useMemo(() => (level: string) => {
    switch (level) {
      case 'low': return 'text-red-600';
      case 'normal': return 'text-green-600';
      case 'high': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  }, []);

  const getReserveIcon = useMemo(() => (level: string) => {
    switch (level) {
      case 'low': return '⬇️';
      case 'normal': return '✅';
      case 'high': return '⬆️';
      default: return '❓';
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'calculator' | 'about')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calculator">{getOvarianText('calculatorTab')}</TabsTrigger>
          <TabsTrigger value="about">{getOvarianText('aboutTab')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calculator" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Baby className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">{getOvarianText('title')}</CardTitle>
                  <CardDescription>{getOvarianText('description')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    {getOvarianText('validationErrors')}
                  </div>
                  <ul className="list-disc list-inside text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid xl:grid-cols-2 gap-4 sm:gap-6">
                {/* Primary Markers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{getOvarianText('primaryMarkersTitle')}</h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getOvarianText('ageLabel')}
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder={getOvarianText('agePlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500">{getOvarianText('ageDescription')}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getOvarianText('amhLabel')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.amh}
                      onChange={(e) => handleInputChange('amh', e.target.value)}
                      placeholder={getOvarianText('amhPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500">{getOvarianText('amhDescription')}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getOvarianText('antralFollicleCountLabel')}
                    </label>
                    <input
                      type="number"
                      value={formData.antalFolicleCount}
                      onChange={(e) => handleInputChange('antalFolicleCount', e.target.value)}
                      placeholder={getOvarianText('antralFollicleCountPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500">{getOvarianText('antralFollicleCountDescription')}</p>
                  </div>
                </div>

                {/* Secondary Markers */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">{getOvarianText('secondaryMarkersTitle')}</h3>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getOvarianText('fshLabel')}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.fsh}
                      onChange={(e) => handleInputChange('fsh', e.target.value)}
                      placeholder={getOvarianText('fshPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500">{getOvarianText('fshDescription')}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getOvarianText('estradiolLabel')}
                    </label>
                    <input
                      type="number"
                      value={formData.estradiol}
                      onChange={(e) => handleInputChange('estradiol', e.target.value)}
                      placeholder={getOvarianText('estradiolPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500">{getOvarianText('estradiolDescription')}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {getOvarianText('inhibinBLabel')}
                    </label>
                    <input
                      type="number"
                      value={formData.inhibinB}
                      onChange={(e) => handleInputChange('inhibinB', e.target.value)}
                      placeholder={getOvarianText('inhibinBPlaceholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <p className="text-xs text-gray-500">{getOvarianText('inhibinBDescription')}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={handleCalculate} 
                  disabled={isLoading || !formData.age || !formData.amh}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {getOvarianText('calculating')}
                    </>
                  ) : (
                    <>
                      <Calculator className="w-4 h-4 mr-2" />
                      {getOvarianText('calculateButton')}
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  {getOvarianText('resetButton')}
                </Button>
              </div>

              {/* Results */}
              {result && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{getOvarianText('resultsTitle')}</h3>
                  </div>
                  
                  <div className="grid xl:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{getOvarianText('reserveCategory')}</h4>
                      <p className="text-lg font-semibold">{result.reproductivePotential}</p>
                      
                      <h4 className="font-medium text-gray-700 mt-4 mb-2">{getOvarianText('interpretationTitle')}</h4>
                      <p className="text-gray-600">{result.interpretation}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">{getOvarianText('treatmentOptionsTitle')}</h4>
                      <ul className="space-y-1">
                        {result.treatmentOptions.map((option, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-gray-600">{option}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <h4 className="font-medium text-gray-700 mt-4 mb-2">{getOvarianText('recommendationsTitle')}</h4>
                      <ul className="space-y-1">
                        {result.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                            <span className="text-sm text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                {getOvarianText('aboutTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{getOvarianText('purposeTitle')}</h3>
                <p className="text-gray-600">{getOvarianText('purposeText')}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{getOvarianText('parametersTitle')}</h3>
                <ul className="space-y-2">
                  {getOvarianArray('parameters').map((param, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-600">{param}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">{getOvarianText('interpretationGuideTitle')}</h3>
                
                <div className="grid gap-4">
                  <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">{getOvarianText('lowReserveTitle')}</h4>
                    <p className="text-red-700 text-sm">{getOvarianText('lowReserveDescription')}</p>
                  </div>
                  
                  <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">{getOvarianText('normalReserveTitle')}</h4>
                    <p className="text-green-700 text-sm">{getOvarianText('normalReserveDescription')}</p>
                  </div>
                  
                  <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">{getOvarianText('highReserveTitle')}</h4>
                    <p className="text-orange-700 text-sm">{getOvarianText('highReserveDescription')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{getOvarianText('limitationsTitle')}</h3>
                <ul className="space-y-2">
                  {getOvarianArray('limitations').map((limitation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span className="text-gray-600">{limitation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">{getOvarianText('referencesTitle')}</h3>
                <ul className="space-y-2">
                  {getOvarianArray('references').map((reference, index) => (
                    <li key={index} className="text-sm text-gray-600">
                      {index + 1}. {reference}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Memoized component to prevent unnecessary re-renders
export const OvarianReserveCalculator = React.memo(OvarianReserveCalculatorComponent);

export default OvarianReserveCalculator; 