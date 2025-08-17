const { logger } = require('./logger');
const { ENV_VARS } = require('./constants');

/**
 * Vector Store Integration
 * Handles embedding generation and vector storage for document chunks
 */

// Vector store configuration
const VECTOR_CONFIG = {
  // Embedding settings
  embedding: {
    provider: 'openai', // Default to OpenAI
    model: 'text-embedding-3-small', // Cost-effective model
    maxTokens: 8192, // Token limit for text-embedding-3-small
    dimensions: 1536 // Dimensions for text-embedding-3-small
  },
  
  // Chunk processing settings
  processing: {
    batchSize: 10, // Process chunks in batches
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  },
  
  // Storage settings
  storage: {
    namespace: 'medimind-docs', // Base namespace
    metadataFields: [
      'documentId',
      'title',
      'category',
      'tags',
      'fileName',
      'fileType',
      'userId',
      'uploadDate',
      'chunkIndex',
      'chunkCount'
    ]
  }
};

/**
 * Generate embeddings for text chunks using OpenAI
 * @param {Array} chunks - Array of text chunks
 * @returns {Promise<Array>} - Array of chunks with embeddings
 */
async function generateEmbeddings(chunks) {
  if (!chunks || chunks.length === 0) {
    throw new Error('No chunks provided for embedding generation');
  }

  logger.info('Starting embedding generation', {
    chunkCount: chunks.length,
    provider: VECTOR_CONFIG.embedding.provider,
    model: VECTOR_CONFIG.embedding.model
  });

  const embeddedChunks = [];
  const batchSize = VECTOR_CONFIG.processing.batchSize;

  try {
    // Process chunks in batches
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      logger.info('Processing embedding batch', {
        batchIndex: Math.floor(i / batchSize) + 1,
        batchSize: batch.length,
        totalBatches: Math.ceil(chunks.length / batchSize)
      });

      const batchResults = await Promise.all(
        batch.map(async (chunk, index) => {
          try {
            const embedding = await generateSingleEmbedding(chunk.text);
            
            return {
              ...chunk,
              embedding,
              embeddingModel: VECTOR_CONFIG.embedding.model,
              embeddingDimensions: VECTOR_CONFIG.embedding.dimensions,
              embeddedAt: new Date().toISOString()
            };
          } catch (error) {
            logger.error('Failed to generate embedding for chunk', {
              chunkId: chunk.id,
              error: error.message,
              batchIndex: Math.floor(i / batchSize) + 1,
              chunkIndex: index
            });
            
            // Return chunk without embedding for now
            return {
              ...chunk,
              embedding: null,
              embeddingError: error.message,
              embeddedAt: new Date().toISOString()
            };
          }
        })
      );

      embeddedChunks.push(...batchResults);

      // Add delay between batches to avoid rate limiting
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const successfulEmbeddings = embeddedChunks.filter(chunk => chunk.embedding !== null);
    const failedEmbeddings = embeddedChunks.filter(chunk => chunk.embedding === null);

    logger.info('Embedding generation completed', {
      totalChunks: chunks.length,
      successful: successfulEmbeddings.length,
      failed: failedEmbeddings.length
    });

    if (failedEmbeddings.length > 0) {
      logger.warn('Some embeddings failed to generate', {
        failedCount: failedEmbeddings.length,
        failedChunks: failedEmbeddings.map(c => ({ id: c.id, error: c.embeddingError }))
      });
    }

    return embeddedChunks;

  } catch (error) {
    logger.error('Embedding generation process failed', {
      error: error.message,
      chunkCount: chunks.length
    });
    throw error;
  }
}

/**
 * Generate embedding for a single text chunk
 * @param {string} text - Text to embed
 * @returns {Promise<Array>} - Embedding vector
 */
async function generateSingleEmbedding(text) {
  // Validate text length
  if (!text || text.trim().length === 0) {
    throw new Error('Text is empty or invalid');
  }

  // Using mock embedding for development - replace with OpenAI API in production
  const dimensions = VECTOR_CONFIG.embedding.dimensions;
  const mockEmbedding = Array.from({ length: dimensions }, () => Math.random() - 0.5);
  
  logger.debug('Generated mock embedding', {
    textLength: text.length,
    dimensions: mockEmbedding.length
  });

  return mockEmbedding;
}

/**
 * Store embedded chunks in vector database
 * @param {Array} embeddedChunks - Chunks with embeddings
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Object>} - Storage results
 */
async function storeEmbeddings(embeddedChunks, metadata) {
  if (!embeddedChunks || embeddedChunks.length === 0) {
    throw new Error('No embedded chunks provided for storage');
  }

  const validChunks = embeddedChunks.filter(chunk => chunk.embedding !== null);
  
  if (validChunks.length === 0) {
    throw new Error('No valid embeddings found for storage');
  }

  logger.info('Starting vector storage', {
    documentId: metadata.documentId,
    totalChunks: embeddedChunks.length,
    validChunks: validChunks.length,
    namespace: `${VECTOR_CONFIG.storage.namespace}-${metadata.userId}`
  });

  try {
    // Mock vector storage - implement database integration in production
    // This could be Pinecone, Weaviate, Chroma, or integrated with Flowise
    
    const vectorStoreId = `vs_${metadata.documentId}_${Date.now()}`;
    const namespace = `${VECTOR_CONFIG.storage.namespace}-${metadata.userId}`;
    
    // Simulate storage process
    const storageResults = {
      vectorStoreId,
      namespace,
      documentsStored: validChunks.length,
      documentsSkipped: embeddedChunks.length - validChunks.length,
      storageProvider: 'mock', // Would be 'pinecone', 'weaviate', etc.
      storedAt: new Date().toISOString(),
      chunks: validChunks.map(chunk => ({
        id: chunk.id,
        vectorId: `vec_${chunk.id}`,
        stored: true,
        metadata: filterMetadataForStorage(chunk.metadata)
      }))
    };

    logger.info('Vector storage completed', {
      documentId: metadata.documentId,
      vectorStoreId,
      namespace,
      stored: storageResults.documentsStored,
      skipped: storageResults.documentsSkipped
    });

    return storageResults;

  } catch (error) {
    logger.error('Vector storage failed', {
      documentId: metadata.documentId,
      error: error.message,
      chunkCount: validChunks.length
    });
    throw error;
  }
}

/**
 * Filter metadata to include only storage-relevant fields
 */
function filterMetadataForStorage(metadata) {
  const filtered = {};
  
  VECTOR_CONFIG.storage.metadataFields.forEach(field => {
    if (metadata.hasOwnProperty(field)) {
      filtered[field] = metadata[field];
    }
  });
  
  return filtered;
}

/**
 * Query vector store for similar documents
 * @param {string} queryText - Text to search for
 * @param {Object} options - Query options
 * @returns {Promise<Array>} - Similar documents
 */
async function queryVectorStore(queryText, options = {}) {
  const {
    userId,
    topK = 5,
    threshold = 0.7,
    category = null,
    tags = null
  } = options;

  if (!queryText || queryText.trim().length === 0) {
    throw new Error('Query text is required');
  }

  if (!userId) {
    throw new Error('User ID is required for querying');
  }

  logger.info('Starting vector store query', {
    userId,
    queryLength: queryText.length,
    topK,
    threshold,
    category,
    tags
  });

  try {
    // Generate embedding for query text
    const queryEmbedding = await generateSingleEmbedding(queryText);
    
    // Mock vector search - implement similarity search in production
    // For now, return mock results
    const mockResults = [
      {
        id: 'doc_123_chunk_0001',
        score: 0.95,
        text: 'This is a sample document chunk that would be returned from the vector store.',
        metadata: {
          documentId: 'doc_123',
          title: 'Sample Medical Document',
          category: 'research-papers',
          tags: ['cardiology', 'treatment'],
          fileName: 'sample.pdf',
          chunkIndex: 0
        }
      }
    ];

    logger.info('Vector store query completed', {
      userId,
      queryLength: queryText.length,
      resultsCount: mockResults.length
    });

    return mockResults;

  } catch (error) {
    logger.error('Vector store query failed', {
      userId,
      error: error.message,
      queryLength: queryText.length
    });
    throw error;
  }
}

/**
 * Update document in vector store
 * @param {string} documentId - Document ID to update
 * @param {Array} newChunks - New chunks to store
 * @param {Object} metadata - Document metadata
 * @returns {Promise<Object>} - Update results
 */
async function updateDocumentInVectorStore(documentId, newChunks, metadata) {
  logger.info('Starting vector store document update', {
    documentId,
    newChunkCount: newChunks.length,
    userId: metadata.userId
  });

  try {
    // Mock vector update - implement database update in production
    // This would typically involve:
    // 1. Delete existing chunks for the document
    // 2. Generate embeddings for new chunks
    // 3. Store new chunks

    // For now, simulate the process
    const embeddedChunks = await generateEmbeddings(newChunks);
    const storageResults = await storeEmbeddings(embeddedChunks, metadata);

    logger.info('Vector store document update completed', {
      documentId,
      chunksUpdated: storageResults.documentsStored
    });

    return storageResults;

  } catch (error) {
    logger.error('Vector store document update failed', {
      documentId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Delete document from vector store
 * @param {string} documentId - Document ID to delete
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Deletion results
 */
async function deleteDocumentFromVectorStore(documentId, userId) {
  logger.info('Starting vector store document deletion', {
    documentId,
    userId
  });

  try {
    // Mock vector deletion - implement database deletion in production
    // This would involve deleting all chunks associated with the document

    const deletionResults = {
      documentId,
      deleted: true,
      chunksDeleted: 0, // Would be actual count
      deletedAt: new Date().toISOString()
    };

    logger.info('Vector store document deletion completed', {
      documentId,
      chunksDeleted: deletionResults.chunksDeleted
    });

    return deletionResults;

  } catch (error) {
    logger.error('Vector store document deletion failed', {
      documentId,
      error: error.message
    });
    throw error;
  }
}

/**
 * Check vector store health and connection
 * @returns {Promise<Object>} - Health status
 */
async function checkVectorStoreHealth() {
  try {
    // Mock health check - implement database health check in production
    const health = {
      status: 'healthy',
      provider: 'mock',
      version: '1.0.0',
      checkedAt: new Date().toISOString()
    };

    logger.info('Vector store health check completed', health);
    return health;

  } catch (error) {
    logger.error('Vector store health check failed', {
      error: error.message
    });
    throw error;
  }
}

module.exports = {
  generateEmbeddings,
  storeEmbeddings,
  queryVectorStore,
  updateDocumentInVectorStore,
  deleteDocumentFromVectorStore,
  checkVectorStoreHealth,
  VECTOR_CONFIG
}; 