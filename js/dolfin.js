"use strict";


function addAccount() {
  let accName = document.querySelector("#accName").value;
  let accBal = parseInt(document.querySelector("#accBal").value);
  let accPercent = document.querySelector("#accPercent").value;

  let account = {
    "name": accName,
    "balance": accBal,
    "percentFromIncome": accPercent / 100,
    "ID": accounts.length
  };

  accounts.push(account);
  update();
}

function removeAccount(ID) {
  /* "Do you want to remove this account?" warning box */
  accounts.splice(ID, 1);
  update();
}

function addTransaction() {
  let transName = document.querySelector("#transName").value;
  let transCost = parseInt(document.querySelector("#transCost").value);
  let transDate = document.querySelector("#transDate").value;
  let itemSubPeriod = document.querySelector("#itemSubTime").value;
  let renewalTime = parseInt(document.querySelector("#renewalTime").value);
  let accountName = (document.querySelector("#transAccName").value).toLowerCase();
  let transCategory = document.querySelector("#transCategory").value;

  let transaction = {
    "name": transName,
    "cost": transCost,
    "date": transDate,
    "accountName": accountName,
    "itemSubPeriod": itemSubPeriod,
    "renewalTime": renewalTime,
    "category": transCategory,
    "ID": transactions.length
  };

  transactions.push(transaction);
  applyTransaction(transaction);
  update();
}

function removeTransaction(ID) {
  /* "Do you want to remove this transaction?" warning box */
  transactions.splice(ID, 1);
  update();
}

function applyTransaction(transaction) {
  accounts.forEach((account) => {
    if ((account.name).toLowerCase() === transaction.accountName) {
      transaction.accountName = account.name;
      account.balance -= transaction.cost;
      return;
    }
  })
  console.log(`${transaction.accountName} is not a valid account name.`);
}

function applyIncome() {
  let income = parseInt(document.querySelector("#income").value);
  let accountName = (document.querySelector("#incomeAccName").value).toLowerCase();
  let accountFound = false;
  
  accounts.forEach((account) => {
    if (accountName === account.name.toLowerCase() || accountName === "all" || accountName === "") {
      accountFound = true;
      account.balance += income * account.percentFromIncome;
    }
  })
  
  if (!accountFound)
    console.log(`${accountName} is not a valid account name.`);
    
  update();
}


function updateDownloadHREF() {
  const accountsDL = document.querySelector("#accountsDL");
  const jsonAccounts = JSON.stringify(accounts);
  const blob = new Blob([jsonAccounts], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  accountsDL.href = url;
  accountsDL.download = "accounts.json";
}
  
function updateOverview() {
  let overview = `<table><tr><th colspan="3">Accounts</th</tr><tr><th>Account Name</th><th>Account Balance</th><th>Delete</th></tr>`;
  let transactionView = `<table><tr><th colspan="6">Transactions</th></tr><tr><th>Name</th><th>Cost</th><th>Date</th><th>Category</th><th>Account</th><th>Delete</th></tr>`;
  let subscriptionView = `<table><tr><th colspan="5">Subscriptions</th></tr><tr><th>Name</th><th>Cost</th><th>Renews</th><th>Category</th><th>Delete</th></tr>`;
  
  accounts.forEach((account) => {
    overview += `<tr><td>${account.name}</td><td>${account.balance}</td><td><button class="deleteButton" onclick="removeAccount(${account.ID})">X</button></td></tr>`; 
  })
  
  for (let ID = transactions.length - 1; ID > transactions.length - 6 && ID>=0; ID--) {
    const { name, cost, date, accountName, itemSubPeriod, renewalTime, category } = transactions[ID]
    transactionView += `<tr><td>${name}</td><td>${cost}</td><td>${date}</td><td>${category}</td><td>${accountName}</td><td><button class="deleteButton" onclick="removeTransaction(${ID})">X</button></td></tr>`;
  }
  
  overview += `</table>`;
  transactionView += `</table>`;
  subscriptionView += `</table>`;
    
  document.querySelector("#accountView").innerHTML = overview;
  document.querySelector("#transactionView").innerHTML = transactionView;
  document.querySelector("#subscriptionView").innerHTML = subscriptionView;
}

function update() {
  updateDownloadHREF();
  updateOverview();
  
  localStorage.setItem("accountList", JSON.stringify(accounts));
  localStorage.setItem("transactionList", JSON.stringify(transactions));
}



let accounts = JSON.parse(localStorage.getItem("accountList")) || [];
let transactions = JSON.parse(localStorage.getItem("transactionList")) || [];
let fileHandle;
update();
