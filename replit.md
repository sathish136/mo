# Ministry of Finance Sri Lanka HR Attendance Management System

## Overview

This is a comprehensive HR Attendance Management System built for the Ministry of Finance Sri Lanka. The application automates employee attendance tracking using ZK biometric devices and provides policy-based calculations for government employees. It features a modern React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom government theme colors
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Design**: RESTful API with structured error handling
- **Session Management**: express-session with PostgreSQL store

### Database Schema
- **Employees**: Core employee data with biometric device integration
- **Attendance**: Daily attendance records with check-in/check-out times
- **Leave Requests**: Leave management with approval workflows
- **Overtime Requests**: Overtime tracking and approval system
- **Biometric Devices**: ZK device management and configuration

## Key Components

### Frontend Components
- **Dashboard**: Overview of attendance statistics and recent activities
- **Employee Management**: CRUD operations for employee records
- **Attendance Tracker**: Real-time attendance monitoring and manual entry
- **Leave Management**: Leave request submission and approval workflows
- **Overtime Management**: Overtime request handling and tracking
- **Reports**: Comprehensive reporting with data visualization
- **Settings**: System configuration and biometric device management

### Backend Services
- **Storage Layer**: Abstracted database operations with type-safe queries
- **Route Handlers**: RESTful endpoints for all business operations
- **Database Connection**: Pooled connections with Neon serverless PostgreSQL
- **Middleware**: Request logging, error handling, and session management

## Data Flow

1. **Employee Registration**: Employees are registered with biometric device IDs
2. **Attendance Capture**: ZK biometric devices capture attendance data
3. **Data Processing**: Backend processes attendance records and calculates working hours
4. **Policy Application**: Government-specific attendance policies are applied
5. **Report Generation**: System generates various reports for HR and management
6. **Leave/Overtime Workflows**: Approval workflows for leave and overtime requests

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/react-***: Headless UI components for accessibility
- **zod**: Runtime type validation and schema definition
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type checking and compilation
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds the React application to `dist/public`
2. **Backend Build**: esbuild bundles the server code to `dist/index.js`
3. **Database Migration**: Drizzle migrations are applied to PostgreSQL

### Production Configuration
- **Node.js Environment**: Production server runs compiled JavaScript
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Static Assets**: Frontend assets served from `dist/public`
- **Environment Variables**: Database URL and session secrets from environment

### Development Workflow
- **Development Server**: Vite dev server with HMR for frontend
- **Backend Server**: tsx for TypeScript execution with hot reload
- **Database**: Drizzle push for schema synchronization

## User Preferences

Preferred communication style: Simple, everyday language.

## Changelog

Changelog:
- July 04, 2025. Initial setup
- July 07, 2025. Migration from Replit Agent to Replit environment completed
  - Successfully migrated HR Attendance Management System from Replit Agent to standard Replit environment
  - Fixed cross-env dependency issue that was preventing application startup
  - Created and migrated complete PostgreSQL database schema with all tables, constraints, and relationships
  - Established database connection using Neon serverless PostgreSQL with proper environment variables
  - Added sample test data (4 departments, 1 admin employee) to verify database functionality
  - All API endpoints verified working with real database connections
  - Application server running successfully on port 5000 with proper error handling
  - Frontend loads correctly with minor React validation warnings (non-blocking)
  - Complete database schema includes: employees, departments, attendance, leave_requests, overtime_requests, biometric_devices, holidays, short_leave_requests
  - All database foreign key relationships and constraints properly established
  - Migration completed successfully - system ready for full operation
  - Successfully migrated project from Replit Agent to Replit environment
  - Database connection established with PostgreSQL (178 employees loaded)
  - All API endpoints working properly with real data
  - Frontend and backend integration verified
  - Added HR Settings navigation link to main Settings page
  - Database setup with PostgreSQL and full schema migration
  - Successfully resolved cross-env dependency issue
  - Database schema created with all tables, constraints, and sample data
  - Application verified working with real biometric device integration
  - ZK device connection and employee import functionality tested successfully
  - All dependencies installed and configured
  - Fixed overtime management approved/rejected tabs to show actual data with real-time updates
  - Updated Daily OT Report to show only pending/approved/rejected statuses (removed "Not Applied" and "N/A")
  - Added real-time cache invalidation for overtime request counts in tab bar
  - Fixed overtime management approved/rejected tabs to show actual data instead of placeholders
  - Removed Daily OT Report button from overtime management page
  - Monthly attendance report enhancements:
    - Added total hours calculation column
    - Added overtime total column (without 'h' suffix)
    - Added present days count in status totals
    - Changed background from yellow to light blue for better readability
    - Added month/year header display
    - Removed duplicate export options
    - Show "-" instead of "0" for empty overtime values
  - Daily reports styling improvements:
    - Reduced text size to extra small (text-xs) for compact layout
    - Enhanced color-coded status indicators (green/red/yellow/orange)
    - Professional card layouts with proper headers and statistics
    - Better group badge styling (Group A/Group B)
    - Improved OT eligibility filtering - only shows employees with OT hours > 0
    - Enhanced OT approval status display (Approved/Pending/Rejected/Not Applied/N/A)
    - Added total OT hours and approved OT hours summary in daily OT report
  - Employee Management enhancements:
    - Added serial numbers (S.No) column for better record tracking
    - Implemented multiple selection with checkboxes for bulk operations
    - Added bulk operations functionality for department, group, and status changes
    - Created bulk update API endpoint with proper validation and error handling
    - Enhanced UI with bulk operations dialog and controls
    - Improved table layout with select all functionality
    - Fixed bulk operations API endpoint with proper route ordering
    - Successfully tested bulk updates for department, group, and status changes
    - Implemented proper error handling and logging for bulk operations
  - Overtime Management page enhancements:
    - Complete UI/UX redesign with modern gradient backgrounds and styling
    - Enhanced dashboard cards with gradient backgrounds and real-time statistics
    - Implemented tabbed workflow interface (Pending/Approved/Rejected)
    - Smart action bar with contextual bulk operations
    - Modern table design with improved visual hierarchy
    - Progressive disclosure pattern for better user experience
    - Integrated workflow automation features
    - Enhanced loading states and empty state messaging
    - Added subtle professional color coding for better visual hierarchy
    - Fixed approval workflow error by correcting employeeId field validation
    - Implemented proper datetime formatting for overtime request creation
    - Added employee search filter and group filtering functionality
    - Implemented reject reason dialog with mandatory reason input
    - Added Daily OT Report link integration from overtime page
    - Enhanced filtering displays for better user experience
    - Fixed workflow button sizing for compact professional design
    - Added bulk operations dialog with intuitive interface
    - Added select all/deselect all functionality
    - Enhanced table layout with better organization
  - Comprehensive Holiday Management system implementation:
    - Added new holidays database table with annual/special/weekend types
    - Created full CRUD API endpoints for holiday management
    - Built modern responsive frontend with gradient design and statistics cards
    - Implemented separate reports for holiday descriptions by type
    - Added group-specific holiday tracking for both Group A and Group B employees
    - Created export functionality for CSV holiday reports
    - Integrated year-based filtering and holiday calendar view
    - Professional design showing Annual Holidays (21 days), Special Holidays (24 days), Total (45 days)
    - Added weekend day tracking for comprehensive holiday coverage
  - Policy Implementation (Group A & Group B Attendance Policies):
    - Created comprehensive attendance calculation engine implementing exact policy requirements
    - Group A: 8:30 AM - 4:15 PM (7.75 hours), 30-min grace period, half-day after 10:00 AM
    - Group B: 8:00 AM - 4:45 PM (8.75 hours), 15-min grace period, half-day after 9:30 AM
    - Implemented short leave tracking system (2 per month max for both groups)
    - Added proper overtime calculation (7.75+ hours for Group A, 8.75+ hours for Group B)
    - Created 1/4 Offer calculation system (overtime from 4:15 PM for Group A, 4:45 PM for Group B)
    - Set up complete 45-holiday system (21 Annual + 24 Special holidays)
    - Integrated weekend and holiday overtime rules (full OT on weekends/holidays)
    - Added short leave requests table and tracking functionality
    - Implemented policy-compliant late arrival and half-day rules
  - Enhanced Export Functionality and 1/4 Offer-Attendance Report improvements:
    - Completely redesigned 1/4 Offer-Attendance Report with modern gradient styling and better visual hierarchy
    - Added enhanced summary statistics cards with icons and gradient backgrounds
    - Implemented comprehensive Excel export functionality with preview dialog
    - Created export preview system showing data sample before download
    - Replaced CSV export with Excel (.xlsx) format for all reports
    - Added professional styling with compact table design and color-coded data
    - Enhanced policy display sections with Group A and Group B specific rules
    - Integrated XLSX library for robust Excel file generation
    - Added file size estimation and export metadata display
    - Improved user experience with preview-first export workflow
  - Multi-Tier Enterprise License System Implementation:
    - Created comprehensive license-based access control system that blocks all functionality without valid license
    - Implemented 5-tier enterprise licensing structure with specific web login limits:
      • J7K9-P2Q4-R6T8-U1V3: Enterprise Pro (2 web logins, advanced analytics)
      • M5N7-B8C2-L4X6-W9Z0: Enterprise Plus (3 web logins, full reports)
      • D3F5-H6J8-K1L4-P7R9: Enterprise Basic (1 web login, basic features)
      • Q2W4-E5R7-T8Y1-U3I6: Enterprise Max (5 web logins, multi-user access)
      • A9S2-D5F7-G3H6-J8K1: Enterprise Demo (unlimited logins, demo features)
    - Built LicenseGuard component that wraps entire application and requires validation before access
    - Created persistent license storage with localStorage for seamless user experience
    - Enhanced System Settings with professional license management interface
    - Added Activity Logs and Error Logs dialogs with real-time system monitoring
    - Integrated license information display in General Settings tab with tier details
    - All system management functions (backup, logs, etc.) disabled without valid license
    - Professional support contact integration and license validation workflow
    - License-based feature enablement system for future functionality restrictions
  - Migration to Replit Environment Completed Successfully:
    - Successfully migrated complete HR Attendance Management System from Replit Agent to standard Replit environment
    - Fixed cross-env dependency issue preventing application startup
    - Established PostgreSQL database connection with complete schema migration
    - Created all 8 database tables with proper constraints, foreign keys, and indexes
    - Added sample test data (4 departments, 1 admin employee) for system verification
    - All API endpoints functional with real database connections and proper error handling
    - Session management system working correctly with real-time session tracking
    - License system updated to reflect "Live U Pvt Ltd" as the license issuer
    - Fixed session display issues in Active Sessions dialog - now shows detailed session information
    - Application server running successfully on port 5000 with full functionality
    - System ready for production use with all features operational