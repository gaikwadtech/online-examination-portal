import jwt from 'jsonwebtoken';
import { IUser } from '@/models/User';
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Please define the JWT_SECRET environment variable inside .env.local');
} 
export const createToken = (user: IUser) => {
    const payload = {
        id: user._id,
        role: user.role,
    };

    const token = jwt.sign(payload,JWT_SECRET,{
        expiresIn: '7d',
    });

    return token;
};


export const verifyToken = (token: string) => {
    try {
       const decoded = jwt.verify(token, JWT_SECRET);
       return decoded;

    } catch (error) {
        return null;
    }
    
};