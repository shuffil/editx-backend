# EditX - AI Video Editing App

## Overview
EditX is an AI-powered video editing application that allows users to upload videos, apply AI-driven edits, and export the final product. The app features a clean and modern interface with responsive design.

## Features
- **Upload Videos**: Drag-and-drop interface for uploading multiple video files.
- **AI Context**: Provide context for AI editing to tailor the video output.
- **Preview and Progress**: Visual progress bar while the backend processes video edits.
- **Final Editor**: Video preview, timeline control, FX sliders, and export functionality.
- **Export**: Download the final edited video.

## Setup Instructions
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd editx
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   npm start
   ```

## API Routes
- `POST /upload`: Upload video files and context.
- `GET /progress/:sessionId`: Check the progress of video processing.
- `GET /preview/:sessionId`: Stream the final rendered video.
- `POST /export/:sessionId`: Export the final video with user edits.

## Documentation
Ensure all documents in `/src/docs/` are present and up-to-date.

## Additional Notes
- Use TailwindCSS for styling.
- Ensure FFmpeg is installed and accessible in your system PATH for video processing.

## License
This project is licensed under the MIT License. 