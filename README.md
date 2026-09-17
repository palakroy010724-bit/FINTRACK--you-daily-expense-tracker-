# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# 📊 FinTrack — Personal Income & Expense Intelligence Platform

FinTrack is a modern, responsive web application designed to track monthly finances, process automated bank statements via CSV uploads, and monitor financial health metrics in real time. Built with **React**, **Tailwind CSS v4**, and **Recharts**.

---

## ✨ Features

* **Automated CSV Processing**: Upload bank statements (`.csv`) to parse income and expenses without manual entry.
* **Dynamic Financial Overview**: Automatically calculates net balance, total income, and total expenses.
* **Financial Health Scorecard**: Evaluates savings rates, fixed-to-variable expense ratios, and emergency reserves on a 100-point scale.
* **Interactive Data Visualization**: Bar charts built with Recharts displaying monthly financial breakdowns.
* **Low Balance Alert**: Real-time alerts when tracked account balances fall below prescheduled commitments.
* **Prescheduled Expense Management**: View and edit upcoming recurring expenses.

---

## 🛠️ Tech Stack

* **Frontend Framework**: React 19 (Vite)
* **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
* **CSV Parsing**: PapaParse
* **Charts & Visualization**: Recharts
* **Icons**: Lucide React

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18 or higher) installed on your machine.

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/your-username/fintrack.git](https://github.com/your-username/fintrack.git)
   cd fintrack
backend : https://github.com/palakroy010724-bit/fintrack-backend 
