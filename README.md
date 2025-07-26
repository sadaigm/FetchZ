# FetchZ

FetchZ is a lightweight and user-friendly tool for managing API requests locally. It provides an alternative to cloud-based tools like Postman by allowing users to organize their API requests in a folder structure without requiring a cloud login. This makes it ideal for developers who value simplicity, control, and local-first workflows.

## Features

- **Local Request Collections**: Organize API requests in a folder structure stored locally.
- **No Cloud Login**: All data is stored locally, ensuring complete control.
- **Request History**: View and manage past API requests.
- **Tabbed Interface**: Work on multiple API requests simultaneously.
- **Customizable Requests**: Configure headers, query parameters, and request bodies.
- **Save to Collections**: Save frequently used requests for quick access.

## Prerequisites

Before starting, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-repo/FetchZ.git
   cd FetchZ
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```

4. **Open the App**
   Open your browser and navigate to `http://localhost:5173` (default Vite port).

## Project Structure

The project is organized as follows:

```
src/
  components/       # React components
  context/          # Context providers for state management
  services/         # Database and storage services
  types/            # TypeScript type definitions
  utils/            # Utility functions
  assets/           # Static assets
public/             # Public files served by Vite
```

## How to Use

1. **Create Requests**: Use the tabbed interface to create and send API requests.
2. **Organize Collections**: Save requests to collections and organize them in a folder structure.
3. **View History**: Access your request history to reuse or modify past requests.

## Why FetchZ?

FetchZ is designed for developers who value local storage and user-friendly tools. It provides a seamless experience for managing API requests locally, offering features like request collections, history, and a tabbed interface. FetchZ is a great choice for those who prefer simplicity and control over their workflow.

## Work in Progress

FetchZ is actively being developed to provide a robust and user-friendly experience for managing API requests. Here are some of the ongoing efforts and planned features:

- **Enhanced Request History**: Improving the request history interface for better usability and filtering options.
- **Folder Management**: Adding advanced folder management capabilities for organizing collections.
- **Performance Optimization**: Ensuring smooth performance even with large datasets.
- **Dark Mode**: Introducing a dark mode for better accessibility and user comfort.
- **Import/Export**: Allowing users to import and export collections in various formats.

We welcome feedback and contributions to make FetchZ even better. Stay tuned for updates!

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to improve FetchZ.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
