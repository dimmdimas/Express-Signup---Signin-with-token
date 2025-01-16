import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    frist_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: (value) => {
            return validator.isEmail(value);
        }
    },
    password: {
        type: String,
        required: true,
        minLength: 6,
    },
});

// bcrypt methods 
// createHash
userSchema.methods.createHash = async function (password) {
    const salt = 10;

    return await bcrypt.hash(password, salt);
};

// validatePassword
userSchema.methods.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


const User = mongoose.model("User", userSchema);
export default User;