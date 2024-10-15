import React, { useState, useEffect, useCallback } from 'react';
import styles from '../styles/BlockPuzzle.module.css';

const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const INITIAL_FALL_SPEED = 1000; // 1 second

const SHAPES = [
    [[1, 1, 1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1, 1], [0, 1, 0]],
    [[1, 1, 0], [0, 1, 1]],
    [[0, 1, 1], [1, 1, 0]]
];

const COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

const BlockPuzzle = () => {
    const [grid, setGrid] = useState(Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0)));
    const [currentPiece, setCurrentPiece] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [cellSize, setCellSize] = useState(30);

    const createPiece = useCallback(() => {
        const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const x = Math.floor((GRID_WIDTH - shape[0].length) / 2);
        const y = 0;
        return { shape, color, x, y };
    }, []);

    const isValidMove = useCallback((piece, gridToCheck) => {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x;
                    const newY = piece.y + y;
                    if (newX < 0 || newX >= GRID_WIDTH || newY >= GRID_HEIGHT || (newY >= 0 && gridToCheck[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }, []);

    const checkLines = useCallback(() => {
        let linesCleared = 0;
        const newGrid = grid.filter(row => {
            if (row.every(cell => cell !== 0)) {
                linesCleared++;
                return false;
            }
            return true;
        });

        while (newGrid.length < GRID_HEIGHT) {
            newGrid.unshift(Array(GRID_WIDTH).fill(0));
        }

        if (linesCleared > 0) {
            setGrid(newGrid);
            setScore(prevScore => prevScore + linesCleared * 100);
        }
    }, [grid]);

    const mergePieceToGrid = useCallback((piece) => {
        const newGrid = grid.map(row => [...row]);
        piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    newGrid[piece.y + y][piece.x + x] = piece.color;
                }
            });
        });
        setGrid(newGrid);
        checkLines();
    }, [grid, checkLines]);

    const moveDown = useCallback(() => {
        if (!currentPiece) return;
        const newPiece = { ...currentPiece, y: currentPiece.y + 1 };
        if (isValidMove(newPiece, grid)) {
            setCurrentPiece(newPiece);
        } else {
            mergePieceToGrid(currentPiece);
            setCurrentPiece(null);
        }
    }, [currentPiece, grid, isValidMove, mergePieceToGrid]);

    const moveHorizontally = useCallback((direction) => {
        if (!currentPiece) return;
        const newPiece = { ...currentPiece, x: currentPiece.x + direction };
        if (isValidMove(newPiece, grid)) {
            setCurrentPiece(newPiece);
        }
    }, [currentPiece, grid, isValidMove]);

    const rotate = useCallback(() => {
        if (!currentPiece) return;
        const newShape = currentPiece.shape[0].map((_, index) =>
            currentPiece.shape.map(row => row[index]).reverse()
        );
        const newPiece = { ...currentPiece, shape: newShape };
        if (isValidMove(newPiece, grid)) {
            setCurrentPiece(newPiece);
        }
    }, [currentPiece, grid, isValidMove]);

    const handleKeyPress = useCallback((event) => {
        if (gameOver) return;
        switch (event.key) {
            case 'ArrowLeft':
                moveHorizontally(-1);
                break;
            case 'ArrowRight':
                moveHorizontally(1);
                break;
            case 'ArrowDown':
                moveDown();
                break;
            case 'ArrowUp':
                rotate();
                break;
        }
    }, [gameOver, moveHorizontally, moveDown, rotate]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    useEffect(() => {
        if (!currentPiece && !gameOver) {
            const newPiece = createPiece();
            if (isValidMove(newPiece, grid)) {
                setCurrentPiece(newPiece);
            } else {
                setGameOver(true);
            }
        }
    }, [currentPiece, gameOver, createPiece, isValidMove, grid]);

    useEffect(() => {
        const gameLoop = setInterval(() => {
            if (!gameOver) {
                moveDown();
            }
        }, INITIAL_FALL_SPEED);

        return () => {
            clearInterval(gameLoop);
        };
    }, [gameOver, moveDown]);

    useEffect(() => {
        const updateSize = () => {
            const minDimension = Math.min(window.innerWidth, window.innerHeight);
            const newCellSize = Math.floor(minDimension / Math.max(GRID_WIDTH, GRID_HEIGHT) * 0.8);
            setCellSize(newCellSize);
        };

        window.addEventListener('resize', updateSize);
        updateSize();

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const renderGrid = () => {
        const displayGrid = grid.map(row => [...row]);
        if (currentPiece) {
            currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value && currentPiece.y + y >= 0) {
                        displayGrid[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
                    }
                });
            });
        }

        return displayGrid.map((row, y) => (
            <div key={y} className={styles.row}>
                {row.map((cell, x) => (
                    <div
                        key={x}
                        className={styles.cell}
                        style={{
                            backgroundColor: cell || 'transparent',
                            width: `${cellSize}px`,
                            height: `${cellSize}px`
                        }}
                    />
                ))}
            </div>
        ));
    };

    return (
        <div className={styles.blockPuzzle}>
            <div className={styles.gameContainer}>
                <div className={styles.grid}>{renderGrid()}</div>
                {gameOver && <div className={styles.gameOver}>Game Over</div>}
            </div>
            <div className={styles.sidebar}>
                <div className={styles.score}>Score: {score}</div>
                <div className={styles.controls}>
                    <p>Controls:</p>
                    <ul>
                        <li>←: Move Left</li>
                        <li>→: Move Right</li>
                        <li>↓: Move Down</li>
                        <li>↑: Rotate</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BlockPuzzle;
