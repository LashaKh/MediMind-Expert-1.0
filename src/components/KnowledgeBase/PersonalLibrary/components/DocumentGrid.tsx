import React from 'react';
import { motion } from 'framer-motion';
import { StaggeredGrid } from '../../PremiumAnimations';
import { DocumentWithMetadata } from '../../../../lib/api/knowledgeBase';
import { ViewMode, DisplayDensity, DocumentGroup } from '../types';
import { ChunkedDocumentCard } from './ChunkedDocumentCard';
import { RegularDocumentCard } from './RegularDocumentCard';

interface DocumentGridProps {
  documentGroups: DocumentGroup[];
  viewMode: ViewMode;
  displayDensity: DisplayDensity;
  expandedGroups: Set<string>;
  selectedDocuments: Set<string>;
  showMetadata: boolean;
  gridClasses: string;

  // Callbacks
  onToggleGroup: (groupId: string) => void;
  onViewDocument: (document: DocumentWithMetadata) => void;
  onDeleteDocument: (documentId: string, title: string) => void;
  onDeleteAllDocuments: (documentIds: string[], title: string) => void;
  onSelectDocument: (id: string) => void;
  onDownloadDocument: () => void;
}

export const DocumentGrid: React.FC<DocumentGridProps> = ({
  documentGroups,
  viewMode,
  displayDensity,
  expandedGroups,
  selectedDocuments,
  showMetadata,
  gridClasses,
  onToggleGroup,
  onViewDocument,
  onDeleteDocument,
  onDeleteAllDocuments,
  onSelectDocument,
  onDownloadDocument
}) => {
  if (viewMode === 'grid') {
    return (
      <StaggeredGrid
        className={`grid ${gridClasses}`}
        staggerDelay={0.05}
      >
        {documentGroups.map((group, index) => (
          group.isChunked ? (
            <ChunkedDocumentCard
              key={group.id}
              group={group}
              viewMode={viewMode}
              displayDensity={displayDensity}
              isExpanded={expandedGroups.has(group.id)}
              selectedDocuments={selectedDocuments}
              onToggle={() => onToggleGroup(group.id)}
              onView={onViewDocument}
              onDelete={onDeleteDocument}
              onDeleteAll={onDeleteAllDocuments}
              onSelect={onSelectDocument}
              index={index}
            />
          ) : (
            <RegularDocumentCard
              key={group.documents[0].id}
              document={group.documents[0]}
              viewMode={viewMode}
              displayDensity={displayDensity}
              isSelected={selectedDocuments.has(group.documents[0].id)}
              showMetadata={showMetadata}
              onSelect={onSelectDocument}
              onView={() => onViewDocument(group.documents[0])}
              onDelete={() => onDeleteDocument(group.documents[0].id, group.documents[0].title)}
              onDownload={onDownloadDocument}
              index={index}
            />
          )
        ))}
      </StaggeredGrid>
    );
  }

  // List View
  return (
    <div className="space-y-3">
      {documentGroups.map((group, index) => (
        group.isChunked ? (
          <ChunkedDocumentCard
            key={group.id}
            group={group}
            viewMode={viewMode}
            displayDensity={displayDensity}
            isExpanded={expandedGroups.has(group.id)}
            selectedDocuments={selectedDocuments}
            onToggle={() => onToggleGroup(group.id)}
            onView={onViewDocument}
            onDelete={onDeleteDocument}
            onDeleteAll={onDeleteAllDocuments}
            onSelect={onSelectDocument}
            index={index}
          />
        ) : (
          <RegularDocumentCard
            key={group.documents[0].id}
            document={group.documents[0]}
            viewMode={viewMode}
            displayDensity={displayDensity}
            isSelected={selectedDocuments.has(group.documents[0].id)}
            showMetadata={showMetadata}
            onSelect={onSelectDocument}
            onView={() => onViewDocument(group.documents[0])}
            onDelete={() => onDeleteDocument(group.documents[0].id, group.documents[0].title)}
            onDownload={onDownloadDocument}
            index={index}
          />
        )
      ))}
    </div>
  );
};
