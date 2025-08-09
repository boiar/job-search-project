import 'dotenv/config';
import mongoose from 'mongoose';
import _ from 'lodash';

import {Job} from '../models/job.model';
import esClient from '../elasticsearch/client';
import jobsData from '../jobs-data.json';

interface JobDocument {
    _id: { toString: () => string };
    title: string;
    description: string;
    location: string;
    salary_min?: number;
    salary_max?: number;
    company_size?: string;
    experience?: string;
    industry?: string;
    company_name: string;
    work_type: string;
    skills: string[];
}

const mongoURI = process.env.MONGO_URI!;
if (!mongoURI) {
    console.error('MONGO_URI environment variable is not set');
    process.exit(1);
}

export const bulkJobsFakeData = async () => {
    try {
        // Insert jobs into MongoDB, continue on errors
        const savedJobs: JobDocument[] = await Job.insertMany(jobsData, { ordered: false });

        const chunkSize = 100;
        for (const chunk of _.chunk(savedJobs, chunkSize)) {
            const body = chunk.flatMap((job: JobDocument) => [
                { index: { _index: 'job_search', _id: job._id.toString() } },
                {
                    title: job.title,
                    description: job.description,
                    location: job.location,
                    company_name: job.company_name,
                    work_type: job.work_type,
                    skills: job.skills.map((skill) => ({ name: skill })), // nested obj
                    salary_min: job.salary_min,
                    salary_max: job.salary_max,
                    industry: job.industry,
                    company_size: job.company_size,
                    experience: job.experience

                },
            ]);
            await esClient.bulk({ refresh: true, body });
        }

        return { insertedCount: savedJobs.length };
    } catch (error) {
        console.error('Error inserting jobs:', error);
        throw error;
    }
};

async function run() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');

        const result = await bulkJobsFakeData();
        console.log(`Inserted ${result.insertedCount} jobs.`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (err) {
        console.error('Error running bulk insert:', err);
        process.exit(1);
    }
}

run();
