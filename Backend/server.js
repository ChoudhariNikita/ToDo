const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'task'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// User Registration Route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Check if user already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
            if (err) return res.status(500).json({ message: 'Error registering user' });
            res.status(201).json({ id: result.insertId, username });
        });
    });
});

// User Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        if (results.length === 0) return res.status(400).json({ message: 'User not found' });

        const user = results[0];

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate a JWT token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'defaultSecret', { expiresIn: '1h' });
        res.json({ token });
    });
});



// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

// Todo Routes
app.post('/todos', verifyToken, (req, res) => {
    const { task } = req.body;
    const userId = req.user.id;

    db.query('INSERT INTO todos (user_id, task) VALUES (?, ?)', [userId, task], (err, result) => {
        if (err) return res.status(500).json({ message: 'Error adding task' });
        res.status(201).json({ id: result.insertId, task, completed: false });
    });
});

app.get('/todos', verifyToken, (req, res) => {
    const userId = req.user.id;

    db.query('SELECT * FROM todos WHERE user_id = ?', [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching tasks' });
        res.json(results);
    });
});

app.put('/todos/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { task } = req.body;
    const userId = req.user.id;

    db.query('UPDATE todos SET task = ? WHERE id = ? AND user_id = ?', [task, id, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Error updating task' });
        res.json({ message: 'Task updated successfully' });
    });
});

app.delete('/todos/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Error deleting task' });
        res.json({ message: 'Task deleted successfully' });
    });
});

app.put('/todos/toggle/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    db.query('UPDATE todos SET completed = NOT completed WHERE id = ? AND user_id = ?', [id, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Error toggling task completion status' });
        res.json({ message: 'Task completion status updated' });
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
