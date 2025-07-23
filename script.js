const TODOS_API = 'https://dummyjson.com/todos';
let currentPage = 1;
const todosPerPage = 5;
let allTodos = [];

const input = document.getElementById('inputTask');
const toDoList = document.getElementById('list');

window.onload = () => {
  fetchTodos();
};

async function fetchTodos(page = 1) {
  try {
    showLoader();
    const res = await fetch(`${TODOS_API}?limit=100`);
    const data = await res.json();
    allTodos = data.todos.map(todo => ({
      ...todo,
      createdDate: new Date(Date.now() - Math.random() * 10000000000),
      dueDate: new Date(Date.now() + Math.random() * 10000000000)
    }));
    allTodos.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    setupPagination(allTodos.length);
    renderTodos(getPaginatedTodos(page));
  } catch (err) {
    alert('Error fetching todos');
  } finally {
    hideLoader();
  }
}

function renderTodos(todos) {
  toDoList.innerHTML = '';
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.innerHTML = `<div><strong>${todo.todo}</strong><br><small>From: ${new Date(todo.createdDate).toLocaleDateString()} | To: ${todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : 'N/A'}</small></div>`;
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
  const createdDateInput = document.getElementById('inputCreatedDate').value;
  const dueDateInput = document.getElementById('inputDueDate').value;
  if (!todoText) return;
  try {
    showLoader();
    const res = await fetch(`${TODOS_API}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo: todoText, completed: false, userId: 5 })
    });
    if (!res.ok) throw new Error('Add failed');
    const newTodo = await res.json();
    newTodo.createdDate = createdDateInput ? new Date(createdDateInput) : new Date();
    newTodo.dueDate = dueDateInput ? new Date(dueDateInput) : null;
    allTodos.unshift(newTodo);
    allTodos.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    renderTodos(getPaginatedTodos(currentPage));
    input.value = '';
    document.getElementById('inputCreatedDate').value = '';
    document.getElementById('inputDueDate').value = '';
  } catch (err) {
    alert('Failed to add todo');
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
  const filtered = allTodos.filter(t => t.todo.toLowerCase().includes(term));
  renderTodos(filtered);
}

function filterByDate() {
  const fromInput = document.getElementById('fromDate').value;
  const toInput = document.getElementById('toDate').value;
  const from = fromInput ? new Date(fromInput) : null;
  const to = toInput ? new Date(new Date(toInput).setHours(23, 59, 59, 999)) : null;

  const filtered = allTodos.filter(t => {
    const created = new Date(t.createdDate);
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