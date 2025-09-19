# 3D Todo App

A modern, interactive to-do list web application that combines practical task management with engaging 3D progress visualization. Built with Next.js and React Three Fiber.

## Features

- **Task Management**: Create, complete, and delete tasks with a clean, intuitive interface
- **Search & Filters**: Inline search, status, and priority filters with debounced updates
- **Priorities**: High/Medium/Low priority with badges and visual cues
- **3D Progress Visualization**: Watch your progress come to life with animated 3D graphics
- **Responsive Design**: Optimized for mobile, tablet, and desktop devices
- **Performance Optimized**: Maintains 60fps with device-specific optimizations
- **Accessibility**: Full keyboard navigation and screen reader support
- **Persistent Storage**: Tasks are saved locally and persist between sessions
- **Polished Footer**: Fixed, gradient footer crediting the author

## Technology Stack

- **Next.js 14+** with App Router
- **React 18+** with TypeScript
- **React Three Fiber** for 3D graphics
- **Tailwind CSS** for styling
- **Vitest** for testing
- **Local Storage** for data persistence

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ajibolagenius/3d_todo_tobamsgroup.git
cd 3d_todo_tobamsgroup
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── TodoApp.tsx        # Main app container
│   ├── TodoList.tsx       # Task list display
│   ├── TodoItem.tsx       # Individual task
│   ├── TodoForm.tsx       # Add task form
│   └── ProgressVisualization.tsx # 3D progress component (orchestrator)
│   └── three/                    # 3D subcomponents (split for maintainability)
│       ├── Scene.tsx            # Lights and main scene assembly
│       ├── GlassCylinderProgress.tsx # Main 3D progress object
│       ├── CelebrationParticles.tsx  # Completion particle effect
│       ├── Fallbacks.tsx        # Loading/error/2D fallbacks
│       └── PriorityHoverInfo.tsx # Priority hover overlay
├── contexts/              # React contexts
│   └── TodoContext.tsx    # Todo state management
├── hooks/                 # Custom React hooks
│   └── useTodos.ts        # Todo management hook
├── types/                 # TypeScript definitions
│   └── todo.ts            # Todo type definitions
└── utils/                 # Utility functions
    ├── localStorage.ts    # Local storage helpers
    ├── performance.ts     # Performance monitoring
    └── validation.ts      # Input validation
```

## Performance Features

- **Device Detection**: Automatically adjusts 3D complexity based on device capabilities
- **Frame Rate Monitoring**: Maintains smooth 60fps animations
- **Memory Management**: Efficient cleanup of 3D resources
- **Progressive Enhancement**: Graceful fallback for devices without WebGL support
- **Debounced Search**: Limits filter recomputation while typing

## Browser Support

- Modern browsers with ES2020+ support
- WebGL support recommended for 3D features
- Fallback 2D visualization for unsupported devices

## Documentation

- **[User Guide](docs/USER_GUIDE.md)** - Complete guide for end users
- **[FAQ](docs/FAQ.md)** - Frequently asked questions
- **[API Documentation](docs/API.md)** - Technical API reference
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to the project

## Credits

Created by: AJIBOLA AKELEBE 🐼 — See footer in-app.

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Support

- **Issues**: Report bugs and request features on [GitHub Issues](https://github.com/your-username/3d_todo_tobamsgroup/issues)
- **Documentation**: Check our comprehensive documentation in the `docs/` folder

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
