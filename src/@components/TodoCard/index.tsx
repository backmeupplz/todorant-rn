import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { observer } from 'mobx-react'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TodoCardContent } from '@components/TodoCard/TodoCardContent'
import withObservables from '@nozbe/with-observables'
import { Text, View } from 'native-base'
import { MelonTodo } from '@models/MelonTodo'

export const TodoCard = (props) => {
  const vm = new TodoCardVM()

  return <TodoCardContent todo={props.todo.todo} vm={vm} {...props} />
}
