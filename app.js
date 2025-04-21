// Configuration
const API_KEY = 'AIzaSyBd8AOj_-cWchA3gN0oJntULtI72uKFJhk';
const SPREADSHEET_ID = '1N_zgb2ZXOnoP9VHlKrnaKlflPx35zW-uiy3cm7CQvnk';
const SHEET_NAME = 'Sheet1';

// DOM Elements
const loadingElement = document.getElementById('loading');
const dataContainer = document.getElementById('data-container');
const modal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImage');
const closeBtn = document.getElementsByClassName('close')[0];

// Fetch data from Google Sheets
async function fetchSheetData() {
    try {
        const dataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
        const response = await fetch(dataUrl);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.values || data.values.length === 0) {
            console.error('No data found in the response');
            dataContainer.innerHTML = '<p class="error">No data found in the spreadsheet.</p>';
            return;
        }

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

    // If it's just a file ID (no http and no file extension)
    if (!driveUrl.startsWith('http') && !driveUrl.includes('.')) {
        return `https://drive.google.com/thumbnail?id=${driveUrl}&sz=w1000`;
    }

    // If it's a filename, try to map it to a file ID
    if (!driveUrl.startsWith('http')) {
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

    // If we found a file ID, return the thumbnail URL
    if (fileId) {
        return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    }

    // If it's already a direct image URL, return it
    if (driveUrl.startsWith('http') && (driveUrl.includes('.jpg') || driveUrl.includes('.png') || driveUrl.includes('.gif'))) {
        return driveUrl;
    }

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

// Format URL to ensure it has a protocol
function formatUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }
    return url;
}

// Display the data in a table format
function displayData(values) {
    if (!values || values.length === 0) {
        dataContainer.innerHTML = '<p>No data found.</p>';
        return;
    }

    // Find the image column indices
    const thumbnailColumnIndex = values[0].findIndex(header =>
        header && header.toLowerCase().includes('thumbnail id')
    );

    const imageTagColumnIndex = values[0].findIndex(header =>
        header && header.toLowerCase().includes('thumbnail preview')
    );

    if (thumbnailColumnIndex === -1 && imageTagColumnIndex === -1) {
        console.warn('No image columns found in the spreadsheet');
    }

    // Create a grid container for the cards
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    // Create cards for each data row
    for (let i = 1; i < values.length; i++) {
        const card = document.createElement('div');
        card.className = 'card';

        // Get the thumbnail ID for this row
        const thumbnailId = values[i][thumbnailColumnIndex];

        // Create image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        if (thumbnailId) {
            const imageUrl = convertToDirectImageUrl(thumbnailId);

            if (imageUrl) {
                addImageToContainer(imageContainer, imageUrl);
            } else {
                const rawDataText = document.createElement('div');
                rawDataText.className = 'raw-data';
                rawDataText.textContent = 'No image available';
                imageContainer.appendChild(rawDataText);
            }
        }

        card.appendChild(imageContainer);

        // Create info container
        const infoContainer = document.createElement('div');
        infoContainer.className = 'info-container';

        // Add each field to the info container
        values[0].forEach((header, index) => {
            if (index !== thumbnailColumnIndex && values[i][index]) {
                const field = document.createElement('div');
                field.className = `field ${header.toLowerCase().replace(/\s+/g, '-')}`;

                if (header.toLowerCase() === 'name') {
                    field.className += ' name';
                    field.textContent = values[i][index];
                } else if (header.toLowerCase() === 'instagram') {
                    field.className += ' link';
                    const link = document.createElement('a');
                    // Format Instagram handle into full URL
                    const handle = values[i][index].replace('@', '').trim();
                    link.href = `https://www.instagram.com/${handle}`;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = `@${handle}`;
                    field.appendChild(link);
                } else if (header.toLowerCase() === 'website') {
                    field.className += ' link';
                    const link = document.createElement('a');
                    const formattedUrl = formatUrl(values[i][index]);
                    link.href = formattedUrl;
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = values[i][index];
                    field.appendChild(link);
                } else if (header.toLowerCase() === 'bio') {
                    field.className += ' bio';
                    field.textContent = values[i][index];
                }

                infoContainer.appendChild(field);
            }
        });

        card.appendChild(infoContainer);
        gridContainer.appendChild(card);
    }

    dataContainer.innerHTML = '';
    dataContainer.appendChild(gridContainer);
}

// Helper function to add an image to a container
function addImageToContainer(container, imageUrl) {
    if (!imageUrl) {
        console.error('No image URL provided');
        return;
    }

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Thumbnail';
    img.className = 'thumbnail';
    img.style.display = 'block';
    img.style.width = '120px';
    img.style.height = '120px';
    img.style.objectFit = 'cover';

    // Add click event to show modal
    img.onclick = function() {
        modal.style.display = 'block';
        modalImg.src = imageUrl;
    }

    container.appendChild(img);
}

// Close modal when clicking the close button
closeBtn.onclick = function() {
    modal.style.display = 'none';
}

// Close modal when clicking outside the image
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Video Modal Functionality
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const playVideoBtn = document.getElementById('playVideoBtn');
const videoCloseBtn = videoModal.querySelector('.close');

// Open video modal
playVideoBtn.onclick = function() {
    videoModal.style.display = 'block';
    modalVideo.play();
}

// Close video modal
videoCloseBtn.onclick = function() {
    videoModal.style.display = 'none';
    modalVideo.pause();
    modalVideo.currentTime = 0;
}

// Close video modal when clicking outside
window.onclick = function(event) {
    if (event.target == videoModal) {
        videoModal.style.display = 'none';
        modalVideo.pause();
        modalVideo.currentTime = 0;
    }
}

// Buy Tokens Button Functionality
const buyTokensBtn = document.getElementById('buyTokensBtn');

buyTokensBtn.onclick = function() {
    // Open the token purchase page in a new tab
    window.open('https://my.onecause.com/event/organizations/sf-0018000000Wc8yJAAR/events/vevt:522be272-7b6b-4745-b00e-3f54a75f5419/shop/fixed-price', '_blank');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', fetchSheetData);