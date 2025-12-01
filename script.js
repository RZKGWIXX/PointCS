// Game State
let gameState = {
    balance: 1000,
    selectedNumber: null,
    selectedCup: null,
    selectedDifficulty: null,
    selectedRisk: null,
    rows: 8,
    ballPath: [],
    winningCup: null
};

// Initialize balance on page load
document.addEventListener('DOMContentLoaded', () => {
    updateBalance();
    loadBalance();
});

// Open game modal
function openGameModal(game) {
    const modal = document.getElementById('gameModal');
    const guessGame = document.getElementById('guessNumberGame');
    const cupsGame = document.getElementById('cupsGame');
    const plinkoGame = document.getElementById('plinkoGame');

    // Hide all games
    guessGame.style.display = 'none';
    cupsGame.style.display = 'none';
    plinkoGame.style.display = 'none';

    // Reset selections
    gameState.selectedNumber = null;
    gameState.selectedCup = null;
    gameState.selectedDifficulty = null;
    gameState.selectedRisk = null;
    gameState.winningCup = null;
    resetButtonStates();

    // Show selected game
    if (game === 'guessNumber') {
        guessGame.style.display = 'block';
    } else if (game === 'cups') {
        cupsGame.style.display = 'block';
        // Hide selection section until difficulty is chosen
        document.getElementById('cupsSelectionSection').style.display = 'none';
    } else if (game === 'plinko') {
        plinkoGame.style.display = 'block';
    }

    modal.style.display = 'block';
}

// Close modal
function closeGameModal() {
    document.getElementById('gameModal').style.display = 'none';
    clearResults();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('gameModal');
    if (event.target == modal) {
        modal.style.display = 'none';
        clearResults();
    }
}

// ===== GUESS NUMBER GAME =====
function selectNumber(num) {
    gameState.selectedNumber = num;
    
    // Update button styles
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Update display
    document.getElementById('selectedNum').textContent = num;
}

function playGuessNumber() {
    const bet = parseInt(document.getElementById('guessBet').value);
    
    // Validation
    if (bet < 10 || bet > gameState.balance) {
        showResult('guessResult', 'Невалідна ставка!', 'lose');
        return;
    }
    
    if (gameState.selectedNumber === null) {
        showResult('guessResult', 'Виберіть число!', 'lose');
        return;
    }
    
    // Generate random number
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    
    // Check result
    if (randomNumber === gameState.selectedNumber) {
        const winAmount = bet * 2;
        gameState.balance += winAmount;
        showResult('guessResult', `🎉 Ви виграли! +${winAmount} балів (число було ${randomNumber})`, 'win');
    } else {
        gameState.balance -= bet;
        showResult('guessResult', `❌ Ви програли (число було ${randomNumber})`, 'lose');
    }
    
    updateBalance();
}
// ===== CUPS GAME =====
function selectDifficulty(diff) {
    gameState.selectedDifficulty = diff;
    
    // Update button styles
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Update display
    const diffLabels = { easy: 'Легко', medium: 'Середній', hard: 'Складно' };
    document.getElementById('selectedDiff').textContent = diffLabels[diff];
    
    // Clear previous result
    document.getElementById('cupsResult').textContent = '';
    document.getElementById('cupsResult').className = 'result-message';
    
    // Reset cup selection
    gameState.selectedCup = null;
    document.getElementById('selectedCup').textContent = '-';
    document.querySelectorAll('.cups-container .cup').forEach(cup => {
        cup.classList.remove('selected');
    });
    
    // Randomly pick which cup has the ball (1-3)
    gameState.winningCup = Math.floor(Math.random() * 3) + 1;
    
    // Show animation
    startCupsAnimation();
}

function startCupsAnimation() {
    const animationEl = document.querySelector('.cups-animation');
    const shufflingText = document.getElementById('shufflingText');
    const selectionSection = document.getElementById('cupsSelectionSection');
    const cupItems = document.querySelectorAll('.cups-animation .cup-item');
    
    // Hide selection section during animation
    selectionSection.style.display = 'none';
    shufflingText.style.display = 'block';
    
    // Initially SHOW the ball - visible for 1 second
    updateCupsDisplay([
        gameState.winningCup === 1,
        gameState.winningCup === 2,
        gameState.winningCup === 3
    ]);
    
    animationEl.style.display = 'flex';
    
    // Duration based on difficulty
    const durations = { easy: 1.5, medium: 2.5, hard: 4 };
    const duration = durations[gameState.selectedDifficulty];
    
    // Hide ball after 1 second, then start shuffling
    setTimeout(() => {
        updateCupsDisplay([false, false, false]); // Hide ball
        performCupsShuffling(duration * 1000 - 1000); // Remaining duration for shuffling
    }, 1000);
    
    // Hide animation after total duration and show selection
    setTimeout(() => {
        animationEl.style.display = 'none';
        shufflingText.style.display = 'none';
        // Reset cups display back to normal
        cupItems.forEach(item => {
            item.textContent = '🥤';
            item.style.transform = 'none';
        });
        // Show the selection section
        selectionSection.style.display = 'block';
    }, duration * 1000);
}

function performCupsShuffling(duration) {
    const cupItems = document.querySelectorAll('.cups-animation .cup-item');
    const swapInterval = 500; // Swap every 500ms for smoother animation
    const numSwaps = Math.floor(duration / swapInterval);
    
    // Track which position has the ball (0, 1, or 2 for array indexing)
    let ballPosition = gameState.winningCup - 1; // Convert to 0-based index
    
    for (let i = 0; i < numSwaps; i++) {
        setTimeout(() => {
            // Pick two adjacent or nearby positions to swap for more natural movement
            let pos1, pos2;
            const rand = Math.random();
            
            if (rand < 0.5) {
                pos1 = 0; pos2 = 1; // Swap left and middle (50%)
            } else if (rand < 0.85) {
                pos1 = 1; pos2 = 2; // Swap middle and right (35%)
            } else {
                pos1 = 0; pos2 = 2; // Swap left and right (15%)
            }
            
            // Animate cups smoothly swapping positions
            swapCupsWithAnimation(cupItems, pos1, pos2);
            
            // Track where the ball moved
            if (ballPosition === pos1) {
                ballPosition = pos2;
            } else if (ballPosition === pos2) {
                ballPosition = pos1;
            }
        }, (i + 1) * swapInterval);
    }
    
    // Update winning cup at the end
    setTimeout(() => {
        gameState.winningCup = ballPosition + 1; // Convert back to 1-based
    }, numSwaps * swapInterval);
}

function swapCupsWithAnimation(cupItems, pos1, pos2) {
    // Smoothly swap cups by moving them to each other's positions
    const cup1 = cupItems[pos1];
    const cup2 = cupItems[pos2];
    
    // Get container info for position calculation
    const container = cup1.parentElement;
    const containerWidth = container.offsetWidth;
    const spacing = containerWidth / 3; // Width per cup slot
    
    // Calculate the distance between positions
    const distance = (pos2 - pos1) * spacing;
    
    // Swap content
    const temp = cup1.textContent;
    cup1.textContent = cup2.textContent;
    cup2.textContent = temp;
    
    // Animate smooth movement with ease-in-out timing
    cup1.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    cup2.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Move cups to swap positions
    cup1.style.transform = `translateX(${distance}px)`;
    cup2.style.transform = `translateX(${-distance}px)`;
    
    // Reset transform after animation
    setTimeout(() => {
        cup1.style.transform = 'none';
        cup2.style.transform = 'none';
        cup1.style.transition = 'none';
        cup2.style.transition = 'none';
    }, 500);
}

function updateCupsDisplay(hasBall) {
    const cupItems = document.querySelectorAll('.cups-animation .cup-item');
    cupItems.forEach((item, index) => {
        if (hasBall[index]) {
            item.textContent = '🥤⚪'; // Cup with ball
        } else {
            item.textContent = '🥤'; // Empty cup
        }
    });
}

function selectCup(cup) {
    gameState.selectedCup = cup;
    
    // Update cup styles
    document.querySelectorAll('.cups-container .cup').forEach((c, index) => {
        c.classList.remove('selected');
        if (index + 1 === cup) {
            c.classList.add('selected');
        }
    });
    
    // Update display
    document.getElementById('selectedCup').textContent = cup;
}

function playCups() {
    const bet = parseInt(document.getElementById('cupsBet').value);
    
    // Validation
    if (bet < 10 || bet > gameState.balance) {
        showResult('cupsResult', 'Невалідна ставка!', 'lose');
        return;
    }
    
    if (gameState.selectedDifficulty === null) {
        showResult('cupsResult', 'Виберіть складність!', 'lose');
        return;
    }
    
    if (gameState.selectedCup === null) {
        showResult('cupsResult', 'Виберіть стакан!', 'lose');
        return;
    }
    
    if (gameState.winningCup === null) {
        showResult('cupsResult', 'Спочатку виберіть складність!', 'lose');
        return;
    }
    
    // Use the winning cup that was determined when difficulty was selected
    const winningCup = gameState.winningCup;
    
    // Reveal cups immediately (animation is already done)
    revealCups(winningCup, gameState.selectedCup, bet);
}

function revealCups(winningCup, selectedCup, bet) {
    const cupElements = document.querySelectorAll('.cups-container .cup');
    
    // Animate cups lifting - stagger them
    cupElements.forEach((cup, index) => {
        setTimeout(() => {
            cup.classList.add('lifting');
            
            // After lift animation, show ball or empty
            setTimeout(() => {
                const cupNumber = index + 1;
                if (cupNumber === winningCup) {
                    cup.textContent = '🥤⚪'; // Cup with ball
                } else {
                    cup.textContent = '🥤'; // Empty cup
                }
            }, 500); // Mid-animation reveal
        }, index * 150); // Stagger by 150ms
    });
    
    // After all cups are revealed, calculate result
    setTimeout(() => {
        let resultMessage = '';
        let winAmount = 0;
        
        if (winningCup === selectedCup) {
            // Won!
            const multipliers = { easy: 2.5, medium: 2.5, hard: 3.5 };
            const multiplier = multipliers[gameState.selectedDifficulty];
            winAmount = Math.floor(bet * multiplier);
            gameState.balance += winAmount;
            resultMessage = `🎉 Ви виграли! +${winAmount} балів (множник ${multiplier}x)`;
            showResult('cupsResult', resultMessage, 'win');
        } else {
            // Lost
            gameState.balance -= bet;
            resultMessage = `❌ Ви програли! -${bet} балів (м'яч був під стаканом ${winningCup})`;
            showResult('cupsResult', resultMessage, 'lose');
        }
        
        updateBalance();
    }, 1200); // Total time for staggered reveals + calculation
}

// ===== PLINKO GAME =====
function updateRows(value) {
    gameState.rows = parseInt(value);
    document.getElementById('rowsValue').textContent = value;
}

function selectRisk(risk) {
    gameState.selectedRisk = risk;
    
    // Update button styles
    document.querySelectorAll('.risk-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Update display
    const riskLabels = { low: 'Низький', medium: 'Середній', high: 'Високий' };
    document.getElementById('selectedRisk').textContent = riskLabels[risk];
}

function playPlinko() {
    const bet = parseInt(document.getElementById('plinkoBet').value);
    
    // Validation
    if (bet < 10 || bet > gameState.balance) {
        showResult('plinkoResult', 'Невалідна ставка!', 'lose');
        return;
    }
    
    if (gameState.selectedRisk === null) {
        showResult('plinkoResult', 'Виберіть ризик!', 'lose');
        return;
    }
    
    // Draw the board
    drawPlinkoBoard();
    
    // Simulate the ball with realistic physics and get path
    setTimeout(() => {
        const simulationResult = simulatePlinkoPhysics();
        const finalBucket = simulationResult.bucket;
        const ballPath = simulationResult.path;
        
        // Animate ball falling through path
        animateBallPath(ballPath, () => {
            // After animation, get the multiplier from the bucket
            const bucketElements = document.querySelectorAll('.plinko-bucket');
            const bucketElement = bucketElements[finalBucket];
            const bucketMultiplier = parseFloat(bucketElement.getAttribute('data-multiplier'));
            
            // Calculate payout based on actual multiplier
            let resultMessage = '';
            let winAmount = 0;
            let isWin = false;
            
            if (bucketMultiplier >= 1) {
                isWin = true;
                winAmount = Math.floor(bet * bucketMultiplier);
                gameState.balance += winAmount;
                resultMessage = `🎉 Ви виграли! +${winAmount} балів (множник ${bucketMultiplier}x в бакеті ${finalBucket + 1})`;
            } else {
                winAmount = Math.floor(bet * bucketMultiplier);
                gameState.balance -= (bet - winAmount);
                resultMessage = `❌ Ви програли! -${bet - winAmount} балів (множник ${bucketMultiplier}x в бакеті ${finalBucket + 1})`;
            }
            
            showResult('plinkoResult', resultMessage, isWin ? 'win' : 'lose');
            updateBalance();
        });
    }, 100);
}

function animateBallPath(path, callback) {
    const ball = document.querySelector('.plinko-ball');
    if (!ball) {
        callback();
        return;
    }
    
    const board = document.getElementById('plinkoBoard');
    const startX = board.clientWidth / 2 - 10;
    const startY = 10;
    
    // Animate through the path
    let step = 0;
    const stepsCount = path.length;
    const animationDuration = 3000; // 3 seconds total
    const stepDuration = animationDuration / stepsCount;
    
    function animateStep() {
        if (step < stepsCount) {
            const progress = step / stepsCount;
            const pathData = path[step];
            
            ball.style.left = pathData.x + 'px';
            ball.style.top = pathData.y + 'px';
            
            step++;
            setTimeout(animateStep, stepDuration);
        } else {
            callback();
        }
    }
    
    animateStep();
}

function drawPlinkoBoard() {
    const board = document.getElementById('plinkoBoard');
    board.innerHTML = '';
    
    const rows = gameState.rows;
    const width = board.clientWidth;
    const height = 250;
    
    // Draw pegs - SAME CALCULATION AS PHYSICS
    for (let row = 0; row < rows; row++) {
        const pegsInRow = row + 1;
        const rowY = 10 + (row * height / rows);
        const rowSpacing = (width - 40) / (pegsInRow + 1);
        
        for (let i = 0; i < pegsInRow; i++) {
            const pegX = 20 + rowSpacing + (i * rowSpacing);
            
            const peg_el = document.createElement('div');
            peg_el.className = 'plinko-peg';
            peg_el.style.left = (pegX - 6) + 'px'; // -6 for peg radius
            peg_el.style.top = (rowY - 6) + 'px'; // -6 for peg radius
            board.appendChild(peg_el);
        }
    }
    
    // Calculate bucket multipliers based on risk and rows
    const bucketCount = rows + 1;
    const bucketWidth = width / bucketCount;
    const riskMultipliers = { low: 1.2, medium: 1.5, high: 2.0 };
    const riskMult = riskMultipliers[gameState.selectedRisk];
    
    // Draw buckets with multipliers
    for (let i = 0; i < bucketCount; i++) {
        // Distance from center (normalized 0-1)
        const distanceFromCenter = Math.abs(i - (bucketCount - 1) / 2) / ((bucketCount - 1) / 2);
        
        // Base multiplier: center is 0.5x, edges are higher
        const baseMultiplier = 0.5 + (distanceFromCenter * (2 + rows * 0.1));
        const finalMultiplier = baseMultiplier * riskMult;
        
        const bucket = document.createElement('div');
        bucket.className = 'plinko-bucket';
        bucket.style.width = (bucketWidth - 10) + 'px';
        bucket.style.left = (i * bucketWidth + 5) + 'px';
        bucket.style.backgroundColor = getMultiplierColor(finalMultiplier);
        bucket.innerHTML = `<span class="bucket-multiplier">${finalMultiplier.toFixed(2)}x</span>`;
        bucket.setAttribute('data-multiplier', finalMultiplier.toFixed(2));
        board.appendChild(bucket);
    }
    
    // Draw ball
    const ball = document.createElement('div');
    ball.className = 'plinko-ball';
    ball.style.left = (width / 2 - 8) + 'px'; // -8 for ball radius
    ball.style.top = '10px';
    board.appendChild(ball);
}

function getMultiplierColor(multiplier) {
    // Color gradient based on multiplier value
    if (multiplier < 1) {
        return 'rgba(244, 67, 54, 0.3)'; // Red - lose
    } else if (multiplier < 1.5) {
        return 'rgba(255, 193, 7, 0.3)'; // Yellow - low win
    } else if (multiplier < 2.5) {
        return 'rgba(76, 175, 80, 0.3)'; // Green - medium win
    } else {
        return 'rgba(63, 81, 181, 0.3)'; // Blue - high win
    }
}

function simulatePlinkoPhysics() {
    const rows = gameState.rows;
    const board = document.getElementById('plinkoBoard');
    const width = board.clientWidth;
    const height = 250;
    
    // Physics constants
    const gravity = 0.3;
    const friction = 0.99;
    const pegRadius = 7;
    const ballRadius = 8;
    const dt = 0.016; // ~60 FPS
    
    // Ball state
    let ball = {
        x: width / 2,
        y: 10,
        vx: (Math.random() - 0.5) * 0.3,
        vy: 0
    };
    
    // Collect peg positions
    const pegs = [];
    for (let row = 0; row < rows; row++) {
        const pegsInRow = row + 1;
        const rowY = 10 + (row * height / rows);
        const rowSpacing = (width - 40) / (pegsInRow + 1);
        
        for (let i = 0; i < pegsInRow; i++) {
            const pegX = 20 + rowSpacing + (i * rowSpacing);
            pegs.push({
                x: pegX,
                y: rowY,
                radius: pegRadius
            });
        }
    }
    
    // Animation path
    const path = [{ x: ball.x - ballRadius, y: ball.y }];
    
    // Simulation
    let maxIterations = 5000; // Prevent infinite loops
    let iteration = 0;
    
    while (ball.y < height - 30 && iteration < maxIterations) {
        iteration++;
        
        // Apply gravity
        ball.vy += gravity;
        
        // Apply friction (damping)
        ball.vx *= friction;
        
        // Store old position for collision detection
        const oldX = ball.x;
        const oldY = ball.y;
        
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;
        
        // Boundary collisions
        if (ball.x - ballRadius < 10) {
            ball.x = 10 + ballRadius;
            ball.vx = -ball.vx * 0.7;
        }
        if (ball.x + ballRadius > width - 10) {
            ball.x = width - 10 - ballRadius;
            ball.vx = -ball.vx * 0.7;
        }
        
        // Peg collisions
        for (let peg of pegs) {
            // Vector from peg to ball
            const dx = ball.x - peg.x;
            const dy = ball.y - peg.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ballRadius + pegRadius;
            
            if (distance < minDistance) {
                // Normalize collision vector
                const nx = dx / distance;
                const ny = dy / distance;
                
                // Separate ball from peg
                const overlap = minDistance - distance;
                ball.x += nx * overlap;
                ball.y += ny * overlap;
                
                // Velocity relative to peg (peg is stationary)
                let relVx = ball.vx;
                let relVy = ball.vy;
                
                // Dot product of velocity and collision normal
                const dotProduct = relVx * nx + relVy * ny;
                
                // Only bounce if moving towards peg
                if (dotProduct < 0) {
                    const riskBounceFactor = { low: 0.6, medium: 0.75, high: 0.9 };
                    const bounceFactor = riskBounceFactor[gameState.selectedRisk];
                    
                    // Bounce velocity (elastic collision with energy loss)
                    const bounceX = dotProduct * nx;
                    const bounceY = dotProduct * ny;
                    
                    ball.vx = (relVx - 2 * bounceX) * bounceFactor;
                    ball.vy = (relVy - 2 * bounceY) * bounceFactor;
                    
                    // Add small random perturbation
                    const randomAmplitude = { low: 0.05, medium: 0.1, high: 0.15 };
                    ball.vx += (Math.random() - 0.5) * randomAmplitude[gameState.selectedRisk];
                    ball.vy += (Math.random() - 0.5) * randomAmplitude[gameState.selectedRisk];
                }
            }
        }
        
        // Terminal velocity
        ball.vy = Math.min(ball.vy, 8);
        
        // Record path every few iterations for smoother animation
        if (iteration % 3 === 0) {
            path.push({ x: ball.x - ballRadius, y: ball.y });
        }
    }
    
    // Final position in bucket
    ball.y = height - 32;
    path.push({ x: ball.x - ballRadius, y: ball.y });
    
    // Determine bucket - ensure ball is within bounds
    ball.x = Math.max(8, Math.min(width - 8, ball.x));
    const bucketCount = rows + 1;
    const bucketWidth = width / bucketCount;
    let bucketIndex = Math.floor(ball.x / bucketWidth);
    bucketIndex = Math.max(0, Math.min(bucketCount - 1, bucketIndex));
    
    return {
        bucket: bucketIndex,
        path: path,
        finalX: ball.x
    };
}

// ===== HELPER FUNCTIONS =====
function showResult(elementId, message, type) {
    const resultEl = document.getElementById(elementId);
    resultEl.textContent = message;
    resultEl.className = 'result-message ' + type;
}

function clearResults() {
    document.querySelectorAll('.result-message').forEach(el => {
        el.textContent = '';
        el.className = 'result-message';
    });
}

function resetButtonStates() {
    document.querySelectorAll('.number-btn, .difficulty-btn, .risk-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelectorAll('.cups-container .cup').forEach(cup => {
        cup.classList.remove('selected');
    });
    document.getElementById('selectedNum').textContent = '-';
    document.getElementById('selectedDiff').textContent = '-';
    document.getElementById('selectedCup').textContent = '-';
    document.getElementById('selectedRisk').textContent = '-';
}

function updateBalance() {
    // Update header balance
    document.querySelector('.points-value').textContent = gameState.balance;
    
    // Update max bet info
    document.getElementById('maxBet').textContent = gameState.balance;
    document.getElementById('maxBet2').textContent = gameState.balance;
    document.getElementById('maxBet3').textContent = gameState.balance;
    
    // Save to localStorage
    localStorage.setItem('casinoBalance', gameState.balance);
    
    // Send to backend
    fetch('/api/update-balance', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ points: gameState.balance })
    }).catch(err => console.log('Backend update:', err));
}

function loadBalance() {
    // Try to load from localStorage
    const savedBalance = localStorage.getItem('casinoBalance');
    if (savedBalance) {
        gameState.balance = parseInt(savedBalance);
        updateBalance();
    }
    
    // Try to load from backend
    fetch('/api/balance')
        .then(res => res.json())
        .then(data => {
            if (data.points) {
                gameState.balance = data.points;
                updateBalance();
            }
        })
        .catch(err => console.log('Backend load:', err));
}