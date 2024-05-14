import express from "express";
import Sales from "../model/Database.js";

const router = express.Router();


router.get("/initialize-database", async(req, res) => {
    const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json')

    const data = await response.json();
    // res.send(data);

    await Sales.insertMany(data)
  res.json(data);
});



router.get('/transaction',async(req, res) => {
    const { search = '', page = 1, perPage = 10 } = req.query;
    const skip = (page - 1) * perPage;
    try {
      const regex = new RegExp(search, 'i');
      const transactions = await Sales.find({
        $or: [
          { title: regex },
          { description: regex },
          // Use numerical operators for price comparison
          { price: { $gte: 0, $lte: parseFloat(search) || Number.MAX_SAFE_INTEGER } } // Convert search to number
        ]
      }).skip(skip).limit(parseInt(perPage));
      res.json(transactions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
})

router.get('/statistics', async (req, res) => {
  const { month } = req.query;
  try {
    const totalSaleAmount = await Sales.aggregate([
      { $match: { dateOfSale: { $regex: new RegExp(month, 'i') } } },
      { $group: { _id: null, totalAmount: { $sum: "$price" } } }
    ]);
    const totalSoldItems = await Sales.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') } });
    const totalNotSoldItems = await Sales.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') }, sold: false });
    res.json({
      totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
      totalSoldItems,
      totalNotSoldItems
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/bar-chart', async (req, res) => {
  const { month } = req.query;
  try {
    const priceRanges = [
      { range: '0 - 100', count: await Sales.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') }, price: { $lte: 100 } }) },
      { range: '101 - 200', count: await Sales.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') }, price: { $gt: 100, $lte: 200 } }) },
      { range: '201 - 300', count: await Sales.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') }, price: { $gt: 200, $lte: 300 } }) },
      // Add more ranges as needed
    ];
    res.json(priceRanges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API for pie chart
router.get('/pie-chart', async (req, res) => {
  const { month } = req.query;
  try {
    const categories = await Sales.aggregate([
      { $match: { dateOfSale: { $regex: new RegExp(month, 'i') } } },
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Combined API fetching data from all above APIs
router.get('/combined-data', async (req, res) => {
  const { month } = req.query;
  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      axios.get(`/transactions?month=${month}`),
      axios.get(`/statistics?month=${month}`),
      axios.get(`/bar-chart?month=${month}`),
      axios.get(`/pie-chart?month=${month}`)
    ]);
    res.json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
