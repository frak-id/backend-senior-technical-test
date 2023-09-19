// MongoDB Configuration
import mongoose from "mongoose";

const dbURI: string = 'mongodb://localhost/todo-app';
// @ts-ignore
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

export default mongoose