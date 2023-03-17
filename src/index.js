const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const { title, deadline } = request.body;

  const userExists = users.find(item => item.username === username);

  if(userExists){
    request.username = username;
    request.title = title;
    request.deadline = deadline;
    request.userExists = userExists;
  }else {
    return response.status(404).json({ error: "Usuario nao encontrado"})
  }

  next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userExists = users.find(item => item.username === username);

  if(userExists){
    return response.status(400).json({ error: "Erro, Usuario ja cadastrado"})
  }

  const user = {
    id: uuidv4(),
    name: name,
    username: username,
    todos: []
  };

  users.push(user)

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request;

  const dataUser = users.find(user => user.username === username);

  return response.status(200).json(dataUser.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username, title, deadline } = request;

  const list = {
    id: uuidv4(),
    title,
    done: false,
    created_at: new Date(),
    deadline: new Date(deadline)
  }

  const result = users.find(user => user.username === username)
  result.todos.push(list)

  return response.status(201).json(list)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { username, title, deadline, userExists } = request;
    const { id } = request.params;


    const index = userExists.todos.findIndex(item => item.id === id)

    if(index){
      return response.status(404).json({ error: "Todo not Exist"})
    }

    const data = userExists.todos[index]
    data.title = title;
    data.deadline = new Date(deadline);

    return response.status(200).json(data)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {

    const { id } = request.params ;
    const { username, userExists } = request;

    const index = userExists.todos.findIndex(item => item.id === id);

    if(index){
      return response.status(404).json({ error: "Done nao encontrado"})
    }

    const data = userExists.todos[index];

    data.done = true;
    
    return response.status(200).json(data)

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {

    const { id } = request.params ;
    const { username, userExists } = request;

    const index = userExists.todos.findIndex(item => item.id === id);

    if(index){
      return response.status(404).json({ error: "Todo nao encontrado"})
    }

    userExists.todos.splice(index, 1);

    return response.status(204).send();


});

module.exports = app;