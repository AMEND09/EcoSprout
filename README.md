# 🌾 Farmer App

A comprehensive farm management dashboard application that helps agricultural professionals manage fields, track resources, and make data-driven decisions for sustainable farming.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.0.0-61dafb.svg)

## 📋 Table of Contents

### Getting Started
- [🎯 Overview](#-overview)
- [✨ Features](#-features)
  - [Core Functionality](#core-functionality)
  - [Smart Features](#smart-features)
- [🚀 Installation](#-getting-started)
  - [Local Setup](#local-setup)
  - [Web Access](#web-access)

### Technical Details
- [🛠️ Technical Stack](#️-technical-stack)
  - [Frontend Technologies](#frontend)
  - [Data Management](#data-management)
  - [Development Tools](#development-tools)
- [🔧 Development](#-development)
  - [Project Structure](#project-structure)
  - [Contributing Guidelines](#contributing)

### Documentation
- [📸 Screenshots](#-screenshots)
  - [Overview Page](#example-overview-page)
  - [Field Management](#example-water-management-page)
  - [Farm Issues](#example-farm-issues-page)
  - [Reports & History](#example-reports-page)
  - [Planning Tools](#example-crop-plan-page)
  - [Settings & Help](#settings-dropdown)

### Project Information
- [🗺️ Future Roadmap](#️-future-roadmap)
  - [Phase 1: Data Management](#phase-1-enhanced-data-management)
  - [Phase 2: Advanced Features](#phase-2-advanced-features)
  - [Phase 3: Sustainability](#phase-3-sustainability-focus)
  - [Bug Fixes](#bug-fixes)
- [📜 License](#-license)
- [🔗 References](#-references)


## 🎯 Overview

FarmerApp empowers farmers with tools to optimize agricultural operations through:
- Smart field management
- Resource usage tracking
- Sustainability metrics
- Weather-informed decision making
- Comprehensive task management

## ✨ Features

### Core Functionality
- **Field Management** - Create, edit, and monitor field profiles
- **Resource Tracking**
  - Water usage monitoring
  - Fertilizer application logging
  - Harvest data recording
- **Crop Planning**
  - Rotation scheduling
  - Calendar-based event planning
  - Issue tracking and resolution

### Smart Features
- **Sustainability Metrics** 
  - Water efficiency scoring
  - Organic practices assessment
  - Harvest efficiency calculations
- **Weather Integration**
  - 10-day forecasts
  - Weather-based planning tools
- **Task Management System**
  - Priority-based organization
  - Due date tracking
  - Status monitoring

## 🛠️ Technical Stack

### Frontend
- React 18.0.0 with TypeScript
- Tailwind CSS
- Shadcn/ui components
- Lucide Dev icons
- Recharts for data visualization

### Data Management
- React Hooks for state
- LocalStorage for persistence
- Open-Meteo API integration

### Development Tools
- Vite build tool
- Jest testing framework
- GitHub Pages deployment

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/username/farmerapp.git
cd farmerapp
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

### OR
**[Web URL](https://amend09.github.io/farmerapp/)** (https://amend09.github.io/farmerapp/)

## 📸 Screenshots

### Example Overview Page
<img width="473" alt="{0C6CF37C-2761-4A6E-9A03-458537326712}" src="https://github.com/user-attachments/assets/956c8805-7d75-4509-9e4c-d2b7d84ab6ca" />

### Example Water Management Page
<img width="486" alt="{35A16A2A-B34A-4A7F-8EC2-C60CBAF2952B}" src="https://github.com/user-attachments/assets/f8770bc3-0de0-4905-a66a-3483d1609a29" />

### Example Farms Page
<img width="476" alt="{4FEEA304-420A-468C-9526-9232E2439964}" src="https://github.com/user-attachments/assets/7fa969b3-31b0-42aa-a412-b1e8ce0862b1" />

### Example Farm Issues Page
<img width="475" alt="{0F5D2283-AC49-497A-90B6-F66331B2DEF4}" src="https://github.com/user-attachments/assets/232fbee2-5530-4bbf-8f6e-8b65e9943d28" />

### Example Reports Page
<img width="488" alt="{5340F957-5BDB-41B4-88D9-E1E7C1035F49}" src="https://github.com/user-attachments/assets/2752ddb9-fc46-44e1-b46c-c6a2f88e4ac0" />

### Example History Page
<img width="479" alt="{1A754D47-93AB-4BC9-B7ED-CDB243D04EFB}" src="https://github.com/user-attachments/assets/59c3f6c7-fab0-45a9-a22b-a3d34469f273" />

### Example Crop Plan Page
<img width="480" alt="{AC2160A8-D9BC-43D2-A8C4-A3A64DFFAD02}" src="https://github.com/user-attachments/assets/0ba03f40-d643-4d92-9980-5f4d31f97ca9" />

### Example Instructions Page
<img width="480" alt="{8C72FCBF-CC69-4222-8766-E0FF03ABE6F7}" src="https://github.com/user-attachments/assets/3109443f-b149-4331-842f-1b09238d4eec" />

### Settings Dropdown
<img width="203" alt="{56494DF9-1F23-45B8-B4A7-6A9A730714C8}" src="https://github.com/user-attachments/assets/a95ace5c-1916-42ea-84b4-246fb15bba5a" />

### Interactive Walkthrough
<img width="794" alt="{C6327967-506E-4971-9E98-7E7C1F228521}" src="https://github.com/user-attachments/assets/7101bc5d-4161-4bbb-ba17-3e4ec83fc13d" />

## 🔧 Development

### Project Structure
```
src/
├── artifacts/
│   └── default.tsx    # Main app component
├── components/
│   └── ui/           # Reusable components
├── styles/
│   └── tabs.css     # Component styles
└── index.css        # Global styles
```

### Contributing
1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

## 🗺️ Future Roadmap

### Phase 1: Enhanced Data Management
- [ ] Cloud storage integration
- [ ] User authentication
- [ ] Data export/import features

### Phase 2: Advanced Features
- [ ] ML-based yield predictions
- [ ] Automated irrigation control
- [ ] Mobile application development

### Phase 3: Sustainability Focus
- [ ] Carbon footprint tracking
- [ ] Biodiversity metrics
- [ ] Resource optimization tools

### Bug Fixes
- [ ] Form exiting for every character typed on History Page

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 References
- [React Documentation](https://reactjs.org/docs)
- [Vite Documentation](https://vitejs.dev/guide)
- [Shadecn Documentation](https://ui.shadcn.com/docs)
- [Lucide](https://lucide.dev/)
- [Open-Meteo API Docs](https://open-meteo.com/en/docs)
- [Sustainable Agriculture Guidelines](https://saiplatform.org)
