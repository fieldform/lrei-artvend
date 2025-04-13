# Google Sheets CMS

A simple CMS that uses Google Sheets as a backend and displays data including images from Google Drive.

## How to Use

1. Set up your Google Sheet with the following columns:
   - Any data columns you want to display
   - A "Thumbnail URL" column for direct image URLs
   - A "Column 7" column for using the `-image` tag

2. For the "Thumbnail URL" column, use Google Drive URLs in one of these formats:
   - `https://drive.google.com/file/d/FILE_ID/view`
   - `https://drive.google.com/open?id=FILE_ID`
   - `https://drive.google.com/uc?id=FILE_ID`
   - Direct image URLs (ending in .jpg, .png, .gif)

3. For the "Column 7" column, use the `-image` tag format:
   - `-image https://example.com/image.jpg`
   - `-image https://drive.google.com/file/d/FILE_ID/view`

4. Make sure your Google Sheet is accessible to anyone with the link.

5. Update the configuration in `app.js`:
   ```javascript
   const API_KEY = 'YOUR_API_KEY';
   const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID';
   const SHEET_NAME = 'YOUR_SHEET_NAME';
   ```

6. Open `index.html` in a web browser to view your CMS.

## Getting a Google Drive URL

1. Upload your image to Google Drive
2. Right-click on the image and select "Share"
3. Make sure the file is accessible to anyone with the link
4. Copy the link
5. Paste the link into your Google Sheet's "Thumbnail URL" column

## Using the -image Tag

The `-image` tag is a simple way to specify image URLs in your spreadsheet:

1. In the "Column 7" cell, type `-image` followed by a space and the image URL
2. Example: `-image https://example.com/image.jpg`
3. The CMS will extract the URL and display the image

## Getting a Google Sheets API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create credentials (API key)
5. Copy the API key and paste it into the `app.js` file

## Troubleshooting

- If images don't appear, check that the Google Drive file is shared with the correct permissions
- Make sure your API key has access to the Google Sheets API
- Verify that the sheet name is correct (case-sensitive)
- For the `-image` tag, make sure there's a space between `-image` and the URL