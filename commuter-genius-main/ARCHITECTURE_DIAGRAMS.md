# RouteIQ - Architecture & Flow Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION LAYER                             │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                         React Frontend (UI)                            │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │ │
│  │  │   Journey    │  │    Route     │  │  Comparison  │                │ │
│  │  │    Input     │  │ Visualization│  │    Table     │                │ │
│  │  │  Component   │  │  (Map View)  │  │  Component   │                │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │ │
│  └─────────┼──────────────────┼──────────────────┼────────────────────────┘ │
└────────────┼──────────────────┼──────────────────┼──────────────────────────┘
             │                  │                  │
             └──────────┬───────┴──────────────────┘
                        │
┌───────────────────────▼────────────────────────────────────────────────────┐
│                        APPLICATION LOGIC LAYER                             │
│  ┌────────────────────────────────────────────────────────────────────────┐│
│  │                  Route Optimizer Controller                            ││
│  │  ┌──────────────────────────────────────────────────────────────────┐ ││
│  │  │  1. Parse Vehicle Route (Extract candidate drop points)          │ ││
│  │  │  2. For each drop point: Calculate time on vehicle               │ ││
│  │  │  3. Run SSSP from drop point to destination                      │ ││
│  │  │  4. Score all routes using weighted formula                      │ ││
│  │  │  5. Rank drop points by total optimality score                   │ ││
│  │  │  6. Return best recommendation + alternatives                    │ ││
│  │  └──────────────────────────────────────────────────────────────────┘ ││
│  └────────────────────────────────────────────────────────────────────────┘│
└────────────────────────────┬───────────────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────────────┐
│                          ALGORITHM LAYER                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │  Enhanced SSSP   │  │  Graph Builder   │  │  Multi-Criteria Scorer  │ │
│  │   Algorithm      │  │    (Network      │  │   (Weighted Formula)    │ │
│  │                  │  │   Constructor)   │  │                         │ │
│  │ • Dijkstra Core  │  │ • Node Creation  │  │ • Time Normalization    │ │
│  │ • Priority Queue │  │ • Edge Linking   │  │ • Fare Normalization    │ │
│  │ • Multi-Modal    │  │ • Route Mapping  │  │ • Transfer Penalty      │ │
│  │ • Transfer Logic │  │ • Stop Indexing  │  │ • Score Calculation     │ │
│  └──────────────────┘  └──────────────────┘  └─────────────────────────┘ │
└────────────────────────────┬───────────────────────────────────────────────┘
                             │
┌────────────────────────────▼───────────────────────────────────────────────┐
│                            DATA LAYER                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────────────┐ │
│  │  Transport Data  │  │   Stop Database  │  │   Route Definitions     │ │
│  │   (Static JSON)  │  │  (Coordinates)   │  │   (Times & Fares)       │ │
│  │                  │  │                  │  │                         │ │
│  │ • Bus Routes     │  │ • Stop ID        │  │ • Route Name            │ │
│  │ • Metro Lines    │  │ • Latitude       │  │ • Stop Sequence         │ │
│  │ • Train Services │  │ • Longitude      │  │ • Average Time          │ │
│  │ • Fares          │  │ • Stop Type      │  │ • Fare Structure        │ │
│  └──────────────────┘  └──────────────────┘  └─────────────────────────┘ │
│                                                                            │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │              FUTURE: External Data Sources                         │   │
│  │  • GTFS Static Data       • Google Transit API                     │   │
│  │  • GTFS Realtime Feed     • OpenStreetMap                          │   │
│  │  • Live Bus Tracking      • Traffic APIs                           │   │
│  └────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Algorithm Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                            START                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  USER INPUT: Current Vehicle Route + Destination                   │
│  Example:                                                           │
│  • Vehicle: College Bus (Planetarium → Guindy → CMBT → College)   │
│  • Destination: Avadi (Home)                                       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 1: Extract Candidate Drop Points                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  candidates = [Guindy, CMBT, Red Hills]                     │   │
│  │  (Skip first & last stops)                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 2: FOR EACH Candidate Drop Point                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Loop: i = 0 to candidates.length                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┬───────────────────┐
         │                                       │                   │
         ▼                                       ▼                   ▼
    Drop Point 1                           Drop Point 2         Drop Point 3
   ┌──────────┐                           ┌──────────┐         ┌──────────┐
   │  Guindy  │                           │   CMBT   │         │ Red Hills│
   └────┬─────┘                           └────┬─────┘         └────┬─────┘
        │                                      │                    │
        ▼                                      ▼                    ▼
┌────────────────────────┐          ┌────────────────────────┐  ┌──────────────────────┐
│ Bus Time to Guindy:    │          │ Bus Time to CMBT:      │  │ Bus Time to Red Hills│
│ 25 minutes             │          │ 50 minutes             │  │ 75 minutes           │
└────────┬───────────────┘          └────────┬───────────────┘  └──────────┬───────────┘
         │                                    │                             │
         └────────────────────┬───────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 3: Build Transport Network Graph                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  graph = Map<stopId, {stop, edges[]}>                       │   │
│  │                                                              │   │
│  │  Example:                                                    │   │
│  │  guindy → {                                                  │   │
│  │    edges: [                                                  │   │
│  │      {to: central, route: metro, time: 30, fare: 40},      │   │
│  │      {to: cmbt, route: bus, time: 15, fare: 20}            │   │
│  │    ]                                                         │   │
│  │  }                                                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 4: Run Enhanced SSSP (Modified Dijkstra's)                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  function enhancedSSSP(dropPoint, destination):             │   │
│  │    1. Initialize priority queue (min-heap by score)         │   │
│  │    2. Add start state: {stop: dropPoint, time: 0, ...}     │   │
│  │    3. While queue not empty:                                │   │
│  │       a. Dequeue lowest score state                         │   │
│  │       b. If destination reached: save path                  │   │
│  │       c. For each neighbor:                                 │   │
│  │          - Calculate new time/fare/transfers                │   │
│  │          - Compute weighted score                           │   │
│  │          - Enqueue new state                                │   │
│  │    4. Return top 5 paths sorted by score                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 5: Score Calculation (Multi-Criteria)                        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  For each path from drop point to home:                     │   │
│  │                                                              │   │
│  │  normalized_time = (busTime + pathTime) / 180               │   │
│  │  normalized_fare = pathFare / 100                           │   │
│  │  normalized_transfers = pathTransfers / 3                   │   │
│  │                                                              │   │
│  │  SCORE = 0.5 × normalized_time +                            │   │
│  │          0.3 × normalized_fare +                            │   │
│  │          0.2 × normalized_transfers                         │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 6: Results for All Drop Points                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Guindy:                                                     │   │
│  │    Best: Metro → Central → Bus → Avadi                      │   │
│  │    Score: 0.52  (Time: 95min, Fare: ₹70, Transfers: 1)     │   │
│  │                                                              │   │
│  │  CMBT: ⭐ OPTIMAL                                            │   │
│  │    Best: Direct Bus 77 → Avadi                              │   │
│  │    Score: 0.38  (Time: 70min, Fare: ₹25, Transfers: 0)     │   │
│  │                                                              │   │
│  │  Red Hills:                                                  │   │
│  │    Best: Local Bus → Avadi                                  │   │
│  │    Score: 0.45  (Time: 110min, Fare: ₹20, Transfers: 0)    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 7: Select Best Drop Point                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  bestDropPoint = min(allResults, by: score)                 │   │
│  │                                                              │   │
│  │  RESULT: CMBT (Score: 0.38)                                 │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  STEP 8: Generate Recommendation                                   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  📍 Get off at: CMBT                                         │   │
│  │  🚌 Take: Bus 77 (CMBT → Avadi)                             │   │
│  │  ⏱️  Total Time: 70 minutes (50 bus + 20 wait + 45 bus)     │   │
│  │  💰 Total Fare: ₹25                                          │   │
│  │  🔄 Transfers: 0                                             │   │
│  │                                                              │   │
│  │  💡 Savings vs staying on college bus:                      │   │
│  │     • Time: 170 minutes saved                               │   │
│  │     • Fare: ₹10 saved                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     DISPLAY TO USER                                 │
│  • Best Recommendation Card (highlighted)                           │
│  • Interactive Map with Route Visualization                         │
│  • Comparison Table with All Drop Point Options                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Structure Diagram

### Graph Representation

```
Transport Network Graph (Directed Weighted Multi-Graph)

Nodes (Stops):
┌────────────────────────────────────────────────────┐
│ Stop {                                             │
│   id: string           // "guindy"                 │
│   name: string         // "Guindy Metro Station"   │
│   lat: number          // 13.0096                  │
│   lng: number          // 80.2209                  │
│   type: 'bus'|'metro'|'train'                     │
│ }                                                  │
└────────────────────────────────────────────────────┘

Edges (Route Segments):
┌────────────────────────────────────────────────────┐
│ Edge {                                             │
│   from: Stop                                       │
│   to: Stop                                         │
│   route: Route                                     │
│   time: number         // minutes                  │
│   fare: number         // rupees                   │
│   mode: 'bus'|'metro'|'train'                     │
│ }                                                  │
└────────────────────────────────────────────────────┘

Example Graph:

        Metro (30min, ₹40)
Guindy ───────────────────→ Chennai Central
  │                              │
  │ Bus (15min, ₹20)             │ Bus (60min, ₹30)
  ▼                              ▼
CMBT ────────────────────────→ Avadi
        Bus 77 (45min, ₹25)
```

### Priority Queue State

```
PathState {
  stop: Stop              // Current stop
  totalTime: number       // Cumulative time (minutes)
  totalFare: number       // Cumulative fare (rupees)
  transfers: number       // Number of transfers so far
  segments: Segment[]     // Path taken so far
  lastRoute: Route        // To detect transfers
  score: number           // Weighted optimization score
}

Priority Queue (Min-Heap by score):
  [0.38] → {stop: CMBT, time: 95, fare: 25, ...}
  [0.45] → {stop: Red Hills, time: 110, fare: 20, ...}
  [0.52] → {stop: Guindy, time: 95, fare: 70, ...}
```

---

## Sequence Diagram

```
User          Frontend         Optimizer       SSSP          Graph
 │               │                │              │             │
 │  Enter Route  │                │              │             │
 ├──────────────>│                │              │             │
 │               │                │              │             │
 │               │ Calculate      │              │             │
 │               │ Optimal Route  │              │             │
 │               ├───────────────>│              │             │
 │               │                │              │             │
 │               │                │ Extract      │             │
 │               │                │ Drop Points  │             │
 │               │                ├──────────┐   │             │
 │               │                │<─────────┘   │             │
 │               │                │              │             │
 │               │                │ For Each     │             │
 │               │                │ Drop Point:  │             │
 │               │                │              │             │
 │               │                │ Run SSSP     │             │
 │               │                ├─────────────>│             │
 │               │                │              │             │
 │               │                │              │ Build Graph │
 │               │                │              ├────────────>│
 │               │                │              │<────────────┤
 │               │                │              │   Graph     │
 │               │                │              │             │
 │               │                │              │ Dijkstra    │
 │               │                │              ├──────────┐  │
 │               │                │              │<─────────┘  │
 │               │                │              │             │
 │               │                │<─────────────┤             │
 │               │                │  Paths       │             │
 │               │                │              │             │
 │               │                │ Score Paths  │             │
 │               │                ├──────────┐   │             │
 │               │                │<─────────┘   │             │
 │               │                │              │             │
 │               │<───────────────┤              │             │
 │               │  Best Result   │              │             │
 │               │                │              │             │
 │  Show Result  │                │              │             │
 │<──────────────┤                │              │             │
 │               │                │              │             │
```

---

## Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                      Index.tsx (Main Page)                     │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  State Management:                                       │ │
│  │  • dropPoints: DropPoint[]                               │ │
│  │  • bestDropPoint: DropPoint                              │ │
│  │  • highlightedStopId: string                             │ │
│  │  • isCalculating: boolean                                │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  useEffect(() => {                                             │
│    const points = calculateOptimalRoute()  ────┐               │
│    const best = getBestDropPoint(points)       │               │
│    setDropPoints(points)                       │               │
│    setBestDropPoint(best)                      │               │
│  }, [])                                        │               │
└────────────────────────────────────────────────┼───────────────┘
                                                 │
                    ┌────────────────────────────┘
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│           routeOptimizer.ts (Algorithm Module)                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  calculateOptimalRoute()                                   │ │
│  │  • Iterate through COLLEGE_BUS_ROUTE.stops                 │ │
│  │  • For each stop: findRoutesFromStop(stop) ───┐            │ │
│  │  • Calculate bus time to stop                 │            │ │
│  │  • Add to drop points with scores             │            │ │
│  └───────────────────────────────────────────────┼────────────┘ │
│                                                   │              │
│  ┌───────────────────────────────────────────────▼────────────┐ │
│  │  findRoutesFromStop(stop)                                  │ │
│  │  • Find direct routes                                      │ │
│  │  • Find one-transfer routes                                │ │
│  │  • Calculate scores for each                               │ │
│  │  • Return sorted by score                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  calculateScore(option)                                    │ │
│  │  • Normalize time, fare, transfers                         │ │
│  │  • Apply weights (0.5, 0.3, 0.2)                           │ │
│  │  • Return combined score                                   │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────┐
│              transportData.ts (Data Layer)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  STOPS = {                                                 │ │
│  │    planetarium: {...},                                     │ │
│  │    guindy: {...},                                          │ │
│  │    cmbt: {...}, ...                                        │ │
│  │  }                                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  TRANSPORT_ROUTES = [                                      │ │
│  │    { id: 'bus_77', stops: [...], fare: 25, ... },         │ │
│  │    { id: 'metro_blue', stops: [...], fare: 40, ... }      │ │
│  │  ]                                                         │ │
│  └────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

---

## Comparison: Traditional vs RouteIQ

```
TRADITIONAL APPROACH (Google Maps):
══════════════════════════════════════════════════════════════════

Time T=0: You're at Planetarium
    │
    ▼
Google Maps Query: "Planetarium → Avadi"
    │
    ▼
Result: Take Bus X (75 min, ₹35)
    │
    │
Time T=30: You're now at Guindy (on college bus)
    │
    ▼
NEW Google Maps Query: "Guindy → Avadi"
    │
    ▼
Result: Take Metro + Bus (95 min, ₹70)
    │
    │  PROBLEM: Route changed! Should I get down?
    │
Time T=60: You're now at CMBT
    │
    ▼
NEW Google Maps Query: "CMBT → Avadi"
    │
    ▼
Result: Take Bus 77 (45 min, ₹25)
    │
    │  PROBLEM: Too late! Regret not getting down earlier!
    │
Time T=90: Still on college bus...


ROUTEIQ APPROACH (Novel):
══════════════════════════════════════════════════════════════════

Time T=0: You're at Planetarium (on college bus)
    │
    ▼
RouteIQ Input: 
  • Current Route: Planetarium → Guindy → CMBT → College
  • Destination: Avadi
    │
    ▼
RouteIQ Analysis:
┌─────────────────────────────────────────────────────────┐
│ Evaluating ALL drop points simultaneously:             │
│                                                         │
│ Guindy  (T=25): Metro+Bus → 95min, ₹70, Score=0.52    │
│ CMBT    (T=50): Bus 77 → 70min, ₹25, Score=0.38 ⭐     │
│ RedHills(T=75): Local Bus → 110min, ₹20, Score=0.45   │
└─────────────────────────────────────────────────────────┘
    │
    ▼
RouteIQ Recommendation (BEFORE you pass CMBT):
  🎯 Get down at CMBT
  🚌 Take Bus 77 at 2:30 PM
  ⏱️  Total: 70 minutes
  💰 Fare: ₹25
  
  ✅ Decision made with confidence!
  ✅ No regrets later!
  ✅ Optimal from the start!
```

---

## Future Architecture (with ML Integration)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FUTURE ML-ENHANCED SYSTEM                   │
└─────────────────────────────────────────────────────────────────┘

Current Algorithm        ML Models (Phase 2)         Combined System
─────────────────       ───────────────────────     ─────────────────
       │                        │                          │
       │                        │                          │
┌──────▼───────┐       ┌───────▼────────┐         ┌──────▼───────┐
│ Rule-Based   │       │ Wait Time      │         │  Hybrid      │
│ Pathfinding  │       │ Prediction     │────────>│  Optimizer   │
│              │       │ (LSTM/RF)      │         │              │
└──────────────┘       └────────────────┘         └──────────────┘
                                                           │
                       ┌────────────────┐                 │
                       │  Crowd Level   │                 │
                       │  Forecasting   │────────────────>│
                       │  (CNN)         │                 │
                       └────────────────┘                 │
                                                           │
                       ┌────────────────┐                 │
                       │ Personalized   │                 │
                       │ Preferences    │────────────────>│
                       │ (CF/RL)        │                 │
                       └────────────────┘                 │
                                                           ▼
                                                   ┌──────────────┐
                                                   │  Enhanced    │
                                                   │  Recommend.  │
                                                   └──────────────┘

Features:
✅ Real-time delay prediction
✅ Personalized weight learning
✅ Historical pattern analysis
✅ Dynamic rerouting
```

---

## Performance Metrics

### Time Complexity by Component

| Component | Algorithm | Complexity | Notes |
|-----------|-----------|------------|-------|
| Drop Point Enumeration | Linear Scan | O(N) | N = stops on vehicle route |
| Graph Construction | Adjacency List | O(V + E) | One-time operation |
| SSSP per Drop Point | Dijkstra + Heap | O((V+E) log V) | With priority queue |
| Score Calculation | Arithmetic | O(1) | Per route option |
| **Overall System** | **Combined** | **O(N × (V+E) log V)** | **Practical: ~50ms** |

### Space Complexity

| Data Structure | Space | Notes |
|----------------|-------|-------|
| Graph | O(V + E) | Sparse adjacency list |
| Priority Queue | O(V × T) | T = max transfers (3) |
| Path Storage | O(P × S) | P = paths, S = segments |
| **Total** | **O(V × T + P × S)** | **Practical: ~2MB** |

---

This comprehensive architecture documentation provides a clear understanding of how RouteIQ is structured and how data flows through the system!