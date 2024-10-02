const API_URL = "https://jsonplaceholder.typicode.com/posts";
const CACHE_NAME = "pwa-vanilla-cache";
const postsContainer = document.getElementById("posts");
const statusDisplay = document.getElementById("status");

// Check if service worker is supported
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("Service Worker registration failed", err));
  });
}

// Fetch and display posts
async function fetchPosts() {
  const response = await fetch(API_URL);
  const data = await response.json();
  cachePosts(data);
  displayPosts(data);
}

// Display posts on the page
function displayPosts(posts) {
  postsContainer.innerHTML = posts.map((post) => createPostHTML(post)).join("");
}

// Generate HTML for a post
function createPostHTML(post) {
  return `
    <li>
      <h3>${post.title}</h3>
      <p>${post.body}</p>
    </li>
  `;
}

// Cache posts
async function cachePosts(posts) {
  const cache = await caches.open(CACHE_NAME);
  await cache.put(API_URL, new Response(JSON.stringify(posts)));
}

// Update online/offline status display
function updateStatus() {
  statusDisplay.textContent = navigator.onLine ? "Online" : "Offline";
}

// Listen for new posts
// Set up event listeners for online and offline events
window.addEventListener("online", updateStatus);
window.addEventListener("offline", updateStatus);

// Initial function calls
fetchPosts();
updateStatus();
