export class Todo {
  text = ''
  completed = false
  frog = false
  frogFails = 0
  skipped = false
  monthAndYear: string = '' // Todo: replace with today's date
  date?: string
  time?: string
}

export const fakeTodo = new Todo()
fakeTodo.text = 'Some todo text'
fakeTodo.monthAndYear = '2020-02'
