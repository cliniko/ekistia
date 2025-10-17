# Ekistia 🌾

## Agricultural Intelligence Platform for Iligan City

Ekistia is a comprehensive web-based platform that combines advanced agricultural data visualization, hazard risk analysis, and land management tools to support sustainable farming and urban planning in Iligan City, Philippines.

## 🌟 Key Features

### 🗺️ **3D Agricultural Mapping**
- **Interactive 3D Terrain**: Powered by Mapbox GL with elevation data
- **Crop Suitability Analysis**: Visualize optimal planting areas for rice, corn, coconut, and vegetables
- **Barangay-Level Analytics**: Detailed agricultural data for all 44 barangays in Iligan City

### ⚠️ **Comprehensive Hazard Analysis**
- **Flood Risk Mapping**: Multi-level flood susceptibility zones
- **Landslide Risk Assessment**: Terrain stability analysis with risk classifications
- **Slope Analysis**: 6-level slope categorization for land management
- **Land Use Classification**: Agricultural, forest, urban, and industrial zoning
- **Ancestral Domain Protection**: Indigenous land rights visualization

### 🛰️ **Advanced Map Controls**
- **Satellite/Streets Toggle**: Switch between satellite imagery and street maps
- **3D Terrain Preservation**: Maintains 3D view when switching map styles
- **SAFDZ Integration**: Strategic Agriculture and Fisheries Development Zones
- **Real-time Filtering**: Dynamic hazard layer controls with opacity adjustment

### 📊 **Analytics Dashboard**
- **Agricultural Statistics**: Land availability, active demands, crop distribution
- **Priority Zone Analysis**: LGU-identified development areas
- **Matched Area Visualization**: Areas meeting farmer supply + business demand + LGU priorities
- **Interactive Legends**: Comprehensive hazard and agricultural data interpretation

## 🛠️ Technical Architecture

### **Frontend Stack**
- **React 18** with TypeScript for type-safe development
- **Mapbox GL JS** for advanced 3D mapping and terrain visualization
- **Tailwind CSS** with Radix UI components for modern, responsive design
- **React Router** for client-side navigation
- **Supabase** for backend data management

### **Mapping Capabilities**
- **Multi-layer GeoJSON Integration**: Hazard data, barangay boundaries, SAFDZ zones
- **Real-time Layer Management**: Toggle hazard layers with smooth transitions
- **Interactive Popups**: Detailed information on hover/click for all map features
- **Responsive Design**: Optimized for desktop and mobile devices

### **Data Processing**
- **Shapefile Conversion**: Automated processing of GIS data into web-compatible formats
- **GeoJSON Optimization**: Efficient rendering of large spatial datasets
- **Real-time Filtering**: Client-side processing for instant map updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Mapbox access token (for map rendering)
- Supabase account (for data storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cliniko/ekistia.git
   cd ekistia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Add your Mapbox token and Supabase credentials
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm run preview
   ```

## 📱 Usage Guide

### **Map Navigation**
- **Zoom**: Mouse wheel or zoom controls
- **Pan**: Click and drag to navigate
- **3D View**: Use the 3D button or right-click + drag to rotate
- **Satellite Mode**: Toggle between streets and satellite views

### **Hazard Analysis**
- **Layer Controls**: Access hazard layers from the top-right panel
- **Risk Categories**: View flood, landslide, slope, and land use classifications
- **Opacity Control**: Adjust layer transparency for better visualization
- **Interactive Popups**: Click on map features for detailed information

### **Agricultural Planning**
- **Crop Selection**: Choose specific crops to view suitability analysis
- **Barangay Details**: Click on barangays for comprehensive agricultural data
- **Analytics Dashboard**: View city-wide agricultural statistics and trends

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file in the root directory:
```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Getting Your Credentials:**
- **Mapbox Token**: https://account.mapbox.com/access-tokens/
- **Supabase URL & Key**: https://app.supabase.com/project/_/settings/api

### **Map Data Sources**
- **Hazard Data**: Official Iligan City GIS datasets
- **Agricultural Data**: Crop suitability analysis and barangay statistics
- **SAFDZ Zones**: Strategic Agriculture and Fisheries Development Zones

## 🚀 Deployment

### Deploying to Vercel

1. **Connect your repository to Vercel**
2. **Add environment variables in Vercel Dashboard**:
   - Go to Settings → Environment Variables
   - Add `VITE_MAPBOX_TOKEN`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
   - Set for all environments (Production, Preview, Development)
3. **Deploy**: Vercel will automatically build and deploy

📚 **Detailed deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🤝 Contributing

We welcome contributions to improve Ekistia's agricultural intelligence capabilities!

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** and test thoroughly
4. **Submit a pull request** with detailed description

### **Development Guidelines**
- Use TypeScript for type safety
- Follow React best practices and hooks
- Test map functionality across different devices
- Maintain responsive design principles
- Document new features and API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **City of Iligan LGU** for providing hazard and agricultural data
- **Mapbox** for powerful mapping platform and terrain data
- **OpenStreetMap contributors** for base map data
- **Supabase** for reliable backend infrastructure
- **React & TypeScript communities** for excellent development tools

## 📞 Contact

For questions, collaboration opportunities, or data partnerships:
- **Email**: info@ekistia.com
- **GitHub**: [cliniko/ekistia](https://github.com/cliniko/ekistia)
- **Website**: [ekistia.com](https://ekistia.com)

---

**Ekistia** - Transforming agricultural planning with data-driven intelligence for sustainable development in Iligan City. 🌱📍🇵🇭
