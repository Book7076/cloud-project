const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
// นำเข้าโมเดล User จากโฟลเดอร์ models
// เรียกใช้งาน dotenv เพื่อจัดการค่าตัวแปรสภาพแวดล้อม
require("dotenv").config();

const app = express();
const User = require("./models/User")

// ตั้งค่า Middleware
app.use(cors());
app.use(express.json());

// 1. เชื่อมต่อ MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://cloud:cloud123456789@cluster0.jts86h0.mongodb.net/myapp";

mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ เชื่อมต่อ MongoDB Atlas สำเร็จแล้ว"))
    .catch(err => {
        console.error("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:");
        console.error(err.message);
    });

// 2. เส้นทางสำหรับการแสดงผลหน้าเว็บ (Web Routes)

// หน้าหลัก (หน้าเกม)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// หน้าเข้าสู่ระบบ/สมัครสมาชิก
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// 3. API สำหรับระบบจัดการผู้ใช้งาน (Authentication API)

// ระบบสมัครสมาชิก (Register)
app.post("/api/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // ตรวจสอบข้อมูลเบื้องต้น
        if (!username || !password) {
            return res.status(400).json({ error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" });
        }

        // ตรวจสอบว่ามีชื่อผู้ใช้นี้ในระบบแล้วหรือไม่
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "ชื่อผู้ใช้นี้ถูกใช้งานไปแล้ว" });
        }

        // สร้างผู้ใช้ใหม่และบันทึกลงฐานข้อมูล
        const newUser = new User({ username, password });
        await newUser.save();
        
        console.log(`👤 สมาชิกลงทะเบียนใหม่: ${username}`);
        res.status(201).json({ message: "สมัครสมาชิกสำเร็จเรียบร้อย" });
    } catch (err) {
        if (err.code === 11000) {
            console.error("🚨 Duplicate Key Error:", err.keyValue);
            return res.status(400).json({ 
                error: "เกิดข้อผิดพลาดด้านข้อมูลซ้ำในระบบ" 
            });
        }
        console.error("🚨 Register Error:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ในการสมัครสมาชิก" });
    }
});

// ระบบเข้าสู่ระบบ (Login)
app.post("/api/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // ค้นหาผู้ใช้ที่ชื่อและรหัสผ่านตรงกัน
        const user = await User.findOne({ username, password });
        
        if (!user) {
            return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
        }

        console.log(`🔓 ผู้ใช้เข้าสู่ระบบ: ${username}`);
        res.json({ 
            user: { 
                username: user.username, 
                highScore: user.highScore 
            } 
        });
    } catch (err) {
        console.error("🚨 Login Error:", err.message);
        res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
    }
});

// 4. API สำหรับจัดการคะแนน (Game API)

// บันทึกคะแนนสูงสุด (Save High Score)
app.post("/api/save-score", async (req, res) => {
    try {
        const { username, score } = req.body;
        
        // ค้นหาผู้ใช้เพื่อตรวจสอบคะแนนเก่า
        const user = await User.findOne({ username });
        
        if (user && score > user.highScore) {
            // อัปเดตคะแนนเฉพาะเมื่อคะแนนใหม่สูงกว่าเดิม
            user.highScore = score;
            await user.save();
            return res.json({ message: "ยินดีด้วย! บันทึกสถิติใหม่สำเร็จ", highScore: user.highScore });
        }
        
        res.json({ message: "คะแนนถูกประมวลผลแล้ว (ไม่ทำลายสถิติเก่า)" });
    } catch (err) {
        console.error("🚨 Save Score Error:", err.message);
        res.status(500).json({ error: "ไม่สามารถบันทึกคะแนนลงฐานข้อมูลได้" });
    }
});

// ==========================================
// 5. API จัดอันดับคะแนน (Leaderboard) - เพิ่มใหม่
// ==========================================
app.get("/api/leaderboard", async (req, res) => {
    try {
        // ดึงข้อมูลผู้ใช้ 10 อันดับแรก เรียงตาม highScore จากมากไปน้อย (-1)
        const topUsers = await User.find({}, 'username highScore')
            .sort({ highScore: -1 })
            .limit(10);
            
        res.json(topUsers);
    } catch (err) {
        console.error("🚨 Leaderboard Error:", err.message);
        res.status(500).json({ error: "ไม่สามารถดึงข้อมูลจัดอันดับได้" });
    }
});

// เริ่มต้นเซิร์ฟเวอร์
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 เซิร์ฟเวอร์รันอยู่ที่: http://localhost:${PORT}`);
});