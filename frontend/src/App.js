import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [month, setMonth] = useState("March");
  const [search, setSearch] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [totalNotSoldItems, setTotalNotSoldItems] = useState(0);
  const [priceRanges, setPriceRanges] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
    fetchBarChartData();
    fetchPieChartData();
  }, [month, search, page]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/transaction?month=${month}&search=${search}&page=${page}`
      );
      setTransactions(response.data);
      setTotalPages(Math.ceil(response.data.totalCount / 10));
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/statistics?month=${month}`
      );
      setTotalSaleAmount(response.data.totalSaleAmount);
      setTotalSoldItems(response.data.totalSoldItems);
      setTotalNotSoldItems(response.data);
      console.log(response.data.totalSaleAmount);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/bar-chart?month=${month}`
      );
      setPriceRanges(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPieChartData = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/pie-chart?month=${month}`
      );
      setCategoryData(response.data);
    } catch (error) {
      console.error(error);
    }
  };
console.log(priceRanges);
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => prevPage - 1);
  };

  return (
    <div className="App">
      <h1>Transactions Table</h1>
      <div>
        <label>Select Month:</label>
        <select value={month} onChange={handleMonthChange}>
          {[
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Search Transactions:</label>
        <input type="text" value={search} onChange={handleSearchChange} />
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Sold</th>
            <th>Category</th>
            <th>Date of Sale</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.sold ? "Yes" : "No"}</td>
              <td>{transaction.category}</td>
              <td>{transaction.dateOfSale}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={handlePrevPage} disabled={page === 1}>
          Previous
        </button>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          Next
        </button>
      </div>
      <h2>Transactions Statistics</h2>
      <div>
        <p>Total Sale Amount: {totalSaleAmount}</p>
        <p>Total Sold Items: {totalSoldItems}</p>
        {totalNotSoldItems && totalNotSoldItems.count !== undefined && (
          <p>Total Not Sold Items: {totalNotSoldItems.count}</p>
        )}
      </div>

      <h2>Transactions Bar Chart</h2>
      <div>
        <ul>
          {priceRanges.map((range) => (
            <li key={range.range}>
              {range.range}: {range.count} items
            </li>
          ))}
        </ul>
      </div>
      <h2>Transactions Pie Chart</h2>
      <div>
        <ul>
          {categoryData.map((category) => (
            <li key={category._id}>
              {category._id}: {category.count} items
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
