import { CardType } from '@components/TodoCard/CardType'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { TodoCardContent } from '@components/TodoCard/TodoCardContent'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { memo } from 'react'
import React from 'react'
import withObservables, { ObservableifyProps } from '@nozbe/with-observables'

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

export const TodoCard = memo(
  enhance((props: Props) => {
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
)
