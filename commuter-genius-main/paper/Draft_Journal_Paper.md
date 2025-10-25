Title: Optimal Drop-Point Recommendation for Point-to-Point Vehicles in Urban Transit Networks

Authors: [Your Name], [Coauthors]

Affiliation: [Your Institution]

Date: 2025-10-22

Abstract
--------
We propose an algorithmic system that recommends the optimal drop point for passengers traveling on point-to-point vehicles (e.g., college/office shuttles) to minimize combined travel time, monetary cost, and transfer count to an arbitrary destination. Unlike general-purpose route planners, our approach treats the moving vehicle as an entry point to the urban multimodal network and evaluates all feasible drop points along the vehicle's route using an enhanced single-source shortest path (SSSP) algorithm with a multi-criteria objective function. We demonstrate the system on a case study using curated transit data and report improvements in time and cost for realistic commuter scenarios.

1. Introduction
---------------
Urban commuters frequently use point-to-point shuttle services (college buses, corporate shuttles) that follow fixed routes. Passengers boarding these vehicles often face a decision: which downstream stop should they choose for disembarking such that their remaining journey to a target destination is minimized in time, cost, or transfers? Existing navigation tools (Google Maps, Citymapper) provide end-to-end routing but do not analyze all intermediate drop points on a moving vehicle comprehensively. This paper addresses this gap by presenting an efficient algorithm and system for optimal drop-point recommendation.

2. Problem Statement
--------------------
Given: (i) a vehicle following a fixed route with ordered stops S = {s1, s2, ..., sn} and (ii) a final destination d selected by the passenger, find the stop si in S where disembarking minimizes a weighted cost C(si, d) combining travel time, fare, and transfers, subject to optional budget constraints.

3. Related Work
----------------
Summarize key works:
- Classic shortest path algorithms (Dijkstra, A*)
- Multi-criteria path planning literature
- Public transport routing systems and GTFS standard
- Applications like Citymapper and prior shuttle-optimization research

4. Methodology
--------------
4.1 Network Modeling
Model the transport network as a directed weighted graph G(V, E). Nodes V represent all stops (bus, metro, train, walking waypoints). Edges E represent feasible travel legs with attributes: travel_time, fare, transport_mode.

4.2 Cost Function
We define a composite cost:
C = w_time * time + w_fare * fare + w_transfers * transfers
Weights w_time, w_fare, w_transfers are tunable per user preference.

4.3 Algorithm
For each candidate drop stop si on the vehicle route, run an SSSP from si to destination d to obtain time and fare; compute C(si, d) and rank the stops. To improve performance, we utilize an adjacency list representation and a priority queue optimized Dijkstra variant. Complexity: O((V + E) log V) per SSSP; overall O(n * (V + E) log V) where n is number of stops on vehicle route. We discuss optimizations, including early pruning when costs exceed a budget and caching of repeated SSSP queries.

5. Implementation
-----------------
We implemented a prototype with the following components:
- Frontend: React + TypeScript + Vite + TailwindCSS
- Core algorithm: TypeScript implementation in `src/utils/routeOptimizer.ts` (Enhanced SSSP)
- Data: Curated static transport dataset (stops, routes, fares) in `src/data/transportData.ts`
- Admin portal: Simple authenticated UI for updating fares stored in client-side JSON (prototype)

6. Case Study and Experiments
-----------------------------
Describe experiments: choose representative origin vehicle routes and destinations (e.g., Birla Planetarium -> Avadi), compare: (a) arbitrary drop (nearest stop), (b) Google Maps-derived strategy, (c) our optimizer. Metrics: total travel time, monetary cost, number of transfers. Present tables and example scenarios.

7. Results
----------
Summarize improvements (example numbers): our approach reduced average travel time by X% and fare by Y% for tested scenarios. Provide tables and plots (to be generated in next steps).

8. Discussion
-------------
- Limitations: static data, lack of real-time vehicle locations, prototype admin using client-side storage.
- Ethical considerations: privacy when using user location; fairness in recommendations if fares change.
- Complexity: scalability concerns for city-wide networks and potential mitigations (caching, hierarchical routing).

9. Future Work
---------------
- Integrate GTFS and live APIs for real-time vehicle positions
- Backend with persistent database (PostgreSQL/PostGIS or MongoDB)
- Add ML modules: ETA prediction (LSTM), demand forecasting (XGBoost)
- Mobile app, offline mode, enhanced UI with interactive maps (Leaflet/Mapbox)

10. Conclusion
--------------
We showed that targeted optimization for point-to-point shuttle passengers can yield measurable time and cost savings by analyzing all possible drop points along a vehicle's route using a multi-criteria enhanced SSSP algorithm. The prototype demonstrates feasibility and sets the stage for larger-scale deployment with live data and backend services.

References
----------
[1] Dijkstra, E. W. (1959). A note on two problems in connexion with graphs.
[2] GTFS Reference. https://developers.google.com/transit/gtfs
[3] Bast, H., Delling, D., Goldberg, A. V., Müller-Hannemann, M., Pajor, T., Sanders, P., Wagner, D., & Werneck, R. F. (2016). Route planning in transportation networks. Communications of the ACM.
[4] Relevant citymapper/google papers and URLs (to be added)

Appendix
--------
- Sample dataset description
- Pseudocode for enhanced SSSP
- User interface screenshots (to be added)
