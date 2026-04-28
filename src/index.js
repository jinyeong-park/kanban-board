export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle root path
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(getIndexHtml(), {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Handle manifest.json
    if (url.pathname === '/manifest.json') {
      return new Response(getManifestJson(), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Handle sw.js
    if (url.pathname === '/sw.js') {
      return new Response(getServiceWorker(), {
        headers: { 'Content-Type': 'application/javascript' },
      });
    }

    // Handle other static files (you might need to add more)
    return new Response('File not found', { status: 404 });
  },
};

function getIndexHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Free Kanban Tracker - Organize Your Tasks</title>
    <meta name="description" content="A free, offline-first Kanban board for task management. Organize your projects with drag-and-drop functionality and PWA support.">
    <link rel="manifest" href="/manifest.json">
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .board {
            display: flex;
            gap: 20px;
            overflow-x: auto;
            padding: 20px 0;
        }
        .column {
            background: white;
            border-radius: 8px;
            padding: 16px;
            min-width: 300px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .column h2 {
            margin-top: 0;
            color: #333;
        }
        .task {
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 12px;
            margin: 8px 0;
            cursor: move;
        }
        .task:hover {
            background: #f0f0f0;
        }
        .add-task {
            background: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 12px;
        }
        .add-task:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <h1>Free Kanban Tracker</h1>
    <div class="board" id="board">
        <div class="column">
            <h2>To Do</h2>
            <div class="task">Sample task 1</div>
            <div class="task">Sample task 2</div>
            <button class="add-task" onclick="addTask(this)">Add Task</button>
        </div>
        <div class="column">
            <h2>In Progress</h2>
            <button class="add-task" onclick="addTask(this)">Add Task</button>
        </div>
        <div class="column">
            <h2>Done</h2>
            <button class="add-task" onclick="addTask(this)">Add Task</button>
        </div>
    </div>

    <script>
        let draggedElement = null;

        function addTask(button) {
            const taskText = prompt('Enter task name:');
            if (taskText) {
                const task = document.createElement('div');
                task.className = 'task';
                task.draggable = true;
                task.textContent = taskText;
                task.addEventListener('dragstart', dragStart);
                button.parentElement.insertBefore(task, button);
            }
        }

        function dragStart(e) {
            draggedElement = e.target;
            e.dataTransfer.effectAllowed = 'move';
        }

        document.addEventListener('dragover', function(e) {
            e.preventDefault();
        });

        document.addEventListener('drop', function(e) {
            e.preventDefault();
            if (draggedElement && e.target.classList.contains('column')) {
                e.target.appendChild(draggedElement);
            }
        });

        // Make existing tasks draggable
        document.querySelectorAll('.task').forEach(task => {
            task.draggable = true;
            task.addEventListener('dragstart', dragStart);
        });

        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
        }
    </script>
</body>
</html>`;
}

function getManifestJson() {
  return `{
    "name": "Free Kanban Tracker",
    "short_name": "Kanban Tracker",
    "description": "A free, offline-first Kanban board for task management",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#007bff",
    "icons": [
      {
        "src": "/icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "/icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      }
    ]
  }`;
}

function getServiceWorker() {
  return `const CACHE_NAME = 'kanban-tracker-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});`;
}