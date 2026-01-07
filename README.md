# Event-Driven Lead Scoring System

A real-time, event-driven application designed to evaluate and rank sales leads based on their interactions.

## Features

- **Real-time Dashboard**: Live view of leads, scores, and status.
- **Scoring Engine**: Configurable rules that automatically update lead scores.
- **Event Ingestion**: API for receiving events from webhooks or manual entry.
- **Visualization**: Score trends and history charts for each lead.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Shadcn UI, Recharts, Wouter
- **Backend**: Node.js, Express, Drizzle ORM, WebSocket (ws)
- **Database**: PostgreSQL

---

## Local Setup Instructions

Follow these steps carefully to set up the project on your local machine.

### Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - See installation instructions below
- **npm** (usually comes with Node.js)
- **Homebrew** (for macOS users) - [Install here](https://brew.sh/)

---

### Step 1: Install PostgreSQL

#### For macOS Users:

```bash
# Install PostgreSQL via Homebrew
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database for the project
/opt/homebrew/opt/postgresql@16/bin/createdb lead_score_engine
```

#### For Linux Users:

```bash
# Install PostgreSQL
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb lead_score_engine
```

#### For Windows Users:

1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Use pgAdmin or command line to create a database named `lead_score_engine`

---

### Step 2: Clone the Repository

```bash
git clone https://github.com/MaverickP24/Targetgrid_Lead_Score
cd Lead-Score-Engine
```

---

### Step 3: Install Dependencies

Install all required npm packages:

```bash
npm install
```

---

### Step 4: Configure Environment Variables

Create a `.env` file in the project root directory:

```bash
touch .env
```

Add the following configuration to `.env`:

```env
DATABASE_URL=postgresql://localhost:5432/lead_score_engine
PORT=3000
```

**Note:** 
- If your PostgreSQL requires a username/password, use: `postgresql://username:password@localhost:5432/lead_score_engine`
- Port 5000 may be occupied by macOS ControlCenter, so we recommend using port 3000

---

### Step 5: Database Schema Setup

Push the database schema using Drizzle ORM:

```bash
npm run db:push
```

You should see output confirming the schema was applied successfully.

---

### Step 6: Start the Development Server

Run the application:

```bash
npm run dev
```

The application will be available at:
- **http://localhost:3000** (or the port specified in your `.env` file)

You should see output like:
```
9:39:08 AM [express] serving on port 3000
```

---

## Troubleshooting

### Issue: Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find process using the port (e.g., port 3000)
lsof -i:3000

# Kill the process
kill -9 <PID>

# Or change the PORT in your .env file
PORT=3001
```

**Note for macOS Users:** Port 5000 is often used by AirPlay Receiver/ControlCenter. You can either:
- Use a different port (like 3000) in your `.env` file, OR
- Disable AirPlay Receiver in System Settings > General > AirDrop & Handoff

---

### Issue: DATABASE_URL Not Found

**Error:** `DATABASE_URL must be set. Did you forget to provision a database?`

**Solution:**
1. Ensure `.env` file exists in the project root
2. Verify the DATABASE_URL is correctly formatted
3. The project automatically loads environment variables via `dotenv` package

---

### Issue: PostgreSQL Connection Failed

**Error:** `Connection to database failed`

**Solution:**
```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux

# Verify database exists
psql -l | grep lead_score_engine

# If database doesn't exist, create it
createdb lead_score_engine  # macOS/Linux
```

---

### Issue: WebSocket Connection Failed

**Solution:**
- Ensure the development server is running
- Check browser console for specific error messages
- Verify the PORT in `.env` matches the running server

---

### Issue: Build/Compilation Errors

**Solution:**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf .vite
```

---

## API Endpoints

- `GET /api/leads`: List all leads
- `GET /api/leads/:id`: Get lead details and history
- `POST /api/events`: Ingest a new event (e.g., `{"eventType": "page_view", "leadId": 1}`)
- `GET /api/rules`: List scoring rules
- `PUT /api/rules/:id`: Update a scoring rule

## Project Structure

- `client/`: Frontend React application
- `server/`: Express backend and storage logic
- `shared/`: Shared TypeScript types and Zod schemas
