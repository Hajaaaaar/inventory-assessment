# Full Stack Assessment Solution


### Backend (Node.js)
The backend was refactored to prioritize non-blocking operations and efficiency.

* **Non-Blocking I/O**: Replaced `fs.readFileSync` with `fs.promises.readFile` in data access layers. This prevents the Event Loop from blocking during file operations, allowing the server to handle concurrent requests efficiently.
* **Performance**: Implemented a "Stale-While-Revalidate" style in-memory cache for the `/api/stats` endpoint.
    * The server checks the file's `mtimeMs` (Modified Time) before reading.
    * If the file hasn't changed since the last read, it returns the cached statistics immediately.
    * This reduces expensive file I/O and JSON parsing operations significantly.
* **Testing**: Added comprehensive unit tests using `Jest` and `Supertest`. Tests cover the "happy path" (successful data retrieval) as well as edge cases (file read errors, missing parameters).

### Frontend (React)
The frontend was adapted to handle large datasets and provide a robust user experience.

* **Memory Leak Fix**: Implemented `AbortController` in the `useEffect` hook. This cancels pending `fetch` requests if the component unmounts or if the search query changes rapidly, preventing state updates on unmounted components.
* **Pagination:** Updated `/api/items` to support server-side pagination (`limit`, `page`) and substring search (`q`). The response payload was standardized to `{ data: [], meta: {} }` to support frontend navigation.
* **Performance (Virtualization)**: Integrated `react-window` to efficiently render the product list. This ensures the DOM remains light (containing only visible nodes) even if the dataset grows to 10,000+ items.
* **State Management & URL Sync**: I synchronized the application state (`page`, `search`, `viewMode`) with the URL parameters using `useSearchParams`. This ensures the browser's **Back Button** works as expected.
* **UX Polish:** Added debounced search input (400ms), loading skeletons/states, and error handling boundaries.
* **Testing**: Used `react-testing-library`. Mocked `react-window` (as JSDOM has no layout engine to calculate item positions) and `fetch` to ensure the UI renders correctly without external dependencies.



## Trade-offs & Decisions

### 1. Virtualization Strategy (The "Shelf" Pattern)
For the **Grid View**, I chose to use `FixedSizeList` rendering multiple items per row (a "shelf") rather than `FixedSizeGrid`.
* **Why?** `FixedSizeGrid` is rigid and difficult to make responsive (fluid width). By using a List where each row renders a flexbox of cards, I achieved a responsive grid layout that adapts to screen width while maintaining the performance benefits of virtualization.

### 2. Caching Layer
I implemented a simple in-memory variable for caching stats.
* **Trade-off**: This is efficient for a single-instance deployment but would not work correctly in a clustered/multi-process environment (each process would have its own cache).
* **Production Readiness**: In a real distributed system, I would replace this with an external store like Redis or Memcached to ensure cache consistency across all server instances.

### 3. Search Implementation
Search is currently performed on the server side using simple string matching (`.includes()`).
* **Trade-off**: Search and Filtering are performed in O(n) time using JavaScript array methods. This works well for small JSON datasets but is inefficient for large data. 
* **Future Improvement**: For production, this should be migrated to a database with indexing like (**PostgreSQL** or **MongoDB**) or a dedicated search engine (Elasticsearch).


## How to Run
1.  **Backend:** `cd backend && npm install && npm start` (Runs on port 5000)
2.  **Frontend:** `cd frontend && npm install && npm start` (Runs on port 3000)
3.  **Tests:** Run `npm test` in either directory.