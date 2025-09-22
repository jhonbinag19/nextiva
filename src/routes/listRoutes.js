const express = require('express');
const router = express.Router();
const listController = require('../controllers/listController');
const { authenticate } = require('../middleware/authenticate');
const { validateListCreate, validateListUpdate } = require('../middleware/validators');

// Apply authentication middleware to all list routes
router.use(authenticate);

/**
 * @route GET /api/lists
 * @desc Get all lists
 * @access Private
 */
router.get('/', listController.getAllLists);

/**
 * @route GET /api/lists/:id
 * @desc Get list by ID
 * @access Private
 */
router.get('/:id', listController.getListById);

/**
 * @route POST /api/lists
 * @desc Create a new list
 * @access Private
 */
router.post('/', validateListCreate, listController.createList);

/**
 * @route PUT /api/lists/:id
 * @desc Update a list
 * @access Private
 */
router.put('/:id', validateListUpdate, listController.updateList);

/**
 * @route DELETE /api/lists/:id
 * @desc Delete a list
 * @access Private
 */
router.delete('/:id', listController.deleteList);

/**
 * @route GET /api/lists/:id/leads
 * @desc Get all leads in a list
 * @access Private
 */
router.get('/:id/leads', listController.getListLeads);

/**
 * @route POST /api/lists/:id/leads
 * @desc Add leads to a list
 * @access Private
 */
router.post('/:id/leads', listController.addLeadsToList);

/**
 * @route DELETE /api/lists/:id/leads/:leadId
 * @desc Remove a lead from a list
 * @access Private
 */
router.delete('/:id/leads/:leadId', listController.removeLeadFromList);

/**
 * @route POST /api/lists/:id/sync
 * @desc Sync list with GoHighLevel
 * @access Private
 */
router.post('/:id/sync', listController.syncList);

module.exports = router;