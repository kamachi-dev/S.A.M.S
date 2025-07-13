function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

let childCounter = 0;
let updateChildCounter = 0;
let currentUpdatingParent = null;
let addedParents = []; // Store added parents data

// Add Parent Modal Functions
function openAddParentModal() {
    document.getElementById('addParentModal').style.display = 'block';
    // Add first child form by default
    addChildForm();
}

function closeAddParentModal() {
    document.getElementById('addParentModal').style.display = 'none';
    // Clear form
    clearAddParentForm();
}

function clearAddParentForm() {
    // Clear parent fields
    document.getElementById('parentFirstName').value = '';
    document.getElementById('parentLastName').value = '';
    document.getElementById('parentEmail').value = '';
    document.getElementById('parentPhone').value = '';
    
    // Clear children container
    document.getElementById('childrenContainer').innerHTML = '';
    childCounter = 0;
}

function addChildForm() {
    childCounter++;
    const childrenContainer = document.getElementById('childrenContainer');
    
    const childForm = document.createElement('div');
    childForm.className = 'child-form';
    childForm.id = `child-${childCounter}`;
    
    childForm.innerHTML = `
        <div class="child-form-header">
            <h4>Child ${childCounter}</h4>
            <button type="button" class="remove-child-btn" onclick="removeChildForm(${childCounter})">Remove</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="childFirstName${childCounter}">First Name *</label>
                <input type="text" id="childFirstName${childCounter}" required>
            </div>
            <div class="form-group">
                <label for="childLastName${childCounter}">Last Name *</label>
                <input type="text" id="childLastName${childCounter}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="childEmail${childCounter}">Email *</label>
                <input type="email" id="childEmail${childCounter}" required>
            </div>
            <div class="form-group">
                <label for="childPhone${childCounter}">Phone Number *</label>
                <input type="tel" id="childPhone${childCounter}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="childGrade${childCounter}">Grade Level *</label>
                <select id="childGrade${childCounter}" required>
                    <option value="">Select Grade</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                </select>
            </div>
            <div class="form-group">
                <!-- Empty space for layout -->
            </div>
        </div>
    `;
    
    childrenContainer.appendChild(childForm);
}

function removeChildForm(childId) {
    const childForm = document.getElementById(`child-${childId}`);
    if (childForm) {
        childForm.remove();
    }
    
    // If no children left, add one back
    const remainingChildren = document.querySelectorAll('.child-form');
    if (remainingChildren.length === 0) {
        addChildForm();
    }
}

function confirmAddParent() {
    // Validate parent fields
    const parentFirstName = document.getElementById('parentFirstName').value.trim();
    const parentLastName = document.getElementById('parentLastName').value.trim();
    const parentEmail = document.getElementById('parentEmail').value.trim();
    const parentPhone = document.getElementById('parentPhone').value.trim();
    
    if (!parentFirstName || !parentLastName || !parentEmail || !parentPhone) {
        alert('Please fill in all parent information fields.');
        return;
    }
    
    // Validate children fields
    const childForms = document.querySelectorAll('.child-form');
    const children = [];
    
    for (let i = 0; i < childForms.length; i++) {
        const childForm = childForms[i];
        const childId = childForm.id.split('-')[1];
        
        const childFirstName = document.getElementById(`childFirstName${childId}`).value.trim();
        const childLastName = document.getElementById(`childLastName${childId}`).value.trim();
        const childEmail = document.getElementById(`childEmail${childId}`).value.trim();
        const childPhone = document.getElementById(`childPhone${childId}`).value.trim();
        const childGrade = document.getElementById(`childGrade${childId}`).value;
        
        if (!childFirstName || !childLastName || !childEmail || !childPhone || !childGrade) {
            alert(`Please fill in all fields for Child ${parseInt(childId)}.`);
            return;
        }
        
        children.push({
            firstName: childFirstName,
            lastName: childLastName,
            email: childEmail,
            phone: childPhone,
            grade: childGrade
        });
    }
    
    // Create parent object
    const newParent = {
        id: Date.now(), // Simple ID generation
        firstName: parentFirstName,
        lastName: parentLastName,
        email: parentEmail,
        phone: parentPhone,
        children: children
    };
    
    // Add to stored parents
    addedParents.push(newParent);
    
    // Create and add parent card to the page
    addParentCardToPage(newParent);
    
    // Close modal and clear form
    closeAddParentModal();
    
    // Update parent count
    updateParentCount();
}

function addParentCardToPage(parent) {
    // Determine which letter section to add to
    const firstLetter = parent.lastName.charAt(0).toUpperCase();
    let letterSection = document.querySelector(`[data-letter="${firstLetter.toLowerCase()}"]`);
    
    // If letter section doesn't exist, create it
    if (!letterSection) {
        letterSection = createLetterSection(firstLetter);
    }
    
    // Create parent card
    const parentCard = document.createElement('div');
    parentCard.className = 'parent-card';
    parentCard.setAttribute('data-letter', firstLetter.toLowerCase());
    parentCard.setAttribute('data-added', 'true');
    
    parentCard.innerHTML = `
        <img src="/assets/Sample.png" alt="Parent" class="parent-photo">
        <div class="parent-info">
            <div class="parent-name">${parent.firstName} ${parent.lastName}</div>
        </div>
        <div class="action-buttons">
            <button class="details-btn" onclick="showAddedParentDetails(${parent.id})">Details</button>
            <button class="update-btn" onclick="updateAddedParent(${parent.id})">Update</button>
            <button class="delete-btn" onclick="deleteAddedParent(${parent.id}, this)">Delete</button>
        </div>
    `;
    
    // Add to the appropriate grid
    const parentsGrid = letterSection.querySelector('.parents-grid');
    parentsGrid.appendChild(parentCard);
}

function createLetterSection(letter) {
    const content = document.querySelector('.content');
    const letterSection = document.createElement('div');
    letterSection.className = 'letter-section';
    letterSection.setAttribute('data-letter', letter.toLowerCase());
    
    letterSection.innerHTML = `
        <h2 class="letter-title">${letter}</h2>
        <div class="parents-grid"></div>
    `;
    
    // Insert in alphabetical order
    const existingSections = document.querySelectorAll('.letter-section');
    let inserted = false;
    
    for (let section of existingSections) {
        const sectionLetter = section.getAttribute('data-letter');
        if (letter.toLowerCase() < sectionLetter) {
            content.insertBefore(letterSection, section);
            inserted = true;
            break;
        }
    }
    
    if (!inserted) {
        content.appendChild(letterSection);
    }
    
    return letterSection;
}

function showAddedParentDetails(parentId) {
    const parent = addedParents.find(p => p.id === parentId);
    if (!parent) return;
    
    let childrenDetails = '';
    parent.children.forEach((child, index) => {
        childrenDetails += `
            <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">Child ${index + 1}: ${child.firstName} ${child.lastName}</h4>
                <p style="margin: 3px 0;"><strong>Email:</strong> ${child.email}</p>
                <p style="margin: 3px 0;"><strong>Phone:</strong> ${child.phone}</p>
                <p style="margin: 3px 0;"><strong>Grade:</strong> Grade ${child.grade}</p>
            </div>
        `;
    });
    
    document.getElementById('modalName').innerHTML = `${parent.firstName} ${parent.lastName}`;
    document.getElementById('modalPhone').textContent = parent.phone;
    document.getElementById('modalEmail').textContent = parent.email;
    
    // Add children details to modal
    const modalInfo = document.querySelector('.modal-info');
    modalInfo.innerHTML = `
        <p><strong>Phone:</strong> <span id="modalPhone">${parent.phone}</span></p>
        <p><strong>Email:</strong> <span id="modalEmail">${parent.email}</span></p>
        <div style="margin-top: 20px;">
            <h3 style="margin-bottom: 15px; color: #333;">Children:</h3>
            ${childrenDetails}
        </div>
    `;
    
    document.getElementById('detailsModal').style.display = 'block';
}

function deleteAddedParent(parentId, button) {
    if (confirm('Are you sure you want to delete this parent?')) {
        // Remove from stored parents
        addedParents = addedParents.filter(p => p.id !== parentId);
        
        // Remove card from page
        const parentCard = button.closest('.parent-card');
        const letterSection = parentCard.closest('.letter-section');
        parentCard.remove();
        
        // If letter section is now empty, remove it
        const remainingCards = letterSection.querySelectorAll('.parent-card');
        if (remainingCards.length === 0) {
            letterSection.remove();
        }
        
        // Update parent count
        updateParentCount();
    }
}

// Update Parent Modal Functions
function updateParent(name, phone, email) {
    // For existing parents (not added ones), create mock data
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    currentUpdatingParent = {
        isExisting: true,
        originalName: name,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        children: [
            {
                firstName: 'Sample',
                lastName: 'Child',
                email: 'child@example.com',
                phone: '(555) 0000',
                grade: '10'
            }
        ]
    };
    
    openUpdateParentModal();
}

function updateAddedParent(parentId) {
    const parent = addedParents.find(p => p.id === parentId);
    if (!parent) return;
    
    currentUpdatingParent = { ...parent, isExisting: false };
    openUpdateParentModal();
}

function openUpdateParentModal() {
    document.getElementById('updateParentModal').style.display = 'block';
    
    // Pre-fill parent information
    document.getElementById('updateParentFirstName').value = currentUpdatingParent.firstName;
    document.getElementById('updateParentLastName').value = currentUpdatingParent.lastName;
    document.getElementById('updateParentEmail').value = currentUpdatingParent.email;
    document.getElementById('updateParentPhone').value = currentUpdatingParent.phone;
    
    // Clear and populate children
    const childrenContainer = document.getElementById('updateChildrenContainer');
    childrenContainer.innerHTML = '';
    updateChildCounter = 0;
    
    // Add existing children
    currentUpdatingParent.children.forEach(child => {
        addUpdateChildForm(child);
    });
    
    // If no children, add one empty form
    if (currentUpdatingParent.children.length === 0) {
        addUpdateChildForm();
    }
}

function closeUpdateParentModal() {
    document.getElementById('updateParentModal').style.display = 'none';
    currentUpdatingParent = null;
    updateChildCounter = 0;
}

function addUpdateChildForm(childData = null) {
    updateChildCounter++;
    const childrenContainer = document.getElementById('updateChildrenContainer');
    
    const childForm = document.createElement('div');
    childForm.className = 'child-form';
    childForm.id = `updateChild-${updateChildCounter}`;
    
    childForm.innerHTML = `
        <div class="child-form-header">
            <h4>Child ${updateChildCounter}</h4>
            <button type="button" class="remove-child-btn" onclick="removeUpdateChildForm(${updateChildCounter})">Remove</button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="updateChildFirstName${updateChildCounter}">First Name *</label>
                <input type="text" id="updateChildFirstName${updateChildCounter}" value="${childData?.firstName || ''}" required>
            </div>
            <div class="form-group">
                <label for="updateChildLastName${updateChildCounter}">Last Name *</label>
                <input type="text" id="updateChildLastName${updateChildCounter}" value="${childData?.lastName || ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="updateChildEmail${updateChildCounter}">Email *</label>
                <input type="email" id="updateChildEmail${updateChildCounter}" value="${childData?.email || ''}" required>
            </div>
            <div class="form-group">
                <label for="updateChildPhone${updateChildCounter}">Phone Number *</label>
                <input type="tel" id="updateChildPhone${updateChildCounter}" value="${childData?.phone || ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label for="updateChildGrade${updateChildCounter}">Grade Level *</label>
                <select id="updateChildGrade${updateChildCounter}" required>
                    <option value="">Select Grade</option>
                    <option value="10" ${childData?.grade === '10' ? 'selected' : ''}>Grade 10</option>
                    <option value="11" ${childData?.grade === '11' ? 'selected' : ''}>Grade 11</option>
                    <option value="12" ${childData?.grade === '12' ? 'selected' : ''}>Grade 12</option>
                </select>
            </div>
            <div class="form-group">
                <!-- Empty space for layout -->
            </div>
        </div>
    `;
    
    childrenContainer.appendChild(childForm);
}

function removeUpdateChildForm(childId) {
    const childForm = document.getElementById(`updateChild-${childId}`);
    if (childForm) {
        childForm.remove();
    }
    
    // If no children left, add one back
    const remainingChildren = document.querySelectorAll('#updateChildrenContainer .child-form');
    if (remainingChildren.length === 0) {
        addUpdateChildForm();
    }
}

function saveParentChanges() {
    // Validate parent fields
    const parentFirstName = document.getElementById('updateParentFirstName').value.trim();
    const parentLastName = document.getElementById('updateParentLastName').value.trim();
    const parentEmail = document.getElementById('updateParentEmail').value.trim();
    const parentPhone = document.getElementById('updateParentPhone').value.trim();
    
    if (!parentFirstName || !parentLastName || !parentEmail || !parentPhone) {
        alert('Please fill in all parent information fields.');
        return;
    }
    
    // Validate children fields
    const childForms = document.querySelectorAll('#updateChildrenContainer .child-form');
    const children = [];
    
    for (let i = 0; i < childForms.length; i++) {
        const childForm = childForms[i];
        const childId = childForm.id.split('-')[1];
        
        const childFirstName = document.getElementById(`updateChildFirstName${childId}`).value.trim();
        const childLastName = document.getElementById(`updateChildLastName${childId}`).value.trim();
        const childEmail = document.getElementById(`updateChildEmail${childId}`).value.trim();
        const childPhone = document.getElementById(`updateChildPhone${childId}`).value.trim();
        const childGrade = document.getElementById(`updateChildGrade${childId}`).value;
        
        if (!childFirstName || !childLastName || !childEmail || !childPhone || !childGrade) {
            alert(`Please fill in all fields for Child ${parseInt(childId)}.`);
            return;
        }
        
        children.push({
            firstName: childFirstName,
            lastName: childLastName,
            email: childEmail,
            phone: childPhone,
            grade: childGrade
        });
    }
    
    if (currentUpdatingParent.isExisting) {
        // For existing parents, just show success message (no actual update to DOM)
        alert('Parent information updated successfully!');
    } else {
        // For added parents, update the stored data and card
        const parentIndex = addedParents.findIndex(p => p.id === currentUpdatingParent.id);
        if (parentIndex !== -1) {
            // Update stored data
            addedParents[parentIndex] = {
                ...addedParents[parentIndex],
                firstName: parentFirstName,
                lastName: parentLastName,
                email: parentEmail,
                phone: parentPhone,
                children: children
            };
            
            // Update card display
            const card = document.querySelector(`[data-added="true"]`);
            if (card && card.querySelector('.parent-name').textContent.includes(currentUpdatingParent.firstName)) {
                card.querySelector('.parent-name').textContent = `${parentFirstName} ${parentLastName}`;
            }
            
            alert('Parent information updated successfully!');
        }
    }
    
    closeUpdateParentModal();
}

// Helper functions for updating existing parent details
function showUpdatedParentDetails(firstName, lastName, phone, email, children) {
    let childrenDetails = '';
    children.forEach((child, index) => {
        childrenDetails += `
            <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                <h4 style="margin: 0 0 8px 0; color: #333;">Child ${index + 1}: ${child.firstName} ${child.lastName}</h4>
                <p style="margin: 3px 0;"><strong>Email:</strong> ${child.email}</p>
                <p style="margin: 3px 0;"><strong>Phone:</strong> ${child.phone}</p>
                <p style="margin: 3px 0;"><strong>Grade:</strong> Grade ${child.grade}</p>
            </div>
        `;
    });
    
    document.getElementById('modalName').innerHTML = `${firstName} ${lastName}`;
    
    const modalInfo = document.querySelector('.modal-info');
    modalInfo.innerHTML = `
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <div style="margin-top: 20px;">
            <h3 style="margin-bottom: 15px; color: #333;">Children:</h3>
            ${childrenDetails}
        </div>
    `;
    
    document.getElementById('detailsModal').style.display = 'block';
}

function updateExistingParent(firstName, lastName, phone, email, children) {
    currentUpdatingParent = {
        isExisting: true,
        originalName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        children: children
    };
    
    openUpdateParentModal();
}

// Search functionality
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-input');
    const parentCards = document.querySelectorAll('.parent-card');
    const gradeFilter = document.getElementById('gradeFilter');
    const sectionFilter = document.getElementById('sectionFilter');
    const letterSections = document.querySelectorAll('.letter-section');
    const parentCountElement = document.querySelector('.count-number');
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            let visibleCount = 0;
            
            parentCards.forEach(card => {
                const parentName = card.querySelector('.parent-name').textContent.toLowerCase();
                
                // Extract last name for search (everything after the last space)
                const nameParts = parentName.split(' ');
                const lastName = nameParts[nameParts.length - 1];
                
                const isVisible = parentName.includes(searchTerm) || 
                    lastName.includes(searchTerm);
                
                if (isVisible && !card.classList.contains('hidden')) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Hide/show letter sections based on whether they have visible cards
            letterSections.forEach(section => {
                const visibleCardsInSection = section.querySelectorAll('.parent-card[style*="flex"]');
                if (searchTerm && visibleCardsInSection.length === 0) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
            
            // Update count based on search results
            if (searchTerm) {
                parentCountElement.textContent = visibleCount;
            } else {
                // Show all sections when search is cleared
                letterSections.forEach(section => {
                    section.style.display = 'block';
                });
                updateParentCount();
            }
        });
    }
    
    // Grade filter functionality (placeholder for future use)
    if (gradeFilter) {
        gradeFilter.addEventListener('change', function() {
            const selectedGrade = this.value;
            console.log('Grade filter selected:', selectedGrade);
            // Placeholder - functionality to be implemented later
            // For now, this doesn't affect the display
        });
    }
    
    // Section filter functionality (placeholder for future use)
    if (sectionFilter) {
        sectionFilter.addEventListener('change', function() {
            const selectedSection = this.value;
            console.log('Section filter selected:', selectedSection);
            // Placeholder - functionality to be implemented later
            // For now, this doesn't affect the display
        });
    }
    
    function updateParentCount() {
        const visibleCards = document.querySelectorAll('.parent-card:not(.hidden)').length;
        const addedParentsCount = addedParents.length;
        parentCountElement.textContent = visibleCards.length;
    }
    
    // Initialize count
    updateParentCount();
});

// Modal functionality
function showParentDetails(name, phone, email) {
    document.getElementById('modalName').textContent = name;
    document.getElementById('modalPhone').textContent = phone;
    document.getElementById('modalEmail').textContent = email;
    document.getElementById('detailsModal').style.display = 'block';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}

function deleteParent(button) {
    if (confirm('Are you sure you want to delete this parent?')) {
        const parentCard = button.closest('.parent-card');
        parentCard.remove();
        
        // Update parent count after deletion
        const parentCountElement = document.querySelector('.count-number');
        const visibleCards = document.querySelectorAll('.parent-card:not(.hidden)');
        parentCountElement.textContent = visibleCards.length;
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('detailsModal');
    const addModal = document.getElementById('addParentModal');
    
    if (event.target === modal) {
        closeDetailsModal();
    }
    
    if (event.target === addModal) {
        closeAddParentModal();
    }
});