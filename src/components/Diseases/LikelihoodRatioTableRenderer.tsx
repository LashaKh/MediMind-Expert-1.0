import React from 'react';

interface LikelihoodRatioTableRendererProps {
  children: React.ReactNode;
}

export const LikelihoodRatioTableRenderer: React.FC<LikelihoodRatioTableRendererProps> = ({ children }) => {
  // Convert children to array for processing
  const childArray = React.Children.toArray(children);
  
  // Check if this is a likelihood ratio table by examining headers
  let isLRTable = false;
  let lrColumnIndex = -1;
  let valueColumnIndex = -1;
  
  // Find thead
  const thead = childArray.find((child: any) => child?.type === 'thead');
  if (thead && thead.props?.children) {
    const headerRow = React.Children.toArray(thead.props.children).find((child: any) => child?.type === 'tr');
    if (headerRow && headerRow.props?.children) {
      const headers = React.Children.toArray(headerRow.props.children);
      headers.forEach((header: any, index: number) => {
        const headerText = extractText(header);
        if (headerText.includes('LR+') || headerText.includes('LR-') || headerText.toLowerCase().includes('lr+') || headerText.toLowerCase().includes('lr-')) {
          isLRTable = true;
          lrColumnIndex = index;
        } else if (headerText.toLowerCase().includes('value')) {
          valueColumnIndex = index;
        }
      });
    }
  }

  // If not an LR table, render normally
  if (!isLRTable || lrColumnIndex === -1 || valueColumnIndex === -1) {
    return (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse bg-[var(--component-card)] rounded-lg shadow-sm">
          {children}
        </table>
      </div>
    );
  }
  
  // Process tbody to add visual indicators
  const processedChildren = childArray.map((child: any) => {
    if (child?.type === 'tbody') {
      const rows = React.Children.toArray(child.props.children);
      const processedRows = rows.map((row: any, rowIndex: number) => {
        if (row?.type === 'tr') {
          const cells = React.Children.toArray(row.props.children);
          let lrValue = 0;
          
          // Extract LR value
          if (cells[lrColumnIndex]) {
            const lrText = extractText(cells[lrColumnIndex]);
            const lrMatch = lrText.match(/^(\d+\.?\d*)/);
            if (lrMatch) {
              lrValue = parseFloat(lrMatch[1]);
            }
          }
          
          // Get confidence interval from value column
          let confidenceInterval = '';
          if (cells[valueColumnIndex]) {
            confidenceInterval = extractText(cells[valueColumnIndex]);
          }
          
          // Process cells
          const processedCells = cells.map((cell: any, cellIndex: number) => {
            if (cellIndex === lrColumnIndex && lrValue > 0) {
              // Merge LR value with confidence interval
              return (
                <td key={cellIndex} className="py-3 px-4 text-[var(--foreground)]">
                  <span className="font-semibold">{lrValue}</span>
                  <span className="text-[var(--foreground-secondary)] ml-1">{confidenceInterval}</span>
                </td>
              );
            } else if (cellIndex === valueColumnIndex && lrValue > 0) {
              // This is the value column - add visual indicator
              let barColor = 'bg-[var(--muted)]';
              const maxLR = 20;
              const scaledValue = Math.min(lrValue, maxLR);
              const barWidth = Math.max(10, (scaledValue / maxLR) * 90);
              
              if (lrValue >= 10) {
                barColor = 'bg-green-500';
              } else if (lrValue >= 5) {
                barColor = 'bg-yellow-500';
              } else if (lrValue >= 2) {
                barColor = 'bg-orange-500';
              }
              
              return (
                <td key={cellIndex} className="py-3 px-4">
                  <div className="bg-[var(--component-surface-secondary)] rounded-full h-6 w-full max-w-[200px]">
                    <div 
                      className={`${barColor} h-6 rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </td>
              );
            }
            
            // Return other cells as is
            return React.cloneElement(cell, { key: cellIndex });
          });
          
          return React.cloneElement(row, { key: rowIndex }, processedCells);
        }
        return row;
      });
      
      return React.cloneElement(child, {}, processedRows);
    }
    
    return child;
  });
  
  // Process headers to ensure proper styling
  const processedChildrenWithHeaders = processedChildren.map((child: any) => {
    if (child?.type === 'thead') {
      const rows = React.Children.toArray(child.props.children);
      const processedRows = rows.map((row: any) => {
        if (row?.type === 'tr') {
          const headers = React.Children.toArray(row.props.children);
          const processedHeaders = headers.map((header: any, index: number) => {
            return React.cloneElement(header, {
              key: index,
              className: 'text-left py-3 px-4 font-semibold text-[var(--foreground)]'
            });
          });
          return React.cloneElement(row, { 
            key: 0,
            className: 'border-b-2 border-[var(--glass-border-light)]'
          }, processedHeaders);
        }
        return row;
      });
      return React.cloneElement(child, {}, processedRows);
    }
    return child;
  });
  
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse bg-[var(--component-card)] rounded-lg">
        {processedChildrenWithHeaders}
      </table>
    </div>
  );
};

// Helper function to extract text from React elements
function extractText(element: any): string {
  if (typeof element === 'string') return element;
  if (!element) return '';
  
  if (element.props?.children) {
    const children = React.Children.toArray(element.props.children);
    return children.map(child => extractText(child)).join('');
  }
  
  return '';
}