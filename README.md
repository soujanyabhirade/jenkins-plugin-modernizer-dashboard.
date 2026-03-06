# Jenkins Plugin Modernizer Dashboard

## Project Overview
The **Jenkins Plugin Modernizer Dashboard** is a dynamic, production-quality analytics tool designed to help Jenkins maintainers thoroughly analyze the modernization status of the live plugin ecosystem. It provides immediate, data-driven insights to distinguish which plugins are healthy, which are falling behind, and which demand urgent modernization attention. The dashboard now includes advanced KPI cards, interactive pie and bar charts, a dependency risk ecosystem graph, and detailed plugin analytics.

## Features

- **Live Jenkins Plugin Data:** Hooks directly into the official Jenkins ecosystem API.
- **KPI Summary Cards:** Quick overview of the total number of plugins, healthy plugins, and high-risk plugins.
- **Advanced Charts:** Interactive pie and bar charts visualizing plugin health distribution, modernizer scores, and dependency risk breakdowns using ECharts.
- **Interactive Plugin Table:** A complete directory with advanced client-side features including sorting, filtering, text search, and pagination.
- **Plugin Detail Drawer:** Click on any plugin to instantly view a side panel with version info, scores, and a detailed breakdown of all dependencies with their individual risk levels.
- **Dependency Graph Visualization:** An interactive node-based graph using React Flow that maps out the top plugins and their ecosystem dependencies, color-coded by health.
- **Data Export:** Easily export the entire analyzed plugin ecosystem to CSV or JSON with a single click.

## Architecture

- **React** for declarative, component-driven UI.
- **TypeScript** for strict model definitions enforcing API parsing integrity.
- **Vite** for incredibly fast compilation and hot module reloading.
- **Lucide React** for consistent, modern SVG icons.
- **ECharts (echarts-for-react)** for performant canvas-rendered charting.
- **React Flow (@xyflow/react)** for visual node-based dependency graphs.
- **Vanilla CSS (Grid & Flexbox)** for a lightweight, customized, and responsive premium design aesthetic.

## Data Source
The dashboard directly aggregates live statistics natively from the unauthenticated **Jenkins Plugins API**:
[https://plugins.jenkins.io/api/plugins](https://plugins.jenkins.io/api/plugins)

## Live Demo
https://soujanyabhirade.github.io/jenkins-plugin-modernizer-dashboard./

## Future Improvements

- **Dependency Analysis:** Deeply trace outdated transitive dependencies required by the plugins.
- **Deprecated API Detection:** Compare core API bindings to the latest required Jenkins baseline releases securely.
- **AI-Powered Plugin Maintenance Predictions:** Leverage local language models to suggest specific code-recipes to automate plugin modernization.

## Run Locally

To spin up this project locally to test or contribute:

1. Clone the repository:
   ```bash
   git clone https://github.com/soujanyabhirade/jenkins-plugin-modernizer-dashboard.git
   cd jenkins-plugin-modernizer-dashboard
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Prepare a static production build:
   ```bash
   npm run build
   ```
