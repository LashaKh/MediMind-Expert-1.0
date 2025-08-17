import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Minus,
  BookOpen,
  FileText,
  Users,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Activity,
  XCircle,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface EvidenceLevelData {
  level: string;
  grade: string;
  quality: string;
  description: string;
  studyTypes: string;
  clinicalApplication: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}

const evidenceLevelsData: EvidenceLevelData[] = [
  {
    level: 'A',
    grade: 'High Quality',
    quality: 'Strong Evidence',
    description: 'A preponderance of level I and/or level II studies supports the recommendation. Must include at least 1 level I study.',
    studyTypes: 'Multiple high-quality RCTs, systematic reviews with homogeneity',
    clinicalApplication: 'Strong recommendations for clinical practice',
    color: 'text-emerald-800',
    bgColor: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-300',
    icon: Award
  },
  {
    level: 'B',
    grade: 'Moderate Quality',
    quality: 'Moderate Evidence',
    description: 'A single high-quality randomised controlled trial or a preponderance of level II studies supports the recommendation.',
    studyTypes: 'Single high-quality RCT, well-conducted meta-analyses, limited RCTs',
    clinicalApplication: 'Moderate recommendations with clinical judgment',
    color: 'text-blue-800',
    bgColor: 'from-blue-50 to-sky-50',
    borderColor: 'border-blue-300',
    icon: CheckCircle
  },
  {
    level: 'C',
    grade: 'Limited Quality',
    quality: 'Weak Evidence',
    description: 'A single level II study or a preponderance of level III and IV studies, including statements of consensus by content experts.',
    studyTypes: 'Non-randomized studies, observational data, case-control studies',
    clinicalApplication: 'Weak recommendations requiring careful consideration',
    color: 'text-amber-800',
    bgColor: 'from-amber-50 to-yellow-50',
    borderColor: 'border-amber-300',
    icon: AlertTriangle
  },
  {
    level: 'D',
    grade: 'Very Limited',
    quality: 'Conflicting Evidence',
    description: 'Higher-quality studies conducted on this topic disagree concerning their conclusions. Based on conflicting studies.',
    studyTypes: 'Case series, case reports, conflicting studies',
    clinicalApplication: 'Expert opinion-based recommendations',
    color: 'text-purple-800',
    bgColor: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-300',
    icon: Minus
  },
  {
    level: 'E',
    grade: 'Theoretical',
    quality: 'Expert Opinion',
    description: 'A preponderance of evidence from animal or cadaver studies, conceptual models/principles, or basic sciences/bench research.',
    studyTypes: 'Animal studies, theoretical models, bench research',
    clinicalApplication: 'Guidance only, requires clinical validation',
    color: 'text-slate-800',
    bgColor: 'from-slate-50 to-gray-50',
    borderColor: 'border-slate-300',
    icon: Lightbulb
  },
  {
    level: 'I',
    grade: 'Insufficient',
    quality: 'Insufficient Evidence',
    description: 'Evidence is insufficient or unavailable. No reliable studies exist, or existing studies have major methodological flaws.',
    studyTypes: 'No studies, poor quality studies, insufficient data',
    clinicalApplication: 'Cannot make evidence-based recommendations',
    color: 'text-red-800',
    bgColor: 'from-red-50 to-pink-50',
    borderColor: 'border-red-300',
    icon: XCircle
  }
];

const oxfordLevelsData = [
  {
    level: '1A',
    description: 'SR (with homogeneity) of RCTs',
    therapy: 'Systematic reviews of randomised controlled trials',
    prognosis: 'SR of inception cohort studies; CDR validated in different populations',
    diagnosis: 'SR of Level 1 diagnostic studies; CDR with 1b studies from different centres'
  },
  {
    level: '1B', 
    description: 'Individual RCT (with narrow CI)',
    therapy: 'Individual RCT with narrow Confidence Interval',
    prognosis: 'Individual inception cohort study with >80% follow-up',
    diagnosis: 'Validating cohort study with good reference standards'
  },
  {
    level: '1C',
    description: 'All or none series',
    therapy: 'All or none case series',
    prognosis: 'All or none case series', 
    diagnosis: 'Absolute SpPins and SnNouts'
  },
  {
    level: '2A',
    description: 'SR of cohort studies',
    therapy: 'SR (with homogeneity) of cohort studies',
    prognosis: 'SR of retrospective cohort studies or untreated control groups',
    diagnosis: 'SR of Level >2 diagnostic studies'
  },
  {
    level: '2B',
    description: 'Individual cohort study',
    therapy: 'Individual cohort study (including low quality RCT)',
    prognosis: 'Retrospective cohort study or follow-up of untreated controls',
    diagnosis: 'Exploratory cohort study with good reference standards'
  }
];

/**
 * Comprehensive Levels of Evidence Reference Table with Sliding System
 * Professional medical-grade component for displaying evidence quality standards
 */
const EvidenceLevelsTable: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Define slide data
  const slides = [
    {
      id: 'overview',
      title: 'Evidence Levels Overview',
      subtitle: 'Quality Grades & Clinical Applications',
      icon: GraduationCap,
      color: 'from-indigo-600 via-purple-600 to-blue-600'
    },
    {
      id: 'oxford',
      title: 'Oxford CEBM Levels',
      subtitle: 'Therapy, Prognosis & Diagnosis',
      icon: Users,
      color: 'from-blue-600 to-indigo-600'
    },
    {
      id: 'notes',
      title: 'Clinical Application',
      subtitle: 'Usage Notes & Abbreviations',
      icon: FileText,
      color: 'from-gray-600 to-slate-700'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="evidence-levels-container my-6">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-xl p-4 text-white hover:from-indigo-700 hover:via-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-controls="evidence-levels-content"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold">
                {isOpen ? slides[currentSlide].title : 'Evidence-Based Medicine Reference'}
              </h2>
              <p className="text-white/80 text-sm">
                {isOpen 
                  ? `${slides[currentSlide].subtitle} - Click to hide` 
                  : 'Click to view evidence levels, Oxford CEBM standards & clinical guidelines'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right text-xs text-white/70">
              <div>6 Evidence Levels</div>
              <div>3 Reference Tables</div>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              {isOpen ? (
                <ChevronUp className="w-5 h-5 transition-transform duration-200" />
              ) : (
                <ChevronDown className="w-5 h-5 transition-transform duration-200" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Collapsible Content */}
      <div
        id="evidence-levels-content"
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {isOpen && (
          <div className="bg-white border-x border-b border-indigo-200 rounded-b-xl shadow-xl">
            {/* Navigation Header for Slides */}
            <div className={`bg-gradient-to-r ${slides[currentSlide].color} p-4 text-white relative overflow-hidden border-b border-white/20`}>
              <div className="flex items-center justify-between">
                {/* Icon Section */}
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {React.createElement(slides[currentSlide].icon, { className: "w-5 h-5" })}
                  </div>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevSlide}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-105"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {/* Slide Indicators */}
                  <div className="flex space-x-1 mx-3">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentSlide 
                            ? 'bg-white scale-125' 
                            : 'bg-white/50 hover:bg-white/70'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={nextSlide}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200 hover:scale-105"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
                <div 
                  className="h-full bg-white transition-all duration-300 ease-out"
                  style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                />
              </div>
            </div>

      {/* Sliding Content Container */}
      <div className="bg-white rounded-b-xl shadow-xl overflow-hidden border border-indigo-200 relative">
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {/* Slide 1: Evidence Levels Overview */}
            <div className="w-full flex-shrink-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-800 to-slate-700 text-white">
                      <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                        Evidence Level
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                        Quality Grade
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                        Study Types
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-sm uppercase tracking-wider">
                        Clinical Application
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {evidenceLevelsData.map((evidence, index) => {
                      const Icon = evidence.icon;
                      return (
                        <tr 
                          key={evidence.level}
                          className={`group hover:shadow-lg transition-all duration-300 ${
                            index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                          } hover:bg-gradient-to-r hover:${evidence.bgColor}`}
                        >
                          <td className="px-4 py-4">
                            <div className={`flex items-center space-x-3`}>
                              <div className={`p-2 bg-gradient-to-r ${evidence.bgColor} rounded-lg border-2 ${evidence.borderColor} shadow-md`}>
                                <Icon className={`w-5 h-5 ${evidence.color}`} />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xl font-bold ${evidence.color}`}>
                                    Level {evidence.level}
                                  </span>
                                </div>
                                <span className={`text-sm font-semibold ${evidence.color}`}>
                                  {evidence.quality}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className={`inline-flex px-3 py-2 rounded-full border-2 ${evidence.borderColor} bg-gradient-to-r ${evidence.bgColor}`}>
                              <span className={`font-bold text-sm ${evidence.color}`}>
                                {evidence.grade}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="space-y-2">
                              <p className="text-gray-800 font-medium leading-relaxed">
                                {evidence.studyTypes}
                              </p>
                              <p className="text-gray-600 text-sm leading-relaxed">
                                {evidence.description}
                              </p>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-gray-700 font-medium leading-relaxed">
                              {evidence.clinicalApplication}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Slide 2: Oxford CEBM Levels */}
            <div className="w-full flex-shrink-0">
              <div className="p-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 overflow-hidden shadow-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gradient-to-r from-blue-700 to-indigo-700 text-white">
                          <th className="px-4 py-3 text-left font-bold text-sm">Level</th>
                          <th className="px-4 py-3 text-left font-bold text-sm">Therapy/Prevention</th>
                          <th className="px-4 py-3 text-left font-bold text-sm">Prognosis</th>
                          <th className="px-4 py-3 text-left font-bold text-sm">Diagnosis</th>
                        </tr>
                      </thead>
                      <tbody>
                        {oxfordLevelsData.map((level, index) => (
                          <tr 
                            key={level.level}
                            className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50/50'} hover:bg-blue-100 transition-colors`}
                          >
                            <td className="px-4 py-4">
                              <span className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-lg shadow-md">
                                {level.level}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-gray-800 leading-relaxed">
                              {level.therapy}
                            </td>
                            <td className="px-4 py-4 text-gray-800 leading-relaxed">
                              {level.prognosis}
                            </td>
                            <td className="px-4 py-4 text-gray-800 leading-relaxed">
                              {level.diagnosis}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Slide 3: Clinical Application Notes */}
            <div className="w-full flex-shrink-0">
              <div className="p-8">
                <div className="space-y-6">
                  {/* Introduction */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-indigo-600 rounded-lg">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-indigo-900">Clinical Significance</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      Levels of evidence help target your search at the type of evidence most likely to provide a reliable answer. 
                      Designed as a shortcut for busy clinicians, researchers, and patients to find the likely best evidence.
                    </p>
                  </div>

                  {/* Abbreviations */}
                  <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gray-600 rounded-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">Key Abbreviations</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-gray-700"><strong>SR:</strong> Systematic Review</p>
                        <p className="text-gray-700"><strong>RCT:</strong> Randomised Controlled Trial</p>
                        <p className="text-gray-700"><strong>CDR:</strong> Clinical Decision Rule</p>
                        <p className="text-gray-700"><strong>CI:</strong> Confidence Interval</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-700"><strong>SpPin:</strong> Specific test rules in</p>
                        <p className="text-gray-700"><strong>SnNout:</strong> Sensitive test rules out</p>
                        <p className="text-gray-700"><strong>CEBM:</strong> Centre for Evidence-based Medicine</p>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Usage */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 shadow-lg">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-amber-600 rounded-lg">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-amber-900">Clinical Application</h3>
                    </div>
                    <blockquote className="text-gray-700 italic leading-relaxed border-l-4 border-amber-400 pl-4">
                      "What are we to do when the irresistible force of the need to offer clinical advice meets 
                      the immovable object of flawed evidence? All we can do is our best: give the advice, but alert 
                      the advisees to the flaws in the evidence on which it is based."
                    </blockquote>
                    <p className="text-sm text-amber-700 mt-3 font-medium">
                      — Adapted from Sackett, Straus and Richardson (2000)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvidenceLevelsTable;