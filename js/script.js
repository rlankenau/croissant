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

// Function to reset all checkboxes in a column
function resetColumn(columnIndex) {
    const checkboxes = document.querySelectorAll(`input[type="checkbox"][data-column="${columnIndex}"]`);
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}