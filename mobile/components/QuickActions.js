import React from 'react'
import { ScrollView, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors } from '../theme/colors'
export function QuickActions({ onSelect, disabled }) { const items=[['🌦️','Will it rain?'],['🌡️','How hot is it?'],['🚨','Any warnings?'],['🌾','Farming advice?']]; return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>{items.map(([icon,text])=><TouchableOpacity key={text} disabled={disabled} onPress={()=>onSelect(text)} style={styles.chip}><Text style={styles.icon}>{icon}</Text><Text style={styles.text}>{text}</Text></TouchableOpacity>)}</ScrollView> }
const styles=StyleSheet.create({row:{gap:9,paddingBottom:8},chip:{backgroundColor:colors.surface,borderWidth:1,borderColor:colors.line,borderRadius:18,paddingHorizontal:14,paddingVertical:11,flexDirection:'row',alignItems:'center'},icon:{fontSize:15},text:{color:colors.text,fontWeight:'700',marginLeft:6,fontSize:12}})
