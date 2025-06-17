class GameState {  constructor() {
    this.userCycles = new Map();
    this.maxGames = 12;
    this.maxWins = 5;
    this.maxLosses = 7;
  }

  // Get or create a user's game cycle
  getUserCycle(userId) {
    if (!this.userCycles.has(userId)) {
      this.userCycles.set(userId, {
        gameHistory: [],
        cyclePattern: this.generatePattern(),
        currentPosition: 0
      });
      console.log(`Created new cycle for user ${userId}:`, this.userCycles.get(userId).cyclePattern);
    }
    return this.userCycles.get(userId);
  }  // Generate a guaranteed 5W/7L pattern with randomization
  generatePattern() {
    // Create array with exactly 5 wins and 7 losses
    const pattern = [];
    for (let i = 0; i < 5; i++) pattern.push('win');
    for (let i = 0; i < 7; i++) pattern.push('lose');
    
    // Shuffle multiple times for unpredictability
    for (let shuffle = 0; shuffle < 5; shuffle++) {
      for (let i = pattern.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pattern[i], pattern[j]] = [pattern[j], pattern[i]];
      }
    }
    
    // Validate pattern (just to be sure)
    const wins = pattern.filter(r => r === 'win').length;
    const losses = pattern.filter(r => r === 'lose').length;
    
    if (wins !== 5 || losses !== 7) {
      console.error(`Invalid pattern generated! Wins: ${wins}, Losses: ${losses}`);
      // Force correct pattern if somehow invalid
      return ['win', 'lose', 'lose', 'win', 'lose', 'win', 'lose', 'lose', 'win', 'lose', 'lose', 'win'];
    }
    
    return pattern;
  }
  // Get the next result for user
  getRandomResult(userId) {
    const userCycle = this.getUserCycle(userId);
    
    console.log(`\n=== GETTING RESULT FOR USER ${userId} ===`);
    console.log(`Current position: ${userCycle.currentPosition}/${this.maxGames}`);
    console.log(`History length: ${userCycle.gameHistory.length}`);
    
    // Reset cycle if completed
    if (userCycle.currentPosition >= this.maxGames) {
      console.log(`🔄 Resetting cycle - position ${userCycle.currentPosition} >= ${this.maxGames}`);
      userCycle.gameHistory = [];
      userCycle.cyclePattern = this.generatePattern();
      userCycle.currentPosition = 0;
      console.log(`New pattern generated:`, userCycle.cyclePattern);
    }

    // CRITICAL: Validate pattern integrity
    const patternWins = userCycle.cyclePattern.filter(r => r === 'win').length;
    const patternLosses = userCycle.cyclePattern.filter(r => r === 'lose').length;
    
    if (patternWins !== this.maxWins || patternLosses !== this.maxLosses) {
      console.error(`❌ CORRUPTED PATTERN! Wins: ${patternWins}, Losses: ${patternLosses}`);
      userCycle.cyclePattern = this.generatePattern();
      console.log(`Fixed pattern:`, userCycle.cyclePattern);
    }

    // Get result from pre-determined pattern
    const patternResult = userCycle.cyclePattern[userCycle.currentPosition];
    
    console.log(`Pattern position ${userCycle.currentPosition} says: ${patternResult}`);
    
    // Current state validation
    const currentWins = userCycle.gameHistory.filter(r => r === 'win').length;
    const currentLosses = userCycle.gameHistory.filter(r => r === 'lose').length;
    const remainingWins = this.maxWins - currentWins;
    const remainingLosses = this.maxLosses - currentLosses;
    const remainingGames = this.maxGames - userCycle.currentPosition;
      console.log(`Current state: ${currentWins}W/${currentLosses}L`);
    console.log(`Remaining: ${remainingWins}W/${remainingLosses}L in ${remainingGames} games`);
    
    // CRITICAL: Safety overrides to prevent corruption
    if (patternResult === 'win' && remainingWins <= 0) {
      console.log(`❌ OVERRIDE: Pattern says WIN but no wins remaining! Forcing LOSE`);
      return 'lose';
    }
    
    if (patternResult === 'lose' && remainingLosses <= 0) {
      console.log(`❌ OVERRIDE: Pattern says LOSE but no losses remaining! Forcing WIN`);
      return 'win';
    }
    
    // End-game forcing to guarantee exact ratio
    if (remainingGames === remainingWins && remainingWins > 0) {
      console.log(`🎯 END-GAME: Forcing WIN - all ${remainingGames} remaining must be wins`);
      return 'win';
    }
    
    if (remainingGames === remainingLosses && remainingLosses > 0) {
      console.log(`🎯 END-GAME: Forcing LOSE - all ${remainingGames} remaining must be losses`);  
      return 'lose';
    }
    
    // If we reach here, the pattern result is safe to use
    console.log(`✅ Using safe pattern result: ${patternResult}`);
    console.log(`=== END GETTING RESULT ===\n`);
    return patternResult;
  }
  // Track the actual result
  addResult(userId, actualResult) {
    const userCycle = this.getUserCycle(userId);
    
    console.log(`\n=== ADDING RESULT FOR USER ${userId} ===`);
    console.log(`Before: Position ${userCycle.currentPosition}, History length: ${userCycle.gameHistory.length}`);
    console.log(`Adding result: ${actualResult}`);
    
    // CRITICAL: Prevent adding results beyond cycle length
    if (userCycle.currentPosition >= this.maxGames) {
      console.error(`❌ PREVENTED: Trying to add result beyond cycle limit!`);
      console.error(`Position: ${userCycle.currentPosition}, Max: ${this.maxGames}`);
      return; // Don't add the result
    }
    
    // Add to history and advance position
    userCycle.gameHistory.push(actualResult);
    userCycle.currentPosition++;
    
    const currentWins = userCycle.gameHistory.filter(r => r === 'win').length;
    const currentLosses = userCycle.gameHistory.filter(r => r === 'lose').length;
    
    console.log(`After: Position ${userCycle.currentPosition}, History length: ${userCycle.gameHistory.length}`);
    console.log(`Current totals: ${currentWins} wins, ${currentLosses} losses`);
    console.log(`Expected pattern result was: ${userCycle.cyclePattern[userCycle.currentPosition - 1]}`);
    console.log(`Actual result was: ${actualResult}`);
    
    // CRITICAL: Check for immediate corruption
    if (currentWins > this.maxWins) {
      console.error(`❌ CORRUPTION: Too many wins! ${currentWins}/${this.maxWins}`);
      this.resetUser(userId);
      return;
    }
    
    if (currentLosses > this.maxLosses) {
      console.error(`❌ CORRUPTION: Too many losses! ${currentLosses}/${this.maxLosses}`);
      this.resetUser(userId);
      return;
    }
      // Validate pattern consistency - this should ALWAYS match now
    if (userCycle.cyclePattern[userCycle.currentPosition - 1] !== actualResult) {
      console.error(`🚨 CRITICAL ERROR: Result ${actualResult} doesn't match pattern ${userCycle.cyclePattern[userCycle.currentPosition - 1]}`);
      console.error(`This should NEVER happen! The controller logic is broken!`);
      console.error(`Position: ${userCycle.currentPosition - 1}, Pattern:`, userCycle.cyclePattern);
      console.error(`History:`, userCycle.gameHistory);
    } else {
      console.log(`✅ Pattern consistency verified: ${actualResult} matches expected`);
    }
      // Track pattern adherence (should always be 100% now)
    const adherenceStats = this.trackPatternAdherence(userId, userCycle.cyclePattern[userCycle.currentPosition - 1], actualResult);
    if (adherenceStats.deviations > 0) {
      console.error(`🚨 Pattern adherence failure! Deviations: ${adherenceStats.deviations}/${adherenceStats.totalGames}`);
    }
    
    // Check if cycle is complete
    if (userCycle.currentPosition === this.maxGames) {
      console.log(`\n🏁 CYCLE COMPLETE for user ${userId}:`);
      console.log(`Final: ${currentWins} wins, ${currentLosses} losses`);
      console.log(`Pattern was:`, userCycle.cyclePattern);
      console.log(`History was:`, userCycle.gameHistory);
      console.log(`Pattern vs History match:`, 
        userCycle.cyclePattern.every((p, i) => p === userCycle.gameHistory[i]));
      
      if (currentWins !== this.maxWins || currentLosses !== this.maxLosses) {
        console.error(`❌ ERROR: Invalid cycle! Expected ${this.maxWins}W/${this.maxLosses}L, got ${currentWins}W/${currentLosses}L`);      } else {
        console.log(`✅ Cycle completed successfully with correct ${this.maxWins}W/${this.maxLosses}L ratio`);
      }
    }
    
    console.log(`=== END ADDING RESULT ===\n`);
  }

  // Track pattern adherence
  trackPatternAdherence(userId, expectedResult, actualResult) {
    const userCycle = this.getUserCycle(userId);
    
    if (!userCycle.patternAdherence) {
      userCycle.patternAdherence = {
        deviations: 0,
        totalGames: 0
      };
    }
    
    userCycle.patternAdherence.totalGames++;
    
    if (expectedResult !== actualResult) {
      userCycle.patternAdherence.deviations++;
      console.log(`📊 Pattern deviation ${userCycle.patternAdherence.deviations}/${userCycle.patternAdherence.totalGames} for user ${userId}`);
        // If too many deviations, warn about ratio breaking
      if (userCycle.patternAdherence.deviations > 2) {
        console.warn(`🚨 High pattern deviation for user ${userId}! This may break the 5:7 ratio.`);
      }
    }
    
    return {
      deviations: userCycle.patternAdherence.deviations,
      totalGames: userCycle.patternAdherence.totalGames,
      adherenceRate: ((userCycle.patternAdherence.totalGames - userCycle.patternAdherence.deviations) / userCycle.patternAdherence.totalGames * 100).toFixed(1)
    };
  }

  // Get user's current state for debugging
  getUserState(userId) {
    const userCycle = this.getUserCycle(userId);
    const currentWins = userCycle.gameHistory.filter(r => r === 'win').length;
    const currentLosses = userCycle.gameHistory.filter(r => r === 'lose').length;
    
    return {
      gamesPlayed: userCycle.currentPosition,
      currentWins,
      currentLosses,
      remainingWins: this.maxWins - currentWins,
      remainingLosses: this.maxLosses - currentLosses,
      gameHistory: userCycle.gameHistory,
      pattern: userCycle.cyclePattern,
      cycleComplete: userCycle.currentPosition >= this.maxGames
    };
  }

  // Reset a specific user's cycle
  resetUser(userId) {
    this.userCycles.delete(userId);
    console.log(`🔄 Reset user ${userId}`);
  }

  // Force reset all users (for fixing corruption)
  resetAllUsers() {
    console.log(`🔄 FORCE RESET: Clearing all user cycles`);
    this.userCycles.clear();
  }

  // Validate and fix any corrupted user cycle
  validateAndFixUser(userId) {
    const userCycle = this.getUserCycle(userId);
    const currentWins = userCycle.gameHistory.filter(r => r === 'win').length;
    const currentLosses = userCycle.gameHistory.filter(r => r === 'lose').length;
    const totalGames = userCycle.gameHistory.length;
    
    console.log(`\n=== VALIDATING USER ${userId} ===`);
    console.log(`Current state: ${currentWins}W/${currentLosses}L in ${totalGames} games`);
    console.log(`Position: ${userCycle.currentPosition}`);
    
    let needsReset = false;
    
    // Check for various corruption scenarios
    if (currentWins > this.maxWins) {
      console.log(`❌ Too many wins: ${currentWins}/${this.maxWins}`);
      needsReset = true;
    }
    
    if (currentLosses > this.maxLosses) {
      console.log(`❌ Too many losses: ${currentLosses}/${this.maxLosses}`);
      needsReset = true;
    }
    
    if (totalGames > this.maxGames) {
      console.log(`❌ Too many games: ${totalGames}/${this.maxGames}`);
      needsReset = true;
    }
    
    if (userCycle.currentPosition !== totalGames) {
      console.log(`❌ Position mismatch: position=${userCycle.currentPosition}, history=${totalGames}`);
      needsReset = true;
    }
    
    if (userCycle.cyclePattern.length !== this.maxGames) {
      console.log(`❌ Pattern length wrong: ${userCycle.cyclePattern.length}/${this.maxGames}`);
      needsReset = true;
    }
    
    if (needsReset) {
      console.log(`🔧 FIXING: Resetting corrupted user ${userId}`);
      this.resetUser(userId);
      return true; // User was reset
    } else {
      console.log(`✅ User ${userId} is valid`);
      return false; // User is valid
    }
  }

  // Get cycle validation info
  getCycleStats(userId) {
    const userCycle = this.getUserCycle(userId);
    const currentWins = userCycle.gameHistory.filter(r => r === 'win').length;
    const currentLosses = userCycle.gameHistory.filter(r => r === 'lose').length;
    
    return {
      expectedWins: this.maxWins,
      expectedLosses: this.maxLosses,
      currentWins,
      currentLosses,
      remainingWins: this.maxWins - currentWins,
      remainingLosses: this.maxLosses - currentLosses,
      isValid: (currentWins <= this.maxWins && currentLosses <= this.maxLosses),
      gameHistory: userCycle.gameHistory,
      pattern: userCycle.cyclePattern,
      position: userCycle.currentPosition
    };
  }
}

module.exports = new GameState();
