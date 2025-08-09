import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import { Client } from '@elastic/elasticsearch';
import jobRoutes from "./routes/job.routes";
import path from "path";
import bodyParser from "body-parser";
import esClient from './elasticsearch/client';





const app = express();

app.use('/public', express.static(path.join(__dirname, '../public')));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // For CSS or JS files
app.use(express.json());


app.use('/', jobRoutes)

// MongoDB connection
mongoose.connect(process.env.MONGO_URI!)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// Elasticsearch connection
esClient.ping()
    .then(() => console.log('✅ Elasticsearch is reachable'))
    .catch(err => {
        console.error('❌ Elasticsearch connection failed:', err);
    });


app.get('/', async (req, res) => {
    const health = await esClient.cluster.health();
    res.json({ elasticsearch: health });
});


const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});