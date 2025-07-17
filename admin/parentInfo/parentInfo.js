function TogglePopup() {
    const popup = document.getElementById("popup");
    popup.classList.toggle("show");
}

// Store fetched parents data
let fetchedParents = [];
let childCounter = 0;
let updateChildCounter = 0;
let currentUpdatingParent = null;
let addedParents = []; // Store added parents data

// Function to populate parents from database
async function loadParentsFromDatabase() {
    try {
        const response = await fetch(`https://sams-backend-u79d.onrender.com/api/getParents.php`, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            }
        });
        
        const data = await response.json();
        
        if (!window.verifyToken(data)) return;
        
        fetchedParents = data;
        displayParents(fetchedParents);
        updateParentCount();
        
        // Remove loader if it exists
        const loader = document.querySelector('.loader');
        if (loader) loader.remove();
        
    } catch (error) {
        console.error('Error fetching parents:', error);
        // Show error message or fallback
    }
}

// Function to display parents in the UI
function displayParents(parents) {
    // Clear existing content except filter section
    const content = document.querySelector('.content');
    const filterSection = content.querySelector('.filter-section');
    content.innerHTML = '';
    content.appendChild(filterSection);
    
    // Group parents by first letter of last name
    const groupedParents = {};
    
    parents.forEach(parent => {
        const firstLetter = parent.lastname.charAt(0).toUpperCase();
        if (!groupedParents[firstLetter]) {
            groupedParents[firstLetter] = [];
        }
        groupedParents[firstLetter].push(parent);
    });
    
    // Sort letters alphabetically
    const sortedLetters = Object.keys(groupedParents).sort();
    
    // Create sections for each letter
    sortedLetters.forEach(letter => {
        const letterSection = document.createElement('div');
        letterSection.className = 'letter-section';
        letterSection.setAttribute('data-letter', letter.toLowerCase());
        
        const letterTitle = document.createElement('h2');
        letterTitle.className = 'letter-title';
        letterTitle.textContent = letter;
        
        const parentsGrid = document.createElement('div');
        parentsGrid.className = 'parents-grid';
        
        // Sort parents within each letter group by last name
        groupedParents[letter].sort((a, b) => a.lastname.localeCompare(b.lastname));
        
        // Create parent cards
        groupedParents[letter].forEach(parent => {
            const parentCard = createParentCard(parent);
            parentsGrid.appendChild(parentCard);
        });
        
        letterSection.appendChild(letterTitle);
        letterSection.appendChild(parentsGrid);
        content.appendChild(letterSection);
    });
    
    // Reinitialize search functionality for new cards
    initializeSearchAndFilters();
}

// Function to create a parent card element
function createParentCard(parent) {
    const parentCard = document.createElement('div');
    parentCard.className = 'parent-card';
    parentCard.setAttribute('data-letter', parent.lastname.charAt(0).toLowerCase());
    parentCard.setAttribute('data-fetched', 'true');
    
    parentCard.innerHTML = `
        <img src="${parent.pfp || '/assets/Sample.png'}" alt="Parent" class="parent-photo">
        <div class="parent-info">
            <div class="parent-name">${parent.firstname} ${parent.lastname}</div>
        </div>
        <div class="action-buttons">
            <button class="details-btn" onclick="showFetchedParentDetails('${parent.firstname}', '${parent.lastname}', '${parent.phone}', '${parent.email}', ${JSON.stringify(parent).replace(/"/g, '&quot;')})">Details</button>
            <button class="update-btn" onclick="updateFetchedParent('${parent.firstname}', '${parent.lastname}', '${parent.phone}', '${parent.email}', ${JSON.stringify(parent).replace(/"/g, '&quot;')})">Update</button>
            <button class="delete-btn" onclick="deleteFetchedParent('${parent.email}', this)">Delete</button>
        </div>
    `;
    
    return parentCard;
}

// Function to show details for fetched parents
function showFetchedParentDetails(firstName, lastName, phone, email, parentData = null) {
    document.getElementById('modalName').innerHTML = `${firstName} ${lastName}`;
    
    // Find the parent data to get children information
    let childrenDetails = '';
    if (parentData && parentData.children && parentData.children.length > 0) {
        parentData.children.forEach((child, index) => {
            childrenDetails += `
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <h4 style="margin: 0 0 8px 0; color: #333;">Child ${index + 1}: ${child.firstname} ${child.lastname}</h4>
                    <p style="margin: 3px 0;"><strong>Grade Level:</strong> ${child.grade_level}</p>
                </div>
            `;
        });
    } else {
        childrenDetails = '<p style="color: #666; font-style: italic;">No children information available.</p>';
    }
    
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

// Function to update fetched parents
function updateFetchedParent(firstName, lastName, phone, email, parentData = null) {
    currentUpdatingParent = {
        isExisting: true,
        isFetched: true,
        originalName: `${firstName} ${lastName}`,
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        children: parentData && parentData.children ? parentData.children : []
    };
    
    openUpdateParentModal();
}

// Function to delete fetched parents
async function deleteFetchedParent(email, button) {
    if (confirm('Are you sure you want to delete this parent? This will remove them from the database.')) {
        try {
            // Show loading state
            button.disabled = true;
            button.textContent = 'Deleting...';
            
            const response = await fetch('https://sams-backend-u79d.onrender.com/api/deleteParent.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Provider': window.provider,
                    'Token': window.token,
                },
                body: JSON.stringify({
                    email: email
                })
            });
            
            const data = await response.json();
            
            if (!window.verifyToken(data)) return;
            
            if (data.success) {
                // Show success message with details
                let successMessage = `Successfully deleted parent: ${data.deleted_parent.name}`;
                if (data.children_count > 0) {
                    successMessage += `\nAlso deleted ${data.children_count} associated student(s).`;
                }
                alert(successMessage);
                
                // Remove from UI
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
                
                // Remove from fetchedParents array if it exists
                fetchedParents = fetchedParents.filter(parent => parent.email !== email);
                
            } else {
                // Show error message
                alert(`Failed to delete parent: ${data.error || 'Unknown error occurred'}`);
                
                // Reset button state
                button.disabled = false;
                button.textContent = 'Delete';
            }
            
        } catch (error) {
            console.error('Error deleting parent:', error);
            alert('An error occurred while deleting the parent. Please try again.');
            
            // Reset button state
            button.disabled = false;
            button.textContent = 'Delete';
        }
    }
}

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

async function confirmAddParent() {
    // Validate parent fields
    const parentFirstName = document.getElementById('parentFirstName').value.trim();
    const parentLastName = document.getElementById('parentLastName').value.trim();
    const parentEmail = document.getElementById('parentEmail').value.trim();
    const parentPhone = document.getElementById('parentPhone').value.trim();
    
    if (!parentFirstName || !parentLastName || !parentEmail || !parentPhone) {
        alert('Please fill in all parent information fields.');
        return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(parentEmail)) {
        alert('Please enter a valid email address.');
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
        const childGrade = document.getElementById(`childGrade${childId}`).value;
        
        if (!childFirstName || !childLastName || !childGrade) {
            alert(`Please fill in all required fields for Child ${parseInt(childId)} (First Name, Last Name, Grade Level).`);
            return;
        }
        
        children.push({
            firstname: childFirstName,
            lastname: childLastName,
            grade_level: childGrade
        });
    }
    
    // Prepare data for API
    const parentData = {
        firstname: parentFirstName,
        lastname: parentLastName,
        email: parentEmail,
        phone: parentPhone,
        children: children
    };
    
    // Show loading state
    const confirmBtn = document.querySelector('#addParentModal .confirm-btn');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Adding Parent...';
    
    try {
        // Call the API
        const response = await fetch('https://sams-backend-u79d.onrender.com/api/addParent.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Provider': window.provider,
                'Token': window.token,
            },
            body: JSON.stringify(parentData)
        });
        
        const result = await response.json();
        
        if (!window.verifyToken(result)) return;
        
        if (result.success) {
            // Show success message
            let successMessage = `Successfully added parent: ${result.parent.firstname} ${result.parent.lastname}`;
            if (result.children_count > 0) {
                successMessage += `\nAdded ${result.children_count} child(ren)`;
            }
            alert(successMessage);
            
            // Close modal and clear form
            closeAddParentModal();
            
            // Reload the page to show the new parent
            location.reload();
            
        } else {
            // Handle API errors
            let errorMessage = 'Failed to add parent: ' + (result.error || 'Unknown error');
            
            if (result.missing_fields) {
                errorMessage += '\nMissing fields: ' + result.missing_fields.join(', ');
            }
            
            alert(errorMessage);
        }
        
    } catch (error) {
        console.error('Error adding parent:', error);
        alert('An error occurred while adding the parent. Please try again.');
        
    } finally {
        // Reset button state
        confirmBtn.disabled = false;
        confirmBtn.textContent = originalText;
    }
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
        const childGrade = document.getElementById(`updateChildGrade${childId}`).value;
        
        if (!childFirstName || !childLastName || !childGrade) {
            alert(`Please fill in all required fields for Child ${parseInt(childId)} (First Name, Last Name, Grade Level).`);
            return;
        }
        
        children.push({
            firstName: childFirstName,
            lastName: childLastName,
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

// Global function to update parent count
function updateParentCount() {
    const visibleCards = document.querySelectorAll('.parent-card[style*="flex"], .parent-card:not([style*="none"]):not(.hidden)');
    const parentCountElement = document.querySelector('.count-number');
    if (parentCountElement) {
        parentCountElement.textContent = visibleCards.length;
    }
}

// Search functionality
function initializeSearchAndFilters() {
    const searchInput = document.querySelector('.search-input');
    const gradeFilter = document.getElementById('gradeFilter');
    const sectionFilter = document.getElementById('sectionFilter');
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const parentCards = document.querySelectorAll('.parent-card');
            const letterSections = document.querySelectorAll('.letter-section');
            
            parentCards.forEach(card => {
                const parentName = card.querySelector('.parent-name').textContent.toLowerCase();
                
                const isVisible = parentName.includes(searchTerm);
                
                if (isVisible && !card.classList.contains('hidden')) {
                    card.style.display = 'flex';
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
            
            // Update count
            updateParentCount();
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
}

// Initialize search and filters after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadParentsFromDatabase();
    initializeSearchAndFilters();
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

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadParentsFromDatabase();
});