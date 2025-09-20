import React, { useState } from 'react';
import { Award, BookOpen, ExternalLink, Crown, Trophy, Star } from 'lucide-react';

interface LandmarkTrialsSectionProps {
  trialName: string;
  description: string;
  citation: string;
  pubmedLink?: string;
}

export const LandmarkTrialsSection: React.FC<LandmarkTrialsSectionProps> = ({
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
      {/* Luxurious Glow Background */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-200/40 via-orange-200/50 to-yellow-200/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out group-hover:blur-2xl" />
      
      {/* Prestige Floating Elements */}
      <div className="absolute top-4 right-6 w-2 h-2 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-70 animate-pulse" />
      <div className="absolute top-8 right-12 w-1 h-1 bg-gradient-to-r from-orange-300 to-yellow-300 rounded-full opacity-50 animate-ping" />
      <div className="absolute top-6 right-20 w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full opacity-40 animate-bounce" />
      
      {/* Prestige Container */}
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/85 via-[#90cdf4]/15 to-[#63b3ed]/20 border border-white/50 rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(43,108,176,0.15)] hover:shadow-[0_20px_60px_rgba(43,108,176,0.3)] transition-all duration-500 ease-out">
        {/* Golden Pattern Overlay */}
        <div className="absolute inset-0 opacity-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(43,108,176,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,179,237,0.1)_0%,transparent_40%)]" />
        </div>
        
        {/* Premium Border Treatment */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#63b3ed]/25 via-transparent to-[#90cdf4]/25 pointer-events-none" />
        
        {/* Luxurious Content */}
        <div className="relative p-8">
          <div className="flex items-start gap-6">
            {/* Prestige Icon Container */}
            <div className="relative flex-shrink-0 group/icon">
              {/* Royal Glow */}
              <div className="absolute -inset-3 bg-gradient-to-br from-amber-400/40 to-orange-500/40 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-600" />
              
              {/* Trophy Background */}
              <div className="relative w-16 h-16 bg-gradient-to-br from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] rounded-3xl shadow-[0_8px_24px_rgba(43,108,176,0.4)] transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out">
                {/* Gold Shimmer */}
                <div className="absolute inset-1 bg-gradient-to-br from-white/30 to-transparent rounded-2xl" />
                <div className="absolute inset-2 bg-gradient-to-br from-[#90cdf4]/20 to-transparent rounded-xl" />
                
                {/* Award Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="w-7 h-7 text-white drop-shadow-xl transform group-hover/icon:scale-110 transition-transform duration-300" />
                </div>
                
                {/* Crown Effect */}
                <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 opacity-0 group-hover:opacity-100 animate-bounce transition-all duration-500" />
              </div>
              
              {/* Floating Stars */}
              <Star className="absolute -top-2 -left-2 w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-60 animate-ping transition-all duration-500" />
              <Star className="absolute -bottom-1 -right-2 w-2 h-2 text-yellow-400 opacity-0 group-hover:opacity-40 animate-pulse transition-all duration-700" />
            </div>
            
            {/* Distinguished Content */}
            <div className="flex-1 space-y-5">
              {/* Prestige Header */}
              <div className="space-y-3">
                {/* Luxury Badge */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-40 blur-sm" />
                    <div className="relative inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/60 rounded-full backdrop-blur-sm">
                      <Trophy className="w-3.5 h-3.5 text-amber-700" />
                      <span className="text-xs font-bold tracking-wider text-amber-900 uppercase">
                        Landmark Trials
                      </span>
                    </div>
                  </div>
                  
                  {/* Prestige Indicator */}
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full animate-pulse shadow-lg" />
                    <span className="text-xs text-amber-700 font-bold tracking-wider">GOLD</span>
                  </div>
                </div>
                
                {/* Trial Name with Royal Treatment */}
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-amber-900 to-gray-900 bg-clip-text text-transparent leading-tight tracking-tight">
                  {trialName}
                </h3>
              </div>
              
                             {/* Distinguished Description */}
               <div className="prose prose-amber max-w-none">
                 <p className="text-gray-700 leading-relaxed text-base font-medium tracking-wide">
                   {cleanDescription}
                 </p>
               </div>
               
               {/* Luxury Citation Display */}
               {finalCitation && (
                 <div className="relative">
                   <div className="absolute -inset-2 bg-gradient-to-r from-amber-100/60 via-orange-100/40 to-yellow-100/60 rounded-2xl blur-sm opacity-70" />
                   <div className="relative bg-gradient-to-r from-amber-50/90 to-orange-50/90 border border-amber-300/70 rounded-2xl p-4 backdrop-blur-sm">
                     <div className="flex items-start gap-3">
                       <div className="p-2 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg shadow-lg flex-shrink-0">
                         <BookOpen className="w-4 h-4 text-white" />
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center gap-2 mb-2">
                           <span className="text-xs font-bold tracking-wider text-amber-800 uppercase">Reference</span>
                           <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                         </div>
                         <cite className="text-sm text-gray-700 font-medium leading-relaxed italic block">
                           {finalCitation}
                         </cite>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
               
               {/* Prestige PubMed Action */}
               {finalPubmedLink && (
                 <div className="flex justify-end pt-2">
                   <a
                     href={finalPubmedLink}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="group/link relative inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] text-white text-sm font-bold rounded-2xl shadow-[0_6px_20px_rgba(43,108,176,0.4)] hover:shadow-[0_12px_32px_rgba(43,108,176,0.6)] transform hover:scale-105 hover:-translate-y-1 transition-all duration-400 ease-out overflow-hidden"
                   >
                     {/* Luxurious Glow Effect */}
                     <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-white/15 to-transparent opacity-0 group-hover/link:opacity-100 transition-opacity duration-400" />
                     
                     {/* Royal Icon Animation */}
                     <div className="relative">
                       <ExternalLink className="w-5 h-5 transform group-hover/link:scale-110 group-hover/link:rotate-12 transition-all duration-400" />
                       <div className="absolute -inset-1 bg-white/40 rounded-full opacity-0 group-hover/link:opacity-100 group-hover/link:animate-ping" />
                     </div>
                     
                     <span className="tracking-wide font-bold">Access PubMed</span>
                     
                     {/* Golden Luxury Shimmer */}
                     <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transform -translate-x-full group-hover/link:translate-x-full transition-transform duration-800 ease-out" />
                   </a>
                 </div>
               )}
            </div>
          </div>
        </div>
        
        {/* Royal Bottom Accent */}
        <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 opacity-70" />
      </div>
    </div>
  );
}; 