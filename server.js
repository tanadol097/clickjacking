const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch (error) {
        return false;
    }
};

app.post('/check-security', async (req, res) => {
    const { url } = req.body;
    if (!url || !isValidURL(url)) {
        return res.status(400).json({ status: 'error', message: '❌ URL ไม่ถูกต้อง' });
    }

    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const headers = response.headers;

        // ตรวจสอบ Clickjacking (Deny)
        const xFrameOptions = headers['x-frame-options'] ? headers['x-frame-options'].toLowerCase() : null;
        const csp = headers['content-security-policy'] || '';

        let clickjackingIssues = [];
        let isDeny = false;

        if (!xFrameOptions && !csp.includes('frame-ancestors')) {
            clickjackingIssues.push('❌ ไม่มีการป้องกัน Clickjacking');
        } else if (xFrameOptions === 'deny') {
            clickjackingIssues.push('✅ ป้องกัน Clickjacking ด้วย X-Frame-Options: DENY');
            isDeny = true;
        } else if (xFrameOptions === 'sameorigin') {
            clickjackingIssues.push('⚠ ป้องกัน Clickjacking ระดับกลาง (SAMEORIGIN)');
        } else if (csp.includes("frame-ancestors 'none'")) {
            clickjackingIssues.push('✅ ป้องกัน Clickjacking ด้วย CSP: frame-ancestors none');
            isDeny = true;
        }

        // ตรวจสอบ XSS ผ่าน CSP
        let cspStatus = csp ? "✅ มี Content-Security-Policy" : "❌ ไม่มี Content-Security-Policy";

        res.json({
            status: 'success',
            headers,
            clickjackingIssues,
            cspStatus,
            isDeny
        });

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ status: 'error', message: 'ไม่สามารถโหลด URL นี้' });
    }
});

app.listen(3000, () => console.log('🚀 Server running at http://localhost:3000'));
