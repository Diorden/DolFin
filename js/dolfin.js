"use strict";

// Functions for adding objects //

function addAccount() {

  let balanceStr = document.querySelector("#accBal").value;
  let percentFromIncomeStr = (document.querySelector("#accPercent").value / 100).toString();  /* Safe? Even with floats? Who knows! */
  
  if (countDecimalPlaces(balanceStr) > 2) {
    alert("Input Error: Currency input has too many decimal places.");
    return;
  }
  
  let balanceInt = strToFixedPoint(balanceStr)
  let percentFromIncomeInt = strToFixedPoint(percentFromIncomeStr)

  let account = {
    "name": document.querySelector("#accName").value,
    "balance": balanceInt,
    "percentFromIncome": percentFromIncomeInt,  
    "ID": accounts.length
  };

  accounts.push(account);
  update();
}



function addTransaction() {
  
  let costStr = document.querySelector("#transCost").value;
  let date = new Date(document.querySelector("#transDate").value);
  
  if (countDecimalPlaces(costStr) > 2) {
    alert("Input Error: Currency input has too many decimal places.");
    return;
  }
  
  let costInt = strToFixedPoint(costStr);
  
  let transaction = {
    "name": document.querySelector("#transName").value,
    "cost": costInt,
    "date": date,
    "accountName": document.querySelector("#transAccName").value,
    "category": document.querySelector("#transCategory").value,
    "ID": transactions.length
  };
  
  transactions.push(transaction);
  applyTransaction(transaction);

  if (document.querySelector("#subPeriod").value !== "None")
    addSubscription(transaction)
  
  update();
}



function addSubscription(transaction) {
  let periodCount = parseInt(document.querySelector("#periodCount").value);
  let subPeriod = document.querySelector("#subPeriod").value;
  
  
  let subscription = {
      "name": transaction.name,
      "cost": transaction.cost,
      "accountName": transaction.accountName,
      "subPeriod": subPeriod,
      "periodCount": periodCount,
      "renewalDate": transaction.date,
      "category": transaction.category,
      "ID": subscriptions.length
    };
    
    nextRenewalDate(subscription);
    
    console.table(subscription);
    subscriptions.push(subscription);
}



// Functions for removing objects //

function removeTransaction(ID) {
  /* "Do you want to remove this transaction?" warning box */
  transactions.splice(ID, 1);
  update();
}



function removeAccount(ID) {
  /* "Do you want to remove this account?" warning box */
  accounts.splice(ID, 1);
  update();
}



function removeSubscription(ID) {
  /* "Do you want to remove this subscription?" warning box */
  subscriptions.splice(ID, 1);
  update();
}



// Balance modifiers //

function applyTransaction(transaction) {
  let accountFound = false;
  accounts.forEach((account) => {
    if ((account.name).toLowerCase() === (transaction.accountName).toLowerCase()) {
      transaction.accountName = account.name;  /* Fixes capitalisation errors */
      account.balance -= transaction.cost;
      accountFound = true;
    }
  })
  if (!accountFound) 
    console.log(`${transaction.accountName} is not a valid account name.`);
}



function applySubscriptions() {
  subscriptions.forEach((sub) => {
    accounts.forEach((account) => {
      if ((account.name).toLowerCase() === (sub.accountName).toLowerCase()) {
        sub.accountName = account.name;
        console.log(typeof sub.renewalDate);
        if (sub.renewalDate <= new Date(Date.now())) {
          account.balance -= sub.cost;
          nextRenewalDate(sub);
          applySubscriptions();
        }
      }
    })    /* what in dentation */
  })
}
          
    

function applyIncome() {
  let incomeStr = document.querySelector("#income").value;
  let accountName = (document.querySelector("#incomeAccName").value).toLowerCase();
  let accountFound = false;
  
   if (countDecimalPlaces(incomeStr) > 2) {
    alert("Input Error: Currency input has too many decimal places.");
    return;
  }
  
  let incomeInt = strToFixedPoint(incomeStr)
  
  accounts.forEach((account) => {
    if (accountName === "all" || accountName === "") {
      accountFound = true;
      account.balance += (incomeInt * account.percentFromIncome) / 100;  /* Safe? */
    } else if (accountName === account.name.toLowerCase()) {  /* Will not make sense if iterating over a set of accounts */
      accountFound = true;
      account.balance += incomeInt;
    }
  })
  
  if (!accountFound)
    alert(`${accountName} is not a valid account name.`);
    
  update();
}



// Fixed point string manipulation functions //

function countDecimalPlaces(numberStr) {
  let reachedDecimal = false;
  let numberOfDecimalPlaces = 0;
  for (let i=0; i<numberStr.length; i++) {
    numberOfDecimalPlaces += reachedDecimal ? 1 : 0;  /* If a decimal has been reached, count this value as a decimal place. */
    if (numberStr[i] === '.')
      reachedDecimal = true;
  }
  return numberOfDecimalPlaces;
}



function strToFixedPoint(numberStr) {
  let numberInt = parseInt(numberStr.replace('.', ''));
  switch (countDecimalPlaces(numberStr)) {
    case 0:
      return numberInt *= 100;
    case 1:
      return numberInt *= 10;
    case 2:
      return numberInt *= 1;
  }
}



function FixedPointToStr(number, decimalPlaces) {
  let numberStr = number.toString();
  let sigFigs = numberStr.slice(0, numberStr.length - decimalPlaces);
  let decimalFigs = numberStr.slice(numberStr.length - decimalPlaces, numberStr.length);
  
  
  return `${sigFigs}.${decimalFigs}`;
}



// Page element upadate functions //

function updateDownloadButtonHREF() {
  const accountsDL = document.querySelector("#accountsDL");
  const jsonAccounts = JSON.stringify(accounts);
  const blob = new Blob([jsonAccounts], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  accountsDL.href = url;
  accountsDL.download = "accounts.json";
}



function updateOverview() {
  let accountView = `<table><tr><th colspan="3">Accounts</th</tr><tr><th>Account Name</th><th>Account Balance</th><th>Delete</th></tr>`;
  let transactionView = `<table><tr><th colspan="6">Transactions</th></tr><tr><th>Name</th><th>Cost</th><th>Date</th><th>Category</th><th>Account</th><th>Delete</th></tr>`;
  let subscriptionView = `<table><tr><th colspan="7">Subscriptions</th></tr><tr><th>Name</th><th>Cost</th><th>Account</th><th>Period</th><th>Renews</th><th>Category</th><th>Delete</th></tr>`;
  
  accounts.forEach((account) => {
    accountView += `<tr><td>${account.name}</td><td>${FixedPointToStr(account.balance, 2)}</td><td><button class="deleteButton" onclick="removeAccount(${account.ID})">X</button></td></tr>`; 
  })
  
  for (let ID = transactions.length - 1; ID > transactions.length - 6 && ID>=0; ID--) {
    const { name, cost, date, accountName, itemSubPeriod, renewalTime, category } = transactions[ID];
    transactionView += `<tr><td>${name}</td><td>${FixedPointToStr(cost, 2)}</td><td>${parseDate(date)}</td><td>${category}</td><td>${accountName}</td><td><button class="deleteButton" onclick="removeTransaction(${ID})">X</button></td></tr>`;
  }
  
  subscriptions.forEach((sub) => {
    const { name, cost, accountName, subPeriod, periodCount, renewalDate, category, ID} = sub;
    console.log(renewalDate);
    console.log(Date(Date.now()));
    subscriptionView += `<tr><td>${name}</td><td>${FixedPointToStr(cost, 2)}</td><td>${accountName}</td><td>${subPeriod}</td><td>${parseDate(renewalDate)}</td><td>${category}<td><button class="deleteButton" onclick="removeSubscription(${ID})">X</button></td></tr>`; 
  })
    
  document.querySelector("#accountView").innerHTML = `${accountView}</table>`;
  document.querySelector("#transactionView").innerHTML = `${transactionView}</table>`;
  document.querySelector("#subscriptionView").innerHTML = `${subscriptionView}</table>`;
}



function update() {  
  applySubscriptions();
  updateDownloadButtonHREF();
  updateOverview();
  
  localStorage.setItem("accountList", JSON.stringify(accounts));
  localStorage.setItem("transactionList", JSON.stringify(transactions));
  localStorage.setItem("subscriptionList", JSON.stringify(subscriptions));
}



// Date Functions //

function parseDate(date) {
  console.log(typeof date);
  let dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;  /* dd-mm-yyyy */
  return dateStr;
}

function nextRenewalDate(sub) {
  console.log(typeof sub.renewalDate);
   switch (sub.subPeriod) {
    case "Daily":
      sub.renewalDate.setDate(sub.renewalDate.getDate() + sub.periodCount);
      break;
    case "Weekly":
      sub.renewalDate.setDate(sub.renewalDate.getDate() + (7 * sub.periodCount));
      break;
    case "Monthly":
      sub.renewalDate.setMonth(sub.renewalDate.getMonth() + sub.periodCount);
      break;
    case "Annual":
      sub.renewalDate.setFullYear(sub.renewalDate.getFullYear() + sub.periodCount);
      break;
  }
}



function parseDates() {
  subscriptions.forEach((sub) => {
    sub.renewalDate = new Date(sub.renewalDate);
  })
  transactions.forEach((transaction) => {
    transaction.date = new Date(transaction.date);
  })
}



// Init code //

let accounts = JSON.parse(localStorage.getItem("accountList")) || [];
let transactions = JSON.parse(localStorage.getItem("transactionList")) || [];
let subscriptions = JSON.parse(localStorage.getItem("subscriptionList")) || [];
parseDates();
update();
