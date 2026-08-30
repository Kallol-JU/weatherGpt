import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'
export function ChatMessage({ message }) { const assistant = message.role === 'assistant'; return <View style={[styles.row,!assistant&&styles.userRow]}><View style={[styles.bubble,assistant?styles.ai:styles.user]}><Text style={styles.text}>{message.text || ' '}</Text>{message.streaming && <Text style={styles.cursor}>▌</Text>}</View></View> }
const styles=StyleSheet.create({row:{marginBottom:12,flexDirection:'row'},userRow:{justifyContent:'flex-end'},bubble:{maxWidth:'88%',padding:14,borderRadius:18},ai:{backgroundColor:colors.surface2,borderTopLeftRadius:6},user:{backgroundColor:colors.blue,borderTopRightRadius:6},text:{color:colors.text,fontSize:15,lineHeight:22},cursor:{color:colors.blue2}})
