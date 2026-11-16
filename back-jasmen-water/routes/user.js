const express = require('express');
const { deleteAllUser, addUser, deleteOneUser, getAllUsers, getOneUser2, getOneUser, updateUser, getLastFiveUsers, getHighFiveUsers, addChargeToUser, addTaxToUser,
    updateTaxForUser, deleteTaxFromUser, clearUserCharges, resetAllMoneyGained } = require('../controller/users');
const router = express.Router();
const { verfiyAdmin, verfiyUser } = require('../utils/verfy_user_token/verfy')

router.post("/AddUser", verfiyAdmin, addUser);
router.get("/GetAllUser", verfiyAdmin, getAllUsers);
router.get("/GetOneUser2/:id", verfiyUser, getOneUser2);
router.get("/GetOneUser/:id", verfiyUser, getOneUser);

router.patch("/UpdateUser/:id", updateUser);

router.delete("/DeleteAllUsers", verfiyAdmin, deleteAllUser);
router.delete("/DeleteOneUser/:id", verfiyAdmin, deleteOneUser);
router.get("/LastFiveUsersAdded", verfiyAdmin, getLastFiveUsers);
router.get("/HighFiveUsersCharging", verfiyAdmin, getHighFiveUsers);
router.post("/AddChargeToUser/:id", verfiyAdmin, addChargeToUser);
router.post("/AddTaxToUser/:id", verfiyAdmin, addTaxToUser);
router.patch("/UpdateTaxToUser/:UserId/:TaxId", verfiyAdmin, updateTaxForUser);
router.delete("/DeleteTaxafromUser/:UserId/:TaxId", verfiyAdmin, deleteTaxFromUser);
router.delete("/ClearUserCharges/:id/charge/:chargeId", verfiyAdmin, clearUserCharges);
router.delete("/ResetAllMoneyGained", verfiyAdmin, resetAllMoneyGained);



router.get('/mmn', (req, res) =>
    res.send('server running successffuly')
);
module.exports = router;

