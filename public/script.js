document.getElementById('checkBtn').addEventListener('click', async () => {
    const url = document.getElementById('urlInput').value.trim();
    if (!url) {
        alert('กรุณาใส่ URL ก่อนทำการตรวจสอบ');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/check-security', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        const data = await response.json();
        if (data.status !== 'success') {
            alert(data.message);
            return;
        }

        // แสดง Headers
        document.getElementById('responseHeaders').textContent = JSON.stringify(data.headers, null, 2);

        // แสดงผล Clickjacking
        const clickjackingWarning = document.getElementById('clickjackingWarning');
        clickjackingWarning.innerHTML = data.clickjackingIssues.map(issue => formatMessage(issue)).join('<br>');

        // แสดงผล XSS
        const xssWarning = document.getElementById('xssWarning');
        xssWarning.innerHTML = formatMessage(data.cspStatus);

        // ✅ แสดงปุ่มรายละเอียด
        document.getElementById('detailBtn').style.display = 'block';

        // ✅ แสดง Iframe Preview
        document.getElementById('iframePreviewDetail').src = url;

    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการตรวจสอบ');
    }
});

// ฟังก์ชันในการแสดงข้อความ
function formatMessage(message) {
    if (message.includes('✅')) return `<span class="safe">${message}</span>`;
    if (message.includes('⚠')) return `<span style="color: yellow;">${message}</span>`;
    return `<span class="warning">${message}</span>`;
}

// ฟังก์ชันแสดงรายละเอียดทั้งหมดใน modal
document.getElementById('detailBtn').addEventListener('click', () => {
    const clickjackingDetails = `
        Clickjacking คือการที่แฮกเกอร์แทรกแซงการแสดงผลหน้าเว็บของคุณใน iframe เพื่อให้ผู้ใช้กดปุ่มหรือทำการอื่นๆ โดยไม่รู้ตัว
        การป้องกันสามารถทำได้โดยการตั้งค่า X-Frame-Options หรือ Content-Security-Policy (CSP) ให้ป้องกันการฝัง iframe ในหน้าเว็บ
    `;
    
    const xssDetails = `
        XSS (Cross-Site Scripting) คือการโจมตีที่ใช้ช่องโหว่ในเว็บไซต์เพื่อฝังสคริปต์ที่อาจทำอันตรายแก่ผู้ใช้
        การป้องกันสามารถทำได้โดยการใช้ Content-Security-Policy (CSP) และตรวจสอบการกรอกข้อมูลจากผู้ใช้
    `;
    
    const details = `
        <h4>รายละเอียด Clickjacking:</h4>
        <p>${clickjackingDetails}</p>
        
        <h4>รายละเอียด XSS:</h4>
        <p>${xssDetails}</p>
    `;
    
    // แสดงรายละเอียดในส่วนรายละเอียด
    document.getElementById('detailContent').innerHTML = details;

    // แสดง Modal
    document.getElementById('detailModal').style.display = 'block';

    // ซ่อนปุ่มรายละเอียด
    document.getElementById('detailBtn').style.display = 'none';
});

// ฟังก์ชันปิด Modal
document.getElementById('closeModalBtn').addEventListener('click', () => {
    document.getElementById('detailModal').style.display = 'none';
});

// ฟังก์ชันพิมพ์เป็น PDF
document.getElementById('printPdfBtn').addEventListener('click', () => {
    window.print();
});
