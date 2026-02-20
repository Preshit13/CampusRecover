# CampusRecover - Smart Lost & Found Matching System

Campus-wide lost and found coordination platform that helps students recover lost items through structured reporting and intelligent matching.

## Authors

- Preshit Ravindra Pimple
- Gurudatt Pramod Gaonkar

## Class

[CS5610 Web Development - Spring 2025](https://johnguerra.co/classes/webDevelopment_spring_2025/)

## Project Objective

CampusRecover helps students recover lost items by providing:

- Centralized platform for reporting lost and found items
- Smart matching algorithm to connect lost items with found items
- Analytics dashboard showing recovery patterns and statistics
- Search and filter capabilities across campus locations

## Screenshots

### Lost Items Page

![Lost Items](screenshots/lost-items.png)

### Analytics Dashboard

![Analytics](screenshots/analytics.png)

### Found Items Page

![Found Items](screenshots/found-items.png)

### Matching System

![Matching](screenshots/matching.png)

## Features

### Lost Items Management (Preshit Pimple)

- ✅ Report lost items with detailed descriptions, location, and contact info
- ✅ Search and filter lost items by category and location
- ✅ Edit lost item reports to update details
- ✅ Mark items as recovered when found
- ✅ Delete lost item reports
- ✅ Smart sorting: Active items first (newest to oldest), then recovered items
- ✅ Date validation: Cannot report items lost in the future

### Analytics Dashboard (Preshit Pimple)

- ✅ Overall recovery statistics (total lost, recovered, active, recovery rate)
- ✅ Top 5 most common loss locations with visual bars
- ✅ Most frequently lost item categories
- ✅ Recovery rate breakdown by category with progress visualization
- ✅ Real-time data aggregation using MongoDB pipelines

### Found Items Management (Gurudatt Gaonkar)

- ✅ Report found items with description, location found, current holding location, and contact info
- ✅ Search and filter found items by category and location
- ✅ Edit found item reports to update details or pickup location
- ✅ Mark items as claimed when returned to owner
- ✅ Delete found item reports
- ✅ Smart sorting: Unclaimed items first (newest to oldest), then claimed items
- ✅ Date validation: Cannot report items found in the future

### Smart Matching System (Gurudatt Gaonkar)

- ✅ Automatic match suggestions when viewing a found item
- ✅ Scoring algorithm based on category (40pts), location proximity (30pts), date proximity (20pts), and keyword similarity (10pts)
- ✅ Match confidence display: High (≥70%), Medium (≥40%), Low (<40%)
- ✅ Human-readable match reasons explaining why items are matched
- ✅ Only matches against active (unrecovered) lost item reports
- ✅ Top 5 matches returned per found item

## Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (NodeJS driver - no Mongoose)
- **Frontend:** Vanilla JavaScript (ES6 modules), HTML5, CSS3
- **Tools:** ESLint, Prettier, nodemon

## Design Document

The full design document including project description, user personas, user stories, and wireframes is available here:

📄 [Design Document](docs/design-document.pdf)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB installation)
- Git

## Installation

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/Preshit13/CampusRecover.git
cd CampusRecover
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Environment Setup

Create a \`.env\` file in the root directory:

\`\`\`env
MONGODB_URI=your_mongodb_connection_string
PORT=3000
\`\`\`

**Note:** See \`.env.example\` for template. Never commit your \`.env\` file!

### 4. Seed Database (Optional)

To populate the database with 1000+ sample records:

\`\`\`bash
npm run seed
\`\`\`

### 5. Run the Application

**Development mode (with auto-reload):**
\`\`\`bash
npm run dev
\`\`\`

**Production mode:**
\`\`\`bash
npm start
\`\`\`

**Access the application:**

- Lost Items: http://localhost:3000
- Found Items: http://localhost:3000/found.html
- Analytics: http://localhost:3000/analytics.html

## API Endpoints

### Lost Items (Preshit Pimple)

| Method | Endpoint                   | Description                                                        |
| ------ | -------------------------- | ------------------------------------------------------------------ |
| GET    | /api/lost-items            | Get all lost items (with optional ?category and ?location filters) |
| GET    | /api/lost-items/:id        | Get single lost item by ID                                         |
| POST   | /api/lost-items            | Create new lost item report                                        |
| PUT    | /api/lost-items/:id        | Update lost item                                                   |
| PATCH  | /api/lost-items/:id/status | Mark item as recovered                                             |
| DELETE | /api/lost-items/:id        | Delete lost item                                                   |

### Analytics (Preshit Pimple)

| Method | Endpoint                            | Description                          |
| ------ | ----------------------------------- | ------------------------------------ |
| GET    | /api/analytics/recovery-stats       | Overall recovery statistics          |
| GET    | /api/analytics/common-locations     | Top 5 most common loss locations     |
| GET    | /api/analytics/item-types           | Most frequently lost item categories |
| GET    | /api/analytics/recovery-by-category | Recovery rate breakdown by category  |

### Found Items (Gurudatt Gaonkar)

| Method | Endpoint                          | Description                                                     |
| ------ | --------------------------------- | --------------------------------------------------------------- |
| GET    | /api/found-items                  | Get all found items (optional ?category and ?location filters) |
| GET    | /api/found-items/:id              | Get single found item by ID                                    |
| POST   | /api/found-items                  | Create new found item report                                   |
| PUT    | /api/found-items/:id              | Update found item                                               |
| PATCH  | /api/found-items/:id/status       | Mark item as claimed                                            |
| DELETE | /api/found-items/:id              | Delete found item                                               |
| GET    | /api/found-items/:id/matches      | Get top 5 matching lost item reports for a found item          |

### Matching (Gurudatt Gaonkar)

| Method | Endpoint                     | Description                                    |
| ------ | ---------------------------- | ---------------------------------------------- |
| GET    | /api/found-items/:id/matches | Get top 5 matching lost item reports for a found item |

## Database Schema

### lost_items Collection

\`\`\`javascript
{
\_id: ObjectId,
itemName: String,
category: String, // Electronics, Accessories, Clothing, Books, IDs, Keys, Other
description: String,
location: String, // Last seen location
dateTime: Date, // When item was lost
contactInfo: String, // Email or phone
status: String, // "active" or "recovered"
createdAt: Date, // When report was created
updatedAt: Date // Last modification
}
\`\`\`

### found_items Collection

\`\`\`javascript
{
\_id: ObjectId,
  itemName: String,
  category: String,       // Electronics, Accessories, Clothing, Books, IDs, Keys, Other
  description: String,
  locationFound: String,  // Where the item was found
  currentLocation: String,// Where the item is being held
  dateTime: Date,         // When item was found
  contactInfo: String,    // Finder's email
  status: String,         // "unclaimed" or "claimed"
  createdAt: Date,        // When report was created
  updatedAt: Date         // Last modification
}
\`\`\`

## Project Structure

```
CampusRecover/
├── server/
│   ├── db/
│   │   └── database.js          # MongoDB connection module
│   ├── routes/
│   │   ├── lostItems.js         # Lost items CRUD routes (Preshit)
│   │   ├── foundItems.js        # Found items CRUD routes (Gurudatt)
│   │   └── analytics.js         # Analytics aggregation routes (Preshit)
│   └── utils/
│       └── matchingAlgorithm.js # Smart matching logic (Gurudatt)
├── public/
│   ├── index.html               # Lost items page (Preshit)
│   ├── found.html               # Found items page (Gurudatt)
│   ├── analytics.html           # Analytics dashboard (Preshit)
│   ├── css/
│   │   ├── main.css            # Global styles
│   │   ├── lostItems.css       # Lost items page styles
│   │   ├── foundItems.css      # Found items page styles
│   │   └── analytics.css       # Analytics page styles
│   └── js/modules/
│       ├── lostItems.js        # Lost items frontend logic
│       ├── foundItems.js       # Found items frontend logic
│       ├── analytics.js        # Analytics frontend logic
│       └── matching.js         # Matching display logic
├── scripts/
│   └── seed.js                 # Database seeding script
├── screenshots/
│   ├── lost-items.png          # Lost items page screenshot
│   └── analytics.png           # Analytics page screenshot
├── docs/
│   └── design-document.pdf     # Design documentation
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies
├── server.js                   # Express application entry point
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## Code Quality

- ✅ ESLint configured and passing with no errors
- ✅ Prettier formatting applied to all files
- ✅ ES6 modules (import/export) throughout
- ✅ Client-side rendering with vanilla JavaScript
- ✅ No Mongoose or template engines used
- ✅ Environment variables properly secured

## Development Scripts

\`\`\`bash
npm start # Start production server
npm run dev # Start development server with auto-reload
npm run seed # Seed database with 1000+ sample records
npm run lint # Run ESLint code quality checks
npm run format # Format all code with Prettier
\`\`\`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Course: CS5610 Web Development, Northeastern University
- Instructor: John Alexis Guerra Gomez
- MongoDB Atlas for database hosting
- (Deployment platform to be added after deployment)
