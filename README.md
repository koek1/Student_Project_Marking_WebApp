# Student Project Marking WebApp

A comprehensive web application for managing student project competitions. This application allows administrators to manage teams, judges, rounds, and scoring criteria, while providing judges with an interface to score projects.

## 🚀 Quick Start

### Prerequisites
- Docker (Download from: https://docs.docker.com/get-docker/)
- Docker Compose (Usually included with Docker Desktop)

### One-Command Setup
```bash
# Make the setup script executable and run it
chmod +x setup.sh
./setup.sh
```

### Manual Setup
```bash
# Start the application
docker-compose up -d

# Create admin user
cd backend
node init-docker-admin.js
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Login**: admin / admin123

## 🔐 Default Login Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

## 📱 How to Use the Application

### For Administrators

#### 1. Managing Teams
- **Navigate to**: "Bestuur Spanne" (Manage Teams)
- **Add Teams**: Click "Voeg Nuwe Span By" (Add New Team)
- **Fill in details**:
  - Team Name (e.g., "Team Alpha")
  - Team Number (1-15)
  - Project Title
  - Project Description
  - Team Members (3-4 members, one per line)
- **Save**: Click "Create Team"

#### 2. Managing Judges
- **Navigate to**: "Bestuur Beoordelaars" (Manage Judges)
- **Add Judges**: Click "Voeg Nuwe Beoordelaar By" (Add New Judge)
- **Fill in details**:
  - Username
  - Password
  - Full Name
  - Email
  - Specialization/Position
- **Save**: Click "Create Judge"

#### 3. Setting Up Criteria
- **Navigate to**: "Bestuur Kriteria" (Manage Criteria)
- **Add Criteria**: Click "+ Add Criteria"
- **Fill in details**:
  - Criteria Name (e.g., "User Interface Design")
  - Description
  - Maximum Score (e.g., 100)
- **Save**: Click "Create Criteria"

#### 4. Creating Rounds
- **Navigate to**: "Bestuur Rondes" (Manage Rounds)
- **Add Round**: Click "Create New Round"
- **Fill in details**:
  - Round Name (e.g., "Preliminary Round")
  - Round Type (Preliminary/Semi-Final/Final)
  - Description
  - Select Criteria (choose from existing criteria)
- **Save**: Click "Create Round"

#### 5. Assigning Judges to Teams
- **Navigate to**: "Bestuur Toewysings" (Manage Assignments)
- **Assign Judges**: 
  - Select teams and judges
  - Use "Auto Assign" for automatic assignment
  - Or manually assign judges to teams
- **Save**: Assignments are saved automatically

### For Judges

#### 1. Viewing Assigned Teams
- **Login** with judge credentials
- **Navigate to**: "My Spanne" (My Teams) tab
- **View teams** assigned to you
- **See project details** and team members

#### 2. Scoring Teams
- **Click** "Start Scoring" for any team
- **Select criteria** to score on
- **Enter scores** (0-100 for each criteria)
- **Add comments** if needed
- **Submit scores** when complete

#### 3. Viewing Results
- **Navigate to**: "Punte Geskiedenis" (Score History) tab
- **View past scores** you've submitted
- **Edit scores** if needed

#### 4. Checking Leaderboard
- **Navigate to**: "Ranglys" (Leaderboard) tab
- **View team rankings** based on scores
- **See team performance** across rounds

## 🎯 Key Features

### Admin Dashboard
- **Team Management**: Create and manage student teams
- **Judge Management**: Add and manage competition judges
- **Round Management**: Organize competition rounds
- **Criteria Management**: Define scoring criteria
- **Assignment System**: Assign judges to teams
- **Statistics**: View real-time statistics

### Judge Dashboard
- **Team Overview**: View assigned teams and projects
- **Scoring Interface**: Score teams based on criteria
- **History Tracking**: View scoring history
- **Leaderboard**: See team rankings and performance

## 🔧 Troubleshooting

### If the application won't start:
```bash
# Check if ports are in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Stop and restart
docker-compose down
docker-compose up -d
```

### If you can't login:
```bash
# Recreate admin user
cd backend
node init-docker-admin.js
```

### If you need to reset everything:
```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d
cd backend && node init-docker-admin.js
```

## 📊 Application Workflow

1. **Admin creates teams** with project details
2. **Admin adds judges** with credentials
3. **Admin defines criteria** for scoring
4. **Admin creates rounds** and selects criteria
5. **Admin assigns judges** to teams
6. **Judges score teams** based on criteria
7. **System calculates rankings** and displays leaderboard

## 🎨 Interface Language

The application interface is in **Afrikaans** with the following key terms:
- **Spanne** = Teams
- **Beoordelaars** = Judges
- **Rondes** = Rounds
- **Kriteria** = Criteria
- **Toewysings** = Assignments
- **Ranglys** = Leaderboard
- **Punte** = Scores

## 📞 Need Help?

- **Technical Issues**: Check the troubleshooting section above
- **Usage Questions**: Refer to the step-by-step instructions
- **Advanced Configuration**: See DOCUMENTATION.md for technical details

---

**Ready to start managing your student project competition! 🚀**