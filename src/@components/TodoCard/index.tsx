import React, { Component, useEffect } from 'react'
import { observer } from 'mobx-react'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TodoCardContent } from '@components/TodoCard/TodoCardContent'
import withObservables, { ObservableifyProps } from '@nozbe/with-observables'
import { Text, View } from 'native-base'
import { MelonTodo, MelonUser } from '@models/MelonTodo'

type InputProps = ObservableifyProps<Props, 'delegator'>

interface Props {
  todo: MelonTodo
  delegator?: MelonUser
  type: CardType
  drag?: () => void
  active?: boolean
}

const enhance = withObservables(['todo'], (items: InputProps) => {
  return {
    todo: items.todo,
    delegator: items.todo.delegator,
  }
})

export const TodoCard = enhance((props: Props) => {
  const vm = new TodoCardVM()

  return (
    <TodoCardContent
      {...props}
      todo={props.todo}
      vm={vm}
      active={props.active}
    />
  )
})
