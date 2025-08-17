import React from 'react';

interface LRTableData {
  finding: string;
  lrValue: number;
  confidenceInterval: string;
}

interface LikelihoodRatiosTableProps {
  data: LRTableData[];
  type: 'positive' | 'negative';
}

export const LikelihoodRatiosTable: React.FC<LikelihoodRatiosTableProps> = ({ data, type }) => {
  const getLRBarColor = (value: number): string => {
    if (type === 'positive') {
      if (value >= 10) return 'bg-green-500';
      if (value >= 5) return 'bg-yellow-500';
      if (value >= 2) return 'bg-orange-500';
      return 'bg-gray-400';
    } else {
      // For negative LRs, lower is better
      if (value <= 0.1) return 'bg-green-500';
      if (value <= 0.2) return 'bg-yellow-500';
      if (value <= 0.5) return 'bg-orange-500';
      return 'bg-gray-400';
    }
  };

  const getLRBarWidth = (value: number): number => {
    if (type === 'positive') {
      // Scale positive LR values (max display at 20)
      const maxLR = 20;
      const scaledValue = Math.min(value, maxLR);
      return (scaledValue / maxLR) * 100;
    } else {
      // Scale negative LR values (0 to 1, inverted)
      return (1 - value) * 100;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-900 w-1/2">
              Finding
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900 w-1/4">
              LR{type === 'positive' ? '+' : '-'}
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-900 w-1/4">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const barColor = getLRBarColor(row.lrValue);
            const barWidth = getLRBarWidth(row.lrValue);
            
            return (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3 px-4 text-gray-800">
                  {row.finding}
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      {row.lrValue}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {row.confidenceInterval}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Helper function to parse likelihood ratio tables from markdown
export function parseLikelihoodRatioTable(tableElement: HTMLTableElement): LRTableData[] | null {
  const rows = tableElement.querySelectorAll('tbody tr');
  const headers = Array.from(tableElement.querySelectorAll('thead th')).map(th => th.textContent?.toLowerCase() || '');
  
  // Check if this is a likelihood ratio table
  const hasLRColumn = headers.some(h => h.includes('lr+') || h.includes('lr-'));
  const hasValueColumn = headers.some(h => h.includes('value'));
  
  if (!hasLRColumn || !hasValueColumn) {
    return null;
  }
  
  const data: LRTableData[] = [];
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 3) {
      const finding = cells[0].textContent?.trim() || '';
      const lrText = cells[1].textContent?.trim() || '';
      const valueText = cells[2].textContent?.trim() || '';
      
      // Parse LR value
      const lrMatch = lrText.match(/^(\d+(?:\.\d+)?)/);
      if (lrMatch) {
        const lrValue = parseFloat(lrMatch[1]);
        
        // Extract confidence interval from value column or LR column
        let confidenceInterval = '';
        const ciMatch = (valueText + ' ' + lrText).match(/\(([^)]+)\)/);
        if (ciMatch) {
          confidenceInterval = `(${ciMatch[1]})`;
        }
        
        data.push({
          finding,
          lrValue,
          confidenceInterval
        });
      }
    }
  });
  
  return data.length > 0 ? data : null;
}