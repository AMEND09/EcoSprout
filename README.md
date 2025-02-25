# Farmer App

Farmerapp is a farm management dashboard application that helps you manage fields, track water usage, fertilizer applications, harvests, and field issues. It also provides sustainability metrics and weather forecasts to help you make informed decisions.

## Features

- **Field Management**: Add, edit, and delete fields with details like name, size, rotation history, and crop type.
- **Water Usage Tracking**: View water usage for each field.
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
      <li>UI Components: Tailwind CSS, Shadcn/ui, Lucide dev</li>
      <li>Data Visualization: Recharts</li>
      <li>State Management: React Hooks</li>
      <li>Data Persistence: LocalStorage</li>
      <li>Weather API: Open-Meteo API</li>
      <li>Deployment: Github Pages</li>
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
- Used Vite to setup React project
- Created reusable components using React
- Used components from Shadecn for charts, forms, and delete confirmation
- Used icons from Lucide Dev
- Implemented core features:
  - Farm management system
  - Water usage tracking
  - Fertilizer application monitoring
  - Harvest recording
  - Weather integration
  - Sustainability metrics
- Uses local browser storage for persistence.
- Uses Github Pages for deployment

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
- Data export/import capabilities with JSON

### 3. Interactive Features
- Guided tutorial system
- Calendar-based planning
- Real-time weather integration with Open Meteo
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

# Example Images
## Example Overview Page
<img width="473" alt="{0C6CF37C-2761-4A6E-9A03-458537326712}" src="https://github.com/user-attachments/assets/956c8805-7d75-4509-9e4c-d2b7d84ab6ca" />

## Example Water Management Page
<img width="486" alt="{35A16A2A-B34A-4A7F-8EC2-C60CBAF2952B}" src="https://github.com/user-attachments/assets/f8770bc3-0de0-4905-a66a-3483d1609a29" />

## Example Farms Page
<img width="476" alt="{4FEEA304-420A-468C-9526-9232E2439964}" src="https://github.com/user-attachments/assets/7fa969b3-31b0-42aa-a412-b1e8ce0862b1" />

## Example Farm Issues Page
<img width="475" alt="{0F5D2283-AC49-497A-90B6-F66331B2DEF4}" src="https://github.com/user-attachments/assets/232fbee2-5530-4bbf-8f6e-8b65e9943d28" />

## Example Reports Page
<img width="488" alt="{5340F957-5BDB-41B4-88D9-E1E7C1035F49}" src="https://github.com/user-attachments/assets/2752ddb9-fc46-44e1-b46c-c6a2f88e4ac0" />

## Example History Page
<img width="479" alt="{1A754D47-93AB-4BC9-B7ED-CDB243D04EFB}" src="https://github.com/user-attachments/assets/59c3f6c7-fab0-45a9-a22b-a3d34469f273" />

## Example Crop Plan Page
<img width="480" alt="{AC2160A8-D9BC-43D2-A8C4-A3A64DFFAD02}" src="https://github.com/user-attachments/assets/0ba03f40-d643-4d92-9980-5f4d31f97ca9" />

## Example Instructions Page
<img width="480" alt="{8C72FCBF-CC69-4222-8766-E0FF03ABE6F7}" src="https://github.com/user-attachments/assets/3109443f-b149-4331-842f-1b09238d4eec" />

## Settings Dropdown
<img width="203" alt="{56494DF9-1F23-45B8-B4A7-6A9A730714C8}" src="https://github.com/user-attachments/assets/a95ace5c-1916-42ea-84b4-246fb15bba5a" />

## Interactive Walkthrough
<img width="794" alt="{C6327967-506E-4971-9E98-7E7C1F228521}" src="https://github.com/user-attachments/assets/7101bc5d-4161-4bbb-ba17-3e4ec83fc13d" />












## References
1. React Documentation
2. Vite Documentation
3. TypeScript Handbook
4. Open-Meteo API Documentation
5. [Sustainable Agriculture Institute's Sustainable Performance Assessment Guidelines](https://saiplatform.org/uploads/Modules/Library/spa-guidelines-2.0_saiplatform.pdf)
6. Lucide Dev
7. Shadecn

</div>

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
