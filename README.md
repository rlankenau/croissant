# CSV Data Table Webpage

This project is a simple static web page that displays data in a tabular format. The data is fetched from a static CSV file and rendered dynamically using JavaScript. The headers are automatically read from the first row of the CSV file.

## Project Structure

```
├── index.html        # Main HTML document
├── css
│   └── styles.css    # Styles for the web page
├── js
│   └── script.js     # JavaScript code to fetch and render data
├── data
│   └── data.csv      # Static CSV data with headers in first row
└── README.md         # Project documentation
```

## Getting Started

To set up and run the web page, follow these steps:

1. **Clone the repository** (if applicable):
   ```
   git clone <repository-url>
   ```

2. **Navigate to the project directory**:
   ```
   cd project-directory
   ```

3. **Open `index.html` in a web browser**:
   Due to security restrictions when accessing local files via JavaScript, you may need to use a local web server:

   Using Python (if installed):
   ```
   python -m http.server
   ```

   Or using Node.js (if installed):
   ```
   npx serve
   ```

   Then access your page at http://localhost:8000 or the port shown in the terminal.

## How It Works

- The `index.html` file serves as the main entry point for the web application. It includes references to the CSS and JavaScript files.
- The `styles.css` file contains styles that define the appearance of the table and other elements on the page.
- The `script.js` file fetches the data from `data.csv`, parses it, and populates the table dynamically.
  - The first row of the CSV file is used as headers for the table
  - The remaining rows are displayed as data in the table
  - The last two columns are displayed as checkboxes, which start unchecked regardless of CSV values
  - Reset buttons in the headers of the last two columns allow resetting all checkboxes in that column
- The `data.csv` file contains comma-separated values, with the first row being the column headers.

## Features

- Dynamic table generation from CSV data
- Automatic column headers from the first CSV row
- Interactive checkboxes for the last two columns
- Reset buttons to clear all checkboxes in a column
- Responsive design with proper overflow handling for mobile devices
- Cookie-based storage of checkbox states
  - Persists user selections across page refreshes
  - Includes checksum verification to validate data structure hasn't changed
  - Automatic state restoration when returning to the page
  - States persist for 30 days

## Technical Implementation

### Cookie Storage
The application stores checkbox states in browser cookies with the following features:

1. **Data Structure Checksum**: A checksum is generated from the CSV headers to ensure the data structure hasn't changed between sessions. If the structure changes, saved states are ignored.

2. **Storage Format**: Cookie data is stored in JSON format with the following structure:
   ```json
   {
     "checksum": "generated-checksum-string",
     "columns": {
       "5": { "1": true, "2": false, "3": true },
       "6": { "1": false, "2": true, "3": false }
     }
   }
   ```
   Where:
   - `checksum` is the verification hash of column headers
   - `columns` contains objects for each checkbox column (indexed by column number)
   - Each column object contains row indices mapping to boolean states

3. **Persistence**: Checkbox states are automatically saved whenever:
   - A checkbox is toggled
   - A reset button is clicked

4. **Debugging**: Console logging helps track when states are saved or loaded

## License

This project is open-source and available under the [MIT License](LICENSE).