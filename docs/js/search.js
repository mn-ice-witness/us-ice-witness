const Search = {
    query: '',
    isOpen: false,

    init() {
        this.btn = document.getElementById('search-btn');
        this.modal = document.getElementById('search-modal');
        this.input = document.getElementById('search-input');
        this.clearBtn = document.getElementById('search-clear');
        this.backdrop = this.modal.querySelector('.search-modal-backdrop');

        this.btn.addEventListener('click', () => this.toggle());
        this.backdrop.addEventListener('click', () => this.close());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.input.addEventListener('input', () => this.onInput());
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        this.isOpen = true;
        this.modal.setAttribute('aria-hidden', 'false');
        // Delay focus to ensure modal is visible after CSS transition
        setTimeout(() => {
            this.input.focus();
            this.input.select();
        }, 50);
    },

    close() {
        this.isOpen = false;
        this.modal.setAttribute('aria-hidden', 'true');
        this.updateButtonState();
        this.applyFilter();
    },

    clear() {
        this.query = '';
        this.input.value = '';
        this.btn.classList.remove('active');
        this.close();
        this.applyFilter();
    },

    onInput() {
        this.query = this.input.value.trim();
        this.updateButtonState();
    },

    updateButtonState() {
        if (this.query.length > 0) {
            this.btn.classList.add('active');
        } else {
            this.btn.classList.remove('active');
        }
    },

    applyFilter() {
        if (typeof App !== 'undefined') {
            App.render();
            if (ViewState.currentView === 'media') {
                App.renderMediaGallery();
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Search.init());
