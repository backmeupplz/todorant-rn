export class Todo {
  text: string
  completed = false
  frog = false
  frogFails = 0
  skipped = false
  monthAndYear: string
  date?: string
  time?: string

  constructor(text: string, monthAndYear: string) {
    this.text = text
    this.monthAndYear = monthAndYear
  }
}

export const fakeTodo = new Todo('Some todo text', '2020-02')
