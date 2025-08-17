import { useEffect } from 'react';

export function useLikelihoodRatioTables(containerRef: React.RefObject<HTMLElement>, deps: any[] = []) {
  useEffect(() => {
    // Add a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (!containerRef.current) return;

      // Find all tables in the container
      const tables = containerRef.current.querySelectorAll('table');
    
    tables.forEach(table => {
      // Check if this is a likelihood ratio table
      const headers = table.querySelectorAll('th');
      let isLRTable = false;
      let lrColumnIndex = -1;
      let valueColumnIndex = -1;
      
      headers.forEach((header, index) => {
        const headerText = header.textContent || '';
        if (headerText.includes('LR+') || headerText.includes('LR-')) {
          isLRTable = true;
          lrColumnIndex = index;
        } else if (headerText.toLowerCase().includes('value')) {
          valueColumnIndex = index;
        }
      });
      
      if (!isLRTable || lrColumnIndex === -1 || valueColumnIndex === -1) return;

      // Style the table
      table.classList.add('w-full', 'border-collapse', 'bg-white', 'rounded-lg');
      
      // Process each data row
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length <= Math.max(lrColumnIndex, valueColumnIndex)) return;
        
        // Get LR value
        const lrCell = cells[lrColumnIndex];
        const lrText = lrCell.textContent || '';
        const lrMatch = lrText.match(/^(\d+\.?\d*)/);
        
        if (!lrMatch) return;
        
        const lrValue = parseFloat(lrMatch[1]);
        
        // Get confidence interval from value column
        const valueCell = cells[valueColumnIndex];
        const confidenceInterval = valueCell.textContent || '';
        
        // Update LR cell to include confidence interval
        lrCell.innerHTML = `<span class="font-semibold">${lrValue}</span> <span class="text-gray-500">${confidenceInterval}</span>`;
        
        // Replace value cell with visual indicator
        let barColor = 'bg-gray-400';
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
        
        valueCell.innerHTML = `
          <div class="bg-gray-100 rounded-full h-6 w-full max-w-[200px]">
            <div class="${barColor} h-6 rounded-full transition-all duration-500 ease-out" style="width: ${barWidth}%"></div>
          </div>
        `;
        
        // Style the cells
        cells.forEach(cell => {
          cell.classList.add('py-3', 'px-4');
        });
        
        // Style the row
        row.classList.add('border-b', 'border-gray-100', 'hover:bg-gray-50', 'transition-colors');
      });
      
      // Style headers
      const headerRow = table.querySelector('thead tr');
      if (headerRow) {
        headerRow.classList.add('border-b-2', 'border-gray-200');
        headers.forEach(header => {
          header.classList.add('text-left', 'py-3', 'px-4', 'font-semibold', 'text-gray-900');
        });
      }
    });
    }, 100);
    
    return () => clearTimeout(timer);
  }, [containerRef, ...deps]);
}