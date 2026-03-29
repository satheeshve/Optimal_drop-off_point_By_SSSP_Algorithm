import {
  Stop,
  Route,
  RouteOption,
  RouteSegment,
  DropPoint,
  STOPS,
  TRANSPORT_ROUTES,
  COLLEGE_BUS_ROUTE,
  HOME,
  WEIGHTS,
  CommuterProfile,
  calculateCrimeScore,
  getPolicePatrolsOnRoute,
  getEffectiveFare
} from '@/data/transportData';

interface RoutePlanInput {
  movingStartId?: string;
  movingEndId?: string;
  destinationId?: string;
  commuterProfile?: CommuterProfile;
}

/**
 * ═══════════════════════════════════════════════════════════════
 * ENHANCED ROUTEIQ ALGORITHM - COMPLETE IMPLEMENTATION
 * ═══════════════════════════════════════════════════════════════
 * 
 * Novel Contributions:
 * 1. Multi-criteria optimization (time, fare, transfers)
 * 2. Transfer-aware pathfinding with penalties
 * 3. Dynamic along-route evaluation
 * 4. Priority queue for optimal performance
 */

// ═══════════════════════════════════════════════════════════════
// PRIORITY QUEUE IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════

class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop()!.item;

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return min.item;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    while (true) {
      let minIndex = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild < this.heap.length && 
          this.heap[leftChild].priority < this.heap[minIndex].priority) {
        minIndex = leftChild;
      }
      if (rightChild < this.heap.length && 
          this.heap[rightChild].priority < this.heap[minIndex].priority) {
        minIndex = rightChild;
      }

      if (minIndex === index) break;
      [this.heap[index], this.heap[minIndex]] = [this.heap[minIndex], this.heap[index]];
      index = minIndex;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// GRAPH CONSTRUCTION
// ═══════════════════════════════════════════════════════════════

interface GraphNode {
  stop: Stop;
  edges: GraphEdge[];
}

interface GraphEdge {
  to: Stop;
  route: Route;
  time: number;
  fare: number;
}

interface PathState {
  stop: Stop;
  totalTime: number;
  totalFare: number;
  transfers: number;
  segments: RouteSegment[];
  lastRoute: Route | null;
  score: number;
}

function buildTransportGraph(): Map<string, GraphNode> {
  const graph = new Map<string, GraphNode>();

  // Initialize nodes
  Object.values(STOPS).forEach(stop => {
    graph.set(stop.id, { stop, edges: [] });
  });

  // Add edges from routes
  TRANSPORT_ROUTES.forEach(route => {
    for (let i = 0; i < route.stops.length - 1; i++) {
      const from = route.stops[i];
      const to = route.stops[i + 1];
      
      const segmentTime = Math.round(route.avgTime / (route.stops.length - 1));
      
      const node = graph.get(from.id);
      if (node) {
        node.edges.push({
          to,
          route,
          time: segmentTime,
          fare: route.fare
        });
      }
    }
  });

  return graph;
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED SCORING FUNCTION
// ═══════════════════════════════════════════════════════════════

function calculateScore(option: RouteOption): number {
  const maxTime = 180;
  const maxFare = 100;
  const maxTransfers = 3;

  const normalizedTime = Math.min(option.totalTime / maxTime, 1.0);
  const normalizedFare = Math.min(option.totalFare / maxFare, 1.0);
  const normalizedTransfers = Math.min(option.transfers / maxTransfers, 1.0);

  return (
    WEIGHTS.time * normalizedTime +
    WEIGHTS.fare * normalizedFare +
    WEIGHTS.transfers * normalizedTransfers
  );
}

// ═══════════════════════════════════════════════════════════════
// ENHANCED SSSP ALGORITHM (Modified Dijkstra's)
// ═══════════════════════════════════════════════════════════════

function enhancedSSSP(
  graph: Map<string, GraphNode>,
  start: Stop,
  end: Stop,
  commuterProfile: CommuterProfile = { gender: 'male' },
  maxTransfers: number = 3
): RouteOption[] {
  const pq = new PriorityQueue<PathState>();
  const visited = new Set<string>();
  const allPaths: RouteOption[] = [];

  pq.enqueue({
    stop: start,
    totalTime: 0,
    totalFare: 0,
    transfers: 0,
    segments: [],
    lastRoute: null,
    score: 0
  }, 0);

  let iterations = 0;
  const MAX_ITERATIONS = 10000;

  while (!pq.isEmpty() && iterations < MAX_ITERATIONS) {
    iterations++;
    
    const current = pq.dequeue()!;
    const stateKey = `${current.stop.id}-${current.lastRoute?.id || 'start'}-${current.transfers}`;
    
    if (visited.has(stateKey)) continue;
    visited.add(stateKey);

    if (current.stop.id === end.id) {
      const routeStops = current.segments.flatMap(seg => [seg.from, seg.to]);
      allPaths.push({
        totalTime: current.totalTime,
        totalFare: current.totalFare,
        transfers: current.transfers,
        segments: current.segments,
        score: current.score,
        crimeScore: calculateCrimeScore(routeStops),
        policePresence: routeStops.some(stop => stop.policePatrol?.isActive),
        policePatrols: getPolicePatrolsOnRoute(routeStops)
      });
      
      if (allPaths.length >= 5) break;
      continue;
    }

    const node = graph.get(current.stop.id);
    if (!node) continue;

    for (const edge of node.edges) {
      const isTransfer = current.lastRoute !== null && 
                        current.lastRoute.id !== edge.route.id;
      const isFirstBoarding = current.lastRoute === null;
      const isNewBoarding = isFirstBoarding || isTransfer;
      const newTransfers = current.transfers + (isTransfer ? 1 : 0);
      
      if (newTransfers > maxTransfers) continue;

      const waitTime = isTransfer ? 10 : 5;
      const newTime = current.totalTime + edge.time + waitTime;
      const boardedFare = getEffectiveFare(edge.route, commuterProfile);
      const newFare = current.totalFare + (isNewBoarding ? boardedFare : 0);

      const segment: RouteSegment = {
        from: current.stop,
        to: edge.to,
        mode: edge.route.type,
        routeName: edge.route.name,
        time: edge.time,
        fare: isNewBoarding ? boardedFare : 0,
        waitTime
      };

      const newScore = calculateScore({
        totalTime: newTime,
        totalFare: newFare,
        transfers: newTransfers,
        segments: [...current.segments, segment],
        score: 0
      });

      pq.enqueue({
        stop: edge.to,
        totalTime: newTime,
        totalFare: newFare,
        transfers: newTransfers,
        segments: [...current.segments, segment],
        lastRoute: edge.route,
        score: newScore
      }, newScore);
    }
  }

  return allPaths.sort((a, b) => a.score - b.score).slice(0, 5);
}


// ═══════════════════════════════════════════════════════════════
// FIND ROUTES FROM STOP (Using Enhanced SSSP)
// ═══════════════════════════════════════════════════════════════

function findRoutesFromStop(
  fromStop: Stop,
  destination: Stop,
  commuterProfile: CommuterProfile = { gender: 'male' }
): RouteOption[] {
  const graph = buildTransportGraph();
  const routes = enhancedSSSP(graph, fromStop, destination, commuterProfile);
  
  // If no routes found using graph, try direct connection heuristics
  if (routes.length === 0) {
    return findRoutesHeuristic(fromStop, destination, commuterProfile);
  }
  
  return routes;
}

// Fallback heuristic for direct routes
function findRoutesHeuristic(
  fromStop: Stop,
  destination: Stop,
  commuterProfile: CommuterProfile = { gender: 'male' }
): RouteOption[] {
  const routes: RouteOption[] = [];

  // Direct routes
  TRANSPORT_ROUTES.forEach(route => {
    const fromIndex = route.stops.findIndex(s => s.id === fromStop.id);
    const toIndex = route.stops.findIndex(s => s.id === destination.id);

    if (fromIndex !== -1 && toIndex !== -1 && toIndex > fromIndex) {
      const segment: RouteSegment = {
        from: fromStop,
        to: destination,
        mode: route.type,
        routeName: route.name,
        time: route.avgTime,
        fare: getEffectiveFare(route, commuterProfile),
        waitTime: 5
      };

      const routeStops = [fromStop, destination];
      const option: RouteOption = {
        totalTime: segment.time + (segment.waitTime || 0),
        totalFare: segment.fare,
        transfers: 0,
        segments: [segment],
        score: 0,
        crimeScore: calculateCrimeScore(routeStops),
        policePresence: routeStops.some(stop => stop.policePatrol?.isActive),
        policePatrols: getPolicePatrolsOnRoute(routeStops)
      };

      option.score = calculateScore(option);
      routes.push(option);
    }
  });

  // Multi-hop routes (one transfer)
  TRANSPORT_ROUTES.forEach(route1 => {
    const fromIndex1 = route1.stops.findIndex(s => s.id === fromStop.id);
    if (fromIndex1 === -1) return;

    route1.stops.forEach((transferStop, idx1) => {
      if (idx1 <= fromIndex1) return;

      TRANSPORT_ROUTES.forEach(route2 => {
        if (route1.id === route2.id) return;

        const fromIndex2 = route2.stops.findIndex(s => s.id === transferStop.id);
        const toIndex2 = route2.stops.findIndex(s => s.id === destination.id);

        if (fromIndex2 !== -1 && toIndex2 !== -1 && toIndex2 > fromIndex2) {
          const segment1: RouteSegment = {
            from: fromStop,
            to: transferStop,
            mode: route1.type,
            routeName: route1.name,
            time: Math.round(route1.avgTime * 0.4),
            fare: Math.round(getEffectiveFare(route1, commuterProfile) * 0.6),
            waitTime: 5
          };

          const segment2: RouteSegment = {
            from: transferStop,
            to: destination,
            mode: route2.type,
            routeName: route2.name,
            time: route2.avgTime,
            fare: getEffectiveFare(route2, commuterProfile),
            waitTime: 10
          };

          const routeStops = [fromStop, transferStop, destination];
          const option: RouteOption = {
            totalTime: segment1.time + segment2.time + (segment1.waitTime || 0) + (segment2.waitTime || 0),
            totalFare: segment1.fare + segment2.fare,
            transfers: 1,
            segments: [segment1, segment2],
            score: 0,
            crimeScore: calculateCrimeScore(routeStops),
            policePresence: routeStops.some(stop => stop.policePatrol?.isActive),
            policePatrols: getPolicePatrolsOnRoute(routeStops)
          };

          option.score = calculateScore(option);
          routes.push(option);
        }
      });
    });
  });

  return routes.sort((a, b) => a.score - b.score);
}

// ═══════════════════════════════════════════════════════════════
// CALCULATE BUS TIME TO STOP
// ═══════════════════════════════════════════════════════════════

function calculateBusTimeToStop(stopsOnMovingRoute: Stop[], stop: Stop, totalRouteTime: number): number {
  const stopIndex = stopsOnMovingRoute.findIndex(s => s.id === stop.id);
  if (stopIndex <= 0) return 0;
  const hopCount = Math.max(stopsOnMovingRoute.length - 1, 1);
  return Math.round((totalRouteTime / hopCount) * stopIndex);
}

function getMovingRouteStops(start: Stop, end: Stop): { stops: Stop[]; avgTime: number } {
  const directRoute = TRANSPORT_ROUTES.find(route => {
    const startIndex = route.stops.findIndex(s => s.id === start.id);
    const endIndex = route.stops.findIndex(s => s.id === end.id);
    return startIndex !== -1 && endIndex !== -1 && endIndex > startIndex;
  });

  if (directRoute) {
    const startIndex = directRoute.stops.findIndex(s => s.id === start.id);
    const endIndex = directRoute.stops.findIndex(s => s.id === end.id);
    return {
      stops: directRoute.stops.slice(startIndex, endIndex + 1),
      avgTime: directRoute.avgTime,
    };
  }

  const collegeStart = COLLEGE_BUS_ROUTE.stops.findIndex(s => s.id === start.id);
  const collegeEnd = COLLEGE_BUS_ROUTE.stops.findIndex(s => s.id === end.id);
  if (collegeStart !== -1 && collegeEnd !== -1 && collegeEnd > collegeStart) {
    return {
      stops: COLLEGE_BUS_ROUTE.stops.slice(collegeStart, collegeEnd + 1),
      avgTime: COLLEGE_BUS_ROUTE.avgTime,
    };
  }

  return {
    stops: [start, end],
    avgTime: 30,
  };
}

// ═══════════════════════════════════════════════════════════════
// MAIN OPTIMIZATION FUNCTION
// ═══════════════════════════════════════════════════════════════

export function calculateOptimalRoute(input?: RoutePlanInput): DropPoint[] {
  const commuterProfile: CommuterProfile = input?.commuterProfile ?? { gender: 'male' };
  const startStop = input?.movingStartId && STOPS[input.movingStartId] ? STOPS[input.movingStartId] : COLLEGE_BUS_ROUTE.stops[0];
  const movingEndStop = input?.movingEndId && STOPS[input.movingEndId] ? STOPS[input.movingEndId] : COLLEGE_BUS_ROUTE.stops[3];
  const destinationStop = input?.destinationId && STOPS[input.destinationId] ? STOPS[input.destinationId] : HOME;

  const movingRouteMeta = getMovingRouteStops(startStop, movingEndStop);
  const movingRouteStops = movingRouteMeta.stops;

  console.log('🚀 Starting Enhanced RouteIQ Algorithm...');
  console.log('📊 Building transport network graph...');
  
  const dropPoints: DropPoint[] = [];
  const graph = buildTransportGraph();
  
  console.log(`✅ Graph built: ${graph.size} stops, ${Array.from(graph.values()).reduce((sum, node) => sum + node.edges.length, 0)} connections`);

  const candidateDropStops = movingRouteStops.slice(1, -1).length > 0
    ? movingRouteStops.slice(1, -1)
    : [movingEndStop];

  // Analyze each potential drop point
  candidateDropStops.forEach((stop, index) => {
    console.log(`\n🔍 Analyzing drop point ${index + 1}: ${stop.name}`);
    
    const busTimeToStop = calculateBusTimeToStop(movingRouteStops, stop, movingRouteMeta.avgTime);
    console.log(`   ⏱️  Bus time to reach: ${busTimeToStop} min`);
    
    const routesToHome = findRoutesFromStop(stop, destinationStop, commuterProfile);
    console.log(`   📍 Found ${routesToHome.length} route options`);

    if (routesToHome.length > 0) {
      const optimalRoute = routesToHome[0];
      
      // Add R.M.K CET shuttle time to total time
      optimalRoute.totalTime += busTimeToStop;
      
      // Recalculate score with updated time
      optimalRoute.score = calculateScore(optimalRoute);
      
      console.log(`   ⭐ Best option: ${optimalRoute.totalTime}min, ₹${optimalRoute.totalFare}, Score: ${optimalRoute.score.toFixed(3)}`);

      dropPoints.push({
        stop,
        distanceFromStart: index + 1,
        routesToHome,
        optimalRoute
      });
    }
  });

  // Add option to stay on moving vehicle till selected end stop
  console.log(`\n🔍 Analyzing: Stay on moving vehicle till ${movingEndStop.name}`);
  const collegeToHomeRoutes = findRoutesFromStop(movingEndStop, destinationStop, commuterProfile);
  
  if (collegeToHomeRoutes.length > 0) {
    const stayOnBusOption = collegeToHomeRoutes[0];
    stayOnBusOption.totalTime += movingRouteMeta.avgTime;
    stayOnBusOption.score = calculateScore(stayOnBusOption);
    
    console.log(`   ⏱️  Total time: ${stayOnBusOption.totalTime}min, Score: ${stayOnBusOption.score.toFixed(3)}`);

    dropPoints.push({
      stop: movingEndStop,
      distanceFromStart: movingRouteStops.length,
      routesToHome: [stayOnBusOption],
      optimalRoute: stayOnBusOption
    });
  }

  console.log(`\n✅ Analysis complete! Found ${dropPoints.length} drop point options`);
  
  // Sort by score
  const sorted = dropPoints.sort((a, b) => {
    if (!a.optimalRoute || !b.optimalRoute) return 0;
    return a.optimalRoute.score - b.optimalRoute.score;
  });
  
  if (sorted.length > 0 && sorted[0].optimalRoute) {
    console.log(`\n🏆 OPTIMAL DROP POINT: ${sorted[0].stop.name}`);
    console.log(`   📊 Score: ${sorted[0].optimalRoute.score.toFixed(3)}`);
    console.log(`   ⏱️  Time: ${sorted[0].optimalRoute.totalTime} min`);
    console.log(`   💰 Fare: ₹${sorted[0].optimalRoute.totalFare}`);
    console.log(`   🔄 Transfers: ${sorted[0].optimalRoute.transfers}`);
  }

  return sorted;
}

export function getBestDropPoint(dropPoints: DropPoint[]): DropPoint | null {
  if (dropPoints.length === 0) return null;

  return dropPoints.reduce((best, current) => {
    if (!current.optimalRoute || !best.optimalRoute) return best;
    return current.optimalRoute.score < best.optimalRoute.score ? current : best;
  });
}
