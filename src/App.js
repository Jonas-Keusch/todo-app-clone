import Dexie from 'dexie'
import { useState, useEffect } from 'react'
import './App.css'

const db = new Dexie('todoApp')
db.version(1).stores({
  todos: '++id,task,completed,listId',
  lists: '++id,name', 
})

const { todos, lists } = db

const App = () => {
  const [allLists, setAllLists] = useState([])
  const [tasks, setTasks] = useState({})

  useEffect(() => {
    const fetchLists = async () => {
      const listsData = await lists.toArray()
      setAllLists(listsData)
    }
    fetchLists()
  }, [])

  // Function to fetch tasks for a given listId
  const fetchTasks = async (listId) => {
    const tasksData = await todos.where('listId').equals(listId).toArray()
    setTasks(prev => ({ ...prev, [listId]: tasksData }))
  }

  const addTask = async (event, listId) => {
    event.preventDefault()
    const taskField = document.querySelector(`#taskInput-${listId}`)
    const newTask = {
      task: taskField.value,
      completed: false,
      listId: listId,
    }
    await todos.add(newTask)
    taskField.value = ''
    fetchTasks(listId) // Refresh tasks for that specific list
  }

  const deleteTask = async (id, listId) => {
    await todos.delete(id)
    fetchTasks(listId) // Refresh tasks for that specific list
  }

  const toggleStatus = async (id, event, listId) => {
    await todos.update(id, { completed: !!event.target.checked })
    fetchTasks(listId) // Refresh tasks for that specific list
  }

  // Function to fetch updated lists
  const fetchLists = async () => {
    const listsData = await lists.toArray()
    setAllLists(listsData) // Update the lists after adding a new one
  }

  const addList = async () => {
    const listName = prompt('Enter the name of the new list:')
    if (listName) {
      await lists.add({ name: listName })
      fetchLists()  // Fetch updated lists
    }
  }

  // Function to delete a list and its tasks
  const deleteList = async (id) => {
    // Delete tasks associated with the list
    await todos.where('listId').equals(id).delete()
    // Delete the list itself
    await lists.delete(id)
    fetchLists()  // Fetch updated lists
  }

  return (
    <div className="container">
      <h3 className="teal-text center-align">Todo App</h3>
      <button onClick={addList} className="waves-effect btn teal right">
        Add Another List
      </button>

      {allLists?.map(({ id, name }) => {
        const listTasks = tasks[id] || []

        return (
          <div className="card white darken-1" key={id}>
            <div className="card-content">
              <h5>{name}</h5>
              <div className="task-info">
                <p>Tasks completed: {listTasks.filter(task => task.completed).length}/{listTasks.length}</p>
                <p>Progress: {listTasks.length > 0 ? `${Math.round((listTasks.filter(task => task.completed).length / listTasks.length) * 100)}%` : '0%'}</p>
              </div>
              <form className="add-item-form" onSubmit={(event) => addTask(event, id)}>
                <input
                  type="text"
                  id={`taskInput-${id}`}
                  placeholder="What do you want to do today?"
                  required
                />
                <button type="submit" className="waves-effect btn teal right">
                  Add Task
                </button>
              </form>
              {!listTasks.length && <p className="center-align">No tasks added yet.</p>}
              {listTasks.map(({ id: taskId, task, completed }) => (
                <div className="row" key={taskId}>
                  <p className="col s10">
                    <label>
                      <input
                        type="checkbox"
                        checked={completed}
                        className="checkbox-blue"
                        onChange={(event) => toggleStatus(taskId, event, id)}
                      />
                      <span className="black-text">{task}</span>
                    </label>
                  </p>
                  <i
                    onClick={() => deleteTask(taskId, id)}
                    className="col s2 material-icons delete-button"
                  >
                    delete
                  </i>
                </div>
              ))}
              {/* Delete list button */}
              <button
                onClick={() => deleteList(id)}
                className="waves-effect btn red right"
              >
                Delete List
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default App
