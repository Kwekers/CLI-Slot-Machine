const prompt = require('prompt-sync')();

// 3x3 slot machine
const ROW = 3;
const COL = 3;

// Symbol
const symbolProbability = {
    '🍒': 80,
    '🍇': 40,
    '🍉': 20,
    '🔔': 10,
    '💎': 5
};

const symbolValues = {
    '🍒': 5,
    '🍇': 10,
    '🍉': 20,
    '🔔': 50,
    '💎': 100
}

// add balance to machine
const addBalance = () => {
    while (true) {
        const balance = prompt('Enter your deposit amount: ');
        const numberOfBalance = parseFloat(balance);

        if (isNaN(numberOfBalance) || numberOfBalance < 1) {
            console.log('Invalid input! Please enter a valid positive number.');
        } else {
            return numberOfBalance;
        }

    }
}

// betting Lines
const getPayLines = () => {
    while (true) {
        const lines = prompt('Enter the number of pay lines you want to play (1-5): ');
        const numberOfLines = parseFloat(lines);

        if (isNaN(numberOfLines) || numberOfLines < 1 || numberOfLines > 5) {
            console.log('Invalid input! Please enter a valid positive number.');
        } else {
            return numberOfLines;
        }
    }
}

// bet per line
const getBet = (balance, lines) => {
    while (true) {
        const bet = prompt('Enter your bet per line: ');
        const numberOfBet = parseFloat(bet);

        if (isNaN(numberOfBet) || numberOfBet < 1) {
            console.log('Invalid input!');
        } else if (numberOfBet > balance / lines) {
            console.log('Your balance is not Enough')
        } else {
            const bettingLines = betLine(lines);
            return { numberOfBet, bettingLines };
        }
    }
}

const betLine = (lines) => {
    const lineOfBet = new Set();
    if (lines !== 5) {
        console.log(`Enter ${lines} line you want to bet (1-5): `);
        while (lineOfBet.size < lines) {
            const line = prompt(`Line No.${lineOfBet.size + 1}: `);

            if (isNaN(line) || line > 5 || line < 1) {
                console.log("Invalid line number. Please enter a number between 1 and 5.");
            } else if (lineOfBet.has(line)) {
                console.log("You have already bet on this line. Please choose a different line.");
            } else {
                lineOfBet.add(line);
            }
        }

        return Array.from(lineOfBet);
    } else {
        return [1, 2, 3, 4, 5];
    }
}

// spin the reels
const spin = () => {
    const symbols = [];
    for (const [symbol, count] of Object.entries(symbolProbability)) {
        for (let i = 0; i < count; i++) {
            symbols.push(symbol);
        }
    }

    const reels = [];
    for (let i = 0; i < COL; i++) {
        reels.push([]);
        const reelSymbols = [...symbols];
        for (let j = 0; j < ROW; j++) {
            const randomIndex = Math.floor(Math.random() * reelSymbols.length);
            const selectedSymbol = reelSymbols[randomIndex];
            reels[i].push(selectedSymbol);
            reelSymbols.splice(randomIndex, 1);
        }
    }

    return reels;
}

// tranpose the reels
const transpose = (reels) => {
    const rows = [];

    for (let i = 0; i < ROW; i++) {
        rows.push([]);
        for (let j = 0; j < COL; j++) {
            rows[i].push(reels[j][i]);
        }
    }

    return rows;
}

const printRows = (rows) => {
    for (const row of rows) {
        let rowString = '';
        for (const [i, symbol] of row.entries()) {
            rowString += symbol;
            if (i != row.length - 1) {
                rowString += ' | ';
            }
        }
        console.log(rowString);
    }
}

const checkWinning = (rows, bet, lines) => {
    let winnings = 0;
    // horizontal
    for (let i = 0; i < rows.length; i++) {
        if (!allSame(rows[i])) {
            continue;
        }

        if (lines.includes(i)) {
            winnings += bet * symbolValues[rows[i][0]];
        }
    }
    // diagonal
    const mainDiagonal = [rows[0][0], rows[1][1], rows[2][2]];
    const antiDiagonal = [rows[0][2], rows[1][1], rows[2][0]];

    if (allSame(mainDiagonal)) {
        if (lines.includes(4)) {
            winnings += bet * symbolValues[rows[1][1]];
        }
    }

    if (allSame(antiDiagonal)) {
        if (lines.includes(5)) {
            winnings += bet * symbolValues[rows[1][1]];
        }
    }

    return winnings;
}

const allSame = (arr) => arr.every(value => value === arr[0]);


(function() {
    let balance = addBalance();

    while (true) {
        console.log(`You have a balance of \$${balance}`);
        const bettingLine = getPayLines();
        const { numberOfBet: bet, bettingLines: lines } = getBet(balance, bettingLine);
        balance -= bet * lines.length;

        const reels = spin();
        const rows = transpose(reels);
        printRows(rows);
        const winnings = checkWinning(rows, bet, lines);
        balance += winnings;
        console.log("You won, $" + winnings.toString());

        if (balance <= 0) {
            console.log("You ran out of money!");
            break;
        }

        const playAgain = prompt("Do you want to play again (y/n)? ");

        if (playAgain != "y") break;
    }
})();