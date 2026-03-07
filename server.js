const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// จำลอง Database เก็บข้อมูล Users ชั่วคราว (ข้อมูลจะหายเมื่อปิดเซิร์ฟเวอร์)
let users = []; 

// ==========================================
// 1. เส้นทางหน้าเว็บ (Web Routes)
// ==========================================

// หน้าแรก (เกมพิมพ์ดีด)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// หน้าเข้าสู่ระบบ
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// ==========================================
// 2. API สำหรับ สมัครสมาชิก / เข้าสู่ระบบ
// ==========================================

// API สมัครสมาชิก
app.post("/api/register", (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }
    
    const isUserExist = users.find(u => u.username === username);
    if (isUserExist) {
        return res.status(400).json({ error: "ชื่อผู้ใช้นี้มีคนใช้งานแล้ว!" });
    }

    users.push({ username, password });
    console.log("📝 มีคนสมัครสมาชิกใหม่:", username);
    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ" });
});

// API เข้าสู่ระบบ
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง!" });
    }

    console.log("🔓 เข้าสู่ระบบสำเร็จ:", username);
    res.json({ message: "สำเร็จ", user: { username: user.username } });
});

// ==========================================
// สตาร์ท Server
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server รันเรียบร้อยแล้วที่พอร์ต ${PORT}`);
    console.log(`👉 เปิดหน้าเว็บได้ที่: http://localhost:${PORT}`);
});