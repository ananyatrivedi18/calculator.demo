# ⚙ EngCalc Pro — Engineering Calculator Suite

> A polished, full-stack engineering calculator web application built with Node.js, Express, and Vanilla JavaScript. Designed as a portfolio/resume project for engineering students.

![Screenshot](https://img.shields.io/badge/status-production--ready-brightgreen)
![Node](https://img.shields.io/badge/Node.js-18%2B-green)
![Express](https://img.shields.io/badge/Express-4.x-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

---

## 📸 Features

| Module | Capabilities |
|--------|-------------|
| **Basic Calculator** | +, −, ×, ÷, decimal, backspace, clear, keyboard input, copy result |
| **Scientific Calculator** | sin/cos/tan, log/ln, √, xʸ, n!, π, e; DEG/RAD toggle |
| **Unit Converter** | Length, Mass, Temperature, Pressure, Energy, Power (20+ units) |
| **Equation Solver** | Linear (ax+b=c) and Quadratic (ax²+bx+c=0) with step-by-step solutions |
| **History** | Saved via Express REST API + localStorage fallback; CSV export |
| **UI/UX** | Dark/light mode, responsive layout, animations, copy buttons, toast notifications |

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

---

## 📋 Resume Bullet Points

Copy and adapt these for your CV/resume:

```
• Engineered a full-stack Engineering Calculator SPA using Node.js + Express REST API and 
  Vanilla JavaScript, featuring scientific functions, a 20+ unit converter, step-by-step 
  equation solver, and persistent calculation history with localStorage fallback.

• Designed and implemented a responsive, accessible UI with dark/light theme switching, 
  CSS custom properties for design-token theming, keyboard navigation, and smooth 
  micro-interaction animations — achieving full mobile/tablet/desktop compatibility.

• Built a RESTful Express.js backend (GET/POST/DELETE) for CRUD operations on calculation 
  history, with input validation, structured JSON responses, and static file serving — 
  following MVC separation of concerns.

• Implemented robust error handling throughout: safe expression evaluation (no eval()), 
  complex-number detection in quadratic solutions, unit conversion edge cases, and graceful 
  API fallback to localStorage when the server is unavailable.
```

---

## 📜 License

MIT © [Your Name](https://github.com/yourusername)

---

## 🐙 GitHub Repository Description

> Full-stack Engineering Calculator built with Node.js + Express + Vanilla JS. Features scientific functions, unit converter (20+ units), linear/quadratic equation solver with step-by-step solutions, dark/light mode, and calculation history with CSV export.

**Suggested GitHub topics:**
`calculator` `engineering` `nodejs` `expressjs` `javascript` `student-project` `portfolio` `unit-converter` `equation-solver` `full-stack`

---

*Built with ❤ by [Your Name] — Engineering Student Portfolio Project*
