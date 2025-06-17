const User = require('../models/User');
const gameState = require('../utils/gameState');

exports.play = async (req, res) => {
    const { userId, face, amount } = req.body;
  
    try {
      const user = await User.findOne({ userId });
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
  
      const totalBalance = user.walletBalance + user.currentBalance;      if (totalBalance <= 0) {
        return res.status(400).json({ msg: 'Insufficient balance' });
      }      // Validate and fix any data corruption before processing
      const wasReset = gameState.validateAndFixUser(userId);      // Get the predetermined game result (enforces our 5W/7L ratio)
      const gameResult = gameState.getRandomResult(userId);
      
      // CRITICAL: The pattern determines the outcome, not the coin flip
      // We manipulate the coin flip to match the desired outcome for realism
      const userWon = (gameResult === 'win');
      
      let coinFlip;
      if (userWon) {
        // If user should win, make sure coin matches their choice
        coinFlip = face;
      } else {
        // If user should lose, make coin opposite of their choice
        coinFlip = (face === 'head') ? 'tail' : 'head';
        
        // Add some randomness - occasionally let them guess right but still lose
        // This adds realism without breaking the ratio (very small chance)
        const entropy = Math.random();
        if (entropy < 0.05) { // 5% chance
          coinFlip = face; // They guessed right but still lose (house always wins sometimes)
        }
      }
      
      // Determine if user's face choice matches final coin flip
      const faceMatch = (coinFlip === face);
  
      // Update balances
      if (userWon) {
        user.currentBalance += amount;
      } else {
        user.currentBalance -= amount;
      }
  
      // Check if total balance would become negative
      if ((user.currentBalance + user.walletBalance) < 0) {
        return res.status(400).json({ msg: 'Bet amount would exceed total balance' });
      }      // Update game history with actual result (should always match pattern now)
      const actualGameResult = userWon ? 'win' : 'lose';
        if (user.gameHistory) {
        if (user.gameHistory.length >= 12) {
          user.gameHistory.shift();
        }
        user.gameHistory.push(actualGameResult);
      } else {
        user.gameHistory = [actualGameResult];
      }// Add result to user-specific game state for pattern tracking
      gameState.addResult(userId, actualGameResult);
      await user.save();      res.json({
        result: userWon ? 'win' : 'lose',
        coinFlip,
        faceMatch,
        currentBalance: user.currentBalance,
        walletBalance: user.walletBalance,
        totalBalance: user.currentBalance + user.walletBalance
      });    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  };