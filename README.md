# CSV Data Table Webpage

This project is a simple static web page that displays data in a tabular format. The data is fetched from a static CSV file and rendered dynamically using JavaScript. The headers are automatically read from the first row of the CSV file.

## Project Structure

```
data-table-webpage
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
   cd data-table-webpage
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

## License

This project is open-source and available under the [MIT License](LICENSE).