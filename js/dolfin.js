"use strict";


function addAccount() {

  let balanceStr = document.querySelector("#accBal").value;
  let balanceInt = parseInt(balanceStr.replace('.', ''));
  
  balanceInt *= checkDecimalSeperator(balanceStr) ? 1 : 100;
  
  let account = {
    "name": document.querySelector("#accName").value,
    "balance": balanceInt,
    "percentFromIncome": document.querySelector("#accPercent").value / 100,
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
  
  let costStr = document.querySelector("#transCost").value;
  let costInt = parseInt(costStr.replace('.', ''));

  costInt *= checkDecimalSeperator(costStr) ? 1 : 100;
  
  let transaction = {
    "name": document.querySelector("#transName").value,
    "cost": costInt,
    "date": document.querySelector("#transDate").value,
    "accountName": (document.querySelector("#transAccName").value).toLowerCase(),
    "itemSubPeriod": document.querySelector("#itemSubTime").value,
    "renewalTime": parseInt(document.querySelector("#renewalTime").value),
    "category": document.querySelector("#transCategory").value,
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
  let incomeStr = document.querySelector("#income").value;
  let accountName = (document.querySelector("#incomeAccName").value).toLowerCase();
  let accountFound = false;
  let incomeInt = parseInt(incomeStr.replace('.', ''));
  
  incomeInt *= checkDecimalSeperator(incomeStr) ? 1 : 100;
  
  accounts.forEach((account) => {
    if (accountName === account.name.toLowerCase() || accountName === "all" || accountName === "") {
      accountFound = true;
      account.balance += incomeInt * account.percentFromIncome;
    }
  })
  
  if (!accountFound)
    console.log(`${accountName} is not a valid account name.`);
    
  update();
}

function checkDecimalSeperator(numberStr) {
  for (let i=0; i<numberStr.length; i++) {
    if (numberStr[i] === '.')
      return true;
  }
  return false;
}

/*function countDecimalPlaces(*/


function updateDownloadHREF() {
  const accountsDL = document.querySelector("#accountsDL");
  const jsonAccounts = JSON.stringify(accounts);
  const blob = new Blob([jsonAccounts], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  accountsDL.href = url;
  accountsDL.download = "accounts.json";
}

function displayAsFloat(number, decimalPlaces) {
  let numberStr = number.toString();
  let sigFigs = numberStr.slice(0, numberStr.length - decimalPlaces);
  let decimalFigs = numberStr.slice(numberStr.length - decimalPlaces, numberStr.length);
  
  
  return `${sigFigs}.${decimalFigs}`;
}

function updateOverview() {
  let overview = `<table><tr><th colspan="3">Accounts</th</tr><tr><th>Account Name</th><th>Account Balance</th><th>Delete</th></tr>`;
  let transactionView = `<table><tr><th colspan="6">Transactions</th></tr><tr><th>Name</th><th>Cost</th><th>Date</th><th>Category</th><th>Account</th><th>Delete</th></tr>`;
  let subscriptionView = `<table><tr><th colspan="5">Subscriptions</th></tr><tr><th>Name</th><th>Cost</th><th>Renews</th><th>Category</th><th>Delete</th></tr>`;
  
  accounts.forEach((account) => {
    overview += `<tr><td>${account.name}</td><td>${displayAsFloat(account.balance, 2)}</td><td><button class="deleteButton" onclick="removeAccount(${account.ID})">X</button></td></tr>`; 
  })
  
  for (let ID = transactions.length - 1; ID > transactions.length - 6 && ID>=0; ID--) {
    const { name, cost, date, accountName, itemSubPeriod, renewalTime, category } = transactions[ID]
    transactionView += `<tr><td>${name}</td><td>${displayAsFloat(cost, 2)}</td><td>${date}</td><td>${category}</td><td>${accountName}</td><td><button class="deleteButton" onclick="removeTransaction(${ID})">X</button></td></tr>`;
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


let UKPound = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
let accounts = JSON.parse(localStorage.getItem("accountList")) || [];
let transactions = JSON.parse(localStorage.getItem("transactionList")) || [];
let fileHandle;
update();
