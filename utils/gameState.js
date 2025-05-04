class GameState {
    constructor() {
      this.games = [];
      this.maxGames = 12;
      this.maxWins = 5;
    }
  
    canWin() {
      const wins = this.games.filter(result => result === 'win').length;
      return wins < this.maxWins;
    }
  
    addResult(result) {
      if (this.games.length >= this.maxGames) {
        this.games.shift();
      }
      this.games.push(result);
    }
  
    getRandomResult() {
      const totalGames = this.games.length;
      const currentWins = this.games.filter(result => result === 'win').length;
      
      // Force lose if max wins reached
      if (currentWins >= this.maxWins) {
        return 'lose';
      }
      
      // Force win if remaining games equal remaining required wins
      const remainingGames = this.maxGames - totalGames;
      const requiredWins = this.maxWins - currentWins;
      if (remainingGames === requiredWins) {
        return 'win';
      }
  
      // Otherwise randomize with weighted probability
      return Math.random() < (this.maxWins / this.maxGames) ? 'win' : 'lose';
    }
  }
  
  module.exports = new GameState();