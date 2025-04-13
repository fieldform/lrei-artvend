// Configuration
const API_KEY = 'AIzaSyBd8AOj_-cWchA3gN0oJntULtI72uKFJhk';
const SPREADSHEET_ID = '1N_zgb2ZXOnoP9VHlKrnaKlflPx35zW-uiy3cm7CQvnk';
const SHEET_NAME = 'Sheet1';

// DOM Elements
const loadingElement = document.getElementById('loading');
const dataContainer = document.getElementById('data-container');

// Fetch data from Google Sheets
async function fetchSheetData() {
    try {
        console.log('Fetching data from Google Sheets...');

        // Fetch the actual data
        const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
        console.log('Data URL:', dataUrl);

        const response = await fetch(dataUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Raw data from Google Sheets:', data);

        if (!data.values || data.values.length === 0) {
            console.error('No data found in the response');
            dataContainer.innerHTML = '<p class="error">No data found in the spreadsheet.</p>';
            return;
        }

        // Log the first few rows for debugging
        console.log('First row (headers):', data.values[0]);
        console.log('Sample data rows:', data.values.slice(1, 3));

        displayData(data.values);
    } catch (error) {
        console.error('Error fetching data:', error);
        dataContainer.innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Convert Google Drive URL to direct image URL
function convertToDirectImageUrl(driveUrl) {
    if (!driveUrl) return null;

    console.log('Converting URL or ID:', driveUrl);

    // If it's just a file ID (no http and no file extension)
    if (!driveUrl.startsWith('http') && !driveUrl.includes('.')) {
        console.log('Detected file ID:', driveUrl);
        // Use the preview URL format which is more reliable
        return `https://drive.google.com/thumbnail?id=${driveUrl}&sz=w1000`;
    }

    // If it's a filename, try to map it to a file ID
    if (!driveUrl.startsWith('http')) {
        console.log('Detected filename instead of URL:', driveUrl);

        // Map of filenames to their Google Drive file IDs
        const fileIdMap = {
            'marthe_jocelyn_2.jpg': '1mcnKdGh0fUrPCI06hIQdoB95Cb3e9kez',
            // Add more mappings as needed
        };

        const fileId = fileIdMap[driveUrl];
        if (fileId) {
            const fullUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
            console.log('Constructed full URL:', fullUrl);
            return fullUrl;
        }

        return null;
    }

    // Handle different Google Drive URL formats
    let fileId = null;

    // Format 1: https://drive.google.com/file/d/FILE_ID/view
    const fileMatch = driveUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
        fileId = fileMatch[1];
    }

    // Format 2: https://drive.google.com/open?id=FILE_ID
    const openMatch = driveUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (openMatch && openMatch[1]) {
        fileId = openMatch[1];
    }

    // Format 3: https://drive.google.com/uc?id=FILE_ID
    const ucMatch = driveUrl.match(/uc\?id=([a-zA-Z0-9_-]+)/);
    if (ucMatch && ucMatch[1]) {
        fileId = ucMatch[1];
    }

    // Format 4: https://drive.usercontent.google.com/download?id=FILE_ID&export=view
    const userContentMatch = driveUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (userContentMatch && userContentMatch[1]) {
        fileId = userContentMatch[1];
    }

    // If we found a file ID, return the direct image URL
    if (fileId) {
        console.log('Found file ID:', fileId);
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    // If it's already a direct image URL, return it
    if (driveUrl.startsWith('http') && (driveUrl.includes('.jpg') || driveUrl.includes('.png') || driveUrl.includes('.gif'))) {
        console.log('Using direct image URL:', driveUrl);
        return driveUrl;
    }

    console.log('Could not convert URL:', driveUrl);
    return null;
}

// Extract image URL from -image tag
function extractImageFromTag(tagContent) {
    if (!tagContent) return null;

    // Look for -image tag with URL
    const imageMatch = tagContent.match(/-image\s+(.+)/i);
    if (imageMatch && imageMatch[1]) {
        return imageMatch[1].trim();
    }

    return null;
}

// Display the data in a table format
function displayData(values) {
    if (!values || values.length === 0) {
        dataContainer.innerHTML = '<p>No data found.</p>';
        return;
    }

    console.log('Headers:', values[0]);
    console.log('Number of rows:', values.length);

    // Find the image column indices
    const thumbnailColumnIndex = values[0].findIndex(header =>
        header && header.toLowerCase().includes('thumbnail id')
    );

    const imageTagColumnIndex = values[0].findIndex(header =>
        header && header.toLowerCase().includes('thumbnail preview')
    );

    console.log('Thumbnail ID column index:', thumbnailColumnIndex);
    console.log('Thumbnail Preview column index:', imageTagColumnIndex);

    if (thumbnailColumnIndex === -1 && imageTagColumnIndex === -1) {
        console.warn('No image columns found in the spreadsheet');
    }

    const table = document.createElement('table');

    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    values[0].forEach((header, index) => {
        const th = document.createElement('th');
        th.textContent = header || `Column ${index + 1}`;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create data rows
    const tbody = document.createElement('tbody');
    for (let i = 1; i < values.length; i++) {
        const row = document.createElement('tr');
        values[i].forEach((cell, index) => {
            const td = document.createElement('td');

            // Check if this cell contains an image
            if ((index === thumbnailColumnIndex || index === imageTagColumnIndex) && cell) {
                console.log(`Row ${i}, Column ${index}, Cell content:`, cell);

                // Create a container for the image
                const container = document.createElement('div');
                container.className = 'image-container';

                let imageUrl = null;

                // Handle Thumbnail ID column
                if (index === thumbnailColumnIndex) {
                    imageUrl = convertToDirectImageUrl(cell);
                }
                // Handle Thumbnail Preview column with -image tag
                else if (index === imageTagColumnIndex) {
                    imageUrl = extractImageFromTag(cell);
                }

                if (imageUrl) {
                    // Add the image
                    addImageToContainer(container, imageUrl);
                } else {
                    // If we couldn't convert it, show the raw data
                    const rawDataText = document.createElement('div');
                    rawDataText.className = 'raw-data';
                    rawDataText.textContent = cell;
                    container.appendChild(rawDataText);
                }

                td.appendChild(container);
            } else {
                td.textContent = cell || '';
            }

            row.appendChild(td);
        });
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    dataContainer.innerHTML = '';
    dataContainer.appendChild(table);
}

// Helper function to add an image to a container
function addImageToContainer(container, imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Thumbnail';
    img.className = 'thumbnail';

    img.onerror = function() {
        console.error('Failed to load image:', imageUrl);
        this.style.display = 'none';
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error';
        errorMsg.textContent = 'Image not available';
        container.appendChild(errorMsg);
    };

    container.appendChild(img);
}

// Initialize the application
fetchSheetData();