# EngCalc Pro 

 EngCalc Pro is an engineering calculator web application that I built using HTML, CSS, JavaScript, Node.js,and Express.
 The idea behind this project was to create a single platform where users can perform basic calculations,use scientific functions, convert units, solve   equations,and keep track of previous calculations.

While building this project, I learned how frontend and backend applications communicate through APIs, how to manage calculation history, and how to create a user responsive user interface that works across different screen sizes.

---

# Features
## Basic Calculator
- Addition, subtraction, multiplication, and division
- Decimal calculations
- Keyboard support
- Copy result option

           
## Scientific Calculator
- Trigonometric functions (sin, cos, tan)
- Logarithmic functions
- Square root calculations
- Powers and factorials
- Degree/Radian mode convertor


## Unit Converter
Conversion between:
- Length
- Mass
- Temperature
- Pressure
- Energy
- Power

### Equation Solver
- Linear equations
- Quadratic equations
- Step-by-step solutions

### Calculation History
- Stores previous calculations
- History can be cleared when needed
- CSV export support

## User Interface
- Dark and Light themes
- Responsive design for mobile and desktop
- Toast notifications and animations

  
  


---

## 🛠 Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Google Fonts
- **Backend:** Node.js 18+, Express.js 4.x
- **Storage:** In-memory (server) + localStorage (client fallback)
- **Design:** CSS custom properties (theming), CSS Grid/Flexbox, DM Mono + Syne fonts

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/engcalc-pro.git
cd engcalc-pro

# 2. Install dependencies
npm install

# 3. Start the server
npm start

# 4. Open your browser
# Navigate to: http://localhost:3000
```

### Development Mode (auto-restart on file changes)

```bash
npm run dev
```

> Requires `nodemon`. It is included as a dev dependency.

---

## 📁 Project Structure

```
engcalc-pro/
├── server.js          # Express server & REST API routes
├── package.json       # Project metadata & dependencies
├── README.md          # This file
└── public/
    ├── index.html     # Single-page app shell
    ├── style.css      # All styling (dark/light themes, responsive)
    └── script.js      # All frontend logic (calculator, converter, solver, history)
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/history` | Fetch all calculation history (newest first) |
| `POST` | `/api/history` | Save a new calculation entry |
| `DELETE` | `/api/history` | Clear all history |
| `DELETE` | `/api/history/:id` | Delete a single entry by ID |
| `GET` | `/api/health` | Server health check |

### POST /api/history — Request Body

```json
{
  "expression": "2x + 3 = 11",
  "result": "x = 4",
  "mode": "solver"
}
```

### GET /api/history — Response

```json
{
  "success": true,
  "history": [
    {
      "id": 1,
      "expression": "12 × 3 =",
      "result": "36",
      "mode": "basic",
      "timestamp": "2025-06-04T10:30:00.000Z"
    }
  ]
}
```

---

## 🖥 Keyboard Shortcuts (Basic Calculator)

| Key | Action |
|-----|--------|
| `0`–`9` | Input digit |
| `.` | Decimal point |
| `+`, `-`, `*`, `/` | Operators |
| `Enter` or `=` | Calculate result |
| `Backspace` | Delete last character |
| `Escape` | Clear all |

---

## 🌙 Themes

Toggle between **dark mode** (industrial steel + amber) and **light mode** by clicking the ☀/☾ button in the header. Theme preference is saved in `localStorage`.

---

## 📦 Future Improvements

- [ ] Matrix calculator (row reduction, determinant, inverse)
- [ ] Ohm's Law & circuit analysis tool
- [ ] Beam deflection / structural engineering calculator
- [ ] User authentication with persistent cloud history (PostgreSQL/MongoDB)
- [ ] PWA support (offline capability via Service Worker)
- [ ] Graph plotter for functions
- [ ] LaTeX equation rendering
- [ ] Multi-language/locale support



##  License

MIT © [Ananya Trivedi](https://github.com/ananyatrivedi18)

---

## 🐙 GitHub Repository Description

> Full-stack Engineering Calculator built with Node.js + Express + Vanilla JS. Features scientific functions, unit converter (20+ units), linear/quadratic equation solver with step-by-step solutions, dark/light mode, and calculation history with CSV export.


---

*Built by [Ananya Trivedi] — Engineering Portfolio Project
