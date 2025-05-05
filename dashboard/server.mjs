import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { client } from '../index.mjs';
import fs from 'fs';
import multer from 'multer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Ensure storage directory exists
const storageDir = path.join(__dirname, 'public', 'storage');
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

// Serve storage as static
app.use('/storage', express.static(storageDir));

// Multer setup for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, storageDir);
        },
        filename: function (req, file, cb) {
            // Use timestamp + original name for uniqueness
            const ext = path.extname(file.originalname);
            const base = path.basename(file.originalname, ext);
            cb(null, base + '-' + Date.now() + ext);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Accept only images
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// API endpoint to get bot info
app.get('/api/bot-info', (req, res) => {
    if (!client?.user) {
        return res.status(500).json({ error: 'Bot is not ready' });
    }

    let friends = 0;
    let dms = 0;
    try {
        friends = client.relationships?.friends?.size || 0;
    } catch {}
    try {
        dms = client.channels.cache.filter(c => c.type === 'DM').size;
    } catch {}
    const customStatus = client.user.presence?.activities?.find(a => a.type === 4)?.state || null;

    const botInfo = {
        username: client.user.username,
        id: client.user.id,
        tag: client.user.tag,
        avatar: client.user.displayAvatarURL(),
        createdAt: client.user.createdAt,
        discriminator: client.user.discriminator,
        guilds: client.guilds.cache.size,
        commands: client.commands.size,
        status: client.user.presence?.status || 'offline',
        activities: client.user.presence?.activities || [],
        friends,
        dms,
        nitro: client.user.premiumType || 0,
        customStatus
    };

    res.json(botInfo);
});

// API endpoint to change bot status
app.post('/api/change-status', async (req, res) => {
    if (!client?.user) {
        return res.status(500).json({ error: 'Bot is not ready' });
    }

    const { status } = req.body;
    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];

    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        await client.user.setPresence({
            status: status,
            activities: client.user.presence?.activities || []
        });
        res.json({ success: true, status });
    } catch (error) {
        console.error('Error changing status:', error);
        res.status(500).json({ error: 'Failed to change status' });
    }
});

// API endpoint to get bank data
app.get('/api/bank', (req, res) => {
    try {
        const bankData = JSON.parse(fs.readFileSync('userbanks.json', 'utf8'));
        res.json(bankData);
    } catch (error) {
        console.error('Error reading bank data:', error);
        res.status(500).json({ error: 'Failed to read bank data' });
    }
});

// API endpoint to update bank data
app.post('/api/bank', (req, res) => {
    try {
        const newBankData = req.body;
        fs.writeFileSync('userbanks.json', JSON.stringify(newBankData, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating bank data:', error);
        res.status(500).json({ error: 'Failed to update bank data' });
    }
});

// API endpoint to get banks list
app.get('/api/banks', (req, res) => {
    try {
        const banksData = JSON.parse(fs.readFileSync('banks.json', 'utf8'));
        res.json(banksData.banks);
    } catch (error) {
        console.error('Error reading banks data:', error);
        res.status(500).json({ error: 'Failed to read banks data' });
    }
});

// API endpoint to get status config
app.get('/api/status-config', (req, res) => {
    try {
        const statusConfig = JSON.parse(fs.readFileSync('status_config.json', 'utf8'));
        res.json(statusConfig);
    } catch (error) {
        console.error('Error reading status config:', error);
        res.status(500).json({ error: 'Failed to read status config' });
    }
});

// API endpoint to update status config
app.post('/api/status-config', (req, res) => {
    try {
        const newConfig = req.body;
        fs.writeFileSync('status_config.json', JSON.stringify(newConfig, null, 2));
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating status config:', error);
        res.status(500).json({ error: 'Failed to update status config' });
    }
});

// API endpoint to turn status ON
app.post('/api/status-on', async (req, res) => {
    try {
        const config = JSON.parse(fs.readFileSync('status_config.json', 'utf8'));
        const activity = {
            name: config.app_name,
            type: config.type,
            url: null
        };
        if (config.details) activity.details = config.details;
        if (config.timestamp) {
            activity.timestamps = {
                start: typeof config.timestamp === 'number'
                    ? Date.now() - (config.timestamp * 1000)
                    : Date.now()
            };
        }
        if (config.large_image || config.small_image) {
            activity.assets = {};
            if (config.large_image) activity.assets.large_image = config.large_image;
            if (config.small_image) activity.assets.small_image = config.small_image;
        }
        await client.user.setActivity(activity);
        res.json({ success: true });
    } catch (error) {
        console.error('Error turning status ON:', error);
        res.status(500).json({ error: 'Failed to turn status ON' });
    }
});

// API endpoint to turn status OFF
app.post('/api/status-off', async (req, res) => {
    try {
        await client.user.setActivity(null);
        res.json({ success: true });
    } catch (error) {
        console.error('Error turning status OFF:', error);
        res.status(500).json({ error: 'Failed to turn status OFF' });
    }
});

// API endpoint to upload image
app.post('/api/upload-image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    // Return the public URL
    const url = `/storage/${req.file.filename}`;
    res.json({ url });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export function startDashboard() {
    app.listen(port, () => {
        console.log(`Dashboard server is running at http://localhost:${port}`);
    });
} 