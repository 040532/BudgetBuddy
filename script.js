function setCurrentBalance(balance) {
    localStorage.setItem('currentBalance', balance.toString());
}

//Get current balance of user
function getCurrentBalance() {
    let currentBalance = localStorage.getItem('currentBalance');
    if (currentBalance) {
      return parseFloat(currentBalance);
    } else {
      const initialBalance = parseFloat(prompt('Enter your initial balance:'));
      localStorage.setItem('currentBalance', initialBalance.toString());
      return initialBalance;
    }
  }

// Calculate and update the balance based on the transaction amounts
function updateBalance() {
    const transactionAmounts = document.querySelectorAll('.transaction-amount');
    let balance = getCurrentBalance();;
  
    transactionAmounts.forEach(amount => {
      const value = parseFloat(amount.textContent.replace(/\$/g, ''));
      if (!isNaN(value)) {
        balance += value;
      }
    });
  
    const balanceElement = document.getElementById('balance');
    balanceElement.textContent = formatAmount(balance);
    setCurrentBalance(balance);
  }
  
  // Format the amount to display with currency symbol and commas
  function formatAmount(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
  
  // Handle form submission and add a new transaction
  function addTransaction(event) {
    event.preventDefault();
  
    const dateInput = document.getElementById('transaction-date');
    const descriptionInput = document.getElementById('transaction-description');
    const amountInput = document.getElementById('transaction-amount');
    const transactionList = document.getElementById('transaction-list');
  
    const date = dateInput.value;
    const description = descriptionInput.value;
    const amount = parseFloat(amountInput.value);
  
    // Create transaction object
    const transaction = {
      id: new Date().getTime(),
      date: date,
      description: description,
      amount: amount
    };
  
    // Retrieve existing transactions from local storage
    let transactions = localStorage.getItem('transactions');
    if (transactions) {
      transactions = JSON.parse(transactions);
    } else {
      transactions = [];
    }
  
    // Add the new transaction to the array
    transactions.push(transaction);
  
    // Store the updated transactions in local storage
    localStorage.setItem('transactions', JSON.stringify(transactions));
  
    // Create transaction list item
    const listItem = createTransactionListItem(transaction);
  
    // Append the new transaction to the list
    transactionList.appendChild(listItem);
  
    // Clear the form inputs
    dateInput.value = '';
    descriptionInput.value = '';
    amountInput.value = '';
  
    // Update the balance
    updateBalance();
  
    // Update the chart
    updateChart();
  }
  
  // Create a transaction list item
  function createTransactionListItem(transaction) {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-id', transaction.id);
    listItem.innerHTML = `
      <span class="transaction-date">${transaction.date}</span>
      <span class="transaction-description">${transaction.description}</span>
      <span class="transaction-amount">${formatAmount(transaction.amount)}</span>
      <button class="btn-update" onclick="updateTransaction(${transaction.id})">Update</button>
      <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">Delete</button>
    `;
  
    return listItem;
  }
  
  // Update a transaction
  function updateTransaction(id) {
    const transactionList = document.getElementById('transaction-list');
  
    // Retrieve existing transactions from local storage
    let transactions = localStorage.getItem('transactions');
    if (transactions) {
      transactions = JSON.parse(transactions);
  
      // Find the transaction with the matching id
      const transaction = transactions.find(t => t.id === id);
      if (transaction) {
        // Prompt the user for updated transaction details
        const updatedDescription = prompt('Enter the updated description:', transaction.description);
        const updatedAmount = parseFloat(prompt('Enter the updated amount:', transaction.amount));
  
        // Update the transaction details
        transaction.description = updatedDescription;
        transaction.amount = updatedAmount;
  
        // Store the updated transactions in local storage
        localStorage.setItem('transactions', JSON.stringify(transactions));
  
        // Update the transaction list item
        const listItem = createTransactionListItem(transaction);
  
        // Replace the existing transaction list item with the updated one
        const existingListItem = document.querySelector(`[data-id="${id}"]`);
        existingListItem.replaceWith(listItem);
  
        // Update the balance
        updateBalance();
  
        // Update the chart
        updateChart();
      }
    }
  }
  
  // Delete a transaction
  function deleteTransaction(id) {
    const transactionList = document.getElementById('transaction-list');
  
    // Retrieve existing transactions from local storage
    let transactions = localStorage.getItem('transactions');
    if (transactions) {
      transactions = JSON.parse(transactions);
  
      // Find the index of the transaction with the matching id
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        // Remove the transaction from the array
        transactions.splice(index, 1);
  
        // Store the updated transactions in local storage
        localStorage.setItem('transactions', JSON.stringify(transactions));
  
        // Remove the transaction list item from the DOM
        const listItem = document.querySelector(`[data-id="${id}"]`);
        listItem.remove();
  
        // Update the balance
        updateBalance();
  
        // Update the chart
        updateChart();
      }
    }
  }
  
  // Create a doughnut chart to visualize the transaction history
  function createChart() {
    const transactionAmounts = document.querySelectorAll('.transaction-amount');
    const transactionDates = document.querySelectorAll('.transaction-date');
    const amounts = [];
    const dates = [];
  
    transactionAmounts.forEach(amount => {
      const value = parseFloat(amount.textContent.replace(/\$/g, ''));
      if (!isNaN(value)) {
        amounts.push(value);
      }
    });
  
    transactionDates.forEach(date => {
      dates.push(date.textContent);
    });
  
    const ctx = document.getElementById('transaction-chart').getContext('2d');
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: dates,
        datasets: [{
          label: 'Transaction Amount',
          data: amounts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        cutout: '70%', // Adjust the size of the central hole
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Update the chart after adding, updating or deleting a transaction
  function updateChart() {
    const transactionChart = document.getElementById('transaction-chart');
    if (transactionChart) {
      transactionChart.parentNode.removeChild(transactionChart);
    }
  
    const newChartCanvas = document.createElement('canvas');
    newChartCanvas.id = 'transaction-chart';
    document.querySelector('.chart').appendChild(newChartCanvas);
  
    createChart();
  }
  
  // Retrieve transactions from local storage and display them on page load
  function displayTransactions() {
    const transactionList = document.getElementById('transaction-list');
  
    // Retrieve existing transactions from local storage
    let transactions = localStorage.getItem('transactions');
    if (transactions) {
      transactions = JSON.parse(transactions);
  
      // Clear the transaction list
      transactionList.innerHTML = '';
  
      // Display transactions on the page
      transactions.forEach(transaction => {
        const listItem = createTransactionListItem(transaction);
        transactionList.appendChild(listItem);
      });
    }
  }
  
  // Add event listener to the form submit event
  const transactionForm = document.getElementById('transaction-form');
  transactionForm.addEventListener('submit', addTransaction);
  
  // Call the createChart function to generate the chart
  createChart();
  
  // Display transactions on page load
  displayTransactions();  