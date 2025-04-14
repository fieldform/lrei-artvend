# Art Vend - Google Sheets Integration with Nuxt

A modern web application that uses Google Sheets as a backend and displays data including images from Google Drive, built with Nuxt.js.

## Development Environment Setup

This project uses [devenv](https://github.com/cachix/devenv) to manage the development environment.

### Prerequisites

- [Nix](https://nixos.org/download.html) package manager
- [direnv](https://direnv.net/) for automatic environment activation

### Setup

1. **Install Nix** (if not already installed):
   ```bash
   sh <(curl -L https://nixos.org/nix/install) --daemon
   ```

2. **Install direnv** (if not already installed):
   ```bash
   # macOS
   brew install direnv

   # Linux
   sudo apt-get install direnv
   ```

3. **Enable direnv in your shell**:
   Add the following to your shell configuration file (`.bashrc`, `.zshrc`, etc.):
   ```bash
   eval "$(direnv hook bash)"  # for bash
   eval "$(direnv hook zsh)"   # for zsh
   ```

4. **Set up your .envrc file**:
   ```bash
   # Copy the example .envrc file
   cp .envrc.example .envrc

   # Allow direnv to use the .envrc file
   direnv allow
   ```

5. **Enter the development environment**:
   ```bash
   devenv up
   ```

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

5. Update the configuration in `.env`:
   ```
   GOOGLE_API_KEY=YOUR_API_KEY
   SPREADSHEET_ID=YOUR_SPREADSHEET_ID
   SHEET_NAME=YOUR_SHEET_NAME
   WATCH_INTERVAL=300000
   ```

6. Start the development server:
   ```bash
   yarn dev
   ```

7. Open your browser and navigate to `http://localhost:3000`

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
5. Copy the API key and paste it into the `.env` file

## AWS Amplify Deployment

### Prerequisites
- AWS account
- GitHub account
- Repository with this code

### Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Set up AWS Amplify**
   - Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify/home)
   - Click "New app" > "Host web app"
   - Choose GitHub as your repository source
   - Connect your GitHub account and select your repository
   - Configure build settings
   - Add environment variables:
     - `GOOGLE_API_KEY`
     - `SPREADSHEET_ID`
     - `SHEET_NAME`
     - `WATCH_INTERVAL` (optional, defaults to 300000 ms)

3. **Deploy**
   - Review the settings and click "Save and deploy"
   - Amplify will build and deploy your application

4. **Set up automatic deployments**
   - Amplify will automatically deploy when you push changes to your GitHub repository
   - You can configure branch protection rules in GitHub for additional security

## Google Sheets Watcher

The application includes a watcher that periodically checks for changes in your Google Sheet:

- By default, it checks every 5 minutes (300000 ms)
- You can change this interval by setting the `WATCH_INTERVAL` environment variable
- The watcher only updates the UI when changes are detected

## Troubleshooting

- If images don't appear, check that the Google Drive file is shared with the correct permissions
- Make sure your API key has access to the Google Sheets API
- Verify that the sheet name is correct (case-sensitive)
- For the `-image` tag, make sure there's a space between `-image` and the URL
- For AWS Amplify deployment issues, check the build logs in the Amplify Console
- For devenv issues, try running `devenv down` and then `devenv up` again