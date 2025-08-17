import { visit } from 'unist-util-visit';
import type { Root, Table, TableRow, TableCell } from 'mdast';

interface TableWithParent extends Table {
  parent?: any;
  isLikelihoodRatioTable?: boolean;
}

export function remarkLikelihoodRatios() {
  return (tree: Root) => {
    let currentH2 = '';
    let currentH3 = '';
    
    visit(tree, (node: any, index, parent) => {
      // Track current section headers
      if (node.type === 'heading') {
        if (node.depth === 2) {
          currentH2 = getTextContent(node);
          currentH3 = '';
        } else if (node.depth === 3) {
          currentH3 = getTextContent(node);
        }
      }
      
      // Check if we're in a Likelihood Ratios section
      if (node.type === 'table' && currentH2.toLowerCase().includes('likelihood ratio')) {
        const table = node as TableWithParent;
        
        // Check if this table has LR+ or LR- in headers
        if (table.children && table.children.length > 0) {
          const headerRow = table.children[0];
          if (headerRow && headerRow.type === 'tableRow' && headerRow.children) {
            const headerTexts = headerRow.children.map((cell: any) => 
              getTextContent(cell).toLowerCase()
            );
            
            const hasLRColumn = headerTexts.some(text => 
              text.includes('lr+') || text.includes('lr-')
            );
            
            if (hasLRColumn) {
              // Mark this table as a likelihood ratio table
              table.isLikelihoodRatioTable = true;
              
              // Process the table rows to restructure for better rendering
              processLikelihoodRatioTable(table);
            }
          }
        }
      }
    });
  };
}

function getTextContent(node: any): string {
  if (typeof node === 'string') return node;
  if (node.value) return node.value;
  if (node.children) {
    return node.children.map(getTextContent).join('');
  }
  return '';
}

function processLikelihoodRatioTable(table: Table) {
  // Skip header row (index 0)
  for (let i = 1; i < table.children.length; i++) {
    const row = table.children[i];
    if (row.type === 'tableRow' && row.children.length >= 3) {
      // Get the LR value from the second column
      const lrCell = row.children[1];
      const lrText = getTextContent(lrCell);
      const lrMatch = lrText.match(/^(\d+\.?\d*)/);
      
      if (lrMatch) {
        const lrValue = parseFloat(lrMatch[1]);
        
        // Add a marker to the third column (Value column) with LR value
        const valueCell = row.children[2];
        if (valueCell && valueCell.children) {
          // Add metadata as a hidden span that we can detect during rendering
          valueCell.children.unshift({
            type: 'text',
            value: `[LR_VALUE:${lrValue}]`
          });
        }
      }
    }
  }
}