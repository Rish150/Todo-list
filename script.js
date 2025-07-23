const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbzWFIKT7TA3Fn_Ud-v7aqdZScd45b4F8AfBFYtHioT0NA_IpH9TxKMlVTV_6rV5XidDRg/exec";
let currentPage = 1;
const todosPerPage = 5;
let allTodos = [];

const input = document.getElementById('inputTask');
const toDoList = document.getElementById('list');

window.onload = () => {
  // Initialize empty
  allTodos = [];
  renderTodos(getPaginatedTodos(currentPage));
};

function renderTodos(todos) {
  toDoList.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `<div><strong>${todo.task}</strong><br><small>From: ${todo.fromDate} | To: ${todo.toDate || 'N/A'}</small></div>`;
    toDoList.appendChild(li);
  });
}

function getPaginatedTodos(page) {
  currentPage = page;
  const start = (page - 1) * todosPerPage;
  return allTodos.slice(start, start + todosPerPage);
}

function setupPagination(totalCount) {
  const totalPages = Math.ceil(totalCount / todosPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline-primary';
    btn.innerText = i;
    btn.onclick = () => renderTodos(getPaginatedTodos(i));
    pagination.appendChild(btn);
  }
}

async function addTodo() {
  const todoText = input.value.trim();
  const fromDate = document.getElementById('inputCreatedDate').value;
  const toDate = document.getElementById('inputDueDate').value;
  if (!todoText) return;

  try {
    showLoader();
    const res = await fetch(WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify({
        task: todoText,
        fromDate: fromDate || new Date().toISOString().slice(0, 10),
        toDate: toDate || ''
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) throw new Error('Failed to send to Google Sheets');

    // Add to local list
    allTodos.unshift({
      task: todoText,
      fromDate: fromDate || new Date().toISOString().slice(0, 10),
      toDate: toDate || ''
    });

    renderTodos(getPaginatedTodos(currentPage));
    setupPagination(allTodos.length);

    input.value = '';
    document.getElementById('inputCreatedDate').value = '';
    document.getElementById('inputDueDate').value = '';
  } catch (err) {
    alert(err.message);
  } finally {
    hideLoader();
  }
}

function DeleteAll() {
  allTodos = [];
  toDoList.innerHTML = '';
  document.getElementById('pagination').innerHTML = '';
  document.getElementById('fromDate').value = '';
  document.getElementById('toDate').value = '';
  document.getElementById('searchInput').value = '';
}

function searchTodos() {
  const term = document.getElementById('searchInput').value.toLowerCase();
  const filtered = allTodos.filter(t => t.task.toLowerCase().includes(term));
  renderTodos(filtered);
}

function filterByDate() {
  const fromInput = document.getElementById('fromDate').value;
  const toInput = document.getElementById('toDate').value;
  const from = fromInput ? new Date(fromInput) : null;
  const to = toInput ? new Date(new Date(toInput).setHours(23, 59, 59, 999)) : null;

  const filtered = allTodos.filter(t => {
    const created = new Date(t.fromDate);
    return (!from || created >= from) && (!to || created <= to);
  });
  renderTodos(filtered);
}

function resetDateFilters() {
  document.getElementById('fromDate').value = '';
  document.getElementById('toDate').value = '';
  renderTodos(getPaginatedTodos(currentPage));
}

function showLoader() {
  document.getElementById('loader').style.display = 'block';
}

function hideLoader() {
  document.getElementById('loader').style.display = 'none';
}
