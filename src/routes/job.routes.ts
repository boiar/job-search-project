// src/routes/job.routes.ts
import { Router } from 'express';
import {createJob, getJobAnalytics, getJobs, searchJobs} from '../controllers/job.controller';
import path from "path";

const router = Router();


router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

router.get('/jobs', getJobs);

router.get('/job-form', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/job-form.html'));
});

router.get('/job-search', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/job-search.html'));
});
router.post('/job-search', searchJobs);


router.get('/job-analytics-page', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/analytics.html'));
});

router.get("/job-analytics", getJobAnalytics);




router.post('/jobs', createJob);

export default router;
