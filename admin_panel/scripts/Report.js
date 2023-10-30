import { ref, onChildAdded, query, equalTo, orderByChild, startAt, endAt } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { db } from './configurations.js';

// Function to fetch and display completed orders in the table
function fetchAndDisplayCompletedOrders() {
  // Reference to the 'Orders' node in the Realtime Database
  const ordersRef = ref(db, 'Orders');

  // Reference to the HTML table
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  table.appendChild(thead);
  table.appendChild(tbody);

  // Create a query to filter orders with "orderStatus" equal to "Completed"
  const completedOrdersQuery = query(
    ordersRef,
    orderByChild("orderStatus"),
    equalTo("completed")
  );

  // Define table headers
  thead.innerHTML = `
    <tr>
      <th>Order ID</th>
      <th>User ID</th>
      <th>Title</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>Delivery Option</th>
      <th>Order Status</th>
    </tr>
  `;

  function addOrderToTable(order) {
    var tableRow = `
        <tr>
          <td>${order.key}</td>
          <td>${order.val().userid}</td>
          <td>${order.val().title}</td>
          <td>${order.val().quantity}</td>
          <td>LKR ${order.val().price}</td>
          <td>${order.val().selectedDeliveryOption}</td>
          <td>${order.val().orderStatus}</td>
        </tr>
      `;
      tbody.innerHTML += tableRow;
  }

  // Event listener for the 'child_added' event to dynamically update the table
  onChildAdded(completedOrdersQuery, (childSnapshot) => {
    addOrderToTable(childSnapshot);
  });

  // Append the table to the report-table div
  const reportTableDiv = document.getElementById("report-table");
  reportTableDiv.innerHTML = "";
  reportTableDiv.appendChild(table);
}

// Function to fetch and display completed orders in the table
function fetchAndDisplayOutForDeliveryOrders() {
  // Reference to the 'Orders' node in the Realtime Database
  const ordersRef = ref(db, 'Orders');

  // Reference to the HTML table
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  table.appendChild(thead);
  table.appendChild(tbody);

  // Create a query to filter orders with "orderStatus" equal to "Completed"
  const completedOrdersQuery = query(
    ordersRef,
    orderByChild("orderStatus"),
    equalTo("out_for_delivery")
  );

  // Define table headers
  thead.innerHTML = `
    <tr>
      <th>Order ID</th>
      <th>User ID</th>
      <th>Title</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>Delivery Option</th>
      <th>Order Status</th>
    </tr>
  `;

  // Function to add a new row to the table
  function addOrderToTable(order) {
    var tableRow = `
      <tr>
        <td>${order.key}</td>
        <td>${order.val().userid}</td>
        <td>${order.val().title}</td>
        <td>${order.val().quantity}</td>
        <td>LKR ${order.val().price}</td>
        <td>${order.val().selectedDeliveryOption}</td>
        <td>${order.val().orderStatus}</td>
      </tr>
    `;
    tbody.innerHTML += tableRow;
  }

  // Event listener for the 'child_added' event to dynamically update the table
  onChildAdded(completedOrdersQuery, (childSnapshot) => {
    addOrderToTable(childSnapshot);
  });

  // Append the table to the report-table div
  const reportTableDiv = document.getElementById("ofd-report-table");
  reportTableDiv.innerHTML = "";
  reportTableDiv.appendChild(table);
}

// Define a function to generate the PDF report
function generatePDFReport(month) {
  document.getElementById('generatePdfButton').onclick = function() {
    // Get the current date and time
    const currentDateTime = new Date().toLocaleString();

    var element = `<div class="reportHead">
        <h1 class="reportHeader">Order Summary</h1>
        <p class="reportDateTime">${currentDateTime}</p>
      </div>
      <h3 style="margin: 50px auto; width: 80%">Completed Orders</h3>
      <table style="margin: 50px auto; width: 80%">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Title</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Delivery Option</th>
          </tr>
        </thead>
        <tbody>
          ${getDataForReport('completed', month)}            
        </tbody>
      </table>

      <h3 style="margin: 0 auto; width: 80%">Out for Delivery Orders</h3>
      <table style="margin: 50px auto; width: 80%">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Title</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Delivery Option</th>
          </tr>
        </thead>
        <tbody>
          ${getDataForReport('out_for_delivery', month)}            
        </tbody>
      </table>
    </div>`;

    var opt = {
      margin: 0, // Set margin to 0
      filename: 'Orders Report.pdf',
      image: {type: 'jpeg', quality: 0.98},
      html2canvas: {scale: 2},
      jsPDF: {unit: 'in', format: 'letter', 'orientation': 'portrait'}
    };

    html2pdf(element, opt);
  };
}





//generate pdf table data
function getDataForReport(orderStatus, month) {
  const ordersRef = ref(db, 'Orders');
  var tBodyContent = '';

  const completedOrdersQuery = query(
    ordersRef,
    orderByChild("orderStatus"),
    equalTo(orderStatus)
  );

  function addOrderToTable(order) {
    var tableRow = `
      <tr>
        <td>${order.key}</td>
        <td>${order.val().title}</td>
        <td>${order.val().quantity}</td>
        <td>LKR ${order.val().price}</td>
        <td>${order.val().selectedDeliveryOption}</td>
      </tr>
    `;

    tBodyContent = tBodyContent + tableRow;
  }

  onChildAdded(completedOrdersQuery, (childSnapshot) => {
    if(childSnapshot.val().timestamp.split('-')[1] == month){
      addOrderToTable(childSnapshot);
    }
  });

  return tBodyContent;
}




document.getElementById('generatePdfButton').onclick = function () {
  document.getElementById('reportMonthSelector').addEventListener('change', function() {
    if(this.value != null){
      generatePDFReport(this.value);
    }else{
      const currentDateTime = new Date().toLocaleString();
      console.log(currentDateTime);
      generatePDFReport('8');
    }
  });
};



window.onload = function () {
  fetchAndDisplayCompletedOrders();
  fetchAndDisplayOutForDeliveryOrders();
};

