const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { authenticate } = require('../middleware/authenticate');
const { validateLeadCreate, validateLeadUpdate } = require('../middleware/validators');

// Apply authentication middleware to all lead routes
router.use(authenticate);

/**
 * @route GET /api/leads
 * @desc Get all leads
 * @access Private
 */
router.get('/', leadController.getAllLeads);

/**
 * @route GET /api/leads/:id
 * @desc Get lead by ID
 * @access Private
 */
router.get('/:id', leadController.getLeadById);

/**
 * @route POST /api/leads
 * @desc Create a new lead
 * @access Private
 */
router.post('/', validateLeadCreate, leadController.createLead);

/**
 * @route PUT /api/leads/:id
 * @desc Update a lead
 * @access Private
 */
router.put('/:id', validateLeadUpdate, leadController.updateLead);

/**
 * @route DELETE /api/leads/:id
 * @desc Delete a lead
 * @access Private
 */
router.delete('/:id', leadController.deleteLead);

/**
 * @route POST /api/leads/search
 * @desc Search leads by criteria
 * @access Private
 */
router.post('/search', leadController.searchLeads);

/**
 * @route POST /api/leads/bulk
 * @desc Bulk create leads
 * @access Private
 */
router.post('/bulk', leadController.bulkCreateLeads);

/**
 * @route PUT /api/leads/bulk
 * @desc Bulk update leads
 * @access Private
 */
router.put('/bulk', leadController.bulkUpdateLeads);

module.exports = router;