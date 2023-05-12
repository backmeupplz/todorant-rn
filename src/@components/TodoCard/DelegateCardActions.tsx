import {
  DelegateSectionType,
  sharedDelegateStateStore,
} from '@stores/DelegateScreenStateStore'
import { IconButton } from '@components/IconButton'
import { MelonTodo } from '@models/MelonTodo'
import { Text, View } from 'native-base'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import React from 'react'

const DelegateCardActions = observer(
  ({ vm, todo }: { vm: TodoCardVM; todo: MelonTodo }) => {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 6,
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            color: sharedColors.borderColor,
          }}
        >
          {`${todo.monthAndYear || ''}${todo.date ? `-${todo.date}` : ''}`}{' '}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {!todo.delegateAccepted && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <IconButton
                onPress={async () => {
                  await vm.delete(todo)
                }}
                color={sharedColors.destructIconColor}
                name="delete_outline_28-iOS"
              />
              <IconButton
                onPress={() => {
                  navigate('EditTodo', {
                    editedTodo: todo,
                  })
                }}
                name="edit_outline_28"
              />
            </View>
          )}
        </View>
        {sharedDelegateStateStore.todoSection === DelegateSectionType.ToMe ? (
          <>
            <TouchableOpacity
              onPress={async () => {
                await vm.accept(todo)
              }}
            >
              <Text
                style={{
                  ...sharedColors.regularTextExtraStyle.style,
                  color: sharedColors.successIconColor,
                }}
              >
                {translate('accept')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View></View>
        )}
      </View>
    )
  }
)

export default DelegateCardActions
