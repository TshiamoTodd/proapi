import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if(!DB_URI) {
  throw new Error('please define the MONGOBD_URI environment variable inside .env<development/production>.local');
}

const connectToDatatbase = async () => {
    try {
        await mongoose.connect(DB_URI);

        console.log(`Database connected in ${NODE_ENV} mode`);

    } catch (error) {
        console.log('Error connecting to the database', error);
        process.exit(1);      
    }
};

export default connectToDatatbase;