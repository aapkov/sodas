module.exports = async function getUnbanApplications(req, query) {
    // bring in models
    let UnbanRequest = require('../models/unbanRequest');
    let recordsPerPage = 10;
    let previousButtonEnabled = true;
    let nextButtonEnabled = true;

    let applications = await UnbanRequest.find(query)
    .skip((req.params.currentPage - 1) * recordsPerPage)
    .limit(recordsPerPage);

    let nextUnbanApplication = await UnbanRequest.find(query).skip((req.params.currentPage) * recordsPerPage).limit(1);

    if (req.params.currentPage == 1) {
        previousButtonEnabled = false;
    }
    if (nextUnbanApplication.length == 0) {
        nextButtonEnabled = false;
    }
    return {
        applications: applications,
        previousButtonEnabled: previousButtonEnabled,
        nextButtonEnabled: nextButtonEnabled
    }
}
