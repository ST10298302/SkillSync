# SkillSync App Documentation

## Overview

SkillSync is a React Native/Expo application designed to help users track and manage their skill development journey. The app provides a comprehensive platform for logging practice sessions, tracking progress, and visualizing skill development over time.

## Table of Contents

1. [Architecture Overview](./architecture.md)
2. [App Structure](./app-structure.md)
3. [Authentication System](./authentication.md)
4. [Database Schema](./database-schema.md)
5. [API Documentation](./api-documentation.md)
6. [Component Library](./components.md)
7. [State Management](./state-management.md)
8. [Styling & Theming](./styling.md)
9. [Development Setup](./development-setup.md)
10. [Deployment Guide](./deployment.md)

## Key Features

- **Skill Tracking**: Create and manage multiple skills with progress tracking
- **Practice Logging**: Log practice sessions with detailed notes and time tracking
- **Progress Visualization**: View progress charts and analytics
- **User Authentication**: Secure login/signup with Supabase
- **Profile Management**: User profiles with customizable avatars
- **Cross-Platform**: Works on iOS, Android, and Web
- **Dark/Light Theme**: Adaptive theming system

## Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: React Context API
- **Styling**: React Native StyleSheet with custom design system
- **Icons**: Expo Vector Icons (Ionicons)
- **Animations**: React Native Animated API
- **Storage**: AsyncStorage (Web) + SecureStore (Native)

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Start development server: `npm start`

For detailed setup instructions, see [Development Setup](./development-setup.md).

## Project Structure

```
SkillSyncApp/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   └── skill/             # Skill management screens
├── components/             # Reusable UI components
├── context/               # React Context providers
├── services/              # API and external services
├── utils/                 # Utility functions and configurations
├── constants/             # Design system constants
└── docs/                  # Documentation (this folder)
```

## Contributing

Please read the [Development Setup](./development-setup.md) guide before contributing to the project.
