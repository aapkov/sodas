const express = require('express')
const router = express.Router();

router.get('/icon', (req, res) => {
    res.sendFile(path.join(__dirname, '/resources/icon.png'));
});

module.exports = router;