const axios = require('axios');
const { logger } = require('../utils/logger');
const { createApiError } = require('../utils/errorUtils');

// Base URL for Nextiva API
const NEXTIVA_API_BASE_URL = process.env.NEXTIVA_API_BASE_URL || 'https://api.thrio.com';

/**
 * Create axios instance for Nextiva API
 * @param {string} apiKey - API key for authentication
 * @returns {Object} Axios instance
 */
const createApiClient = (apiKey) => {
  return axios.create({
    baseURL: NEXTIVA_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json'
    },
    timeout: 30000 // 30 seconds timeout
  });
};

/**
 * Handle API errors
 * @param {Error} error - Axios error object
 * @returns {Object} Standardized error response
 */
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    logger.error('Nextiva API error response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    
    return {
      success: false,
      statusCode: error.response.status,
      message: error.response.data.message || 'Nextiva API error',
      errors: error.response.data.errors || []
    };
  } else if (error.request) {
    // The request was made but no response was received
    logger.error('Nextiva API no response:', { request: error.request });
    
    return {
      success: false,
      statusCode: 503,
      message: 'No response from Nextiva API',
      errors: ['Service unavailable']
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    logger.error('Nextiva API request error:', { message: error.message });
    
    return {
      success: false,
      statusCode: 500,
      message: 'Error setting up request to Nextiva API',
      errors: [error.message]
    };
  }
};

/**
 * Nextiva CRM Service
 */
const nextivaCrmService = {
  /**
   * Get all leads
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  getLeads: async ({ apiKey, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.get('/leads', {
        params: {
          page,
          limit,
          sortBy,
          sortOrder
        }
      });
      
      return {
        success: true,
        leads: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Get lead by ID
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  getLeadById: async ({ apiKey, leadId }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.get(`/leads/${leadId}`);
      
      return {
        success: true,
        lead: response.data.data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Create a new lead
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  createLead: async ({ apiKey, leadData }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.post('/leads', leadData);
      
      return {
        success: true,
        lead: response.data.data,
        message: 'Lead created successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Update a lead
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  updateLead: async ({ apiKey, leadId, leadData }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.put(`/leads/${leadId}`, leadData);
      
      return {
        success: true,
        lead: response.data.data,
        message: 'Lead updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Delete a lead
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  deleteLead: async ({ apiKey, leadId }) => {
    try {
      const client = createApiClient(apiKey);
      await client.delete(`/leads/${leadId}`);
      
      return {
        success: true,
        message: 'Lead deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Search leads by criteria
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  searchLeads: async ({ apiKey, searchCriteria, page = 1, limit = 20 }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.post('/leads/search', searchCriteria, {
        params: { page, limit }
      });
      
      return {
        success: true,
        leads: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Bulk create leads
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  bulkCreateLeads: async ({ apiKey, leads }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.post('/leads/bulk', { leads });
      
      return {
        success: true,
        leads: response.data.data,
        message: 'Leads created successfully',
        failedLeads: response.data.failedLeads || []
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Bulk update leads
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  bulkUpdateLeads: async ({ apiKey, leads }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.put('/leads/bulk', { leads });
      
      return {
        success: true,
        leads: response.data.data,
        message: 'Leads updated successfully',
        failedLeads: response.data.failedLeads || []
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Get all lists
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  getLists: async ({ apiKey, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.get('/lists', {
        params: {
          page,
          limit,
          sortBy,
          sortOrder
        }
      });
      
      return {
        success: true,
        lists: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Get list by ID
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  getListById: async ({ apiKey, listId }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.get(`/lists/${listId}`);
      
      return {
        success: true,
        list: response.data.data
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Create a new list
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  createList: async ({ apiKey, listData }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.post('/lists', listData);
      
      return {
        success: true,
        list: response.data.data,
        message: 'List created successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Update a list
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  updateList: async ({ apiKey, listId, listData }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.put(`/lists/${listId}`, listData);
      
      return {
        success: true,
        list: response.data.data,
        message: 'List updated successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Delete a list
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  deleteList: async ({ apiKey, listId }) => {
    try {
      const client = createApiClient(apiKey);
      await client.delete(`/lists/${listId}`);
      
      return {
        success: true,
        message: 'List deleted successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Get all leads in a list
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  getListLeads: async ({ apiKey, listId, page = 1, limit = 20 }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.get(`/lists/${listId}/leads`, {
        params: { page, limit }
      });
      
      return {
        success: true,
        leads: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Add leads to a list
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  addLeadsToList: async ({ apiKey, listId, leadIds }) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.post(`/lists/${listId}/leads`, { leadIds });
      
      return {
        success: true,
        message: 'Leads added to list successfully',
        addedLeads: response.data.addedLeads || [],
        failedLeads: response.data.failedLeads || []
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Remove a lead from a list
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  removeLeadFromList: async ({ apiKey, listId, leadId }) => {
    try {
      const client = createApiClient(apiKey);
      await client.delete(`/lists/${listId}/leads/${leadId}`);
      
      return {
        success: true,
        message: 'Lead removed from list successfully'
      };
    } catch (error) {
      return handleApiError(error);
    }
  }
};

module.exports = {
  nextivaCrmService
};