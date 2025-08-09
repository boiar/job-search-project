# Job Search & Analytics Platform

A Node.js + Express application that integrates **MongoDB** for storage and **Elasticsearch** for advanced job search, fuzzy matching, synonyms, highlighting, and market analytics. Frontend visualizations are powered by **Google Charts**.

---

## 📌 Features

### Job Management
- Create, read, and search job postings.
- Store jobs in MongoDB.
- Index jobs in Elasticsearch for fast full-text search.

### Advanced Search
- Fuzzy search on job title, description, and skills.
- Synonym support (e.g., "dev" = "developer", "frontend" = "UI developer").
- Filter by:
    - Location
    - Work type
    - Industry
    - Company size
    - Experience level
    - Salary range
    - Skills (nested query support)

### Analytics Dashboard
- Aggregates top job skills, job titles, industries, work types, and experience levels.
- Visualized with Google Charts.

---

## 📂 Project Structure

src/
├── controllers/
│ └── job.controller.ts # Job CRUD & search endpoints
├── models/
│ └── job.model.ts # Job schema (MongoDB)
├── routes/
│ └── job.routes.ts # API routes
├── views/
│    └── analytics.html 
│    └── index.html
│    └── job-form.html
│    └── job-search.html
└── app.ts # App entry point
public/
│── css
└── js


---

## Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/job-search-analytics.git
cd job-search-analytics
```
### 2. Run Docker 
```bash
docker-compose up -d
```

### 3. Set up Elasticsearch Mappings
- Open Kibana in your browser (usually at http://localhost:5601).
- Go to the Dev Tools section.
- Copy the contents of the src/es-queries.txt file into the console.
- Run the queries to create the **jobs** index with the correct mappings and settings for fuzzy search and synonyms.


### 4. Insert data in mongoDB and elastic search by run script
```bash
    npx ts-node src/scripts/loadJobs.ts
```

### 5. Install Dependencies & Run the Application

```bash
npm install
npm start
```
- The application will now be running on http://localhost:3000. 



---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB (Mongoose)
- **Search Engine:** Elasticsearch 8.x
- **Visualization:** Google Charts
- **Frontend:** HTML5, Bootstrap 5

---