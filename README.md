
Built by https://www.blackbox.ai

---

# World Tattoo Rating

## Project Overview
World Tattoo Rating is a comprehensive management system for tattoo conventions, featuring an administrator panel and a contact form for attendees to interact. This platform is designed to improve event organization and facilitate communication between tattoo artists, jurors, and attendees.

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your system.
- Recommended: [Visual Studio Code](https://code.visualstudio.com/) for code editing.
- Optional: Live Server extension for frontend development.

### Steps to Set Up
1. **Create the project directory:**
   ```bash
   mkdir world-tattoo-rating
   cd world-tattoo-rating
   ```

2. **Initialize npm:**
   ```bash
   npm init -y
   ```

3. **Install dependencies:**
   ```bash
   npm install express
   ```

4. **Create the data directory:**
   ```bash
   mkdir data
   ```

5. **Copy all project files** into the created directory.

6. **Run the server:**
   ```bash
   node server.js
   ```

7. **Open the application** in your browser at: [http://localhost:8000](http://localhost:8000)

## Usage
To access the admin panel, visit [http://localhost:8000/admin.html](http://localhost:8000/admin.html) and log in using the credentials:
- **Password:** `admin123`

### Features
- **Contact Form:** Users can submit their inquiries and messages.
- **Admin Panel:** Manage messages, view statistics, and administer user roles seamlessly.
- **Dynamic Components:** Real-time updates through JavaScript and a smooth user interface built with [Tailwind CSS](https://tailwindcss.com/).
- **Data Persistence:** Utilizes JSON files to store messages, allowing for easy retrieval and modification.

## Dependencies
The following dependencies are used in the project as defined in `package.json`:
- **express:** ^4.18.2 - Node.js web application framework for building RESTful APIs.

## Project Structure
```
world-tattoo-rating/
├── index.html              # Main homepage
├── admin.html              # Admin panel
├── registro.html           # Registration page for participants
├── style.css               # CSS styles for the application
├── script.js               # Main JavaScript for frontend functionality
├── admin.js                # JavaScript for admin panel functionality
├── registro.js             # JavaScript for registration forms
├── server.js               # Node.js Express server
├── package.json            # Project metadata and dependencies
└── data/
    └── messages.json       # JSON file for storing contact messages
```

## License
This project is licensed under the MIT License.

## Support
If you encounter any issues or have questions regarding the setup or usage, feel free to reach out via the contact form available on the site.

## Notes
- Ensure that the server is running to make the contact form functional.
- Messages will be stored in `data/messages.json`.
- The admin panel requires a password for access: `admin123`.
- All project files should be located in the same directory for proper functionality.