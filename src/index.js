const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userAlreadyExists = users.find((user) => { return user.username === username});

  if(!userAlreadyExists) {
    return response.status(400).json({message: 'User not found'});
  }

  request.username = username;

  return next();
}

app.post('/users', (request, response) => {
    const { name, username } = request.body;

    const userAlreadyExists = users.some((user) => { return user.username === username });

    if(userAlreadyExists) {
      return response.status(400).json({error: 'User already exists'});
    }

    const newUser = {
      name: name,
      username: username,
      id: uuidv4(),
      todos: []
    }

    users.push(newUser);

    return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const { todos } = users.find((user) => { return user.username === username });

  return response.status(200).json(todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { title, deadline } = request.body;

  const user = users.find((user) => { return user.username === username });

  const newTodo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: new Date().toISOString()
  }

  user.todos.push(newTodo);

  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const { todos } = users.find((user) => { return user.username === username });

  const todo = todos.find((todo) => { return todo.id === id });

  if(!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline).toISOString();

  return response.status(201).json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const { todos } = users.find((user) => { return user.username === username });

  const todo = todos.find((todo) => { return todo.id === id });

  if(!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todo.done = true;

  return response.status(201).json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request;
  const { id } = request.params;

  const { todos } = users.find((user) => { return user.username === username });

  const todo = todos.find((todo) => { return todo.id === id });

  if(!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  todos.splice(todo, 1);

  return response.status(204).json(todos)
});

module.exports = app;