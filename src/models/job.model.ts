import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    company_name: {
        type: String,
        required: true,
    },
    work_type: {
        type: String,
        required: true,
    },
    industry: {
        type: String,
    },

    skills: {
        type: [String],
        default: [],
    },
    salary_min: {
        type: Number,
    },
    salary_max: {
        type: Number,
    },
    company_size: {
        type: String,
    },
    experience: {
        type: String,
    },



}, { timestamps: true });

export const Job = mongoose.model('Job', jobSchema);
