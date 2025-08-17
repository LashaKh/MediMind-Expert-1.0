import React, { useState } from 'react';
import { TrendingUp, BookOpen, ExternalLink, Sparkles, Activity } from 'lucide-react';

interface UpdatedEvidenceSectionProps {
  trialName: string;
  description: string;
  citation: string;
  pubmedLink?: string;
}

export const UpdatedEvidenceSection: React.FC<UpdatedEvidenceSectionProps> = ({
  trialName,
  description,
  citation,
  pubmedLink
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Enhanced citation and PubMed link extraction
  const extractCitationAndLink = (text: string) => {
    // Extract citation in italic format: *Author et al. Journal. Date.*
    const citationMatch = text.match(/\*([^*]+\.)\*/);
    const extractedCitation = citationMatch ? citationMatch[1].trim() : citation;
    
    // Extract PubMed link: [PubMed](url) or direct URL
    const pubmedLinkMatch = text.match(/\[PubMed\]\((https?:\/\/[^)]+)\)/) || 
                           text.match(/(https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/[^)\s]+)/);
    const extractedPubmedLink = pubmedLinkMatch ? pubmedLinkMatch[1] : pubmedLink;
    
    // Clean description by removing ONLY specific citation patterns and PubMed references
    // This is much more precise to avoid removing important medical content like "As per" statements
    const cleanDescription = text
      // Remove complete citation + PubMed pattern: *Author et al. Journal. Date.* [PubMed](url)
      .replace(/\*[^*]*et al[^*]*\*\s*\[PubMed\]\([^)]+\)/g, '')
      // Remove standalone citations that end with a period and year pattern: *Author et al. Journal Year.*
      .replace(/\*[^*]*et al[^*]*\d{4}[^*]*\.\*/g, '')
      // Remove specific journal citation patterns: *Author. Journal. Year;volume:pages.*
      .replace(/\*[^*]*\.\s*[A-Z][^*]*\.\s*\d{4}[^*]*\.\*/g, '')
      // Remove standalone PubMed links
      .replace(/\[PubMed\]\([^)]+\)/g, '')
      .replace(/https?:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/[^)\s]+/g, '')
      .trim();
    
    return {
      citation: extractedCitation,
      pubmedLink: extractedPubmedLink,
      cleanDescription
    };
  };
  
  const { citation: finalCitation, pubmedLink: finalPubmedLink, cleanDescription } = extractCitationAndLink(description);

  return (
    <div 
      className="group relative my-10 mx-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Ambient Glow Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-emerald-200/30 via-teal-200/40 to-cyan-200/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:blur-2xl" />
      
      {/* Floating Orb Effects */}
      <div className="absolute top-4 right-6 w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-60 animate-pulse" />
      <div className="absolute top-8 right-12 w-1 h-1 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full opacity-40 animate-ping" />
      
      {/* Main Container */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/80 via-emerald-50/60 to-teal-50/70 border border-white/40 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(16,185,129,0.12)] hover:shadow-[0_20px_60px_rgba(16,185,129,0.25)] transition-all duration-500 ease-out">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_50%)]" />
        </div>
        
        {/* Premium Border Gradient */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-200/20 via-transparent to-teal-200/20 pointer-events-none" />
        
        {/* Content Container */}
        <div className="relative p-8">
          <div className="flex items-start gap-6">
            {/* Premium Icon Container */}
            <div className="relative flex-shrink-0 group/icon">
              {/* Icon Glow */}
              <div className="absolute -inset-2 bg-gradient-to-br from-emerald-400/30 to-teal-500/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
              
              {/* Icon Background */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-[0_8px_24px_rgba(16,185,129,0.3)] transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 ease-out">
                {/* Inner Glow */}
                <div className="absolute inset-1 bg-gradient-to-br from-white/20 to-transparent rounded-xl" />
                
                {/* Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white drop-shadow-lg transform group-hover/icon:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Sparkle Effect */}
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-emerald-300 opacity-0 group-hover:opacity-100 animate-spin transition-all duration-500" />
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 space-y-5">
              {/* Header Section */}
              <div className="space-y-3">
                {/* Premium Badge */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-30 blur-sm" />
                    <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 rounded-full backdrop-blur-sm">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">
                        Updated Evidence
                      </span>
                    </div>
                  </div>
                  
                  {/* Pulse Indicator */}
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-xs text-emerald-600 font-medium tracking-wider">LIVE</span>
                  </div>
                </div>
                
                {/* Trial Name */}
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight tracking-tight">
                  {trialName}
                </h3>
              </div>
              
              {/* Description */}
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed text-base font-medium tracking-wide">
                  {cleanDescription}
                </p>
              </div>
              
              {/* Elegant Citation Display */}
              {finalCitation && (
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-emerald-100/50 via-teal-100/30 to-emerald-100/50 rounded-2xl blur-sm opacity-60" />
                  <div className="relative bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/60 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg flex-shrink-0">
                        <BookOpen className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold tracking-wider text-emerald-700 uppercase">Reference</span>
                          <div className="w-1 h-1 bg-emerald-400 rounded-full"></div>
                        </div>
                        <cite className="text-sm text-gray-700 font-medium leading-relaxed italic block">
                          {finalCitation}
                        </cite>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
                             {/* Premium PubMed Action */}
               {finalPubmedLink && (
                 <div className="flex justify-end pt-2">
                   <a
                     href={finalPubmedLink}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="group/link relative inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-sm font-bold rounded-2xl shadow-[0_6px_20px_rgba(16,185,129,0.35)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.45)] transform hover:scale-105 hover:-translate-y-1 transition-all duration-400 ease-out overflow-hidden"
                   >
                     {/* Dynamic Glow Effect */}
                     <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity duration-400" />
                     
                     {/* Icon with Animation */}
                     <div className="relative">
                       <ExternalLink className="w-5 h-5 transform group-hover/link:scale-110 group-hover/link:rotate-12 transition-all duration-400" />
                       <div className="absolute -inset-1 bg-white/30 rounded-full opacity-0 group-hover/link:opacity-100 group-hover/link:animate-ping" />
                     </div>
                     
                     <span className="tracking-wide font-bold">Access PubMed</span>
                     
                     {/* Premium Shimmer Effect */}
                     <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -translate-x-full group-hover/link:translate-x-full transition-transform duration-800 ease-out" />
                   </a>
                 </div>
               )}
            </div>
          </div>
        </div>
        
        {/* Bottom Accent */}
        <div className="h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 opacity-60" />
      </div>
    </div>
  );
}; 