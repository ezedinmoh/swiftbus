/**
 * SwiftBus Admin Modal System
 * Provides enhanced modal dialogs to replace browser alerts/confirms
 */

// Initialize modals when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initAdminModals();
});

function initAdminModals() {
    // Check if modals already exist, if not create them
    if (!document.getElementById('adminAlertModal')) {
        createModalHTML();
    }
    setupModalEventListeners();
}

function createModalHTML() {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <!-- Alert/Notification Modal -->
        <div class="admin-modal" id="adminAlertModal">
            <div class="admin-modal-content" style="max-width: 450px;">
                <div class="admin-modal-header" id="adminAlertModalHeader">
                    <h3 id="adminAlertModalTitle"><i class="fas fa-info-circle"></i> Notice</h3>
                    <button class="admin-modal-close" id="closeAdminAlertModal">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <p id="adminAlertModalMessage" style="font-size: 15px; line-height: 1.6; margin: 0;"></p>
                </div>
                <div style="padding: 15px 20px; border-top: 1px solid #eee; text-align: right;">
                    <button class="btn btn-primary" id="adminAlertModalOkBtn" style="min-width: 100px;">
                        <i class="fas fa-check"></i> OK
                    </button>
                </div>
            </div>
        </div>

        <!-- Confirm Modal -->
        <div class="admin-modal" id="adminConfirmModal">
            <div class="admin-modal-content" style="max-width: 450px;">
                <div class="admin-modal-header" id="adminConfirmModalHeader" style="background: linear-gradient(135deg, #ffc107 0%, #ff9800 100%);">
                    <h3 id="adminConfirmModalTitle" style="color: white;"><i class="fas fa-exclamation-triangle"></i> Confirm Action</h3>
                    <button class="admin-modal-close" id="closeAdminConfirmModal" style="color: white;">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <p id="adminConfirmModalMessage" style="font-size: 15px; line-height: 1.6; margin: 0;"></p>
                    <div id="adminConfirmModalInput" style="margin-top: 15px; display: none;">
                        <label class="form-label">Reason:</label>
                        <textarea class="form-control" id="adminConfirmModalReason" rows="2" placeholder="Enter reason..."></textarea>
                    </div>
                </div>
                <div style="padding: 15px 20px; border-top: 1px solid #eee; display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn btn-secondary" id="adminConfirmModalCancelBtn">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn btn-danger" id="adminConfirmModalConfirmBtn">
                        <i class="fas fa-check"></i> Confirm
                    </button>
                </div>
            </div>
        </div>

        <!-- View Details Modal -->
        <div class="admin-modal" id="adminViewModal">
            <div class="admin-modal-content" style="max-width: 600px;">
                <div class="admin-modal-header" id="adminViewModalHeader">
                    <h3 id="adminViewModalTitle"><i class="fas fa-eye"></i> Details</h3>
                    <button class="admin-modal-close" id="closeAdminViewModal">&times;</button>
                </div>
                <div class="admin-modal-body" id="adminViewModalContent">
                    <!-- Content will be populated here -->
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
    
    // Add modal styles if not already present
    if (!document.getElementById('admin-modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'admin-modal-styles';
        styles.textContent = `
            .admin-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10000;
                backdrop-filter: blur(4px);
            }
            .admin-modal.active {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .admin-modal-content {
                background: white;
                border-radius: 15px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideIn 0.3s ease;
            }
            @keyframes modalSlideIn {
                from { transform: translateY(-30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            .admin-modal-header {
                padding: 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background: linear-gradient(135deg, #1a73e8 0%, #1557b0 100%);
                border-radius: 15px 15px 0 0;
            }
            .admin-modal-header h3 {
                margin: 0;
                color: white;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .admin-modal-close {
                background: none;
                border: none;
                font-size: 28px;
                cursor: pointer;
                color: white;
                opacity: 0.8;
                transition: opacity 0.2s;
                line-height: 1;
            }
            .admin-modal-close:hover {
                opacity: 1;
            }
            .admin-modal-body {
                padding: 20px;
            }
            @media (max-width: 768px) {
                .admin-modal-content {
                    margin: 10px;
                    width: calc(100% - 20px);
                    max-height: calc(100vh - 20px);
                }
            }
        `;
        document.head.appendChild(styles);
    }
}

function setupModalEventListeners() {
    // Alert modal
    const alertModal = document.getElementById('adminAlertModal');
    if (alertModal) {
        document.getElementById('closeAdminAlertModal')?.addEventListener('click', () => alertModal.classList.remove('active'));
        document.getElementById('adminAlertModalOkBtn')?.addEventListener('click', () => alertModal.classList.remove('active'));
        alertModal.addEventListener('click', (e) => { if (e.target === alertModal) alertModal.classList.remove('active'); });
    }
    
    // Confirm modal
    const confirmModal = document.getElementById('adminConfirmModal');
    if (confirmModal) {
        document.getElementById('closeAdminConfirmModal')?.addEventListener('click', () => confirmModal.classList.remove('active'));
        document.getElementById('adminConfirmModalCancelBtn')?.addEventListener('click', () => confirmModal.classList.remove('active'));
        confirmModal.addEventListener('click', (e) => { if (e.target === confirmModal) confirmModal.classList.remove('active'); });
    }
    
    // View modal
    const viewModal = document.getElementById('adminViewModal');
    if (viewModal) {
        document.getElementById('closeAdminViewModal')?.addEventListener('click', () => viewModal.classList.remove('active'));
        viewModal.addEventListener('click', (e) => { if (e.target === viewModal) viewModal.classList.remove('active'); });
    }
}

/**
 * Show an alert modal
 * @param {string} message - The message to display (supports HTML)
 * @param {string} type - Type of alert: 'success', 'error', 'warning', 'info'
 * @param {string} title - Optional custom title
 */
function showAdminAlert(message, type = 'info', title = null) {
    // Ensure modals are initialized
    if (!document.getElementById('adminAlertModal')) {
        createModalHTML();
        setupModalEventListeners();
    }
    
    const modal = document.getElementById('adminAlertModal');
    const header = document.getElementById('adminAlertModalHeader');
    const titleEl = document.getElementById('adminAlertModalTitle');
    const messageEl = document.getElementById('adminAlertModalMessage');
    
    const configs = {
        'success': { icon: 'check-circle', color: '#28a745', title: 'Success' },
        'error': { icon: 'times-circle', color: '#dc3545', title: 'Error' },
        'warning': { icon: 'exclamation-triangle', color: '#ffc107', title: 'Warning' },
        'info': { icon: 'info-circle', color: '#1a73e8', title: 'Notice' }
    };
    
    const config = configs[type] || configs['info'];
    header.style.background = `linear-gradient(135deg, ${config.color} 0%, ${adjustColorBrightness(config.color, -20)} 100%)`;
    titleEl.innerHTML = `<i class="fas fa-${config.icon}"></i> ${title || config.title}`;
    titleEl.style.color = 'white';
    messageEl.innerHTML = message.replace(/\n/g, '<br>');
    
    modal.classList.add('active');
}

/**
 * Show a confirmation modal
 * @param {string} message - The message to display (supports HTML)
 * @param {function} onConfirm - Callback function when confirmed
 * @param {object} options - Optional settings: { showInput: boolean, confirmText: string, title: string }
 */
function showAdminConfirm(message, onConfirm, options = {}) {
    // Ensure modals are initialized
    if (!document.getElementById('adminConfirmModal')) {
        createModalHTML();
        setupModalEventListeners();
    }
    
    const modal = document.getElementById('adminConfirmModal');
    const messageEl = document.getElementById('adminConfirmModalMessage');
    const inputDiv = document.getElementById('adminConfirmModalInput');
    const reasonInput = document.getElementById('adminConfirmModalReason');
    const confirmBtn = document.getElementById('adminConfirmModalConfirmBtn');
    const titleEl = document.getElementById('adminConfirmModalTitle');
    
    messageEl.innerHTML = message.replace(/\n/g, '<br>');
    
    if (options.title) {
        titleEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${options.title}`;
    }
    
    // Show/hide reason input
    if (options.showInput) {
        inputDiv.style.display = 'block';
        reasonInput.value = '';
    } else {
        inputDiv.style.display = 'none';
    }
    
    // Update confirm button text
    confirmBtn.innerHTML = `<i class="fas fa-check"></i> ${options.confirmText || 'Confirm'}`;
    
    // Remove old event listener and add new one
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        const reason = options.showInput ? reasonInput.value : null;
        onConfirm(reason);
    });
    
    modal.classList.add('active');
}

/**
 * Show a view details modal
 * @param {string} title - Modal title
 * @param {string} content - HTML content to display
 */
function showAdminView(title, content) {
    // Ensure modals are initialized
    if (!document.getElementById('adminViewModal')) {
        createModalHTML();
        setupModalEventListeners();
    }
    
    const modal = document.getElementById('adminViewModal');
    const titleEl = document.getElementById('adminViewModalTitle');
    const contentEl = document.getElementById('adminViewModalContent');
    
    titleEl.innerHTML = `<i class="fas fa-eye"></i> ${title}`;
    contentEl.innerHTML = content;
    
    modal.classList.add('active');
}

/**
 * Adjust color brightness
 */
function adjustColorBrightness(color, amount) {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1);
}

// Export functions for global use
window.showAdminAlert = showAdminAlert;
window.showAdminConfirm = showAdminConfirm;
window.showAdminView = showAdminView;
