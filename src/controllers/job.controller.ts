// src/controllers/job.controller.ts
import { Request, Response } from 'express';
import {Job} from '../models/job.model';
import { Client } from '@elastic/elasticsearch';
// @ts-ignore
import _ from 'lodash';

const esClient = new Client({
    node: process.env.ELASTICSEARCH_NODE,
});

esClient.ping()
    .then(() => console.log('✅ Elasticsearch is reachable'))
    .catch(err => {
        console.error('❌ Elasticsearch connection failed:', err);
    });

export const createJob = async (req: Request, res: Response) => {
    try {
        const job = new Job(req.body);
        const savedJob = await job.save();

        // Index to Elasticsearch
        await esClient.index({
            index: 'job_search',
            id: savedJob._id.toString(),
            document: {
                title: savedJob.title,
                description: savedJob.description,
                location: savedJob.location,
                company_name: savedJob.company_name,
                work_type: savedJob.work_type,
                skills: savedJob.skills.map((skill) => ({ name: skill })), // nested obj
                salary_min: savedJob.salary_min,
                salary_max: savedJob.salary_max,
                industry: savedJob.industry,
                company_size: savedJob.company_size,
                experience: savedJob.experience
            }
        });

        res.status(201).json(savedJob);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create job', details: err });
    }
};

export const getJobs = async (_: Request, res: Response) => {
    try {
        const jobs = await Job.find();
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch jobs', details: err });
    }
};

export const searchJobs = async (req: Request, res: Response) => {
    try {
        const {
            searchQuery,
            location,
            work_type,
            experience,
            salary_range,
            company_size,
            industry,
            skills
        } = req.body;

        const mustQueries: any[] = [];

        // Main search with synonyms
        if (searchQuery) {
            mustQueries.push({
                multi_match: {
                    query: searchQuery,
                    fields: [
                        'title^3',
                        'description',
                        'skills.name'
                    ],
                    fuzziness: 'AUTO'
                }
            });
        }

        // Filters
        if (location) mustQueries.push({ match: { location } });
        if (work_type) mustQueries.push({ match: { work_type } });
        if (experience) mustQueries.push({ match: { experience } });
        if (company_size) mustQueries.push({ match: { company_size } });
        if (industry) mustQueries.push({ match: { industry } });

        if (salary_range) {
            const [min, max] = salary_range.split('-').map((v: string) => parseFloat(v.trim()));
            if (!isNaN(min) && !isNaN(max)) {
                mustQueries.push({
                    bool: {
                        should: [
                            { range: { salary_min: { lte: max } } }, // job starts below max
                            { range: { salary_max: { gte: min } } }  // job ends above min
                        ],
                        minimum_should_match: 1
                    }
                });
            }
        }

        // Skills (nested query)
        if (skills && skills.length > 0) {
            mustQueries.push({
                bool: {
                    should: skills.map((skill: any) => ({
                        nested: {
                            path: 'skills',
                            query: {
                                match: {
                                    'skills.name': {
                                        query: skill,
                                        fuzziness: 'AUTO'
                                    }
                                }
                            }
                        }
                    }))
                }
            });
        }

        // Elasticsearch query
        const esResponse = await esClient.search({
            index: 'job_search',
            size: 50,
            query: {
                bool: { must: mustQueries }
            },
            highlight: {
                fields: {
                    title: {},
                    description: {},
                    'skills.name': {}
                }
            }
        });

        res.json(esResponse.hits.hits.map(hit => ({
            id: hit._id,
            ...(hit._source || {}),
            highlight: hit.highlight || {}
        })));
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Search failed' });
    }
};

export const getJobAnalytics = async (_: Request, res: Response) => {
    try {
        const esResponse = await esClient.search({
            index: 'job_search',
            size: 0,
            runtime_mappings: {
                skill_name_runtime: {
                    type: 'keyword',
                    script: {
                        source: `
                            if (params._source.containsKey('skills') && params._source.skills != null) {
                                for (def skill : params._source.skills) {
                                    if (skill.containsKey('name') && skill.name != null) {
                                        emit(skill.name);
                                    }
                                }
                            }
                        `
                    }
                },
                title_runtime: {
                    type: 'keyword',
                    script: {
                        source: `
                            if (params._source.containsKey('title') && params._source.title != null) {
                                emit(params._source.title);
                            }
                        `
                    }
                }
            },
            aggs: {
                top_skills: {
                    terms: {
                        field: 'skill_name_runtime',
                        size: 10
                    }
                },
                top_jobs: {
                    terms: {
                        field: 'title_runtime',
                        size: 10
                    }
                },
                work_types: {
                    terms: {
                        field: 'work_type',
                        size: 10
                    }
                },
                industries: {
                    terms: {
                        field: 'industry',
                        size: 10
                    }
                },
                experience_levels: {
                    terms: {
                        field: 'experience',
                        size: 10
                    }
                }
            }
        });

        res.json(esResponse.aggregations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch analytics" });
    }
};


