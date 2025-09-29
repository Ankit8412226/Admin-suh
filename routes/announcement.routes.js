const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const ctrl = require('../controllers/announcement.controller');

router.get('/', auth, ctrl.list);
router.post('/', auth, authorize('admin','hr'), ctrl.create);
router.put('/:id', auth, authorize('admin','hr'), ctrl.update);
router.delete('/:id', auth, authorize('admin','hr'), ctrl.remove);

module.exports = router;


