const axios = require('axios');
const logger = require('../utils/logger');

// Base URL for GoHighLevel API
const GHL_API_BASE_URL = process.env.GHL_API_BASE_URL || 'https://services.leadconnectorhq.com';

/**
 * Create axios instance for GoHighLevel API
 * @param {string} apiKey - API key for authentication
 * @returns {Object} Axios instance
 */
const createApiClient = (apiKey) => {
  return axios.create({
    baseURL: GHL_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'Accept': 'application/json',
      'Version': '2021-07-28'
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
    logger.error('GoHighLevel API error response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    });
    
    return {
      success: false,
      statusCode: error.response.status,
      message: error.response.data.message || 'GoHighLevel API error',
      errors: error.response.data.errors || []
    };
  } else if (error.request) {
    // The request was made but no response was received
    logger.error('GoHighLevel API no response:', { request: error.request });
    
    return {
      success: false,
      statusCode: 503,
      message: 'No response from GoHighLevel API',
      errors: ['Service unavailable']
    };
  } else {
    // Something happened in setting up the request that triggered an Error
    logger.error('GoHighLevel API request error:', { message: error.message });
    
    return {
      success: false,
      statusCode: 500,
      message: 'Error setting up request to GoHighLevel API',
      errors: [error.message]
    };
  }
};

/**
 * Store Thrio credentials for a GoHighLevel location during app installation
 * @param {string} locationId - GoHighLevel location ID
 * @param {string} username - Thrio username/email
 * @param {string} password - Thrio password
 * @param {string} apiKey - GoHighLevel API key
 * @returns {Promise<Object>} Storage result
 */
const storeThrioCredentials = async (locationId, username, password, apiKey) => {
  try {
    const apiClient = createApiClient(apiKey);
    
    // Store credentials in GoHighLevel custom fields or app data
    // This could be stored in location custom fields or app-specific storage
    const credentialData = {
      thrio_username: username,
      thrio_password: password, // In production, this should be encrypted
      stored_at: new Date().toISOString(),
      app_name: 'nextiva-thrio-integration'
    };

    // Store in location custom fields
    const response = await apiClient.put(`/locations/${locationId}/customFields`, {
      customFields: {
        'nextiva_thrio_username': username,
        'nextiva_thrio_password': password, // Encrypt in production
        'nextiva_integration_active': 'true',
        'nextiva_installed_at': new Date().toISOString()
      }
    });

    logger.info('Thrio credentials stored successfully', { 
      locationId, 
      username,
      status: response.status 
    });

    return {
      success: true,
      message: 'Credentials stored successfully',
      locationId,
      username
    };

  } catch (error) {
    logger.error('Failed to store Thrio credentials', { 
      locationId, 
      username, 
      error: error.message 
    });
    
    return handleApiError(error);
  }
};

/**
 * Retrieve stored Thrio credentials for a GoHighLevel location
 * @param {string} locationId - GoHighLevel location ID
 * @param {string} apiKey - GoHighLevel API key
 * @returns {Promise<Object>} Retrieved credentials
 */
const getThrioCredentials = async (locationId, apiKey) => {
  try {
    const apiClient = createApiClient(apiKey);
    
    // Retrieve credentials from GoHighLevel location data
    const response = await apiClient.get(`/locations/${locationId}`);
    
    const locationData = response.data;
    const customFields = locationData.customFields || {};
    
    const thrioUsername = customFields['nextiva_thrio_username'];
    const thrioPassword = customFields['nextiva_thrio_password']; // Decrypt in production
    
    if (!thrioUsername || !thrioPassword) {
      return {
        success: false,
        message: 'Thrio credentials not found for this location',
        locationId
      };
    }

    logger.info('Thrio credentials retrieved successfully', { 
      locationId, 
      username: thrioUsername 
    });

    return {
      success: true,
      credentials: {
        username: thrioUsername,
        password: thrioPassword,
        locationId
      }
    };

  } catch (error) {
    logger.error('Failed to retrieve Thrio credentials', { 
      locationId, 
      error: error.message 
    });
    
    return handleApiError(error);
  }
};

/**
 * Validate that the app is properly installed for a location
 * @param {string} locationId - GoHighLevel location ID
 * @param {string} apiKey - GoHighLevel API key
 * @returns {Promise<Object>} Installation status
 */
const validateAppInstallation = async (locationId, apiKey) => {
  try {
    const credentialsResult = await getThrioCredentials(locationId, apiKey);
    
    if (!credentialsResult.success) {
      return {
        success: false,
        installed: false,
        message: 'App not properly installed - missing Thrio credentials'
      };
    }

    return {
      success: true,
      installed: true,
      message: 'App is properly installed',
      credentials: credentialsResult.credentials
    };

  } catch (error) {
    logger.error('Failed to validate app installation', { 
      locationId, 
      error: error.message 
    });
    
    return {
      success: false,
      installed: false,
      message: 'Failed to validate installation'
    };
  }
};

/**
 * Map Nextiva list data to GoHighLevel tag format
 * @param {Object} listData - Nextiva list data
 * @returns {Object} GoHighLevel tag data
 */
const mapListToTag = (listData) => {
  return {
    name: listData.name,
    description: listData.description || '',
    color: listData.color || '#3498db'
  };
};

/**
 * GoHighLevel Service
 */
const goHighLevelService = {
  /**
   * Validate API key with GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  validateApiKey: async (apiKey) => {
    try {
      const client = createApiClient(apiKey);
      const response = await client.get('/locations/me');
      
      return {
        success: true,
        userId: response.data.userId,
        locationId: response.data.id,
        locationName: response.data.name,
        companyId: response.data.companyId
      };
    } catch (error) {
      logger.error('Error validating GoHighLevel API key:', error);
      return { success: false };
    }
  },

  /**
   * Get all leads from GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  getLeads: async ({ accessToken, locationId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    try {
      // For demo mode, return mock data
      if (accessToken && accessToken.includes('demo-access-token')) {
        return {
          success: true,
          data: [
            {
              id: 'demo-lead-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john.doe@example.com',
              phone: '+1234567890',
              source: 'Demo',
              status: 'new',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'demo-lead-2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane.smith@example.com',
              phone: '+0987654321',
              source: 'Demo',
              status: 'qualified',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 2,
            totalPages: 1
          }
        };
      }

      const client = createApiClient(accessToken);
      const response = await client.get('/contacts', {
        params: {
          locationId,
          limit,
          skip: (page - 1) * limit,
          sortBy,
          sortOrder
        }
      });
      
      return {
        success: true,
        data: response.data.contacts || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data.meta?.total || 0,
          totalPages: Math.ceil((response.data.meta?.total || 0) / limit)
        }
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Get lead by ID from GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  getLeadById: async ({ accessToken, locationId, leadId }) => {
    try {
      // For demo mode, return mock data
      if (accessToken && accessToken.includes('demo-access-token')) {
        return {
          success: true,
          data: {
            id: leadId,
            firstName: 'Demo',
            lastName: 'Lead',
            email: 'demo.lead@example.com',
            phone: '+1234567890',
            source: 'Demo',
            status: 'new',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      }

      const client = createApiClient(accessToken);
      const response = await client.get(`/contacts/${leadId}`, {
        params: { locationId }
      });
      
      return {
        success: true,
        data: response.data.contact
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Search leads in GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  searchLeads: async ({ accessToken, locationId, query, filters, page = 1, limit = 20 }) => {
    try {
      // For demo mode, return mock data
      if (accessToken && accessToken.includes('demo-access-token')) {
        return {
          success: true,
          data: [
            {
              id: 'demo-search-1',
              firstName: 'Search',
              lastName: 'Result',
              email: 'search.result@example.com',
              phone: '+1111111111',
              source: 'Demo Search',
              status: 'new',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 1,
            totalPages: 1
          }
        };
      }

      const client = createApiClient(accessToken);
      const response = await client.get('/contacts/search', {
        params: {
          locationId,
          query,
          ...filters,
          limit,
          skip: (page - 1) * limit
        }
      });
      
      return {
        success: true,
        data: response.data.contacts || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data.meta?.total || 0,
          totalPages: Math.ceil((response.data.meta?.total || 0) / limit)
        }
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Sync lead to GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  syncLead: async ({ apiKey, locationId, leadData }) => {
    try {
      const client = createApiClient(apiKey);
      const contactData = mapLeadToContact(leadData);
      
      // Check if contact exists by email or phone
      let existingContact = null;
      
      if (contactData.email) {
        const searchResponse = await client.get(`/contacts/lookup`, {
          params: {
            locationId,
            email: contactData.email
          }
        });
        
        if (searchResponse.data.contacts && searchResponse.data.contacts.length > 0) {
          existingContact = searchResponse.data.contacts[0];
        }
      }
      
      if (!existingContact && contactData.phone) {
        const searchResponse = await client.get(`/contacts/lookup`, {
          params: {
            locationId,
            phone: contactData.phone
          }
        });
        
        if (searchResponse.data.contacts && searchResponse.data.contacts.length > 0) {
          existingContact = searchResponse.data.contacts[0];
        }
      }
      
      let response;
      
      if (existingContact) {
        // Update existing contact
        response = await client.put(`/contacts/${existingContact.id}`, {
          ...contactData,
          locationId
        });
      } else {
        // Create new contact
        response = await client.post('/contacts', {
          ...contactData,
          locationId
        });
      }
      
      return {
        success: true,
        contact: response.data.contact,
        message: existingContact ? 'Contact updated in GoHighLevel' : 'Contact created in GoHighLevel'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Delete lead from GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  deleteLead: async ({ apiKey, locationId, leadId }) => {
    try {
      const client = createApiClient(apiKey);
      
      // First, find the contact in GoHighLevel by external ID (leadId)
      const searchResponse = await client.get(`/contacts`, {
        params: {
          locationId,
          query: leadId
        }
      });
      
      if (!searchResponse.data.contacts || searchResponse.data.contacts.length === 0) {
        return {
          success: false,
          message: 'Contact not found in GoHighLevel'
        };
      }
      
      const contactId = searchResponse.data.contacts[0].id;
      
      // Delete the contact
      await client.delete(`/contacts/${contactId}`, {
        params: { locationId }
      });
      
      return {
        success: true,
        message: 'Contact deleted from GoHighLevel'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Bulk sync leads to GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  bulkSyncLeads: async ({ apiKey, locationId, leads }) => {
    try {
      const client = createApiClient(apiKey);
      const contacts = leads.map(lead => ({
        ...mapLeadToContact(lead),
        locationId
      }));
      
      const response = await client.post('/contacts/bulk', {
        contacts,
        locationId
      });
      
      return {
        success: true,
        results: response.data.results,
        message: 'Contacts synced to GoHighLevel'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Sync list to GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  syncList: async ({ apiKey, locationId, listData }) => {
    try {
      const client = createApiClient(apiKey);
      const tagData = mapListToTag(listData);
      
      // Check if tag exists
      const tagsResponse = await client.get('/tags', {
        params: { locationId }
      });
      
      const existingTag = tagsResponse.data.tags.find(tag => tag.name === tagData.name);
      
      let response;
      
      if (existingTag) {
        // Update existing tag
        response = await client.put(`/tags/${existingTag.id}`, {
          ...tagData,
          locationId
        });
      } else {
        // Create new tag
        response = await client.post('/tags', {
          ...tagData,
          locationId
        });
      }
      
      return {
        success: true,
        tag: response.data.tag,
        message: existingTag ? 'Tag updated in GoHighLevel' : 'Tag created in GoHighLevel'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Delete list from GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  deleteList: async ({ apiKey, locationId, listId }) => {
    try {
      const client = createApiClient(apiKey);
      
      // First, get the list details to find the tag name
      const listResponse = await axios.get(`${process.env.NEXTIVA_API_BASE_URL}/lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!listResponse.data.data) {
        return {
          success: false,
          message: 'List not found in Nextiva'
        };
      }
      
      const listName = listResponse.data.data.name;
      
      // Find the tag in GoHighLevel
      const tagsResponse = await client.get('/tags', {
        params: { locationId }
      });
      
      const existingTag = tagsResponse.data.tags.find(tag => tag.name === listName);
      
      if (!existingTag) {
        return {
          success: false,
          message: 'Tag not found in GoHighLevel'
        };
      }
      
      // Delete the tag
      await client.delete(`/tags/${existingTag.id}`, {
        params: { locationId }
      });
      
      return {
        success: true,
        message: 'Tag deleted from GoHighLevel'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Sync leads to a list in GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  syncLeadsToList: async ({ apiKey, locationId, listId, leadIds }) => {
    try {
      const client = createApiClient(apiKey);
      
      // First, get the list details to find the tag name
      const listResponse = await axios.get(`${process.env.NEXTIVA_API_BASE_URL}/lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!listResponse.data.data) {
        return {
          success: false,
          message: 'List not found in Nextiva'
        };
      }
      
      const listName = listResponse.data.data.name;
      
      // Find the tag in GoHighLevel
      const tagsResponse = await client.get('/tags', {
        params: { locationId }
      });
      
      const existingTag = tagsResponse.data.tags.find(tag => tag.name === listName);
      
      if (!existingTag) {
        // Create the tag if it doesn't exist
        const createTagResponse = await client.post('/tags', {
          name: listName,
          locationId
        });
        
        existingTag = createTagResponse.data.tag;
      }
      
      // For each lead, find the contact in GoHighLevel and add the tag
      const results = [];
      
      for (const leadId of leadIds) {
        try {
          // Get lead details from Nextiva
          const leadResponse = await axios.get(`${process.env.NEXTIVA_API_BASE_URL}/leads/${leadId}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!leadResponse.data.data) {
            results.push({
              leadId,
              success: false,
              message: 'Lead not found in Nextiva'
            });
            continue;
          }
          
          const lead = leadResponse.data.data;
          
          // Find contact in GoHighLevel
          let contactId = null;
          
          if (lead.email) {
            const searchResponse = await client.get(`/contacts/lookup`, {
              params: {
                locationId,
                email: lead.email
              }
            });
            
            if (searchResponse.data.contacts && searchResponse.data.contacts.length > 0) {
              contactId = searchResponse.data.contacts[0].id;
            }
          }
          
          if (!contactId && lead.phone) {
            const searchResponse = await client.get(`/contacts/lookup`, {
              params: {
                locationId,
                phone: lead.phone
              }
            });
            
            if (searchResponse.data.contacts && searchResponse.data.contacts.length > 0) {
              contactId = searchResponse.data.contacts[0].id;
            }
          }
          
          if (!contactId) {
            // Create contact if not found
            const contactData = mapLeadToContact(lead);
            const createResponse = await client.post('/contacts', {
              ...contactData,
              locationId
            });
            
            contactId = createResponse.data.contact.id;
          }
          
          // Add tag to contact
          await client.post(`/contacts/${contactId}/tags`, {
            locationId,
            tagIds: [existingTag.id]
          });
          
          results.push({
            leadId,
            success: true,
            message: 'Lead added to tag in GoHighLevel'
          });
        } catch (error) {
          results.push({
            leadId,
            success: false,
            message: error.message || 'Error syncing lead to GoHighLevel'
          });
        }
      }
      
      return {
        success: true,
        results,
        message: 'Leads synced to list in GoHighLevel'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Remove a lead from a list in GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  removeLeadFromList: async ({ apiKey, locationId, listId, leadId }) => {
    try {
      const client = createApiClient(apiKey);
      
      // First, get the list details to find the tag name
      const listResponse = await axios.get(`${process.env.NEXTIVA_API_BASE_URL}/lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!listResponse.data.data) {
        return {
          success: false,
          message: 'List not found in Nextiva'
        };
      }
      
      const listName = listResponse.data.data.name;
      
      // Find the tag in GoHighLevel
      const tagsResponse = await client.get('/tags', {
        params: { locationId }
      });
      
      const existingTag = tagsResponse.data.tags.find(tag => tag.name === listName);
      
      if (!existingTag) {
        return {
          success: false,
          message: 'Tag not found in GoHighLevel'
        };
      }
      
      // Get lead details from Nextiva
      const leadResponse = await axios.get(`${process.env.NEXTIVA_API_BASE_URL}/leads/${leadId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!leadResponse.data.data) {
        return {
          success: false,
          message: 'Lead not found in Nextiva'
        };
      }
      
      const lead = leadResponse.data.data;
      
      // Find contact in GoHighLevel
      let contactId = null;
      
      if (lead.email) {
        const searchResponse = await client.get(`/contacts/lookup`, {
          params: {
            locationId,
            email: lead.email
          }
        });
        
        if (searchResponse.data.contacts && searchResponse.data.contacts.length > 0) {
          contactId = searchResponse.data.contacts[0].id;
        }
      }
      
      if (!contactId && lead.phone) {
        const searchResponse = await client.get(`/contacts/lookup`, {
          params: {
            locationId,
            phone: lead.phone
          }
        });
        
        if (searchResponse.data.contacts && searchResponse.data.contacts.length > 0) {
          contactId = searchResponse.data.contacts[0].id;
        }
      }
      
      if (!contactId) {
        return {
          success: false,
          message: 'Contact not found in GoHighLevel'
        };
      }
      
      // Remove tag from contact
      await client.delete(`/contacts/${contactId}/tags/${existingTag.id}`, {
        params: { locationId }
      });
      
      return {
        success: true,
        message: 'Lead removed from tag in GoHighLevel'
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Sync list from Nextiva to GoHighLevel
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  syncListToGhl: async ({ apiKey, locationId, listData }) => {
    try {
      // First, sync the list as a tag
      const syncTagResponse = await goHighLevelService.syncList({ apiKey, locationId, listData });
      
      if (!syncTagResponse.success) {
        return syncTagResponse;
      }
      
      // Then, get all leads in the list and sync them to GoHighLevel
      const leadsResponse = await axios.get(`${process.env.NEXTIVA_API_BASE_URL}/lists/${listData.id}/leads`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        params: {
          limit: 100 // Adjust as needed
        }
      });
      
      if (!leadsResponse.data.data || !Array.isArray(leadsResponse.data.data)) {
        return {
          success: true,
          message: 'List synced to GoHighLevel, but no leads found to sync',
          tag: syncTagResponse.tag
        };
      }
      
      const leads = leadsResponse.data.data;
      const leadIds = leads.map(lead => lead.id);
      
      // Sync leads to the list
      await goHighLevelService.syncLeadsToList({ apiKey, locationId, listId: listData.id, leadIds });
      
      return {
        success: true,
        message: `List and ${leads.length} leads synced to GoHighLevel`,
        tag: syncTagResponse.tag
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  /**
   * Sync list from GoHighLevel to Nextiva
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  syncListFromGhl: async ({ apiKey, locationId, listId }) => {
    try {
      const client = createApiClient(apiKey);
      
      // First, get the list details from Nextiva
      const listResponse = await axios.get(`${process.env.NEXTIVA_API_BASE_URL}/lists/${listId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!listResponse.data.data) {
        return {
          success: false,
          message: 'List not found in Nextiva'
        };
      }
      
      const listName = listResponse.data.data.name;
      
      // Find the tag in GoHighLevel
      const tagsResponse = await client.get('/tags', {
        params: { locationId }
      });
      
      const existingTag = tagsResponse.data.tags.find(tag => tag.name === listName);
      
      if (!existingTag) {
        return {
          success: false,
          message: 'Tag not found in GoHighLevel'
        };
      }
      
      // Get all contacts with this tag from GoHighLevel
      const contactsResponse = await client.get(`/contacts/tag/${existingTag.id}`, {
        params: { locationId }
      });
      
      if (!contactsResponse.data.contacts || !Array.isArray(contactsResponse.data.contacts)) {
        return {
          success: true,
          message: 'No contacts found with this tag in GoHighLevel'
        };
      }
      
      const contacts = contactsResponse.data.contacts;
      
      // For each contact, create or update a lead in Nextiva and add to the list
      const results = [];
      
      for (const contact of contacts) {
        try {
          // Check if lead exists in Nextiva by email or phone
          let leadId = null;
          
          if (contact.email) {
            const searchResponse = await axios.post(`${process.env.NEXTIVA_API_BASE_URL}/leads/search`, {
              email: contact.email
            }, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (searchResponse.data.data && searchResponse.data.data.length > 0) {
              leadId = searchResponse.data.data[0].id;
            }
          }
          
          if (!leadId && contact.phone) {
            const searchResponse = await axios.post(`${process.env.NEXTIVA_API_BASE_URL}/leads/search`, {
              phone: contact.phone
            }, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (searchResponse.data.data && searchResponse.data.data.length > 0) {
              leadId = searchResponse.data.data[0].id;
            }
          }
          
          // Map contact data to lead data
          const leadData = {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            source: 'GoHighLevel',
            customFields: contact.customFields || {}
          };
          
          let response;
          
          if (leadId) {
            // Update existing lead
            response = await axios.put(`${process.env.NEXTIVA_API_BASE_URL}/leads/${leadId}`, leadData, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            });
          } else {
            // Create new lead
            response = await axios.post(`${process.env.NEXTIVA_API_BASE_URL}/leads`, leadData, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
              }
            });
            
            leadId = response.data.data.id;
          }
          
          // Add lead to list
          await axios.post(`${process.env.NEXTIVA_API_BASE_URL}/lists/${listId}/leads`, {
            leadIds: [leadId]
          }, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          results.push({
            contactId: contact.id,
            leadId,
            success: true,
            message: 'Contact synced to Nextiva and added to list'
          });
        } catch (error) {
          results.push({
            contactId: contact.id,
            success: false,
            message: error.message || 'Error syncing contact to Nextiva'
          });
        }
      }
      
      return {
        success: true,
        message: `${results.filter(r => r.success).length} contacts synced from GoHighLevel to Nextiva`,
        results
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
  getLists: async ({ accessToken, locationId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    try {
      // Check if we're in demo mode
      if (!accessToken || accessToken.startsWith('demo-')) {
        return {
          success: true,
          data: [
            {
              id: 'demo-list-1',
              name: 'Hot Leads',
              description: 'High priority leads',
              tags: ['hot', 'priority'],
              leadCount: 25,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            {
              id: 'demo-list-2',
              name: 'Cold Leads',
              description: 'Leads to nurture',
              tags: ['cold', 'nurture'],
              leadCount: 15,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 2,
            totalPages: 1
          }
        };
      }

      const client = createApiClient(accessToken);
      const response = await client.get('/tags', {
        params: { 
          locationId,
          limit,
          offset: (page - 1) * limit
        }
      });
      
      return {
        success: true,
        data: response.data.tags || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / limit)
        }
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
  getListById: async ({ accessToken, locationId, listId }) => {
    try {
      // Check if we're in demo mode
      if (!accessToken || accessToken.startsWith('demo-')) {
        return {
          success: true,
          data: {
            id: listId,
            name: 'Demo List',
            description: 'Demo list for testing',
            tags: ['demo'],
            leadCount: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        };
      }

      const client = createApiClient(accessToken);
      const response = await client.get(`/tags/${listId}`, {
        params: { locationId }
      });
      
      return {
        success: true,
        data: response.data
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
  createList: async ({ accessToken, locationId, listData }) => {
    try {
      // Check if we're in demo mode
      if (!accessToken || accessToken.startsWith('demo-')) {
        return {
          success: true,
          data: {
            id: `demo-list-${Date.now()}`,
            name: listData.name,
            description: listData.description,
            tags: listData.tags || [],
            leadCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          message: 'List created successfully (demo mode)'
        };
      }

      const client = createApiClient(accessToken);
      const response = await client.post('/tags', {
        locationId,
        name: listData.name,
        color: listData.color || '#007bff'
      });
      
      return {
        success: true,
        data: response.data,
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
  updateList: async ({ accessToken, locationId, listId, listData }) => {
    try {
      // Check if we're in demo mode
      if (!accessToken || accessToken.startsWith('demo-')) {
        return {
          success: true,
          data: {
            id: listId,
            name: listData.name,
            description: listData.description,
            tags: listData.tags || [],
            leadCount: 10,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date().toISOString()
          },
          message: 'List updated successfully (demo mode)'
        };
      }

      const client = createApiClient(accessToken);
      const response = await client.put(`/tags/${listId}`, {
        locationId,
        name: listData.name,
        color: listData.color || '#007bff'
      });
      
      return {
        success: true,
        data: response.data,
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
  deleteList: async ({ accessToken, locationId, listId }) => {
    try {
      // Check if we're in demo mode
      if (!accessToken || accessToken.startsWith('demo-')) {
        return {
          success: true,
          message: 'List deleted successfully (demo mode)'
        };
      }

      const client = createApiClient(accessToken);
      await client.delete(`/tags/${listId}`, {
        params: { locationId }
      });
      
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
  getListLeads: async ({ accessToken, locationId, listId, page = 1, limit = 20 }) => {
    try {
      // Check if we're in demo mode
      if (!accessToken || accessToken.startsWith('demo-')) {
        return {
          success: true,
          data: [
            {
              id: 'demo-lead-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '+1234567890',
              company: 'Demo Company',
              status: 'new',
              addedAt: new Date().toISOString()
            },
            {
              id: 'demo-lead-2',
              firstName: 'Jane',
              lastName: 'Smith',
              email: 'jane@example.com',
              phone: '+1234567891',
              company: 'Demo Corp',
              status: 'qualified',
              addedAt: new Date().toISOString()
            }
          ],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: 2,
            totalPages: 1
          }
        };
      }

      const client = createApiClient(accessToken);
      const response = await client.get('/contacts', {
        params: { 
          locationId,
          tags: [listId],
          limit,
          offset: (page - 1) * limit
        }
      });
      
      return {
        success: true,
        data: response.data.contacts || [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: response.data.count || 0,
          totalPages: Math.ceil((response.data.count || 0) / limit)
        }
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
  addLeadsToList: async ({ accessToken, locationId, listId, leadIds }) => {
    try {
      // Check if we're in demo mode
      if (!accessToken || accessToken.startsWith('demo-')) {
        return {
          success: true,
          message: `${leadIds.length} leads added to list successfully (demo mode)`,
          added: leadIds.length,
          failed: 0
        };
      }

      const client = createApiClient(accessToken);
      let added = 0;
      let failed = 0;

      for (const leadId of leadIds) {
        try {
          await client.put(`/contacts/${leadId}`, {
            locationId,
            tags: [listId]
          });
          added++;
        } catch (error) {
          failed++;
        }
      }
      
      return {
        success: true,
        message: `${added} leads added to list successfully`,
        added,
        failed
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  /**
   * Remove lead from a list
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} Response data
   */
  removeLeadFromList: async ({ accessToken, locationId, listId, leadId }) => {
    try {
      // Check if we're in demo mode
      if (!accessToken || accessToken.startsWith('demo-')) {
        return {
          success: true,
          message: 'Lead removed from list successfully (demo mode)'
        };
      }

      const client = createApiClient(accessToken);
      
      // Get current contact to remove the tag
      const contactResponse = await client.get(`/contacts/${leadId}`, {
        params: { locationId }
      });
      
      const currentTags = contactResponse.data.tags || [];
      const updatedTags = currentTags.filter(tag => tag !== listId);
      
      await client.put(`/contacts/${leadId}`, {
        locationId,
        tags: updatedTags
      });
      
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
  goHighLevelService,
  storeThrioCredentials,
  getThrioCredentials,
  validateAppInstallation
};