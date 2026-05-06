const express = require('express');
const router = express.Router();
const checklistItemController = require('../../controllers/checklistItemController');

router.get('/', checklistItemController.getAllCheckListItems);
router.get('/:id', checklistItemController.getCheckListItemById);
router.post('/', checklistItemController.createCheckListItem);
router.put('/:id', checklistItemController.updateCheckListItem);
router.delete('/:id', checklistItemController.deleteCheckListItem);

module.exports = router;
