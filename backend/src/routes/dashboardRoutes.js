const express = require("express");
const { getUpcomingMilestones, getRecentActivity, getOverdueMilestones  } = require("../controllers/dashboardController");

const router = express.Router();

router.get("/milestones/upcoming", getUpcomingMilestones);
router.get("/activity/recent", getRecentActivity);
router.get('/milestones/overdue', getOverdueMilestones);

module.exports = router;
