# Contributing to 3D Todo App

Thank you for your interest in contributing to the 3D Todo App! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- Git for version control
- Basic knowledge of React, TypeScript, and Three.js

### Development Setup

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/ajibolagenius/3d_todo_tobamsgroup.git
   cd 3d_todo_tobamsgroup
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 to view the app

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code formatting (Prettier configuration)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep components small and focused on a single responsibility

### Component Guidelines

- Use functional components with hooks
- Prefer Server Components when possible, use Client Components only when needed
- Keep 3D components performant (target 60fps)
- Ensure all components are accessible (ARIA labels, keyboard navigation)
- Use Tailwind CSS for styling

### Testing

- Write unit tests for utility functions
- Add integration tests for complex user flows
- Test 3D components for performance and functionality
- Ensure tests pass before submitting PRs

Run tests with:
```bash
npm test
```

### Performance Considerations

- Monitor 3D rendering performance
- Optimize for mobile devices
- Use React.memo() for expensive components
- Implement proper cleanup for 3D resources

## Submitting Changes

### Pull Request Process

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the guidelines above
3. Add or update tests as needed
4. Ensure all tests pass and there are no linting errors
5. Commit your changes with clear, descriptive messages
6. Push to your fork and submit a pull request

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure the PR is focused on a single feature or fix
- Update documentation if needed

### Commit Message Format

Use clear, descriptive commit messages:
```
feat: add celebration animation for task completion
fix: resolve mobile layout issue on small screens
docs: update API documentation
test: add unit tests for todo validation
```

## Code Review Process

- All submissions require review from maintainers
- Reviews focus on code quality, performance, and adherence to guidelines
- Address feedback promptly and professionally
- Be open to suggestions and improvements

## Reporting Issues

### Bug Reports

When reporting bugs, please include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser and device information
- Screenshots or videos if applicable

### Feature Requests

For feature requests, please provide:
- Clear description of the proposed feature
- Use case and benefits
- Any implementation ideas or considerations

## Development Tips

### Working with 3D Components

- Use React Three Fiber's `useFrame` hook for animations
- Implement proper disposal of geometries and materials
- Test on various devices for performance
- Use `React.Suspense` for loading 3D assets

### State Management

- Use the existing TodoContext for todo-related state
- Keep component state local when possible
- Use custom hooks for reusable logic

### Styling

- Use Tailwind CSS utility classes
- Follow mobile-first responsive design
- Ensure high contrast for accessibility
- Test on various screen sizes

## Getting Help

- Check existing issues and documentation first
- Ask questions in GitHub Discussions
- Join our community chat (if available)
- Reach out to maintainers for guidance

## Recognition

Contributors will be recognized in the project's README and release notes. We appreciate all contributions, from bug fixes to major features!

Thank you for contributing to making the 3D Todo App better for everyone!
