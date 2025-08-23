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
          className: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
        })
      )}
    </thead>
  );

  // Medical table header cell renderer
  const TableHeaderCellRenderer = ({ children, ...props }: any) => (
    <th 
      className="px-4 py-3 text-left font-semibold text-sm uppercase tracking-wide border-b border-blue-500"
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
              ? 'bg-gray-50 dark:bg-gray-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
              : 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20'
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
      1: "text-3xl mt-8 mb-6 border-blue-500 text-blue-900 dark:text-blue-100",
      2: "text-2xl mt-6 mb-4 border-blue-400 text-blue-800 dark:text-blue-200", 
      3: "text-xl mt-5 mb-3 border-blue-300 text-blue-700 dark:text-blue-300",
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
      className="font-semibold text-gray-900 dark:text-white bg-yellow-100 dark:bg-yellow-900/30 px-1 py-0.5 rounded"
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

  // Filter out hardcoded sources section from AI response, but preserve markdown sources for proper rendering
  const cleanContent = content.replace(
    /^\s*•\s*Internal KB.*?\n/gm, ''
  ).replace(
    /^\s*•\s*PerplexityMD.*?\n/gm, ''
  ).trim();

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