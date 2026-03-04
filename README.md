# Jenkins Plugin Modernizer Dashboard

## Project Overview
The **Jenkins Plugin Modernizer Dashboard** is a dynamic, frontend-only application designed to help Jenkins maintainers thoroughly analyze the modernization status of the live plugin ecosystem. It provides immediate, data-driven insights to distinguish which plugins are healthy, which are falling behind, and which demand urgent modernization attention.

## Features

- **Live Jenkins Plugin Data:** Hooks directly into the official Jenkins ecosystem APIs.
- **Plugin Modernization Scoring System:** Intelligently evaluates thousands of plugins based on comprehensive rules covering popularity metrics, strict semantic versioning, and recent release activity.
- **Risk Level Detection:** Automatically categorizes the entire registry into `HEALTHY`, `NEEDS ATTENTION`, or `OUTDATED`.
- **Interactive Dashboard Charts:** Visualize aggregated plugin metadata instantly via ECharts to gauge ecosystem performance at a glance.
- **Plugin Search:** Powerful, fuzzy client-side search mechanism quickly isolating specific target plugins.

## Architecture

- **React** for declarative, component-driven UI.
- **TypeScript** for strict model definitions enforcing API parsing integrity.
- **Vite** for incredibly fast compilation and hot module reloading.
- **ECharts (echarts-for-react)** for performant canvas-rendered charting.

## Data Source
The dashboard directly aggregates live statistics natively from the unauthenticated **Jenkins Plugins API**:
[https://plugins.jenkins.io/api/plugins](https://plugins.jenkins.io/api/plugins)

## Live Demo
https://soujanyabhirade.github.io/jenkins-plugin-modernizer-dashboard./


## Future Improvements

- **Dependency Analysis:** Deeply trace outdated transitive dependencies required by the plugins.
- **Deprecated API Detection:** Compare core API bindings to the latest required Jenkins baseline releases securely.
- **AI-Powered Plugin Maintenance Predictions:** Leverage local language models to suggest specific code-recipes to automate plugin modernization.
- 
 ## Run Locally
 git clone https://github.com/soujanyabhirade/jenkins-plugin-modernizer-dashboard.
 cd jenkins-plugin-modernizer-dashboard


## Contribution

To spin up this project locally to test or contribute:

1. Clone the repository and install packages:
   ```bash
   npm install
   ```
2. Run the Vite development server:
   ```bash
   npm run dev
   ```
3. Prepare a static production build (fully compatible with GitHub pages static hosting):
   ```bash
   npm run build
   ```
