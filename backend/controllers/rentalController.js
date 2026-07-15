const Rental = require('../models/Rental');
const User = require('../models/User');
const Book = require('../models/Book');

// @desc    List all rentals / orders with search, filters, pagination
// @route   GET /api/crm/rentals
const getRentals = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Handle search by matching user name/email/phone or book title
    if (search) {
      // Find matching users
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(u => u._id);

      // Find matching books
      const books = await Book.find({
        title: { $regex: search, $options: 'i' }
      }).select('_id');

      const bookIds = books.map(b => b._id);

      query.$or = [
        { user: { $in: userIds } },
        { book: { $in: bookIds } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Rental.countDocuments(query);
    
    const rentals = await Rental.find(query)
      .populate('user', 'name email phone')
      .populate('book', 'title author pricePerWeek cover')
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Map rentals to format transaction/payment IDs
    const formattedRentals = rentals.map(r => {
      const plain = r.toObject({ virtuals: true });
      // Generate a mock payment reference number based on MongoDB ObjectId
      plain.paymentNo = `TXN-${plain.id.slice(-8).toUpperCase()}`;
      return plain;
    });

    res.json({
      success: true,
      rentals: formattedRentals,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('CRM Get Rentals error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving order history.' });
  }
};

module.exports = {
  getRentals
};
