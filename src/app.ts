// src/app.ts
import express, {Application, Request, Response} from 'express';
import {Document, Schema} from 'mongoose';
import bodyParser from 'body-parser';
import isEven from "is-even";
import mongoose from "./utils/mongo";

// Initialize Express
const app: Application = express();

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Define a Todo List Schema that contains an array of todos
interface ITodoList extends Document {
    name: string;
    isEven: boolean;
    todos: {
        text: string;
        completed: boolean;
        date: Date;
    }[];
}

const TodoListSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    isEven: {
        type: boolean,
        required: true
    },
    todos: [{
        text: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    }], // Embed the TodoSchema as an array of todos
});

const TodoList = mongoose.model<ITodoList>('TodoList', TodoListSchema);

// Routes for Todo Lists
app.get('/api/lists', async (req: Request, res: Response) => {
    try {
        const lists: ITodoList[] = await TodoList.find();
        res.json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.post('/api/lists', async (req: Request, res: Response) => {
    const { name } = req.body;
    try {
        const newList: ITodoList = new TodoList({
            name,
            isEven: isEven((await TodoList.find()).length)
        });

        const exists = await TodoList.find({
            name: name
        })

        if (exists) {
            res.status(201).json("already exists")
        }

        await newList.save();
        res.status(201).json(newList);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.put('/api/lists/:id/addTodo', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { text } = req.body;
    try {
        const todoList: ITodoList | null = await TodoList.findById(id);
        if (!todoList) return res.status(404).json({ message: 'Todo List not found' });

        const newTodo = {
            text,
            completed: false,
            date: Date.now()
        }
        // @ts-ignore
        todoList.todos.push(newTodo);
        await todoList.save();
        res.status(201).json(newTodo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Start the server
const PORT: number = parseInt(process.env.PORT || '3000');
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
