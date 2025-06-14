// Cookie utility functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + JSON.stringify(value) + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for(let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(nameEQ) === 0) {
            try {
                return JSON.parse(cookie.substring(nameEQ.length, cookie.length));
            } catch (e) {
                console.error('Error parsing cookie:', e);
                return null;
            }
        }
    }
    return null;
}

// Generate a simple checksum from column headers
function generateChecksum(headers) {
    return headers.join('|').split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0) | 0;
    }, 0).toString(16);
}

// Save checkbox state to cookies
function saveCheckboxState(data) {
    // Generate checksum from all headers
    const checksum = generateChecksum(data[0]);
    
    // Get last two column indices
    const lastColumnIndex = data[0].length - 1;
    const secondLastColumnIndex = lastColumnIndex - 1;
    
    // Store checkbox states for both columns
    const checkboxStates = {
        checksum: checksum,
        columns: {}
    };
    
    // Save states for second last column
    checkboxStates.columns[secondLastColumnIndex] = {};
    document.querySelectorAll(`input[type="checkbox"][data-column="${secondLastColumnIndex}"]`).forEach(checkbox => {
        const rowIndex = checkbox.dataset.row;
        checkboxStates.columns[secondLastColumnIndex][rowIndex] = checkbox.checked;
    });
    
    // Save states for last column
    checkboxStates.columns[lastColumnIndex] = {};
    document.querySelectorAll(`input[type="checkbox"][data-column="${lastColumnIndex}"]`).forEach(checkbox => {
        const rowIndex = checkbox.dataset.row;
        checkboxStates.columns[lastColumnIndex][rowIndex] = checkbox.checked;
    });
    
    // Save to cookie (keep for 30 days)
    setCookie('checkboxStates', checkboxStates, 30);
}

// Load checkbox state from cookies
function loadCheckboxState(data) {
    const savedState = getCookie('checkboxStates');
    if (!savedState) return false;
    
    // Verify checksum to ensure data structure hasn't changed
    const currentChecksum = generateChecksum(data[0]);
    if (savedState.checksum !== currentChecksum) {
        console.log('Data structure has changed, ignoring saved state');
        return false;
    }
    
    // Apply saved states to checkboxes
    Object.keys(savedState.columns).forEach(columnIndex => {
        const column = savedState.columns[columnIndex];
        Object.keys(column).forEach(rowIndex => {
            const checkbox = document.querySelector(`input[type="checkbox"][data-column="${columnIndex}"][data-row="${rowIndex}"]`);
            if (checkbox) {
                checkbox.checked = column[rowIndex];
            }
        });
    });
    
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    // Fetch the CSV file
    fetch('data/data.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(csvData => {
            // Parse the CSV data
            const parsedData = parseCSV(csvData);
            
            // Display the data in the table
            displayTable(parsedData);
            
            // Try to load saved checkbox states
            const stateLoaded = loadCheckboxState(parsedData);
            if (stateLoaded) {
                showStatusMessage('Checkbox states loaded from saved data');
            }
            
            // Add event listeners for checkbox changes
            setupCheckboxEventListeners(parsedData);
        })
        .catch(error => {
            console.error('Error fetching or parsing CSV:', error);
            document.getElementById('data-table').innerHTML = 
                '<tr><td colspan="100%">Error loading data. Please try again later.</td></tr>';
        });
});

// Parse CSV function
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    return lines.map(line => {
        // Handle quoted values with commas inside them
        let result = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        result.push(currentValue);
        return result;
    });
}

// Display table function
function displayTable(data) {
    if (!data || data.length === 0) {
        console.error('No data to display');
        return;
    }
    
    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');
    
    // Clear any existing content
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
    
    // Determine the last two column indices
    const lastColumnIndex = data[0].length - 1;
    const secondLastColumnIndex = lastColumnIndex - 1;
    
    // Create table header from the first row
    const headerRow = document.createElement('tr');
    data[0].forEach((header, index) => {
        const th = document.createElement('th');
        
        // For the last two columns, add a reset button
        if (index === secondLastColumnIndex || index === lastColumnIndex) {
            const headerContainer = document.createElement('div');
            headerContainer.className = 'header-with-button';
            
            const headerText = document.createElement('span');
            headerText.textContent = header;
            headerContainer.appendChild(headerText);
            
            const resetButton = document.createElement('button');
            resetButton.textContent = 'Reset All';
            resetButton.className = 'reset-column-btn';
            resetButton.dataset.columnIndex = index;
            resetButton.addEventListener('click', function() {
                resetColumn(index);
            });
            headerContainer.appendChild(resetButton);
            
            th.appendChild(headerContainer);
        } else {
            th.textContent = header;
        }
        
        headerRow.appendChild(th);
    });
    tableHeader.appendChild(headerRow);
    
    // Create table rows from the rest of the data
    for (let i = 1; i < data.length; i++) {
        const row = document.createElement('tr');
        data[i].forEach((cell, columnIndex) => {
            const td = document.createElement('td');
            
            // For the last two columns, create checkboxes (always starting as unchecked)
            if (columnIndex === secondLastColumnIndex || columnIndex === lastColumnIndex) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = false; // Always start as FALSE regardless of CSV value
                checkbox.dataset.row = i;
                checkbox.dataset.column = columnIndex;
                td.appendChild(checkbox);
            } else {
                td.textContent = cell;
            }
            
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    }
}

// Setup event listeners for checkbox changes
function setupCheckboxEventListeners(data) {
    // Add change event listener to all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveCheckboxState(data);
        });
    });
}

// Function to reset all checkboxes in a column
function resetColumn(columnIndex) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-column="${columnIndex}"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Update cookie after reset
    fetch('data/data.csv')
        .then(response => response.text())
        .then(csvData => {
            const parsedData = parseCSV(csvData);
            saveCheckboxState(parsedData);
        })
        .catch(error => console.error('Error updating cookie after reset:', error));
}

// Debug function to clear cookies
function clearAllCookies() {
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    console.log("All cookies cleared");
}

// Helper function to show status messages
function showStatusMessage(message, isSuccess = true) {
    // Create or get status element
    let statusElement = document.getElementById('status-message');
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'status-message';
        document.querySelector('.container').insertBefore(statusElement, document.querySelector('.table-container'));
    }
    
    // Set message and class
    statusElement.textContent = message;
    statusElement.className = isSuccess ? 'status-success' : 'status-error';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        statusElement.style.opacity = '0';
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 500);
    }, 3000);
    
    // Show element
    statusElement.style.display = 'block';
    setTimeout(() => {
        statusElement.style.opacity = '1';
    }, 10);
}