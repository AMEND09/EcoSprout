# Farm Management Dashboard

A comprehensive web application for farmers to manage, track, and optimize all aspects of their farming operations.

![Farm Management Dashboard Screenshot](./screenshot.png)

## Features

### Dashboard Overview
- Quick action buttons for recording common farming activities
- Sustainability score with detailed metrics and recommendations
- 10-day weather forecast to help plan farming activities
- Task management system for organizing farm work
- Upcoming events preview from the crop planning calendar
- Active farm issues tracker

### Farm Management
- Add and manage multiple farms with detailed information
- Track crop rotation history for each farm
- Record water usage, fertilizer applications, and harvests
- Monitor soil quality and other important metrics

### Water Management
- Track water usage across all farms
- Visualize water usage trends with interactive charts
- Calculate water efficiency scores
- Compare water usage between different farms and crops

### Financial Planning & Analysis
- Comprehensive financial dashboard with income and expense tracking
- Budget planning and management with progress tracking
- Set and monitor financial goals with automatic progress updates
- Create financial projections with monthly breakdown
- Generate detailed financial reports in PDF format

### Sustainability Analytics
- Calculate overall sustainability score based on farming practices
- Track key metrics including water efficiency, organic practices, soil quality, and more
- Get personalized recommendations for improving sustainability
- Generate sustainability reports with trend analysis

### Crop Planning
- Interactive calendar for scheduling farming activities
- Plan planting, fertilizing, and harvesting events
- Export and import crop plans
- Visualize upcoming farming events

### History Tracking
- Comprehensive history of all farming activities
- Search and filter historical data
- Edit or delete historical entries

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/farmerapp.git
   cd farmerapp
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Data Management

All data is stored locally in your browser using localStorage. You can:

- Export all your farm data to a JSON file for backup
- Import data from previously exported files
- The export includes farms, tasks, issues, crop plans, and financial data

## Interactive Tutorial

The application includes an interactive walkthrough to help new users get familiar with all features. To start the tutorial:

1. Click on the settings icon in the top right corner
2. Select "Start Tutorial"
3. Follow the guided steps to learn about each feature

## Technologies Used

- React with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- jsPDF and html2canvas for PDF generation
- Open-Meteo API for weather data

## License

This project is licensed under the MIT License - see the LICENSE file for details.
