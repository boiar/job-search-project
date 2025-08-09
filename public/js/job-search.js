// Job Search Form JavaScript
class JobSearchForm {
    constructor() {
        this.skills = [];
        this.currentResults = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('jobSearchForm');
        const skillInput = document.getElementById('skillInput');
        const addSkillBtn = document.getElementById('addSkill');
        const clearBtn = document.getElementById('clearBtn');

        // Form submission
        form.addEventListener('submit', (e) => this.handleSearch(e));

        // Skill input - Enter key
        skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill();
            }
        });

        // Add skill button
        addSkillBtn.addEventListener('click', () => this.addSkill());

        // Clear filters button
        clearBtn.addEventListener('click', () => this.clearFilters());

        // Real-time search on input changes
        const searchInputs = form.querySelectorAll('input, select');
        searchInputs.forEach(input => {
            if (input.id !== 'skillInput') {
                input.addEventListener('change', () => {
                    if (this.currentResults.length > 0) {
                        this.performSearch();
                    }
                });
            }
        });
    }

    addSkill() {
        const skillInput = document.getElementById('skillInput');
        const skill = skillInput.value.trim();

        if (skill && !this.skills.includes(skill)) {
            this.skills.push(skill);
            this.renderSkills();
            skillInput.value = '';
            this.updateSkillsInput();

            // Trigger search if there are existing results
            if (this.currentResults.length > 0) {
                this.performSearch();
            }
        }
    }

    removeSkill(skillToRemove) {
        this.skills = this.skills.filter(skill => skill !== skillToRemove);
        this.renderSkills();
        this.updateSkillsInput();

        // Trigger search if there are existing results
        if (this.currentResults.length > 0) {
            this.performSearch();
        }
    }

    renderSkills() {
        const container = document.getElementById('skillsContainer');
        container.innerHTML = this.skills.map(skill => `
            <span class="skill-tag">
                ${this.escapeHtml(skill)}
                <button type="button" class="skill-remove" onclick="jobSearchForm.removeSkill('${this.escapeHtml(skill)}')">
                    ×
                </button>
            </span>
        `).join('');
    }

    updateSkillsInput() {
        document.getElementById('skillsData').value = JSON.stringify(this.skills);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearFilters() {
        document.getElementById('jobSearchForm').reset();
        this.skills = [];
        this.renderSkills();
        this.updateSkillsInput();

        // Hide results
        document.getElementById('resultsSection').style.display = 'none';
        this.currentResults = [];
    }

    async handleSearch(e) {
        e.preventDefault();
        this.performSearch();
    }

    async performSearch() {
        this.setLoading(true);
        try {
            const formData = new FormData(document.getElementById('jobSearchForm'));
            const searchData = {
                searchQuery: formData.get('searchQuery'),
                location: formData.get('location'),
                work_type: formData.get('work_type'),
                experience: formData.get('experience'),
                salary_range: formData.get('salary_range'),
                company_size: formData.get('company_size'),
                industry: formData.get('industry'),
                skills: this.skills
            };

            const response = await fetch('/job-search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(searchData)
            });

            if (!response.ok) throw new Error('Search request failed');

            const results = await response.json();
            this.displayResults(results);
        } catch (error) {
            console.error('Error searching jobs:', error);
            this.showError('Failed to search jobs. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }



    displayResults(results) {
        this.currentResults = results;
        const resultsSection = document.getElementById('resultsSection');
        const resultsCount = document.getElementById('resultsCount');
        const jobResults = document.getElementById('jobResults');

        resultsCount.textContent = results.length;
        resultsSection.style.display = 'block';

        if (results.length === 0) {
            jobResults.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No jobs found</h5>
                <p class="text-muted">Try adjusting your search criteria</p>
            </div>
        `;
            return;
        }

        jobResults.innerHTML = results.map(job => `
        <div class="card mb-3 shadow-sm">
            <div class="card-body">
                <h5 class="card-title">
                    ${job.highlight?.title ? job.highlight.title[0] : job.title}
                </h5>
                <h6 class="card-subtitle mb-2 text-muted">${job.company_name}</h6>

                <p class="card-text">
                    ${job.highlight?.description
            ? job.highlight.description[0]
            : (job.description ? job.description.substring(0, 150) + '...' : '')}
                </p>

                <div class="mb-2">
                    <i class="fas fa-map-marker-alt me-2"></i>${job.location || 'Location not specified'}
                </div>
                <div class="mb-2">
                    <i class="fas fa-dollar-sign me-2"></i>
                    ${job.salary_min && job.salary_max
            ? `$${job.salary_min} - $${job.salary_max}`
            : 'Not specified'}
                </div>
                <div class="mb-2">
                    <i class="fas fa-briefcase me-2"></i>${this.formatWorkType(job.work_type)}
                </div>
                <div class="mb-2">
                    <i class="fas fa-chart-line me-2"></i>${this.formatExperience(job.experience)}
                </div>

                <div class="mb-2">
                    ${job.skills.map(skill => `
                        <span class="badge bg-primary me-1">${skill.name || skill}</span>
                    `).join('')}
                </div>
            </div>
        </div>
    `).join('');

        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }


    formatWorkType(work_type) {
        const types = {
            'remote': 'Remote',
            'hybrid': 'Hybrid',
            'onsite': 'On-site'
        };
        return types[work_type] || work_type;
    }

    formatExperience(experience) {
        const levels = {
            'entry': 'Entry Level',
            'mid': 'Mid Level',
            'senior': 'Senior Level',
            'executive': 'Executive'
        };
        return levels[experience] || experience;
    }

    viewJob(jobId) {
        // In a real application, this would navigate to job details page
        const job = this.currentResults.find(j => j.id === jobId);
        if (job) {
            alert(`Viewing job: ${job.title} at ${job.company}\n\nIn a real application, this would open the job details page.`);
        }
    }

    setLoading(loading) {
        const searchBtn = document.getElementById('searchBtn');
        const submitText = searchBtn.querySelector('.submit-text');
        const spinner = searchBtn.querySelector('.spinner-border');

        if (loading) {
            searchBtn.classList.add('loading');
            searchBtn.disabled = true;
            spinner.classList.remove('d-none');
            submitText.style.opacity = '0';
        } else {
            searchBtn.classList.remove('loading');
            searchBtn.disabled = false;
            spinner.classList.add('d-none');
            submitText.style.opacity = '1';
        }
    }

    showError(message) {
        alert(message);
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobSearchForm = new JobSearchForm();
});