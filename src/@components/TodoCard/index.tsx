import React, { Component, useEffect } from 'react'
import { Todo } from '@models/Todo'
import { observer } from 'mobx-react'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TodoCardContent } from '@components/TodoCard/TodoCardContent'
import withObservables from '@nozbe/with-observables'
import { Text, View } from 'native-base'
import { MelonTodo } from '@models/MelonTodo'

const TodoC1ard = (props) => {
  const vm = new TodoCardVM()

  return (
    <TodoCardContent
      {...props}
      todo={props.todo}
      vm={vm}
      active={props.active}
    />
  )
}

const enhance = withObservables(['todos'], (items) => {
  return {
    todo: items.todo,
    delegator: items.todo.delegator,
  }
})

export const TodoCard = enhance(TodoC1ard)
