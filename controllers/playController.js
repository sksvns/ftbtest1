const User = require('../models/User');
const gameState = require('../utils/gameState');

exports.play = async (req, res) => {
    const { userId, face, amount } = req.body;
  
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      const totalBalance = user.walletBalance + user.currentBalance;
      if (totalBalance <= 0) {
        return res.status(400).json({ msg: 'Insufficient balance' });
      }
  
      // Determine game result
      const result = gameState.getRandomResult();
      const coinFlip = Math.random() < 0.5 ? 'head' : 'tail';
      const userWon = (coinFlip === face && result === 'win');
  
      // Update balances
      if (userWon) {
        user.currentBalance += amount;
      } else {
        user.currentBalance -= amount;
      }
  
      // Check if total balance would become negative
      if ((user.currentBalance + user.walletBalance) < 0) {
        return res.status(400).json({ msg: 'Bet amount would exceed total balance' });
      }
  
      // Update game history
      if (user.gameHistory) {
        if (user.gameHistory.length >= 12) {
          user.gameHistory.shift();
        }
        user.gameHistory.push(userWon ? 'win' : 'lose');
      } else {
        user.gameHistory = [userWon ? 'win' : 'lose'];
      }
  
      gameState.addResult(userWon ? 'win' : 'lose');
      await user.save();
  
      res.json({
        result: userWon ? 'win' : 'lose',
        coinFlip,
        currentBalance: user.currentBalance,
        walletBalance: user.walletBalance,
        totalBalance: user.currentBalance + user.walletBalance
      });
    } catch (err) {
        console.log(err);
      res.status(500).json({ msg: 'Server error' });
    }
  };