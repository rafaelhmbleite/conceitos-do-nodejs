const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);
  if (!user) return response.status(400).json({error: "invalid username"});
  request.user = user;
  return next();
};

function checExistsUserTodo(request, response, next){
  const { user } = request;
  const { id } = request.params;
  const todo = user.todos.find(todo => todo.id === id);
  if (!todo){
    return response.status(404).json({error: "todo does not exists"});
  };
  request.todo = todo;
  return next();
};

app.post('/users', (request, response) => {
  const { username, name } = request.body;
  if (users.some(user => user.username === username)){
    return response.status(400).json({error:"user already registered"});
  };
  const user = {
    id: uuidv4(),
    username,
    name,
    todos:[]
  };
  users.push(user);
  return response.status(201).json(user); 
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { todos } = user;
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }
  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checExistsUserTodo, (request, response) => {
  const { todo } = request;
  const { title, deadline } = request.body;
  if (title) todo.title = title;
  if (deadline) todo.deadline = new Date(deadline);
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checExistsUserTodo, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find(todo => todo.id === id);
  if (!todo){
    return response.status(404).json({error:"invalid todo"});;
  };
  todo.done = true;
  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checExistsUserTodo, (request, response) => {
  const { user, todo } = request;
  user.todos.splice(todo, 1);
  return response.status(204).send();
});

module.exports = app;