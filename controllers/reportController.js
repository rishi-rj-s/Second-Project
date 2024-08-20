const Orderdb = require('../models/orderModel');

const PDFDocument = require('pdfkit-table');

exports.generatereport = async (req, res) => {
  try {
    const { filterType, startDate, endDate, reportType } = req.body;

    console.log(filterType, reportType)

    let salesData;
    let dailySalesData;
    let reportTitle;

    if (filterType === 'daily') {
      salesData = await getDailySales();
      dailySalesData = salesData;
      reportTitle = 'Today';
    } else if (filterType === 'weekly') {
      salesData = await getWeeklySales();
      dailySalesData = salesData;
      reportTitle = `This Week`;
    } else if (filterType === 'monthly') {
      salesData = await getMonthlySales();
      dailySalesData = salesData;
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      reportTitle = monthNames[new Date().getMonth()]; // Use current month if no startDate provided
    } else if (filterType === 'yearly') {
      salesData = await getYearlySales();
      dailySalesData = salesData;
      reportTitle = `Yearly Sales Report (Rs. {new Date().getFullYear()})`;
    } else if (filterType === 'custom') {
      if (!startDate || !endDate) {
        throw new Error('Custom date range requires both start date and end date.');
      }
      salesData = await getCustomRangeSales(startDate, endDate);
      dailySalesData = salesData;
      reportTitle = `${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
    }

    if (reportType === 'pdf') {
      generatePDFReport(res, reportTitle, salesData, dailySalesData); // Pass dailySalesData here
    } else if (reportType === 'excel') {
      generateExcelReport(res, reportTitle, salesData, dailySalesData);
    } else {
      res.status(400).json({ message: 'Invalid report type' });
    }
  } catch (error) {
    console.error(error);
    res.status(404).send(error);
  }
};

async function generatePDFReport(res, reportTitle, salesData, dailySalesData) {
  try {
    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=Rishi Studio_salesReport.pdf`, // inline for preview
        'Content-Length': pdfData.length
      });
      res.end(pdfData);
    });

    doc.fontSize(20).text(`RISHI STUDIO`, { align: 'center' });
    doc.fontSize(18).text(`Sales Report (${reportTitle})`, { align: 'center' });
    doc.moveDown();

    // Overall Sales Report Table
    doc.fontSize(16).text('Sales Report', { underline: true });
    const overallTableHeaders = ['Date', 'Total Sales', 'Total Order Amount', 'Total Discount', 'Total Coupon Discount'];
    const overallTableData = dailySalesData.map(({ date, totalSales, totalOrderAmount, totalDiscount, totalCouponDiscount }) =>
      [new Date(date).toLocaleDateString(), totalSales, 'Rs.' + totalOrderAmount, 'Rs.' + totalDiscount, 'Rs.' + totalCouponDiscount]
    );
    const { totalSalesSum, totalOrderAmountSum, totalDiscountSum, totalCouponDiscountSum } = calculateTotalSums(dailySalesData);
    generateTable(doc, overallTableHeaders, overallTableData, totalSalesSum, totalOrderAmountSum, totalDiscountSum, totalCouponDiscountSum);

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error generating PDF report' });
  }
}

async function generateTable(doc, headers, data, totalSalesSum, totalOrderAmountSum, totalDiscountSum, totalCouponDiscountSum) {
  const tableData = [...data, ['Total:', totalSalesSum, 'Rs.' + totalOrderAmountSum, 'Rs.' + totalDiscountSum, 'Rs.' + totalCouponDiscountSum]];

  doc.table({
    headers: headers,
    rows: tableData,
    widths: Array(headers.length).fill('*'), // Equal width for all columns
    heights: 20,
    headerRows: 1
  });
}

function calculateTotalSums(dailySalesData) {
  let totalSalesSum = 0;
  let totalOrderAmountSum = 0;
  let totalDiscountSum = 0;
  let totalCouponDiscountSum = 0;

  dailySalesData.forEach(({ totalSales, totalOrderAmount, totalDiscount, totalCouponDiscount }) => {
    totalSalesSum += totalSales;
    totalOrderAmountSum += totalOrderAmount;
    totalDiscountSum += totalDiscount;
    totalCouponDiscountSum += totalCouponDiscount;
  });

  return {
    totalSalesSum,
    totalOrderAmountSum,
    totalDiscountSum,
    totalCouponDiscountSum
  };
}
async function generateTable(doc, headers, data, totalSalesSum, totalOrderAmountSum, totalDiscountSum, totalCouponDiscountSum) {
  const tableData = [...data, ['Total:', totalSalesSum, 'Rs.' + totalOrderAmountSum, 'Rs.' + totalDiscountSum, 'Rs.' + totalCouponDiscountSum]];

  doc.table({
    headers: headers,
    rows: tableData,
    widths: Array(headers.length).fill('*'), // Equal width for all columns
    heights: 20,
    headerRows: 1
  });
}

// Add the following function for yearly sales data retrieval

async function getYearlySales() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  return await getOrderData(startOfYear, endOfYear);
}



// Helper functions to retrieve sales data based on different filter types
async function getDailySales() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  return await getOrderData(startOfDay, endOfDay);
}

async function getWeeklySales() {
  const today = new Date();
  const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
  const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 7);
  return await getOrderData(startOfWeek, endOfWeek);
}

async function getMonthlySales() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return await getOrderData(startOfMonth, endOfMonth);
}

async function getCustomRangeSales(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return await getOrderData(start, end);
}

async function getOrderData(startDate, endDate) {
  const orders = await Orderdb.find({ orderedDate: { $gte: startDate, $lt: endDate } }).populate('items.productId')
  // .populate('couponused');

  let dailySalesData = [];

  orders.forEach(order => {
    let totalSales = 0;
    let totalOrderAmount = order.totalAmount;
    let totalDiscount = 0;
    let totalCouponDiscount = 0;

    order.items.forEach(item => {
      totalSales += item.quantity;
      // const productPrice = item.productId.rate * item.quantity;
      // const discountedPrice = productPrice * (1 - (item.productId.discount / 100));
      // const discountAmount = productPrice - discountedPrice;
      // totalDiscount += Math.round(discountAmount);
    });

    // if (order.couponused) {
    //     totalCouponDiscount += order.couponused.maxdiscount;
    // }

    dailySalesData.push({
      date: order.orderedDate,
      totalSales,
      totalOrderAmount,
      totalDiscount,
      totalCouponDiscount
    });
  });

  // Sort the daily sales data by order date in ascending order
  dailySalesData.sort((a, b) => a.date - b.date);

  return dailySalesData;
}


// invoice generator 


exports.generateInvoice = async (req, res) => {
  try {
    if(!user){
      res.status(400).send("No user Logged In!");
    }
    const orderId = req.params.id;
    const order = await Orderdb.findById(orderId).populate('items.productId shippingAddress');
    console.dir(order)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== "Delivered") {
      return res.status(404).json({ message: 'Order not delivered' });
    }

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=   Rishi Studio_invoice.pdf');
    doc.pipe(res);

    // Header Section
    doc.image('assets/img/logo.jpg', { width: 50, align: 'right' }).moveDown(0.5);
    doc.fontSize(20).text('RISHI STUDIO', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).text('Invoice', { align: 'center' });
    doc.moveDown();

    // Company Information
    doc.fontSize(12).text('Address: 123 Studio Lane, City, State, ZIP');
    doc.text('Phone: (+91) 456-7890');
    doc.text('Email: rishistudio1995@gmail.com');
    doc.text('Website: www.rishistudio.shop');
    doc.moveDown();

    // Invoice Details
    doc.fontSize(12).text(`Invoice Number: ${generateInvoiceNumber(order)}`);
    doc.text(`Invoice Date: ${formatDate(order.orderedDate)}`);
    doc.moveDown();

    // Customer Information
    doc.fontSize(14).text('Customer Information:', { underline: true });
    doc.fontSize(12).text(`Name: ${order.name}`);
    doc.text(`Shipping Address: ${order.shippingAddress.address},${order.shippingAddress.district},${order.shippingAddress.state}`);
    doc.text(` ${order.shippingAddress.mobileNumber}`);
    doc.text(` ${order.shippingAddress.pincode}`);
    doc.moveDown();

    // Ordered Items Table
    generateTble(doc, order);
    doc.moveDown();

    // Payment Information
    doc.fontSize(12).text(`Payment Method: ${order.paymentMethod}`);
    doc.text(`Payment Status: ${order.paymentStatus}`);
    if (order.couponApplied) {
      doc.text(`Coupon: (-)Rs. ${order.couponApplied.discountAmount}/-`, { align: 'right' });
    }
    doc.text(`Total Amount: Rs. ${order.totalAmount}/-`, { align: 'right' });
    doc.moveDown();

    // Footer Section
    doc.fontSize(10).text('Thank you for your purchase!', { align: 'center' });
    doc.text('For any inquiries, please contact us at rishistudio@gmail.com or (+91) 456-7890.', { align: 'center' });
    doc.text('Return Policy: Items can be returned within 30 days of receipt. Please visit our website for more details.', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

function generateTble(doc, orderedItems) {
  const tableHeaders = ['Product Name', 'Description', 'Quantity', 'Unit Price', 'Total'];
  console.log(orderedItems);
  const tableData = orderedItems.items.map(item => [
    item.productId.name,
    item.productId.description,
    item.quantity,
    `Rs. ${item.productId.rate}/-`,
    `Rs. ${item.price * item.quantity}/-`
  ]);

  doc.table({
    headers: tableHeaders,
    rows: tableData
  });
}

function generateInvoiceNumber(order) {
  // Generate a unique invoice number based on order details
  return `INV-${order._id}`;
}

function formatDate(date) {
  // Format date in a readable format
  return new Date(date).toLocaleDateString();
}
exports.generateChart = async (req, res) => {
  try {
    const { filterType } = req.body;
    let startDate, endDate;

    switch (filterType) {
      case "weekly":
        const week = new Date();
        const startOfWeek = new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay());
        const endOfWeek = new Date(week.getFullYear(), week.getMonth(), week.getDate() - week.getDay() + 7);
        startDate = startOfWeek;
        endDate = endOfWeek;
        break;

      case "monthly":
        const month = new Date();
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        startDate = startOfMonth;
        endDate = endOfMonth;
        break;

      case "yearly":
        const yearly = new Date();
        const startOfYear = new Date(yearly.getFullYear(), 0, 1);
        const endOfYear = new Date(yearly.getFullYear(), 11, 31);
        startDate = startOfYear;
        endDate = endOfYear;
        break;

      default:
        return res.status(400).json({ error: "Invalid filterType" });
    }

    async function getdata(startDate, endDate, filterType) {
      try {
        let labelData, dataSetData;

        const orders = await Orderdb.find({ orderedDate: { $gte: startDate, $lt: endDate } }).populate('items.productId');

        if (filterType === "weekly") {
          labelData = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          dataSetData = Array(7).fill(0);
          orders.forEach((order) => {
            const date = new Date(order.orderedDate);
            const day = date.getDay();
            dataSetData[day] += 1;
          });

        } else if (filterType === "monthly") {
          const numDays = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
          labelData = Array.from({ length: numDays }, (_, i) => i + 1);
          dataSetData = Array(numDays).fill(0);
          orders.forEach((order) => {
            const date = new Date(order.orderedDate);
            const day = date.getDate() - 1; // Adjust index to start from 0
            dataSetData[day] += 1;
          });

        } else if (filterType === "yearly") {
          labelData = Array.from({ length: 12 }, (_, i) => i + 1);
          dataSetData = Array(12).fill(0);
          orders.forEach((order) => {
            const date = new Date(order.orderedDate);
            const month = date.getMonth();
            dataSetData[month] += 1;
          });
        }

        return res.status(200).json({ labelData, dataSetData });

      } catch (error) {
        console.error("Error fetching data:", error);
        return res.status(500).send({ error: "Failed to fetch data" });
      }
    }

    getdata(startDate, endDate, filterType);

  } catch (error) {
    console.error("Error in generateChart:", error);
    return res.status(500).send({ error: "Internal server error" });
  }
}
