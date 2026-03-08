const mongoose = require("mongoose");

// นิยามโครงสร้างข้อมูลของผู้ใช้งาน
const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    highScore: { 
        type: Number, 
        default: 0 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// ส่งออก Model เพื่อนำไปใช้งานในไฟล์อื่น
module.exports = mongoose.model("User", userSchema);