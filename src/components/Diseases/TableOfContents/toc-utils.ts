import { TableOfContentsItem, MarkdownSection } from '../../../types/markdown-viewer';

/**
 * Generate table of contents from markdown sections
 * @param sections - Array of markdown sections
 * @returns Array of TOC items
 */
export const generateTableOfContents = (sections: MarkdownSection[]): TableOfContentsItem[] => {
  return sections.map(section => ({
    id: section.id,
    title: section.title,
    level: section.level
  }));
};

/**
 * Find the active section based on scroll position
 * @param sections - Array of sections to check
 * @param scrollOffset - Offset from top for active section detection
 * @returns Active section ID or empty string
 */
export const findActiveSection = (sections: MarkdownSection[], scrollOffset: number = 150): string => {
  const sectionElements = document.querySelectorAll('[data-section-id]');
  let current = '';
  let closestDistance = Infinity;
  
  sectionElements.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const distance = Math.abs(rect.top - scrollOffset);
    
    // If section is visible and closer to the ideal position
    if (rect.top <= 200 && distance < closestDistance) {
      closestDistance = distance;
      current = section.getAttribute('data-section-id') || '';
    }
  });
  
  return current;
};

/**
 * Scroll to a specific section with smooth animation
 * @param sectionId - ID of the section to scroll to
 * @param headerOffset - Offset to account for fixed headers
 */
export const scrollToSection = (sectionId: string, headerOffset: number = 120): void => {
  // Try to find the section container first
  const sectionContainer = document.querySelector(`[data-section-id="${sectionId}"]`);
  
  if (sectionContainer) {
    // Use scrollIntoView for more reliable scrolling
    sectionContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
    
    // Add a small delay then adjust for header offset
    setTimeout(() => {
      const currentScroll = window.scrollY || window.pageYOffset;
      window.scrollTo({
        top: currentScroll - headerOffset,
        behavior: 'smooth'
      });
    }, 100);
  } else {
    // Fallback: try to find by ID
    const fallbackElement = document.getElementById(sectionId);
    
    if (fallbackElement) {
      fallbackElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      
      // Add a small delay then adjust for header offset
      setTimeout(() => {
        const currentScroll = window.scrollY || window.pageYOffset;
        window.scrollTo({
          top: currentScroll - headerOffset,
          behavior: 'smooth'
        });
      }, 100);
    }
  }
};

/**
 * Filter TOC items based on search term
 * @param items - TOC items to filter
 * @param sections - Corresponding sections for content search
 * @param searchTerm - Search term to filter by
 * @returns Filtered TOC items
 */
export const filterTOCItems = (
  items: TableOfContentsItem[], 
  sections: MarkdownSection[], 
  searchTerm: string
): TableOfContentsItem[] => {
  if (!searchTerm) return items;
  
  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return items.filter(item => 
    filteredSections.some(section => section.id === item.id)
  );
};