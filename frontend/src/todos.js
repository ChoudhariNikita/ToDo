import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, ListGroup, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Todos = () => {
    const [todos, setTodos] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [editingTask, setEditingTask] = useState(null);
    const navigate = useNavigate();

    const username = localStorage.getItem('username'); // Get username from local storage

    useEffect(() => {
        const fetchTodos = async () => {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/todos', {
                headers: {
                    Authorization: token,
                },
            });
            setTodos(response.data);
        };

        fetchTodos();
    }, []);

    const handleAddTask = async () => {
        const token = localStorage.getItem('token');
        const response = await axios.post('http://localhost:5000/todos', { task: newTask }, {
            headers: {
                Authorization: token,
            },
        });
        setTodos([...todos, response.data]);
        setNewTask('');
    };

    const handleDeleteTask = async (id) => {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/todos/${id}`, {
            headers: {
                Authorization: token,
            },
        });
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const handleEditTask = (todo) => {
        setEditingTask(todo);
        setNewTask(todo.task);
    };

    const handleUpdateTask = async () => {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/todos/${editingTask.id}`, { task: newTask }, {
            headers: {
                Authorization: token,
            },
        });
        setTodos(todos.map(todo => (todo.id === editingTask.id ? { ...todo, task: newTask } : todo)));
        setNewTask('');
        setEditingTask(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the token
        localStorage.removeItem('username'); // Clear the username
        navigate('/login'); // Redirect to login page
    };

    const handleToggleCompleted = async (id) => {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/todos/toggle/${id}`, {}, {
            headers: {
                Authorization: token,
            },
        });
        setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
    };

    return (
        <Container className="mt-5">
            <Row>
                <Col md={8} className="mx-auto">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="text-center">Your Todos</h1>
                        <Button variant="danger" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                    <h3 className="text-center">Welcome back, {username}!</h3>
                    <Form className="mb-4 mt-3">
                        <Form.Group controlId="formTask">
                            <Form.Control
                                type="text"
                                placeholder="Add a new task"
                                value={newTask}
                                onChange={(e) => setNewTask(e.target.value)}
                            />
                        </Form.Group>
                        <Button
                            variant={editingTask ? "warning" : "primary"}
                            onClick={editingTask ? handleUpdateTask : handleAddTask}
                            className="mt-2"
                        >
                            {editingTask ? "Update Task" : "Add Task"}
                        </Button>
                    </Form>

                    <Row>
                        <Col>
                            <h4>Pending Tasks</h4>
                            <ListGroup>
                                {todos.filter(todo => !todo.completed).map(todo => (
                                    <ListGroup.Item key={todo.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <Form.Check 
                                                type="checkbox"
                                                checked={todo.completed}
                                                onChange={() => handleToggleCompleted(todo.id)}
                                            />
                                            {todo.task}
                                        </div>
                                        <div>
                                            <Button variant="info" onClick={() => handleEditTask(todo)} className="me-2">
                                                Edit
                                            </Button>
                                            <Button variant="danger" onClick={() => handleDeleteTask(todo.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>

                        <Col>
                            <h4>Completed Tasks</h4>
                            <ListGroup>
                                {todos.filter(todo => todo.completed).map(todo => (
                                    <ListGroup.Item key={todo.id} className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <Form.Check 
                                                type="checkbox"
                                                checked={todo.completed}
                                                onChange={() => handleToggleCompleted(todo.id)}
                                            />
                                            {todo.task}
                                        </div>
                                        <div>
                                            <Button variant="danger" onClick={() => handleDeleteTask(todo.id)}>
                                                Delete
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default Todos;
