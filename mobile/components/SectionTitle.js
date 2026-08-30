import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'
export function SectionTitle({ title, subtitle }) { return <View style={styles.wrap}><Text style={styles.title}>{title}</Text>{subtitle && <Text style={styles.sub}>{subtitle}</Text>}</View> }
const styles = StyleSheet.create({ wrap:{marginBottom:14,marginTop:6}, title:{color:colors.text,fontSize:22,fontWeight:'800'},sub:{color:colors.muted,fontSize:13,marginTop:4} })
