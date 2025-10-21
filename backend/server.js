const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Temporary in-memory user store
const users = [];

// Function to generate unique IDs
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// ------------------- Nodemailer setup -------------------
// Use your Gmail account and App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'krishna00687@gmail.com',       // 🔁 replace with your Gmail
        pass: 'sfik jbsa pspo tnlo'           // 🔁 replace with Gmail App Password
    }
});

// Owner/admin email
const OWNER_EMAIL = 'krishna00687@gmail.com'; // 🔁 replace with your email

// ------------------- Signup API -------------------
app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (users.find(u => u.email === email)) {
        return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const newUser = { id: generateId(), name, email, password };
    users.push(newUser);
    console.log('✅ User registered:', email);

    // Email to user
    const userMailOptions = {
        from: `"No Hunger Chatbot" <${transporter.options.auth.user}>`,
        to: email,
        subject: '🎉 Welcome to No Hunger!',
        html: `
            <h2>Hello ${name},</h2>
            <p>Congratulations! You have successfully registered at <b>No Hunger Chatbot</b>.</p>
            <p>🍲 Now you can donate, receive, or manage food easily!</p>
            <p>Thank you,<br><b>No Hunger Chatbot Team</b></p>
        `
    };

    // Email to owner/admin
    const ownerMailOptions = {
        from: `"No Hunger Chatbot" <${transporter.options.auth.user}>`,
        to: OWNER_EMAIL,
        subject: 'New User Registered!',
        html: `
            <h2>New User Registration</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p>User has successfully registered.</p>
        `
    };

    try {
        // Send both emails
        await Promise.all([
            transporter.sendMail(userMailOptions),
            transporter.sendMail(ownerMailOptions)
        ]);
        res.status(201).json({ success: true, message: 'Signup successful. Confirmation email sent!' });
    } catch (err) {
        console.error('❌ Email send error:', err);
        res.status(500).json({ success: true, message: 'Signup successful, but email failed to send.' });
    }
});

// ------------------- Login API -------------------
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        res.json({ success: true, message: 'Login successful', user: { name: user.name, email: user.email } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// ------------------- Chatbot API -------------------
app.post('/api/chat', (req, res) => {
    const { message, role, userName } = req.body;
    const msg = message.toLowerCase();
    const roleName = role?.split(' ')[0] || 'User';
    let response;

    if (msg.includes('hello') || msg.includes('hi')) {
        response = `Hello ${userName}! How can I assist you as a ${roleName}?`;
    } else if (msg.includes('donate')) {
        response = `Thank you for your generosity! Please provide donation details.`;
    } else {
        response = `Thanks, ${userName}. We’ll follow up soon.`;
    }

    res.json({ success: true, botResponse: response });
});

// ------------------- Start server -------------------
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('🚀 Backend ready!');
});
