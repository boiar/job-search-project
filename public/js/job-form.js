// Job Form JavaScript
class JobForm {
    constructor() {
        this.skills = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const form = document.getElementById('jobForm');
        const skillInput = document.getElementById('skillInput');
        const addSkillBtn = document.getElementById('addSkill');

        // Form submission
        form.addEventListener('submit', (e) => this.handleSubmit(e));

        // Skill input - Enter key
        skillInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill();
            }
        });

        // Add skill button
        addSkillBtn.addEventListener('click', () => this.addSkill());

        // Bootstrap form validation
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
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
        }
    }

    removeSkill(skillToRemove) {
        this.skills = this.skills.filter(skill => skill !== skillToRemove);
        this.renderSkills();
        this.updateSkillsInput();
    }

    renderSkills() {
        const container = document.getElementById('skillsContainer');
        container.innerHTML = this.skills.map(skill => `
            <span class="skill-tag">
                ${this.escapeHtml(skill)}
                <button type="button" class="skill-remove" onclick="jobForm.removeSkill('${this.escapeHtml(skill)}')">
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

    async handleSubmit(e) {
        e.preventDefault();

        const form = e.target;
        if (!form.checkValidity()) {
            return;
        }

        this.setLoading(true);

        try {
            const formData = new FormData(form);
            const jobData = {
                title: formData.get('title'),
                description: formData.get('description'),
                location: formData.get('location'),
                company_name: formData.get('company_name'),
                work_type: formData.get('work_type'),
                skills: this.skills,
                salary_min: formData.get('salary_min'),
                salary_max: formData.get('salary_max'),
                industry: formData.get('industry'),
                company_size: formData.get('company_size'),
                experience: formData.get('experience'),
            };

            const response = await fetch('/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(jobData)
            });

            if (response.ok) {
                this.showSuccess();
                this.resetForm();
            } else {
                throw new Error('Failed to submit job');
            }
        } catch (error) {
            console.error('Error submitting job:', error);
            this.showError('Failed to submit job. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        const submitBtn = document.getElementById('submitBtn');
        const submitText = submitBtn.querySelector('.submit-text');
        const spinner = submitBtn.querySelector('.spinner-border');

        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            spinner.classList.remove('d-none');
            submitText.style.opacity = '0';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            submitText.style.opacity = '1';
        }
    }

    showSuccess() {
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
    }

    showError(message) {
        // You can implement a toast or alert for errors
        alert(message);
    }

    resetForm() {
        document.getElementById('jobForm').reset();
        document.getElementById('jobForm').classList.remove('was-validated');
        this.skills = [];
        this.renderSkills();
        this.updateSkillsInput();
    }
}

// Initialize the form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.jobForm = new JobForm();
});