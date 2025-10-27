import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MedicalMarkdownRendererProps {
  content: string;
  className?: string;
  onSourceClick?: (sourceNumber: number) => void;
}

export const MedicalMarkdownRenderer: React.FC<MedicalMarkdownRendererProps> = ({
  content,
  className = '',
  onSourceClick
}) => {
  // Enhanced medical-specific table renderer
  const TableRenderer = ({ children, ...props }: any) => (
    <div className="table-container overflow-x-auto rounded-lg shadow-lg my-6 border border-gray-200 dark:border-gray-700">
      <table className="w-full border-collapse bg-white dark:bg-gray-800" {...props}>
        {children}
      </table>
    </div>
  );

  // Medical table header renderer
  const TableHeaderRenderer = ({ children, ...props }: any) => (
    <thead {...props}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          className: "bg-gradient-to-r from-[#1a365d] via-[#2b6cb0] to-[#63b3ed] text-white"
        })
      )}
    </thead>
  );

  // Medical table header cell renderer
  const TableHeaderCellRenderer = ({ children, ...props }: any) => (
    <th
      className="px-4 py-3 text-left font-semibold text-sm uppercase tracking-wide border-b border-[#63b3ed]"
      {...props}
    >
      {children}
    </th>
  );

  // Medical table body renderer
  const TableBodyRenderer = ({ children, ...props }: any) => (
    <tbody {...props}>
      {React.Children.map(children, (child, rowIndex) =>
        React.cloneElement(child, {
          className: `transition-colors duration-200 ${
            rowIndex % 2 === 0
              ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-[#90cdf4]/10 dark:hover:bg-[#2b6cb0]/20'
              : 'bg-white dark:bg-gray-800 hover:bg-[#90cdf4]/10 dark:hover:bg-[#2b6cb0]/20'
          }`
        })
      )}
    </tbody>
  );

  // Medical table cell renderer
  const TableCellRenderer = ({ children, ...props }: any) => (
    <td 
      className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 text-sm"
      {...props}
    >
      {children}
    </td>
  );

  // Enhanced heading renderer for medical sections
  const HeadingRenderer = ({ level, children, ...props }: any) => {
    const baseClasses = "font-semibold text-gray-900 dark:text-white border-b-2 pb-2 mb-4";
    const levelClasses = {
      1: "text-3xl mt-8 mb-6 border-[#2b6cb0] text-[#1a365d] dark:text-[#90cdf4]",
      2: "text-2xl mt-6 mb-4 border-[#63b3ed] text-[#2b6cb0] dark:text-[#63b3ed]",
      3: "text-xl mt-5 mb-3 border-[#90cdf4] text-[#2b6cb0] dark:text-[#63b3ed]",
      4: "text-lg mt-4 mb-2 border-gray-300 text-gray-800 dark:text-gray-200",
      5: "text-base mt-3 mb-2 border-gray-200 text-gray-700 dark:text-gray-300",
      6: "text-sm mt-2 mb-1 border-gray-100 text-gray-600 dark:text-gray-400"
    };

    const Tag = `h${level}` as keyof JSX.IntrinsicElements;
    
    return (
      <Tag 
        className={`${baseClasses} ${levelClasses[level as keyof typeof levelClasses]}`}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (typeof child === 'string') {
            // Add medical icons for specific section types
            if (child.toLowerCase().includes('pathophysiology')) {
              return (
                <span className="flex items-center gap-2">
                  <span className="text-red-500">🧬</span>
                  {child}
                </span>
              );
            }
            if (child.toLowerCase().includes('clinical') || child.toLowerCase().includes('findings')) {
              return (
                <span className="flex items-center gap-2">
                  <span className="text-green-500">🩺</span>
                  {child}
                </span>
              );
            }
            if (child.toLowerCase().includes('treatment') || child.toLowerCase().includes('management')) {
              return (
                <span className="flex items-center gap-2">
                  <span className="text-blue-500">💊</span>
                  {child}
                </span>
              );
            }
            if (child.toLowerCase().includes('score') || child.toLowerCase().includes('calculation')) {
              return (
                <span className="flex items-center gap-2">
                  <span className="text-purple-500">📊</span>
                  {child}
                </span>
              );
            }
          }
          return child;
        })}
      </Tag>
    );
  };

  // Enhanced list renderer for medical content
  const ListRenderer = ({ ordered, children, ...props }: any) => {
    const Tag = ordered ? 'ol' : 'ul';
    return (
      <Tag 
        className={`mb-4 space-y-2 ${ordered ? 'ml-6 list-decimal' : 'ml-6 list-none'}`}
        {...props}
      >
        {children}
      </Tag>
    );
  };

  // Medical list item renderer
  const ListItemRenderer = ({ children, ...props }: any) => (
    <li 
      className="relative pl-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300"
      {...props}
    >
      <span className="absolute left-[-1rem] text-blue-500 font-bold">•</span>
      {children}
    </li>
  );

  // Enhanced paragraph renderer for medical content
  const ParagraphRenderer = ({ children, ...props }: any) => {
    // Check if this is a special medical paragraph
    const textContent = React.Children.toArray(children).join('');
    
    if (textContent.includes('**Pathophysiology') || textContent.includes('**Background')) {
      return (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-500 p-4 rounded-r-lg my-4 shadow-sm">
          <p className="text-sm leading-7 text-gray-800 dark:text-gray-200 mb-0" {...props}>
            {children}
          </p>
        </div>
      );
    }
    
    if (textContent.includes('**Clinical') || textContent.includes('**Findings') || textContent.includes('**Symptoms')) {
      return (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 p-4 rounded-r-lg my-4 shadow-sm">
          <p className="text-sm leading-7 text-gray-800 dark:text-gray-200 mb-0" {...props}>
            {children}
          </p>
        </div>
      );
    }
    
    if (textContent.includes('**Treatment') || textContent.includes('**Management') || textContent.includes('**Therapy')) {
      return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg my-4 shadow-sm">
          <p className="text-sm leading-7 text-gray-800 dark:text-gray-200 mb-0" {...props}>
            {children}
          </p>
        </div>
      );
    }
    
    if (textContent.includes('**Score') || textContent.includes('**Calculation') || textContent.includes('**Risk')) {
      return (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-l-4 border-purple-500 p-4 rounded-r-lg my-4 shadow-sm">
          <p className="text-sm leading-7 text-gray-800 dark:text-gray-200 mb-0" {...props}>
            {children}
          </p>
        </div>
      );
    }
    
    return (
      <p className="mb-4 text-sm leading-7 text-gray-700 dark:text-gray-300" {...props}>
        {children}
      </p>
    );
  };

  // Enhanced strong text renderer for medical terms
  const StrongRenderer = ({ children, ...props }: any) => (
    <strong
      className="font-semibold text-[#1a365d] dark:text-[#90cdf4] bg-[#90cdf4]/20 dark:bg-[#2b6cb0]/30 px-1 py-0.5 rounded"
      {...props}
    >
      {children}
    </strong>
  );

  // Enhanced code renderer for medical values
  const CodeRenderer = ({ children, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    
    if (match) {
      return (
        <div className="rounded-lg overflow-hidden shadow-lg my-4">
          <SyntaxHighlighter
            style={tomorrow}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    }
    
    return (
      <code 
        className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-2 py-1 rounded text-sm font-mono border"
        {...props}
      >
        {children}
      </code>
    );
  };

  // Blockquote renderer for medical guidelines
  const BlockquoteRenderer = ({ children, ...props }: any) => (
    <blockquote 
      className="border-l-4 border-amber-500 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 pl-4 py-3 my-4 italic text-gray-700 dark:text-gray-300 rounded-r-lg shadow-sm"
      {...props}
    >
      <div className="flex items-start gap-2">
        <span className="text-amber-500 text-lg">💡</span>
        <div>{children}</div>
      </div>
    </blockquote>
  );

  // Handle source reference clicks
  const handleClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.classList.contains('inline-source-ref')) {
      const sourceNumber = parseInt(target.getAttribute('data-source-number') || '0');
      onSourceClick?.(sourceNumber);
    }
  };

  // Extract sources from AI response content and filter them out
  const { cleanContent, extractedSources } = (() => {
    const lines = content.split('\n');
    const cleanLines = [];
    const sources = [];
    let inSourcesSection = false;
    let sourceCounter = 1;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Check if this line starts a sources section (English "Sources" or Georgian "წყაროები")
      // Support various formats: ### Sources, Sources:, ### წყაროები, წყაროები:, ### **წყაროები:**, etc.
      // Remove ALL markdown formatting (###, **, _, etc.) first, then check
      const cleanLine = line.trim().replace(/^#{1,6}\s*/, '').replace(/\*\*/g, '').replace(/[_]/g, '').trim();
      if (/^(?:Sources?|წყაროები)[:\s]*$/i.test(cleanLine)) {
        inSourcesSection = true;
        continue; // Skip this line
      }

      // Also check if we hit a horizontal rule (---) followed by sources header on next line
      if (line.trim() === '---' && i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim().replace(/^#{1,6}\s*/, '').replace(/\*\*/g, '').replace(/[_]/g, '').trim();
        if (/^(?:Sources?|წყაროები)[:\s]*$/i.test(nextLine)) {
          // Skip the horizontal rule
          continue;
        }
      }
      
      // If we're in sources section, extract sources
      if (inSourcesSection) {
        // Extract source information from markdown list items (numbered or bulleted)
        const sourceMatch = line.match(/^\s*(?:\d+\.\s*|[-•*]\s*)(.+)$/);
        if (sourceMatch) {
          let sourceText = sourceMatch[1].trim();

          // Skip internal system references
          if (/^(Internal KB|PerplexityMD)/i.test(sourceText)) {
            continue;
          }

          // Extract source type from bold markers (**Guideline:**, **TextBook:**, etc.)
          let type: 'guideline' | 'research' | 'document' | 'textbook' | 'personal' = 'research';
          let title = sourceText;

          // Check for **Type:** pattern and extract it
          const typeMatch = sourceText.match(/^\*\*([^:*]+):\*\*\s*(.+)$/i);
          if (typeMatch) {
            const detectedType = typeMatch[1].toLowerCase().trim();
            title = typeMatch[2].trim();

            // Map detected type to our type system
            if (detectedType.includes('guideline')) {
              type = 'guideline';
            } else if (detectedType.includes('textbook') || detectedType.includes('book')) {
              type = 'textbook';
            } else if (detectedType.includes('research') || detectedType.includes('article')) {
              type = 'research';
            } else if (detectedType.includes('document')) {
              type = 'document';
            }
          } else {
            // Fallback: Determine type from content
            if (/guideline|ACCF|AHA|ESC/i.test(title)) {
              type = 'guideline';
            } else if (/textbook|book/i.test(title)) {
              type = 'textbook';
            } else if (/PerplexityMD/i.test(title)) {
              type = 'document';
            }
          }

          // Extract URL if present in markdown link format BEFORE cleaning markdown
          const urlMatch = title.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
          let url: string | undefined = undefined;
          if (urlMatch) {
            title = urlMatch[1]; // Use link text as title
            url = urlMatch[2];
          }

          // Clean up ALL markdown formatting from title
          // Remove bold markers (**text** -> text)
          title = title.replace(/\*\*([^*]+)\*\*/g, '$1');
          // Remove italic markers (*text* -> text)
          title = title.replace(/\*([^*]+)\*/g, '$1');
          // Remove any remaining asterisks
          title = title.replace(/\*/g, '');
          // Remove underscores used for bold/italic
          title = title.replace(/__([^_]+)__/g, '$1');
          title = title.replace(/_([^_]+)_/g, '$1');
          // Trim whitespace
          title = title.trim();

          // Clean excerpt text the same way as title to remove all markdown
          let cleanExcerpt = sourceText;
          // Remove bold markers
          cleanExcerpt = cleanExcerpt.replace(/\*\*([^*]+)\*\*/g, '$1');
          // Remove italic markers
          cleanExcerpt = cleanExcerpt.replace(/\*([^*]+)\*/g, '$1');
          // Remove any remaining asterisks
          cleanExcerpt = cleanExcerpt.replace(/\*/g, '');
          // Remove underscores
          cleanExcerpt = cleanExcerpt.replace(/__([^_]+)__/g, '$1');
          cleanExcerpt = cleanExcerpt.replace(/_([^_]+)_/g, '$1');
          // Trim whitespace
          cleanExcerpt = cleanExcerpt.trim();

          sources.push({
            id: `extracted-source-${sourceCounter}`,
            title: title,
            url: url,
            type: type,
            excerpt: cleanExcerpt.length > 200 ? cleanExcerpt.substring(0, 200) + '...' : cleanExcerpt
          });

          sourceCounter++;
        }
        continue;
      }
      
      // Convert bullet points (•) to proper markdown format
      if (/^\s*•\s/.test(line)) {
        line = line.replace(/^\s*•\s/, '- ');
      }
      
      // Keep all other lines
      cleanLines.push(line);
    }
    
    return { 
      cleanContent: cleanLines.join('\n').trim(),
      extractedSources: sources
    };
  })();

  // Notify parent component about extracted sources if there's a callback
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Clear any previous sources first
      (window as any).extractedSources = null;

      // Only set new sources if we actually found some
      if (extractedSources.length > 0) {
        (window as any).extractedSources = extractedSources;
      }
    }

    // Cleanup: clear sources when component unmounts
    return () => {
      if (typeof window !== 'undefined') {
        (window as any).extractedSources = null;
      }
    };
  }, [extractedSources, content]);

  return (
    <div
      className={`medical-markdown-content prose prose-sm dark:prose-invert max-w-none ${className}`}
      onClick={handleClick}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          table: TableRenderer,
          thead: TableHeaderRenderer,
          th: TableHeaderCellRenderer,
          tbody: TableBodyRenderer,
          td: TableCellRenderer,
          h1: (props) => <HeadingRenderer level={1} {...props} />,
          h2: (props) => <HeadingRenderer level={2} {...props} />,
          h3: (props) => <HeadingRenderer level={3} {...props} />,
          h4: (props) => <HeadingRenderer level={4} {...props} />,
          h5: (props) => <HeadingRenderer level={5} {...props} />,
          h6: (props) => <HeadingRenderer level={6} {...props} />,
          ul: ListRenderer,
          ol: ListRenderer,
          li: ListItemRenderer,
          p: ParagraphRenderer,
          strong: StrongRenderer,
          code: CodeRenderer,
          blockquote: BlockquoteRenderer,
          // Handle source references
          text: ({ children }) => {
            if (typeof children === 'string') {
              return (
                <span
                  dangerouslySetInnerHTML={{
                    __html: children.replace(/\[(\d+)\]/g, (match, num) => {
                      return `<span class="inline-source-ref cursor-pointer text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-1 py-0.5 rounded transition-colors" data-source-number="${num}" title="Click to highlight source ${num}">[${num}]</span>`;
                    })
                  }}
                />
              );
            }
            return children;
          }
        }}
      >
        {cleanContent}
      </ReactMarkdown>
    </div>
  );
};

export default MedicalMarkdownRenderer;