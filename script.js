// script.js — Expense Tracker (LocalStorage)
// Simple, well-commented, and easy to extend.

(() => {
  // DOM references
  const balanceEl = document.getElementById('balance');
  const moneyPlusEl = document.getElementById('money-plus');
  const moneyMinusEl = document.getElementById('money-minus');
  const listEl = document.getElementById('list');
  const form = document.getElementById('form');
  const textInput = document.getElementById('text');
  const amountInput = document.getElementById('amount');
  const clearBtn = document.getElementById('clear-all');

  // LocalStorage key
  const STORAGE_KEY = 'expense_tracker_transactions_v1';

  // Load from localStorage or start with empty array
  let transactions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Utility: save to localStorage
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  // Utility: format currency (Indian Rupee shown, can customize)
  function formatCurrency(n) {
    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);
    // Use Intl for proper formatting
    return sign + new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(abs);
  }

  // Add single transaction to DOM
  function addTransactionToDOM(tx) {
    const item = document.createElement('li');
    item.classList.add('transaction');
    item.classList.add(tx.amount >= 0 ? 'plus' : 'minus');

    item.innerHTML = `
      <div>
        <div class="name">${escapeHtml(tx.text)}</div>
        <small class="ts" style="color:var(--muted)">${new Date(tx.id).toLocaleString()}</small>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="amount">${tx.amount >= 0 ? '+' : '-'}₹${formatCurrency(tx.amount)}</div>
        <button class="remove-btn" title="Remove">✕</button>
      </div>
    `;

    // remove handler
    item.querySelector('.remove-btn').addEventListener('click', () => {
      removeTransaction(tx.id);
    });

    listEl.prepend(item); // newest on top
  }

  // Render all
  function render() {
    // clear list
    listEl.innerHTML = '';

    // add each
    transactions.forEach(addTransactionToDOM);

    // calculations
    const amounts = transactions.map(t => Number(t.amount));
    const total = amounts.reduce((s, v) => s + v, 0);
    const income = amounts.filter(a => a > 0).reduce((s, v) => s + v, 0);
    const expense = amounts.filter(a => a < 0).reduce((s, v) => s + Math.abs(v), 0);

    balanceEl.textContent = `₹${formatCurrency(total)}`;
    moneyPlusEl.textContent = `+₹${formatCurrency(income)}`;
    moneyMinusEl.textContent = `-₹${formatCurrency(expense)}`;

    save();
  }

  // Remove by id
  function removeTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    render();
  }

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = textInput.value.trim();
    const amount = parseFloat(amountInput.value);

    if (!text || isNaN(amount)) {
      alert('Please enter valid description and amount.');
      return;
    }

    const tx = {
      id: Date.now(), // unique id (timestamp)
      text,
      amount
    };

    transactions.push(tx);

    // clear inputs
    textInput.value = '';
    amountInput.value = '';

    render();
  });

  // Clear all
  clearBtn.addEventListener('click', () => {
    if (!confirm('Clear ALL transactions? This cannot be undone.')) return;
    transactions = [];
    render();
  });

  // small helper: escape HTML to avoid injection from description
  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]);
    });
  }

  // initial render
  render();

  // Optional: keyboard shortcuts (N = new focus)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'n' || e.key === 'N') {
      textInput.focus();
    }
  });

})();
