import express from 'express';
import bodyParser from 'body-parser';
import mysql from 'mysql2';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

// MySQL Configuration
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Use your MySQL username
    password: 'Yugam@123', // Use your MySQL password
    database: 'chatbot'
});

// Connect to the Database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database.');
});

// Initialize Database
const initDb = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS queries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            question VARCHAR(255) NOT NULL,
            answer TEXT NOT NULL
        )
    `;

    db.query(createTableQuery, (err) => {
        if (err) throw err;

        const seedData = `
            INSERT IGNORE INTO queries (id, question, answer)
            VALUES
            (1, 'What is your name?', 'I am Chatbot.'),
            (2, 'How are you?', 'I am functioning well.'),
            (3, 'What is your purpose?', 'I am here to assist you.')
        `;
        db.query(seedData, (err) => {
            if (err) throw err;
            console.log('Database initialized with seed data.');
        });
    });
};
initDb();

// Chat Route
app.post('/chat', (req, res) => {
    const userMessage = req.body.message.toLowerCase(); // Convert input to lowercase

    const query = 'SELECT answer FROM queries WHERE LOWER(question) = ?';
    db.query(query, [userMessage], (err, results) => {
        if (err) {
            return res.status(500).json({ reply: 'Database error.' });
        }
        if (results.length > 0) {
            return res.json({ reply: results[0].answer });
        }
        return res.json({ reply: "I don't understand that." });
    });
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
