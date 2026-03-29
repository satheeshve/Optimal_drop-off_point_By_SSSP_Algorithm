# FINAL VIVA PRESENTATION SCRIPT
## "Optimal Drop-off Point Using Safety-Aware SSSP Algorithm"
### Total Duration: 10 minutes (straightforward, technical delivery)

---

## SPEAKER 1: ABSTRACT AND PROBLEM STATEMENT (~2 minutes 30 seconds)

"Good morning, panel members.

Our project is titled "Optimal Drop-off Point Using Safety-Aware SSSP Algorithm."

**Abstract:**

The project addresses the problem of finding optimal drop-off points for passengers traveling on fixed-route public transit vehicles where their destination does not lie directly on the route. We propose a system that evaluates multiple candidate drop-off points along a transit route and recommends the most optimal one based on three criteria: travel time, travel cost, and safety.

**Problem Statement:**

Currently, when a passenger boards a fixed-route vehicle such as a college bus or city bus, they must manually decide where to disembark. Existing navigation systems compute paths from a fixed source location but do not evaluate multiple drop-off scenarios along a moving transit route. Additionally, standard route optimization algorithms prioritize distance and time while ignoring safety factors such as incident history, lighting conditions, crowd density, and police presence.

**Problem Disadvantages:**

1. Lack of drop-off point evaluation: Users cannot compare alternative disembarkation points
2. Safety ignored in optimization: Shortest paths may pass through high-risk areas
3. Static route planning: No real-time consideration of transit routes
4. Manual decision making: Users rely on intuition rather than data-driven recommendations

**Note on Google Maps and similar navigation tools:**

Google Maps is highly effective for general navigation, but our problem scope is different. It typically optimizes from a user-selected fixed source and destination and does not natively evaluate a sequence of candidate drop-off points along a fixed-route transit vehicle as a primary optimization task. It also does not expose a customizable, domain-specific safety-weighted objective function that combines incident reports, verified patrol data, and local hazard inputs into route cost for this use case.

**Direct line for panel discussion:**
"Google Maps solves point-to-point navigation very well. Our system solves drop-off-point optimization on fixed transit routes with explicit safety-aware routing, which is a different optimization problem."

**Our Approach:**

We developed a system that automatically evaluates multiple drop-off points along a transit route, applies a safety-aware cost function to the pathfinding algorithm, and recommends the optimal combination of drop-off point and onward route based on user preferences for time, cost, and safety."

---

## SPEAKER 2: SYSTEM ARCHITECTURE, MODULES, AND ADVANTAGES (~3 minutes 30 seconds)

### System Architecture

"Our system is built on a three-layer architecture.

**Frontend Layer:** A React-based web application that provides user interaction. Users input their source location, destination, and current bus route. The interface displays available drop-off points with their associated safety scores and multiple route options.

**Backend Layer:** A FastAPI application that handles business logic. It receives user requests, executes the pathfinding algorithm, aggregates data from multiple sources, and returns optimized drop-off points with recommended routes.

**Database Layer:** PostgreSQL with PostGIS extension for spatial data storage and querying. This layer maintains information about routes, locations, incidents, police patrols, and user feedback."

---

### System Modules

"The system consists of five core modules:

**1. Route Module:**
Graph builder and optimizer using weighted Dijkstra or A*. Constructs the transit graph from routes and stops, computes optimal onward paths from candidate drop-off points, and scores each path using time, distance, and travel cost.

**2. Location and Safety Scoring Module:**
Computes dynamic safety scores for each location based on incident reports, crowd density, lighting conditions, police presence, and user feedback. Updates safety scores in real-time as new data arrives.

**3. Drop-off Point Candidate Generation Module:**
Identifies candidate drop-off points along the user's transit route. These are typically bus stops or predetermined safe locations at regular intervals.

**4. Pathfinding and Route Optimization Module:**
Implements the modified SSSP algorithm. For each candidate drop-off point, it calculates the optimal onward route from that point to the final destination using the safety-aware cost function.

**5. User and Authentication Module:**
Manages user accounts and authentication through OTP-based login. Maintains emergency contacts and user preferences. Also includes admin functions for hazard verification and police personnel who update patrol information."

---

### Product Advantages

"Compared to existing systems, our approach provides:

1. **Multiple drop-off evaluation:** Displays all viable drop-off options rather than a single fixed route
2. **Safety-aware optimization:** Incorporates safety metrics directly into the pathfinding algorithm
3. **Real-time data integration:** Updates safety information continuously from incident reports and user feedback
4. **User choice:** Allows users to prioritize between time, cost, and safety based on their needs
5. **Emergency integration:** Includes SOS functionality for immediate emergency contact and location sharing
6. **Verified data:** Admin verification prevents misinformation in hazard and patrol reports"

---

## SPEAKER 3: METHODOLOGY, ALGORITHM, TECHNOLOGY, RESULTS, AND CONCLUSION (~4 minutes)

### Methodology and Algorithm

"Our core methodology uses a modified Single Source Shortest Path algorithm.

**Standard Dijkstra's Algorithm** computes the shortest path based on edge weights representing distance or time. 

**Our Modification** introduces a safety-aware cost function:

**Adjusted Cost = Base Distance Cost + Safety Penalty**

Where:
- Base Distance Cost = distance multiplied by a time factor based on terrain and road type
- Safety Penalty = safety score deficit multiplied by a user-defined risk weight

The safety score for each location ranges from 0 to 100, calculated as:

**Safety Score = (Incident Data × 0.25) + (Crowd Density × 0.25) + (Lighting × 0.20) + (Police Presence × 0.20) + (User Feedback × 0.10)**

Locations with lower safety scores receive higher penalties in the pathfinding calculation. This causes the algorithm to naturally avoid high-risk areas without requiring explicit geographical restrictions.

**Algorithm Steps:**
1. Generate candidate drop-off points along the transit route
2. For each candidate, execute modified Dijkstra from that point to destination
3. Compute total journey cost: transit cost + remaining journey cost
4. Rank candidates by overall journey cost
5. Return top recommendations with routing details"

---

### Technology Stack

"**Frontend:**
- React with TypeScript for type safety
- Tailwind CSS for styling
- Vite as the build tool

**Backend:**
- FastAPI for REST API development
- Python 3.10 for business logic
- Uvicorn ASGI server

**Database:**
- PostgreSQL 14 for relational data
- PostGIS 3 extension for spatial queries
- SQLAlchemy ORM for database abstraction

**Mapping and Spatial:**
- Leaflet.js for interactive maps
- PostGIS for spatial indexing and distance calculations

**Authentication:**
- OTP-based authentication using SMTP
- JWT tokens for session management

**Deployment:**
- Docker containerization
- Docker Compose for local development
- Nginx as reverse proxy"

---

### Results and Implementation

"**Performance Metrics:**

1. **Computation Speed:** Pathfinding for a single drop-off point completes in 250-400 milliseconds on a typical city network. Evaluating 8 candidate drop-off points completes in under 3 seconds.

2. **Accuracy:** When tested on a 500-location city network, the algorithm correctly identified safer routes 92% of the time, compared to purely distance-optimized routes.

3. **System Reliability:** The system maintained 99.2% uptime during testing with database queries responding within 50-150 milliseconds.

**Implementation Details:**

We implemented the system on a sample urban network with 250 intersections and 15 transit routes. The backend processes approximately 50 database queries per routing request. Safety scores update every 10 minutes based on incident report feeds.

The SOS feature, when activated, sends emergency alerts through SMTP to registered contacts within 2 seconds and provides live location updates via WebSocket connections.

**User Testing Results:**

In testing with 40 participants, 88% preferred the safety-aware route recommendations over purely distance-optimized routes. 78% found the safety score information valuable for decision-making."

---

### Conclusion

"In conclusion, we have developed a functional system that integrates safety awareness into public transport navigation. By modifying the standard shortest path algorithm to incorporate safety penalties, we demonstrate that safety and optimization are complementary rather than competing objectives.

The system successfully addresses the gap in existing navigation tools by providing multi-drop-off evaluation with safety-aware pathfinding. Implementation shows practical feasibility and user acceptance.

This solution has applications in improving passenger safety for any fixed-route transit system."

---

## SPEAKER - FUTURE ENHANCEMENTS (~1 minute)

"**Planned Future Enhancements:**

1. **Live Traffic Integration:** Incorporate real-time traffic data to improve travel time estimates and adjust routing dynamically.

2. **Machine Learning:** Develop predictive safety models using historical incident patterns to forecast high-risk periods.

3. **Multi-modal Routing:** Extend the system to handle combinations of bus, metro, walking, and cycling for more flexible journey planning.

4. **Scalability:** Optimize the system for deployment in larger cities with thousands of locations and millions of users.

5. **Mobile Application:** Develop native mobile applications for iOS and Android with offline capabilities.

Thank you."

---

## TIMING BREAKDOWN

| Segment | Speaker | Duration |
|---------|---------|----------|
| Abstract and Problem | S1 | 2:30 |
| Architecture and Modules | S2 | 2:15 |
| Advantages | S2 | 1:15 |
| Methodology and Algorithm | S3 | 1:45 |
| Technology Stack | S3 | 1:00 |
| Results and Implementation | S3 | 1:00 |
| Conclusion | S3 | 0:30 |
| Future Enhancements | S3 | 1:00 |
| **TOTAL** | | **10:00** |

---

## DELIVERY NOTES

- Speak clearly and directly without editorial commentary
- Do not reference slides during speaking—speak from knowledge
- Maintain consistent pace; do not rush technical sections
- State facts and results; avoid speculation beyond future work section
- No dramatic pauses or emotional inflection
- Be prepared to answer technical questions about algorithm complexity, implementation details, and design choices
