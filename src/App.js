import React, { useEffect, useState } from 'react';
import './App.css';
import './'


function App() {
  const [tickets, setTickets] = useState([]);
  const [groupedTickets, setGroupedTickets] = useState({});
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [users, setUsers] = useState({}); // Store users as an object for quick lookup by ID

  // Fetch data from the API
  useEffect(() => {
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then(response => response.json())
      .then(data => {
        // Log the data for debugging purposes
        console.log('API response:', data);
        // Transform users array into an object for quick lookup
        const usersById = data.users.reduce((acc, user) => {
          acc[user.id] = user.name;
          return acc;
        }, {});
        
        setUsers(usersById); // Store users in state
        setTickets(data.tickets); // Store tickets array in state
        groupTickets(data.tickets, 'status'); // Group tickets by default grouping
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // Group tickets based on the selected option (status, user, priority)
  const groupTickets = (tickets, groupBy) => {
    let grouped;
    if (groupBy === 'status') {
      grouped = {
        todo: tickets.filter(ticket => ticket.status === 'Todo'),
        inProgress: tickets.filter(ticket => ticket.status === 'In progress'),
        backlog: tickets.filter(ticket => ticket.status === 'Backlog'),
      };
    } else if (groupBy === 'user') {
      grouped = tickets.reduce((acc, ticket) => {
        const assigneeName = users[ticket.userId] || 'Unknown';
        acc[assigneeName] = acc[assigneeName] || [];
        acc[assigneeName].push(ticket);
        return acc;
      }, {});
    } else if (groupBy === 'priority') {
      grouped = tickets.reduce((acc, ticket) => {
        acc[ticket.priority] = acc[ticket.priority] || [];
        acc[ticket.priority].push(ticket);
        return acc;
      }, {});
    }
    setGroupedTickets(grouped);
  };

  // Handle grouping and sorting changes
  const handleGroupingChange = (e) => {
    const newGrouping = e.target.value;
    setGrouping(newGrouping);
    groupTickets(tickets, newGrouping);
  };

  const handleSortingChange = (e) => {
    const newSorting = e.target.value;
    setSorting(newSorting);
    const sortedTickets = [...tickets].sort((a, b) => {
      if (newSorting === 'priority') {
        return b.priority - a.priority;
      } else if (newSorting === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
    setTickets(sortedTickets);
    groupTickets(sortedTickets, grouping);
  };

  // Render grouped tickets
  const renderColumns = () => {
    return Object.keys(groupedTickets).map(group => (
      <div className="column" key={group}>
        <h3>{group}</h3>
        {groupedTickets[group].map(ticket => (
          <div className="card" key={ticket.id}>
            <h4>{ticket.title}</h4>
            <p><strong>Status:</strong> {ticket.status}</p>
            <p><strong>Priority:</strong> {ticket.priority}</p>
            <p><strong>Assignee:</strong> {users[ticket.userId] || 'Unknown'}</p>
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Kanban Board</h1>
        <div className="controls">
          <label>Group by: </label>
          <select value={grouping} onChange={handleGroupingChange}>
            <option value="status">Status</option>
            <option value="user">User</option>
            <option value="priority">Priority</option>
          </select>
          <label>Sort by: </label>
          <select value={sorting} onChange={handleSortingChange}>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </header>
      <div className="kanban-board">
        {renderColumns()}
      </div>
    </div>
  );
}

export default App;
