# Farmer App

Farmerapp is a farm management dashboard application that helps you manage fields, track water usage, fertilizer applications, harvests, and field issues. It also provides sustainability metrics and weather forecasts to help you make informed decisions.

## Features

- **Field Management**: Add, edit, and delete fields with details like name, size, and crop type.
- **Water Usage Tracking**: Record and view water usage for each field.
- **Fertilizer Application Tracking**: Record and view fertilizer applications for each field.
- **Harvest Tracking**: Record and view harvests for each field.
- **Crop Rotation**: Track the rotation of crops on a farm. 
- **Field Issues**: Report and resolve field issues like pests and diseases.
- **Sustainability Metrics**: Calculate and view sustainability scores based on water efficiency, organic practices, and harvest efficiency.
- **Weather Forecast**: View a 10-day weather forecast to plan field activities.
- **Task Management**: Add, edit, and delete tasks related to field management.
- **Crop Plan**: A standard calendar tool to plan out basic farming events.

<div class="space-y-8">

## Project Overview
<div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg mb-6">
A comprehensive farm management solution designed to help farmers track and optimize their agricultural operations through sustainable practices and data-driven decisions.
</div>

## Technical Specifications
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
  <div class="border rounded-lg p-4">
    <h3 class="text-lg font-bold mb-2">Technology Stack</h3>
    <ul class="list-disc pl-4 space-y-1">
      <li>Frontend: React 18.0.0 with TypeScript</li>
      <li>UI Components: Tailwind CSS, Shadcn/ui</li>
      <li>Data Visualization: Recharts</li>
      <li>State Management: React Hooks</li>
      <li>Data Persistence: LocalStorage</li>
      <li>Weather API: Open-Meteo API</li>
      <li>Deployment: Vercel</li>
    </ul>
  </div>
  <div class="border rounded-lg p-4">
    <h3 class="text-lg font-bold mb-2">System Requirements</h3>
    <ul class="list-disc pl-4 space-y-1">
      <li>Node.js 16.0.0 or higher</li>
      <li>npm 7.0.0 or higher</li>
      <li>Modern web browser with JavaScript enabled</li>
      <li>Minimum screen resolution: 1024x768</li>
    </ul>
  </div>
</div>

## Development Process
### 1. Planning Phase
- Created wireframes and mockups
- Developed sustainability scoring algorithms
- Planned data structure and state management

### 2. Implementation
- Created reusable components
- Implemented core features:
  - Farm management system
  - Water usage tracking
  - Fertilizer application monitoring
  - Harvest recording
  - Weather integration
  - Sustainability metrics

### 3. Testing
- Unit testing with Jest
- User acceptance testing
- Cross-browser compatibility testing
- Mobile responsiveness testing

## Code Structure
```
src/
├── artifacts/
│   ├── default.tsx        # Main application component
├── components/
│   └── ui/               # Reusable UI components
├── styles/
│   └── tabs.css         # Custom styling
└── index.css            # Global styles
```

## Features
### 1. Sustainability Metrics System
Comprehensive scoring system based on:
- Water Efficiency (25%)
- Organic Practices (20%)
- Harvest Efficiency (20%)
- Soil Quality (20%)
- Crop Rotation (15%)

### 2. Data Management
- Farm data structure with TypeScript interfaces
- Local storage persistence
- Data export/import capabilities

### 3. Interactive Features
- Guided tutorial system
- Calendar-based planning
- Real-time weather integration
- Issue tracking system

## Installation & Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/username/farmerapp.git
   ```
2. Install dependencies:
   ```bash
   npm install

3. Start development server:
   ```bash
   npm run dev
   ```

## Future Enhancements
1. Backend Integration
   - User authentication
   - Cloud data storage
   - Real-time collaboration

2. Advanced Features
   - Machine learning for yield prediction
   - Automated irrigation scheduling
   - Pest detection system
   - Mobile application

3. Sustainability Improvements
   - Carbon footprint tracking
   - Biodiversity metrics
   - Water conservation analytics

## References
1. React Documentation
2. Vite Documentation
3. TypeScript Handbook
4. Open-Meteo API Documentation
5. [Sustainable Agriculture Institute's Sustainable Performance Assessment Guidelines](https://saiplatform.org/uploads/Modules/Library/spa-guidelines-2.0_saiplatform.pdf)

</div>

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
