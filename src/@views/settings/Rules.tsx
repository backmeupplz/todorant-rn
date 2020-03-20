import React, { Component } from 'react'
import { Text, Container, Content } from 'native-base'
import { translate } from '@utils/i18n'

export class Rules extends Component {
  rules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(i =>
    translate(`rules${i}`)
  )

  render() {
    return (
      <Container>
        <Content>
          {this.rules.map((r, i) => (
            <Text key={i} style={{ padding: 12 }}>
              {i + 1}. {r}
            </Text>
          ))}
        </Content>
      </Container>
    )
  }
}
