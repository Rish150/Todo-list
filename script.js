const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxOI33fi4jdLDMvn3jA4cKuS3gZXY-FFir-SStdQZUNBx2UxnfD12rNapfR_vUCZQBgRw/exec";

let todos = [];
let currentPage = 1;
const todosPerPage = 5;

const listElement = document.getElementById("list");
const loader = document.getElementById("loader");

function showLoader(show) {
  loader.style.display = show ? "block" : "none";
}

function displayTodos(filtered = todos) {
  const start = (currentPage - 1) * todosPerPage;
  const end = start + todosPerPage;
  const paginatedTodos = filtered.slice(start, end);

  listElement.innerHTML = "";

  paginatedTodos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
      <span>
        ${todo.task} <br>
        <small class="text-muted">From: ${todo.fromDate} To: ${todo.toDate}</small>
      </span>
      <button class="btn btn-sm btn-danger" onclick="deleteTodo(${index + start})">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    listElement.appendChild(li);
  });

  updatePagination(filtered.length);
}

function updatePagination(total) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";
  const pageCount = Math.ceil(total / todosPerPage);
  for (let i = 1; i <= pageCount; i++) {
    const btn = document.createElement("button");
    btn.className = `btn btn-sm ${i === currentPage ? "btn-primary" : "btn-outline-primary"}`;
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      filterTodos();
    };
    pagination.appendChild(btn);
  }
}

function filterTodos() {
  const searchValue = document.getElementById("searchInput").value.toLowerCase();
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  let filtered = todos.filter(todo => todo.task.toLowerCase().includes(searchValue));

  if (fromDate) {
    filtered = filtered.filter(todo => todo.fromDate >= fromDate);
  }
  if (toDate) {
    filtered = filtered.filter(todo => todo.toDate <= toDate);
  }

  displayTodos(filtered);
}

function searchTodos() {
  currentPage = 1;
  filterTodos();
}

function filterByDate() {
  currentPage = 1;
  filterTodos();
}

function resetDateFilters() {
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";
  filterTodos();
}

function addTodo() {
  const taskInput = document.getElementById("inputTask");
  const taskValue = taskInput.value.trim();
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;

  if (!taskValue || !fromDate || !toDate) {
    alert("Please fill all fields including From and To dates.");
    return;
  }

  showLoader(true);

  fetch(WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      task: taskValue,
      fromDate,
      toDate
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.status === "success") {
        todos.unshift({ task: taskValue, fromDate, toDate });
        taskInput.value = "";
        currentPage = 1;
        filterTodos();
      } else {
        alert("Failed to add todo: " + res.message);
      }
      showLoader(false);
    })
    .catch((error) => {
      alert("Failed to send data: " + error.message);
      console.error("Fetch error:", error);
      showLoader(false);
    });
}

function deleteTodo(index) {
  todos.splice(index, 1);
  filterTodos();
}

function DeleteAll() {
  todos = [];
  document.getElementById("searchInput").value = "";
  document.getElementById("fromDate").value = "";
  document.getElementById("toDate").value = "";
  currentPage = 1;
  filterTodos();
}

// Simulate initial dummy data with timestamps removed
todos = [
  { task: "Learn JavaScript", fromDate: "2025-07-20", toDate: "2025-07-21" },
  { task: "Read a book", fromDate: "2025-07-19", toDate: "2025-07-20" },
  { task: "Exercise", fromDate: "2025-07-18", toDate: "2025-07-19" },
  { task: "Meeting with team", fromDate: "2025-07-22", toDate: "2025-07-22" },
  { task: "Grocery Shopping", fromDate: "2025-07-17", toDate: "2025-07-17" },
  { task: "Pay bills", fromDate: "2025-07-15", toDate: "2025-07-15" },
  { task: "Clean room", fromDate: "2025-07-16", toDate: "2025-07-16" }
];

// Sort by fromDate descending to show most recent first
todos.sort((a, b) => new Date(b.fromDate) - new Date(a.fromDate));

filterTodos();
