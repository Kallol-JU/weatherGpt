import React from 'react'
import { Text, TouchableOpacity, StyleSheet } from 'react-native'
import { colors, shadows } from '../theme/colors'
export function FeatureCard({ icon,title,text,onPress }) { return <TouchableOpacity onPress={onPress} style={styles.card}><Text style={styles.icon}>{icon}</Text><Text style={styles.title}>{title}</Text><Text style={styles.text}>{text}</Text></TouchableOpacity> }
const styles=StyleSheet.create({card:{width:'48%',backgroundColor:colors.surface,borderRadius:20,padding:16,marginBottom:12,...shadows},icon:{fontSize:25,marginBottom:10},title:{color:colors.text,fontSize:15,fontWeight:'800'},text:{color:colors.muted,fontSize:12,marginTop:4}})
