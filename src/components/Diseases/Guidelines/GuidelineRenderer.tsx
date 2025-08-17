import React, { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkLikelihoodRatios } from '../../../utils/remark-likelihood-ratios';
import { GuidelineBox } from './GuidelineBox';
import CHA2DS2VAScCalculator from '../../Calculators/CHA2DS2VAScCalculator';
import HIT4TsCalculator from '../../Calculators/HIT4TsCalculator';
import { SIADHCalculator } from '../../Calculators/SIADHCalculator';
import LakeLouiseCriteriaCalculator from '../../Calculators/LakeLouiseCriteriaCalculator';
import { useLikelihoodRatioTables } from '../../../hooks/useLikelihoodRatioTables';

interface GuidelineRendererProps {
  content: string;
}

interface GuidelineData {
  organization: string;
  year?: string;
  evidenceLevel?: string;
  text: string;
}

export const GuidelineRenderer: React.FC<GuidelineRendererProps> = ({ content }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useLikelihoodRatioTables(containerRef, [content]);
  
  // Debug: Find the exact position of calculator text
  const calcIndex = content.indexOf('*Calculator Available*');
  if (calcIndex !== -1) {
  }
  
  // Check if content contains any "As per" guidelines (both ** wrapped and plain) or organization guidelines
  const hasAsPerPattern = /(\*\*as per|^as per|\nas per|\*\*(?:ACC|AHA|AMSSM|SCMR|ESC)(?:[\/\s]*(?:ACC|AHA|AMSSM|SCMR|ESC))*[^*]*\*\*)/gmi.test(content);
  
  // Debug: Test specific patterns from user
  const testPatterns = ["**ESC 2023:**", "**ACC/AHA/AMSSM/SCMR 2024 Guidelines:**", "**ESC 2014 Guidelines:**"];
  testPatterns.forEach(pattern => {
    if (content.includes(pattern)) {
    }
  });
  
  if (!hasAsPerPattern) {
          return (
        <div ref={containerRef} className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}
            components={{
              p: ({ children }) => <p className="text-gray-800 dark:text-gray-200">{children}</p>,
              strong: ({ children }) => <strong className="text-gray-900 dark:text-white font-semibold">{children}</strong>,
              h1: ({ children }) => <h1 className="text-gray-900 dark:text-white">{children}</h1>,
              h2: ({ children }) => <h2 className="text-gray-900 dark:text-white">{children}</h2>,
              h3: ({ children }) => <h3 className="text-gray-900 dark:text-white">{children}</h3>,
              h4: ({ children }) => <h4 className="text-gray-900 dark:text-white">{children}</h4>,
              h5: ({ children }) => <h5 className="text-gray-900 dark:text-white">{children}</h5>,
              h6: ({ children }) => <h6 className="text-gray-900 dark:text-white">{children}</h6>,
              ul: ({ children }) => <ul className="text-gray-800 dark:text-gray-200">{children}</ul>,
              ol: ({ children }) => <ol className="text-gray-800 dark:text-gray-200">{children}</ol>,
              li: ({ children }) => <li className="text-gray-800 dark:text-gray-200">{children}</li>,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );
  }

  // Enhanced content splitting to handle ### and #### titles between As per sections
  const splitContentWithSubtitles = (content: string) => {
    const parts: Array<{ type: 'guideline' | 'subtitle' | 'content', content: string }> = [];
    
    // Split on both "As per", organization guidelines, "### " and "#### " boundaries, but preserve the ### and #### titles
    const segments = content.split(/(?=\*\*as per\s|(?:^|\n)as per\s|\*\*(?:ACC|AHA|AMSSM|SCMR|ESC)(?:[\/\s]*(?:ACC|AHA|AMSSM|SCMR|ESC))*[^*]*\*\*|(?:^|\n)###\s|(?:^|\n)####\s)/gmi);
    
    segments.forEach(segment => {
      if (!segment || !segment.trim()) return;
      
      if (/^(###|####)\s/.test(segment.trim())) {
        // This is a subtitle (both ### and #### headers)
        parts.push({ type: 'subtitle', content: segment });
      } else if (/(\*\*as per|^as per|\nas per|\*\*(?:ACC|AHA|AMSSM|SCMR|ESC)(?:[\/\s]*(?:ACC|AHA|AMSSM|SCMR|ESC))*[^*]*\*\*)/gmi.test(segment)) {
        // This is a guideline section (either "As per" format or organization format)
        parts.push({ type: 'guideline', content: segment });
      } else {
        // This is regular content
        parts.push({ type: 'content', content: segment });
      }
    });
    
    return parts;
  };

  const contentParts = splitContentWithSubtitles(content);
  
  const processedParts = contentParts.map((part, index) => {
    
    if (part.type === 'subtitle') {
      // Check for calculator placeholder in subtitle content
      if (part.content.includes('*Calculator Available*') || part.content.includes('Calculator Available')) {
        
        // Determine which calculator to render based on content context
        const contextText = part.content.toLowerCase();
        
        // Check for SIADH diagnostic criteria
        const isSIADHSection = contextText.includes('siadh') || 
                              contextText.includes('syndrome of inappropriate antidiuretic hormone') ||
                              contextText.includes('diagnostic criteria for syndrome') ||
                              contextText.includes('antidiuretic hormone secretion') ||
                              contextText.includes('hyponatremia') ||
                              contextText.includes('essential criteria') ||
                              contextText.includes('supplemental criteria');
        
        // Check for HIT 4Ts
        const isHIT4TsSection = contextText.includes('4ts') || 
                               contextText.includes('heparin-induced thrombocytopenia') ||
                               contextText.includes('hit') ||
                               contextText.includes('heparin');
        
        // Check for Lake Louise Criteria (specific detection)
        const isLakeLouiseSection = contextText.includes('lake louise') ||
                                   (contextText.includes('lake') && contextText.includes('louise')) ||
                                   contextText.includes('lake louise criteria') ||
                                   contextText.includes('magnetic resonance imaging diagnosis of myocarditis');

        if (isSIADHSection) {
          
          // Extract the title (everything before *Calculator Available*)
          const titleMatch = part.content.match(/^(#{1,6}.*?)(?=\*Calculator Available\*)/);
          const title = titleMatch ? titleMatch[1].trim() : '';
          
          return (
            <div key={index}>
              {title && (
                <div className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}
                    components={{
                      h3: ({children}) => (
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 border-b-2 border-blue-200 dark:border-blue-800 pb-2">
                          {children}
                        </h3>
                      )
                    }}
                  >
                    {title}
                  </ReactMarkdown>
                </div>
              )}
              <SIADHCalculator />
            </div>
          );
        } else if (isHIT4TsSection) {
          
          // Extract the title (everything before *Calculator Available*)
          const titleMatch = part.content.match(/^(#{1,6}.*?)(?=\*Calculator Available\*)/);
          const title = titleMatch ? titleMatch[1].trim() : '';
          
          return (
            <div key={index}>
              {title && (
                <div className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}
                    components={{
                      h3: ({children}) => (
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 border-b-2 border-blue-200 dark:border-blue-800 pb-2">
                          {children}
                        </h3>
                      )
                    }}
                  >
                    {title}
                  </ReactMarkdown>
                </div>
              )}
                          <HIT4TsCalculator />
          </div>
        );
      } else if (isLakeLouiseSection) {
        
        // Extract the title (everything before *Calculator Available*)
        const titleMatch = part.content.match(/^(#{1,6}.*?)(?=\*Calculator Available\*)/);
        const title = titleMatch ? titleMatch[1].trim() : '';
        
        // Extract the description (everything after *Calculator Available*)
        const descriptionMatch = part.content.match(/\*Calculator Available\*\s*([\s\S]*)/);
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        
        return (
          <div key={index}>
            {title && (
              <div className="prose dark:prose-invert text-gray-800 dark:text-gray-200 mb-4">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}
                  components={{
                    h3: ({children}) => (
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 border-b-2 border-blue-200 dark:border-blue-800 pb-2">
                        {children}
                      </h3>
                    )
                  }}
                >
                  {title}
                </ReactMarkdown>
              </div>
            )}
            {description && (
              <div className="prose dark:prose-invert text-gray-800 dark:text-gray-200 mb-6">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}>
                  {description}
                </ReactMarkdown>
              </div>
            )}
            <LakeLouiseCriteriaCalculator />
          </div>
        );
      } else {
        // Default to CHA₂DS₂-VASc calculator for other sections
          
          // Extract the title (everything before *Calculator Available*)
          const titleMatch = part.content.match(/^(#{1,6}.*?)(?=\*Calculator Available\*)/);
          const title = titleMatch ? titleMatch[1].trim() : '';
          
          return (
            <div key={index}>
              {title && (
                <div className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}
                    components={{
                      h3: ({children}) => (
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 border-b-2 border-blue-200 dark:border-blue-800 pb-2">
                          {children}
                        </h3>
                      )
                    }}
                  >
                    {title}
                  </ReactMarkdown>
                </div>
              )}
              <CHA2DS2VAScCalculator />
            </div>
          );
        }
      }
      
      // Regular subtitle processing (no calculator)
      // Differentiate between ### and #### headers for different styling
      const isH3 = part.content.trim().startsWith('###') && !part.content.trim().startsWith('####');
      const isH4 = part.content.trim().startsWith('####');
      
      if (isH3) {
        // Render ### headers with bigger, bolder styling
        return (
          <div key={index} className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}
              components={{
                h3: ({children}) => (
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4 border-b-2 border-blue-200 dark:border-blue-800 pb-2">
                    {children}
                  </h3>
                )
              }}
            >
              {part.content}
            </ReactMarkdown>
          </div>
        );
      } else if (isH4) {
        // Render #### headers with standard subtitle styling
        return (
          <div key={index} className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}
              components={{
                h4: ({children}) => (
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
                    {children}
                  </h4>
                )
              }}
            >
              {part.content}
            </ReactMarkdown>
          </div>
        );
      } else {
        // Fallback for other subtitle types
        return (
          <div key={index} className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}>
              {part.content}
            </ReactMarkdown>
          </div>
        );
      }
    }
    
    if (part.type === 'guideline') {
      // Process guideline sections - now without ###| in the stopping condition
      // Simplified flexible patterns to handle complex organization names
      // Format 1: "**As per [ANYTHING] YEAR guidelines[ANYTHING]:**"
      let asPerMatch = part.content.match(/^\*\*as per\s+(.*?)\s+(\d{4})\s+guidelines.*?:\*\*\s*([\s\S]*?)(?=\*\*\s*$|\*\*\s*as per|$)/i);
      
      if (!asPerMatch) {
        // Try plain format without ** markdown
        asPerMatch = part.content.match(/^as per\s+(.*?)\s+(\d{4})\s+guidelines.*?[,:]\s*([\s\S]*?)(?=\nas per|$)/i);
      }
      
      // Format 2: Organization patterns like "**ESC 2023:**" or "**ACC/AHA/AMSSM/SCMR 2024 Guidelines:**"
      let orgMatch = null;
      if (!asPerMatch) {
        orgMatch = part.content.match(/^\*\*((?:ACC|AHA|AMSSM|SCMR|ESC)(?:[\/\s]*(?:ACC|AHA|AMSSM|SCMR|ESC))*)\s*([^*]*?)\*\*\s*([\s\S]*?)$/i);
        if (orgMatch) {
        }
      }

       if (asPerMatch) {
         const [, organizationRaw, yearRaw, restOfTextRaw] = asPerMatch;
         
         // Safety checks for undefined values
         const organization = organizationRaw?.trim() || 'Medical Guidelines';
         const year = yearRaw?.trim() || undefined;
         const restOfText = restOfTextRaw?.trim() || '';

         const guideline: GuidelineData = {
           organization,
           year,
           evidenceLevel: undefined, // Remove card-level evidence level
           text: restOfText
         };

         return (
           <GuidelineBox
             key={index}
             organization={guideline.organization}
             year={guideline.year}
             content={guideline.text}
             evidenceLevel={undefined}
             enhanced={true}
           />
         );
       } else if (orgMatch) {
         // Handle organization patterns like "**ESC 2023:**" or "**ACC/AHA/AMSSM/SCMR 2024 Guidelines:**"
         const [, organizationFull, details, restOfText] = orgMatch;
         
         // Extract year from details if present
         const yearMatch = details?.match(/(\d{4})/);
         const year = yearMatch ? yearMatch[1] : undefined;
         
         // Clean up organization name (take first if multiple)
         const organization = organizationFull?.split(/[\/\s]/)[0] || 'Medical Guidelines';
         
         const guideline: GuidelineData = {
           organization,
           year,
           evidenceLevel: undefined,
           text: restOfText?.trim() || ''
         };

         return (
           <GuidelineBox
             key={index}
             organization={`${organizationFull} ${details}`.trim()}
             year={year}
             content={guideline.text}
             evidenceLevel={undefined}
             enhanced={true}
           />
         );
       } else {
         // Not a recognized guideline, render as regular content
         return (
           <div key={index} className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
             <ReactMarkdown remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}>
               {part.content}
             </ReactMarkdown>
           </div>
         );
       }
     }
     
     // Regular content parts
     return (
       <div key={index} className="prose dark:prose-invert text-gray-800 dark:text-gray-200">
         <ReactMarkdown 
           remarkPlugins={[remarkGfm, remarkLikelihoodRatios]}
           components={{
             p: ({ children }) => {
               // Improved text extraction - handle all React children types
               const extractTextFromReactNode = (node: React.ReactNode): string => {
                 if (typeof node === 'string') return node;
                 if (typeof node === 'number') return node.toString();
                 if (Array.isArray(node)) return node.map(extractTextFromReactNode).join('');
                 if (node && typeof node === 'object' && 'props' in node) {
                   return extractTextFromReactNode(node.props.children);
                 }
                 return '';
               };

               const paragraphText = extractTextFromReactNode(children);

               // Check for calculator placeholder with both variations
               if (paragraphText.includes('*Calculator Available*') || paragraphText.includes('Calculator Available')) {
                  
                  // Determine which calculator to render based on content context
                  const allContent = content.toLowerCase();
                  const isHIT4TsSection = allContent.includes('4ts') || 
                                         allContent.includes('heparin-induced thrombocytopenia') ||
                                         allContent.includes('hit') ||
                                         paragraphText.toLowerCase().includes('heparin');
                  
                  // Check for Lake Louise Criteria (specific detection)
                  const isLakeLouiseSection = allContent.includes('lake louise') ||
                                             (allContent.includes('lake') && allContent.includes('louise')) ||
                                             allContent.includes('lake louise criteria') ||
                                             allContent.includes('magnetic resonance imaging diagnosis of myocarditis') ||
                                             paragraphText.toLowerCase().includes('lake louise');

                  if (isLakeLouiseSection) {
                    return (
                      <div className="my-8">
                        <LakeLouiseCriteriaCalculator />
                      </div>
                    );
                  } else if (isHIT4TsSection) {
                    return (
                      <div className="my-8">
                        <HIT4TsCalculator />
                      </div>
                    );
                  } else {
                    // Default to CHA₂DS₂-VASc calculator
                    return (
                      <div className="my-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200 shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                          <h3 className="text-white font-bold text-xl flex items-center space-x-3">
                            <span>🧮</span>
                            <span>CHA₂DS₂-VASc Calculator</span>
                          </h3>
                          <p className="text-blue-100 mt-2">Interactive stroke risk assessment tool</p>
                        </div>
                        <div className="p-6">
                          <CHA2DS2VAScCalculator />
                        </div>
                      </div>
                    );
                  }
                }
               
               return <p className="text-gray-800 dark:text-gray-200">{children}</p>;
             },
             strong: ({ children }) => <strong className="text-gray-900 dark:text-white font-semibold">{children}</strong>,
             h1: ({ children }) => <h1 className="text-gray-900 dark:text-white">{children}</h1>,
             h2: ({ children }) => <h2 className="text-gray-900 dark:text-white">{children}</h2>,
             h3: ({ children }) => <h3 className="text-gray-900 dark:text-white">{children}</h3>,
             h4: ({ children }) => <h4 className="text-gray-900 dark:text-white">{children}</h4>,
             h5: ({ children }) => <h5 className="text-gray-900 dark:text-white">{children}</h5>,
             h6: ({ children }) => <h6 className="text-gray-900 dark:text-white">{children}</h6>,
             ul: ({ children }) => <ul className="text-gray-800 dark:text-gray-200">{children}</ul>,
             ol: ({ children }) => <ol className="text-gray-800 dark:text-gray-200">{children}</ol>,
             li: ({ children }) => <li className="text-gray-800 dark:text-gray-200">{children}</li>,
             // Professional table components for medical guidelines
             table: ({ children, ...props }) => (
               <div className="overflow-x-auto my-6 rounded-lg shadow-md border border-gray-200">
                 <table className="w-full border-collapse bg-white" {...props}>
                   {children}
                 </table>
               </div>
             ),
             thead: ({ children, ...props }) => (
               <thead className="bg-gradient-to-r from-blue-50 to-indigo-50" {...props}>
                 {children}
               </thead>
             ),
             tbody: ({ children, ...props }) => (
               <tbody {...props}>
                 {children}
               </tbody>
             ),
             tr: ({ children, ...props }) => (
               <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors" {...props}>
                 {children}
               </tr>
             ),
             th: ({ children, ...props }) => (
               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b-2 border-blue-200" {...props}>
                 {children}
               </th>
             ),
             td: ({ children, ...props }) => (
               <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100" {...props}>
                 {children}
               </td>
             ),
           }}
         >
           {part.content}
         </ReactMarkdown>
       </div>
     );
   });

  return <div ref={containerRef} className="space-y-4">{processedParts}</div>;
};