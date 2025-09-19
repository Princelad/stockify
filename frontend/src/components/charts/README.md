# Charts Components

This directory contains reusable chart components for the Stockify dashboard.

## Components

### SalesChart

A comprehensive sales analytics chart with multiple view options:

- **Line Chart**: Revenue and profit trends over time
- **Bar Chart**: Comparative revenue and profit visualization
- **Pie Chart**: Product category distribution
- **Time Periods**: 7 days, 30 days, 1 year views
- **Interactive**: Tooltips, legends, and period selection

### MiniAnalytics

Small chart widgets for quick insights:

- **Area Charts**: Smooth trend visualization
- **Bar Charts**: Discrete value comparison
- **Trend Indicators**: Up/down/neutral with icons
- **Pre-built Components**: Revenue, Orders, Conversion rate

## Features

- **Real-time Data**: Connects to backend APIs for live data
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Skeleton placeholders during data fetch
- **Error Handling**: Graceful fallbacks with mock data
- **TypeScript**: Fully typed components
- **Recharts**: Built with reliable charting library

## Usage

```tsx
import { SalesChart, RevenueMiniChart } from '@/components/charts';

// Full-featured sales analytics
<SalesChart className="mt-6" />

// Mini chart widgets
<RevenueMiniChart />
```
