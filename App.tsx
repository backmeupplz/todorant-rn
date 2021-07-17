import { appSchema, Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'
import * as React from 'react'

import MMKVStorage from 'react-native-mmkv-storage'

import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { spawnThread } from 'react-native-multithreading'
import 'react-native-reanimated'

export const watermelon = appSchema({
  version: 1,
  tables: [],
})

export const watertmelonMigration = schemaMigrations({
  migrations: [
    // We'll add migration definitions here later
  ],
})

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema: watermelon,
  // synchronous: true,
  // (You might want to comment it out for development purposes -- see Migrations documentation)
  migrations: watertmelonMigration,
  // (optional database name or file system path)
  // dbName: 'myapp',
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  jsi: true /* Platform.OS === 'ios' */,
  // (optional, but you should implement this method)
})

// Then, make a Watermelon database from it!
export const database = new Database({
  adapter,
  modelClasses: [],
})

const MMKV = new MMKVStorage.Loader().initialize() // Returns an MMKV Instance

MMKV.setString('language', 'я fyukbqcrbq')

console.log(MMKV.getString('language'))

// calculates the fibonacci number - that can be optimized really good so it's really really fast.
const fibonacci = (num: number): number => {
  'worklet'
  // Uses array to store every single fibonacci number
  var i
  let fib: number[] = []

  fib[0] = 0
  fib[1] = 1
  for (i = 2; i <= num; i++) {
    fib[i] = fib[i - 2] + fib[i - 1]
  }
  return fib[fib.length - 1]
}

export default function App() {
  const [isRunning, setIsRunning] = React.useState(false)
  const [input, setInput] = React.useState('5')
  const [result, setResult] = React.useState<number | undefined>()

  const runFibonacci = React.useCallback(async (parsedInput: number) => {
    setIsRunning(true)
    try {
      const fib = await spawnThread(() => {
        'worklet'
        console.log(`: Calculating fibonacci for input ${parsedInput}...`)
        const value = fibonacci(parsedInput)
        console.log(`: Fibonacci number for ${parsedInput} is ${value}!`)
        return value
      })
      setResult(fib)
    } catch (e) {
      const msg = e instanceof Error ? e.message : JSON.stringify(e)
      Alert.alert('Error', msg)
    } finally {
      setIsRunning(false)
    }
  }, [])

  React.useEffect(() => {
    const parsedInput = Number.parseInt(input, 10)
    runFibonacci(parsedInput)
  }, [runFibonacci, input])

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        In this example you can enter a number in the TextInput while the custom
        thread will calculate the fibonacci sequence for the given number
        completely async and in parallel, while the React-JS Thread stays fully
        responsive.
      </Text>
      <Text>Input:</Text>
      <TextInput
        style={styles.input}
        value={input}
        onChangeText={setInput}
        placeholder="0"
      />
      {isRunning ? (
        <ActivityIndicator />
      ) : (
        <Text>Fibonacci Number: {result}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 70,
  },
  description: {
    maxWidth: '80%',
    fontSize: 15,
    color: '#242424',
    marginBottom: 80,
  },
  input: {
    width: '50%',
    paddingVertical: 5,
    marginVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 5,
    borderColor: 'black',
    textAlign: 'center',
    fontSize: 14,
  },
})
